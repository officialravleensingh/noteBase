const API_URL = process.env.NEXT_PUBLIC_API_URL;

const apiRequest = async (endpoint, options = {}) => {
  try {
    if (!API_URL) {
      throw new Error('API URL is not configured');
    }
    if (!endpoint) {
      throw new Error('API endpoint is required');
    }
    
    const url = `${API_URL}${endpoint}`;
    
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        ...(refreshToken && { 'x-refresh-token': refreshToken }),
        ...options.headers
      },
      ...options
    };
    if (options.body && typeof options.body === 'object') {
      try {
        config.body = JSON.stringify(options.body);
      } catch (jsonError) {
        throw new Error('Failed to serialize request body');
      }
    }

    let response;
    try {
      response = await fetch(url, config);
    } catch (networkError) {
      console.error('Network error:', networkError.message);
      throw new Error('Network error. Please check your connection.');
    }
    
    const newAccessToken = response.headers.get('x-access-token');
    const newRefreshToken = response.headers.get('x-refresh-token');
    
    if (newAccessToken) {
      localStorage.setItem('accessToken', newAccessToken);
    }
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
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

export const authAPI = {
  signup,
  login,
  refreshToken
};

export default apiRequest;