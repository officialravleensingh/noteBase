const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiRequest = async (endpoint, options = {}) => {
  try {
    if (!API_URL) {
      throw new Error('API URL is not configured');
    }
    if (!endpoint) {
      throw new Error('API endpoint is required');
    }
    
    const url = `${API_URL}${endpoint}`;
    
    // Check both localStorage and sessionStorage for tokens
    let accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    let refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        ...(refreshToken && { 'x-refresh-token': refreshToken }),
        ...options.headers
      },
      ...options
    };
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    config.signal = controller.signal;
    
    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    let response;
    try {
      response = await fetch(url, config);
      clearTimeout(timeoutId);
    } catch (networkError) {
      clearTimeout(timeoutId);
      if (networkError.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      throw new Error(`Network error: ${networkError.message}`);
    }
    
    const newAccessToken = response.headers.get('x-access-token');
    const newRefreshToken = response.headers.get('x-refresh-token');
    
    if (newAccessToken) {
      if (localStorage.getItem('accessToken')) {
        localStorage.setItem('accessToken', newAccessToken);
      } else {
        sessionStorage.setItem('accessToken', newAccessToken);
      }
    }
    if (newRefreshToken) {
      if (localStorage.getItem('refreshToken')) {
        localStorage.setItem('refreshToken', newRefreshToken);
      } else {
        sessionStorage.setItem('refreshToken', newRefreshToken);
      }
    }
    
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error(`Invalid response format from server. Status: ${response.status}`);
    }
    if (!response.ok) {
      const errorMessage = data.error || data.message || `HTTP ${response.status}: ${response.statusText}`;
      const error = new Error(errorMessage);
      if (data.details) {
        error.details = data.details;
      }
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const signup = async (userData) => {
  return await apiRequest('/auth/signup', {
    method: 'POST',
    body: userData,
  });
};

export const login = async (credentials) => {
  return await apiRequest('/auth/login', {
    method: 'POST',
    body: credentials,
  });
};

export const refreshToken = async (refreshToken) => {
  return await apiRequest('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  });
};

export const notesAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/notes${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => apiRequest(`/notes/${id}`),
  create: (noteData) => apiRequest('/notes', {
    method: 'POST',
    body: noteData
  }),
  update: (id, noteData) => apiRequest(`/notes/${id}`, {
    method: 'PUT',
    body: noteData
  }),
  delete: (id) => apiRequest(`/notes/${id}`, {
    method: 'DELETE'
  }),
  // Note locking APIs
  lock: (id, pin) => apiRequest(`/notes/${id}/lock`, {
    method: 'POST',
    body: { pin }
  }),
  unlock: (id, pin) => apiRequest(`/notes/${id}/unlock`, {
    method: 'POST',
    body: { pin }
  }),
  requestUnlockOTP: (id) => apiRequest(`/notes/${id}/request-unlock-otp`, {
    method: 'POST'
  }),
  verifyUnlockOTP: (id, otp) => apiRequest(`/notes/${id}/verify-unlock-otp`, {
    method: 'POST',
    body: { otp }
  })
};

export const foldersAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/folders${queryString ? `?${queryString}` : ''}`);
  },
  create: (folderData) => apiRequest('/folders', {
    method: 'POST',
    body: folderData
  }),
  update: (id, folderData) => apiRequest(`/folders/${id}`, {
    method: 'PUT',
    body: folderData
  }),
  delete: (id) => apiRequest(`/folders/${id}`, {
    method: 'DELETE'
  })
};

export const pinAPI = {
  setPin: (section, pin) => apiRequest('/pins/set', {
    method: 'POST',
    body: { section, pin }
  }),
  verifyPin: (section, pin) => apiRequest('/pins/verify', {
    method: 'POST',
    body: { section, pin }
  }),
  checkPin: (section) => apiRequest(`/pins/check/${section}`),
  removePin: (section) => apiRequest('/pins/remove', {
    method: 'DELETE',
    body: { section }
  })
};

export const settingsAPI = {
  getSettings: () => apiRequest('/settings'),
  requestPinSetupOTP: (section) => apiRequest('/pin-setup/request-otp', {
    method: 'POST',
    body: { section }
  }),
  verifyPinSetupOTP: (section, otp, pin) => apiRequest('/pin-setup/verify-otp', {
    method: 'POST',
    body: { section, otp, pin }
  }),
  requestPasswordChangeOTP: () => apiRequest('/password-change/request-otp', {
    method: 'POST'
  }),
  verifyPasswordChangeOTP: (otp, newPassword) => apiRequest('/password-change/verify-otp', {
    method: 'POST',
    body: { otp, newPassword }
  }),
  requestProfileDeletionOTP: () => apiRequest('/profile-deletion/request-otp', {
    method: 'POST'
  }),
  verifyProfileDeletionOTP: (otp) => apiRequest('/profile-deletion/verify-otp', {
    method: 'POST',
    body: { otp }
  }),
  cancelProfileDeletion: () => apiRequest('/profile-deletion/cancel', {
    method: 'POST'
  })
};

export const sectionsAPI = {
  getSettings: () => apiRequest('/sections/settings'),
  updateFeatureToggles: (featuresEnabled) => apiRequest('/sections/settings/features', {
    method: 'PUT',
    body: { featuresEnabled }
  }),
  requestFeatureToggleOTP: (data) => apiRequest('/sections/settings/features/request-otp', {
    method: 'POST',
    body: data
  }),
  verifyFeatureToggleOTP: (data) => apiRequest('/sections/settings/features/verify-otp', {
    method: 'POST',
    body: data
  }),
  requestPasswordChangeOTP: (data) => apiRequest('/auth/send-password-change-otp', {
    method: 'POST',
    body: data
  }),
  verifyPasswordChangeOTP: (data) => apiRequest('/auth/verify-password-change-otp', {
    method: 'POST',
    body: data
  })
};

export const memoriesAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/memories${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => apiRequest(`/memories/${id}`),
  create: (memoryData) => apiRequest('/memories', {
    method: 'POST',
    body: memoryData
  }),
  update: (id, memoryData) => apiRequest(`/memories/${id}`, {
    method: 'PUT',
    body: memoryData
  }),
  delete: (id) => apiRequest(`/memories/${id}`, {
    method: 'DELETE'
  }),
  requestDeleteOTP: (id) => apiRequest(`/memories/${id}/request-delete-otp`, {
    method: 'POST'
  }),
  permanentDelete: (id, otp) => apiRequest(`/memories/${id}/permanent`, {
    method: 'DELETE',
    body: { otp }
  })
};

export const journalAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/journal${queryString ? `?${queryString}` : ''}`);
  },
  getTodayEntry: () => apiRequest('/journal/today'),
  getByDate: (date) => apiRequest(`/journal/date/${date}`),
  create: (entryData) => apiRequest('/journal', {
    method: 'POST',
    body: entryData
  }),
  update: (id, entryData) => apiRequest(`/journal/${id}`, {
    method: 'PUT',
    body: entryData
  }),
  delete: (id) => apiRequest(`/journal/${id}`, {
    method: 'DELETE'
  }),
  requestDeleteOTP: (id) => apiRequest(`/journal/${id}/request-delete-otp`, {
    method: 'POST'
  }),
  permanentDelete: (id, otp) => apiRequest(`/journal/${id}/permanent`, {
    method: 'DELETE',
    body: { otp }
  })
};

