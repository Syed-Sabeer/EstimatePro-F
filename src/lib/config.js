// API Configuration
export const API_CONFIG = {
  // BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://estimatepro.deveondynamics.com/public/api',
  TIMEOUT: 10000, // 10 seconds
};

// Authentication Configuration
export const AUTH_CONFIG = {
  TOKEN_KEY: 'authToken',
  DEFAULT_ROLE_ID: 2, // Default role for new users
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'EstiMate Pro',
  VERSION: '1.0.0',
};

export default {
  API_CONFIG,
  AUTH_CONFIG,
  APP_CONFIG,
}; 