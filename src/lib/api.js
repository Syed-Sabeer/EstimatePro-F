import { API_CONFIG, AUTH_CONFIG } from './config';

// API Service for Laravel Backend
class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  }

  // Set authorization header
  getHeaders(includeAuth = false) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Update token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    }
  }

  // Register API
  async register(userData) {
    try {
      const response = await fetch(`${this.baseURL}/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || `Registration failed with status ${response.status}`);
      }

      // Store token after successful registration
      if (data.token) {
        this.setToken(data.token);
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the server. Please check if the backend is running.');
      }
      throw new Error(error.message || 'Registration failed');
    }
  }

  // Login API
  async login(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();

      if (!response.ok) {
        // Handle email verification case specifically
        if (response.status === 403 && data.error === 'Email not verified') {
          // Store token even for unverified users (they might need it for resending verification)
          if (data.token) {
            this.setToken(data.token);
          }
          const error = new Error(data.error);
          error.status = 403;
          error.user = data.user;
          error.token = data.token;
          throw error;
        }
        throw new Error(data.message || data.error || `Login failed with status ${response.status}`);
      }

      // Store token after successful login
      if (data.token) {
        this.setToken(data.token);
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the server. Please check if the backend is running.');
      }
      throw error; // Re-throw the original error to preserve status and user data
    }
  }

  // Logout API
  async logout() {
    try {
      const response = await fetch(`${this.baseURL}/logout`, {
        method: 'POST',
        headers: this.getHeaders(true),
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      // Clear token after successful logout
      this.setToken(null);
      
      return await response.json();
    } catch (error) {
      // Even if logout fails on server, clear local token
      this.setToken(null);
      throw new Error(error.message || 'Logout failed');
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const response = await fetch(`${this.baseURL}/current/user`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch user data');
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const response = await fetch(`${this.baseURL}/refresh-token`, {
        method: 'POST',
        headers: this.getHeaders(true),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      if (data.token) {
        this.setToken(data.token);
      }

      return data;
    } catch (error) {
      throw new Error(error.message || 'Token refresh failed');
    }
  }

  // Send verification email
  async sendVerificationEmail() {
    try {
      const response = await fetch(`${this.baseURL}/email/verification-notification`, {
        method: 'POST',
        headers: this.getHeaders(true),
      });

      if (!response.ok) {
        throw new Error('Failed to send verification email');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Failed to send verification email');
    }
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();

// Export individual methods for easier usage
export const authAPI = {
  register: (userData) => apiService.register(userData),
  login: (credentials) => apiService.login(credentials),
  logout: () => apiService.logout(),
  getCurrentUser: () => apiService.getCurrentUser(),
  refreshToken: () => apiService.refreshToken(),
  sendVerificationEmail: () => apiService.sendVerificationEmail(),
};

export default apiService; 