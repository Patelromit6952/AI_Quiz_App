// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await apiService.getProfile();
          if (response.success) {
            console.log('AuthContext: Found existing token, user data:', response.data);
            setUser(response.data);
          } else {
            console.log('AuthContext: Invalid token, removing from localStorage');
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('AuthContext: Auth check failed:', error);
          localStorage.removeItem('token');
        }
      } else {
        console.log('AuthContext: No token found in localStorage');
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      console.log('AuthContext: Starting login...');
      const response = await apiService.login(credentials);
      console.log('AuthContext: Login response:', response);
      
      if (response.success && response.user && response.token) {
        console.log('AuthContext: Setting user state:', response.user);
        setUser(response.user);
        localStorage.setItem('token', response.token);
        return { success: true };
      } else {
        console.error('AuthContext: Invalid response structure:', response);
        return { success: false, error: response.message || 'Invalid response from server' };
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      console.log('AuthContext: Starting registration...');
      const response = await apiService.register(userData);
      console.log('AuthContext: Registration response:', response);
      
      if (response.success && response.user && response.token) {
        console.log('AuthContext: Setting user state:', response.user);
        setUser(response.user);
        localStorage.setItem('token', response.token);
        return { success: true };
      } else {
        console.error('AuthContext: Invalid response structure:', response);
        return { success: false, error: response.message || 'Invalid response from server' };
      }
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      return { 
        success: false, 
        error: error.message || 'Registration failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  // Debug effect to watch user state changes
  useEffect(() => {
    console.log('AuthContext: User state changed to:', user);
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      updateUser,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;