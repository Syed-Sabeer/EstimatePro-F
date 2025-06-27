import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '@/lib/api';
import { AUTH_CONFIG } from '@/lib/config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
      
      if (storedToken) {
        setToken(storedToken);
        try {
          // Verify token and get user data
          const userData = await authAPI.getCurrentUser();
          // Only set user if email is verified
          if (userData.email_verified_at) {
            setUser(userData);
          } else {
            // Token is valid but email is not verified, clear user but keep token
            setUser(null);
          }
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      // Only set user if email is verified
      if (response.user && response.user.email_verified_at) {
        setUser(response.user);
      } else {
        setUser(null);
      }
      setToken(response.token);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      setUser(response.user);
      setToken(response.token);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};