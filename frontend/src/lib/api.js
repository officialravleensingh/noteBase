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
    
    // Add timeout for requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    config.signal = controller.signal;
    
    if (options.body && typeof options.body === 'object') {
      try {
        config.body = JSON.stringify(options.body);
      } catch (jsonError) {
        clearTimeout(timeoutId);
        throw new Error('Failed to serialize request body');
      }
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
      console.error('Network error:', networkError.message);
      throw new Error('Network error. Please check your connection.');
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
      console.error('Failed to parse response:', parseError.message);
      throw new Error('Invalid response format from server');
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
    console.error('API request failed:', error.message);
    throw error;
  }
};

export const signup = async (userData) => {
  try {
    if (!userData || !userData.email || !userData.password) {
      throw new Error('Email and password are required');
    }
    return await apiRequest('/auth/signup', {
      method: 'POST',
      body: userData,
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    if (!credentials || !credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }
    return await apiRequest('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    throw error;
  }
};

export const refreshToken = async (refreshToken) => {
  try {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }
    return await apiRequest('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    });
  } catch (error) {
    console.error('Token refresh error:', error.message);
    throw error;
  }
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

export const exportAPI = {
  generatePDF: async (noteId) => {
    try {
      const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Authentication required');
      }
      const response = await fetch(`${API_URL}/export/notes/${noteId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to generate PDF');
      }
      return response.blob();
    } catch (error) {
      console.error('PDF generation error:', error.message);
      throw error;
    }
  },
  generateShareLink: (noteId) => apiRequest(`/export/notes/${noteId}/share`, {
    method: 'POST'
  }),
  getSharedNote: (shareId) => apiRequest(`/export/shared/${shareId}`)
};

export const authAPI = {
  signup,
  login,
  refreshToken
};

export default apiRequest;