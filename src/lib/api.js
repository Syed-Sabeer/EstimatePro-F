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
      const response = await fetch(`${this.baseURL}/api/register`, {
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
      const response = await fetch(`${this.baseURL}/api/login`, {
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
      const response = await fetch(`${this.baseURL}/api/logout`, {
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

  // Get current user with profile
  async getCurrentUser() {
    try {
      const response = await fetch(`${this.baseURL}/api/current/user`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      return data.currentUser; // Return the currentUser object from Laravel response
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch user data');
    }
  }

  // Get user profile
  async getProfile() {
    try {
      const response = await fetch(`${this.baseURL}/api/profile`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const data = await response.json();
      return data.profile; // Return the profile object from Laravel response
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch profile data');
    }
  }

  // Get profile by ID
  async getProfileById(userId) {
    try {
      const response = await fetch(`${this.baseURL}/api/profile/${userId}`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const data = await response.json();
      return data.profile; // Return the profile object from Laravel response
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch profile data');
    }
  }

  // Store/Update profile
  async updateProfile(profileData, profilePicture = null) {
    try {
      console.log('Updating profile with data:', profileData);
      console.log('Profile picture:', profilePicture);

      let body;
      let headers;

      if (profilePicture) {
        // Handle multipart form data for profile picture
        const formData = new FormData();
        
        // Add all profile fields to FormData
        Object.keys(profileData).forEach(key => {
          if (profileData[key] !== null && profileData[key] !== undefined && profileData[key] !== '') {
            formData.append(key, profileData[key]);
          }
        });
        
        // Add profile picture
        formData.append('profile_picture', profilePicture);
        
        body = formData;
        // Don't set Content-Type header for FormData, let browser set it automatically
        headers = {
          'Accept': 'application/json',
        };
        
        if (this.token) {
          headers['Authorization'] = `Bearer ${this.token}`;
        }
      } else {
        // Regular JSON request - remove empty fields
        const cleanedData = {};
        Object.keys(profileData).forEach(key => {
          if (profileData[key] !== null && profileData[key] !== undefined && profileData[key] !== '') {
            cleanedData[key] = profileData[key];
          }
        });
        
        body = JSON.stringify(cleanedData);
        headers = this.getHeaders(true);
        console.log('Sending JSON data:', cleanedData);
      }

      const response = await fetch(`${this.baseURL}/api/profile`, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      console.log('Profile update response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Profile update error:', errorData);
        throw new Error(errorData.message || errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      console.log('Profile update success:', data);
      return data.profile; // Return the updated profile object
    } catch (error) {
      console.error('Profile update failed:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  // Forgot password API
  async forgotPassword(email) {
    try {
      const response = await fetch(`${this.baseURL}/api/forgot-password`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send password reset email');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Failed to send password reset email');
    }
  }

  // Reset password API
  async resetPassword(resetData) {
    try {
      const response = await fetch(`${this.baseURL}/api/reset-password`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(resetData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset password');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Failed to reset password');
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const response = await fetch(`${this.baseURL}/api/refresh-token`, {
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
      const response = await fetch(`${this.baseURL}/api/email/verification-notification`, {
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

  // Client Survey APIs
  // Submit client survey
  async submitClientSurvey(builderId, surveyData) {
    try {
      const response = await fetch(`${this.baseURL}/api/client-survey/store/${builderId}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(surveyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to submit survey');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Failed to submit survey');
    }
  }

  // Submit client survey with files
  async submitClientSurveyWithFiles(builderId, formData) {
    try {
      // Get auth headers but exclude Content-Type for FormData
      const headers = {};
      const token = localStorage.getItem('authToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}/api/client-survey/store/${builderId}`, {
        method: 'POST',
        headers: headers, // Don't set Content-Type, let browser set it for FormData
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to submit survey');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Failed to submit survey');
    }
  }

  // Get client surveys for authenticated user
  async getClientSurveys() {
    try {
      const response = await fetch(`${this.baseURL}/api/client-surveys`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch client surveys');
      }

      const data = await response.json();
      return data.buildersClientSurveys || [];
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch client surveys');
    }
  }

  // Get specific client survey detail
  async getClientSurveyDetail(surveyId) {
    try {
      const response = await fetch(`${this.baseURL}/api/client-surveys/show/${surveyId}`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch survey details');
      }

      const data = await response.json();
      return data.clientSurvey;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch survey details');
    }
  }

  // Update client survey status
  async updateClientSurveyStatus(surveyId, status) {
    try {
      const response = await fetch(`${this.baseURL}/api/client-surveys/update-status/${surveyId}`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to update survey status');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Failed to update survey status');
    }
  }

  // Delete client survey
  async deleteClientSurvey(surveyId) {
    try {
      const response = await fetch(`${this.baseURL}/api/client-surveys/${surveyId}`, {
        method: 'DELETE',
        headers: this.getHeaders(true),
      });

      if (!response.ok) {
        throw new Error('Failed to delete survey');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Failed to delete survey');
    }
  }

  // Builder Pricing APIs
  // Get builder pricings
  async getBuilderPricings() {
    try {
      const response = await fetch(`${this.baseURL}/api/builder-pricing`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch builder pricings');
      }

      const data = await response.json();
      return data.builderPricings || [];
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch builder pricings');
    }
  }

  // Store new builder pricing
  async storeBuilderPricing(pricingData) {
    try {
      console.log('API: Sending pricing data to backend:', pricingData);
      
      const response = await fetch(`${this.baseURL}/api/builder-pricing`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(pricingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API: Backend validation error:', errorData);
        throw new Error(errorData.message || errorData.error || 'Failed to store pricing');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Failed to store pricing');
    }
  }

  // Update builder pricing
  async updateBuilderPricing(pricingId, pricingData) {
    try {
      const response = await fetch(`${this.baseURL}/api/builder-pricing/${pricingId}`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(pricingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to update pricing');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Failed to update pricing');
    }
  }

  // Delete builder pricing
  async deleteBuilderPricing(pricingId) {
    try {
      const response = await fetch(`${this.baseURL}/api/builder-pricing/${pricingId}`, {
        method: 'DELETE',
        headers: this.getHeaders(true),
      });

      if (!response.ok) {
        throw new Error('Failed to delete pricing');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Failed to delete pricing');
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
  forgotPassword: (email) => apiService.forgotPassword(email),
  resetPassword: (resetData) => apiService.resetPassword(resetData),
};

export const profileAPI = {
  getProfile: () => apiService.getProfile(),
  getProfileById: (userId) => apiService.getProfileById(userId),
  updateProfile: (profileData, profilePicture = null) => apiService.updateProfile(profileData, profilePicture),
};

export const clientSurveyAPI = {
  submitClientSurvey: (builderId, surveyData) => apiService.submitClientSurvey(builderId, surveyData),
  submitClientSurveyWithFiles: (builderId, formData) => apiService.submitClientSurveyWithFiles(builderId, formData),
  getClientSurveys: () => apiService.getClientSurveys(),
  getClientSurveyDetail: (surveyId) => apiService.getClientSurveyDetail(surveyId),
  updateClientSurveyStatus: (surveyId, status) => apiService.updateClientSurveyStatus(surveyId, status),
  deleteClientSurvey: (surveyId) => apiService.deleteClientSurvey(surveyId),
};

export const builderPricingAPI = {
  getBuilderPricings: () => apiService.getBuilderPricings(),
  storeBuilderPricing: (pricingData) => apiService.storeBuilderPricing(pricingData),
  updateBuilderPricing: (pricingId, pricingData) => apiService.updateBuilderPricing(pricingId, pricingData),
  deleteBuilderPricing: (pricingId) => apiService.deleteBuilderPricing(pricingId),
};

export default apiService; 