export const recycleBinAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/recycle-bin${queryString ? `?${queryString}` : ''}`);
  },
  restore: (id) => apiRequest(`/recycle-bin/${id}/restore`, {
    method: 'POST'
  }),
  requestDeleteOTP: (id) => apiRequest(`/recycle-bin/${id}/request-delete-otp`, {
    method: 'POST'
  }),
  permanentDelete: (id, otp) => apiRequest(`/recycle-bin/${id}/permanent`, {
    method: 'DELETE',
    body: { otp }
  }),
  requestEmptyOTP: () => apiRequest('/recycle-bin/empty/request-otp', {
    method: 'POST'
  }),
  emptyBin: (otp) => apiRequest('/recycle-bin/empty', {
    method: 'DELETE',
    body: { otp }
  })
};

export const exportAPI = {
  exportToPDF: async (noteId) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    
    const response = await fetch(`${API_URL}/export/notes/${noteId}/pdf`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...(refreshToken && { 'x-refresh-token': refreshToken })
      }
    });
    
    // Handle token refresh
    const newAccessToken = response.headers.get('x-access-token');
    const newRefreshToken = response.headers.get('x-refresh-token');
    
    if (newAccessToken) {
      if (localStorage.getItem('accessToken')) {
        localStorage.setItem('accessToken', newAccessToken);
      } else {
        sessionStorage.setItem('accessToken', newAccessToken);
      }
    }
    if (newRefreshToken) {
      if (localStorage.getItem('refreshToken')) {
        localStorage.setItem('refreshToken', newRefreshToken);
      } else {
        sessionStorage.setItem('refreshToken', newRefreshToken);
      }
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Export failed' }));
      throw new Error(errorData.error || 'Export failed');
    }
    
    return response;
  }
};

export const sharingAPI = {
  createShareLink: (noteId, options = {}) => apiRequest(`/sharing/notes/${noteId}/share`, {
    method: 'POST',
    body: options
  }),
  getSharedNote: (shareId) => apiRequest(`/sharing/shared/${shareId}`),
  updateSharedNote: (shareId, noteData) => apiRequest(`/sharing/shared/${shareId}`, {
    method: 'PUT',
    body: noteData
  }),
  getMyShares: () => apiRequest('/sharing/my-shares'),
  revokeShare: (shareId) => apiRequest(`/sharing/shares/${shareId}`, {
    method: 'DELETE'
  })
};

export const authAPI = {
  signup,
  login,
  refreshToken
};

// Export api object for backward compatibility
export const api = {
  get: (endpoint) => apiRequest(endpoint),
  post: (endpoint, data) => apiRequest(endpoint, { method: 'POST', body: data }),
  put: (endpoint, data) => apiRequest(endpoint, { method: 'PUT', body: data }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' })
};

export default apiRequest;