import React, { createContext, useContext, useState, useEffect } from 'react';
import { userApi } from './api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('userData');

      if (!token || !userData) {
        setUser(null);
        setLoading(false);
        return;
      }

      const parsedData = JSON.parse(userData);
      const tokenExpiry = new Date(parsedData.tokenExpiry);
      const now = new Date();

      console.log('Token expiry:', tokenExpiry); // Debug: Log token expiry
      console.log('Current time:', now); // Debug: Log current time

      if (now >= tokenExpiry) {
        console.warn('Token expired. Logging out.');
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(parsedData);

      try {
        const response = await userApi.getProfile(); // Validate token with server
        setUser(response.data);
      } catch (error) {
        if (error.response?.status === 404) {
          console.error('Profile not found:', error.response.data.message);
        } else {
          console.error('Server validation failed:', error);
        }
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await userApi.login(email, password);

      // Debug: Log the entire response to verify its structure
      console.log('Login response:', response);

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error('Invalid response from server. Token or user data is missing.');
      }

      // Debug: Log the token and user to verify they are being extracted correctly
      console.log('Token received:', token);
      console.log('User data received:', user);

      // Store token in local storage
      localStorage.setItem('token', token);

      // Calculate token expiration (24 hours from now)
      const tokenExpiry = new Date();
      tokenExpiry.setHours(tokenExpiry.getHours() + 24);

      // Store user data with token expiration
      const userData = {
        ...user,
        token,
        tokenExpiry: tokenExpiry.toISOString(),
      };

      localStorage.setItem('userData', JSON.stringify(userData));
      setUser(user);

      return user; // Return the user data for the component to use
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (userData) => {
    try {
      const response = await userApi.register(userData);
      const { token, user } = response.data;

      // Calculate token expiration (24 hours from now)
      const tokenExpiry = new Date();
      tokenExpiry.setHours(tokenExpiry.getHours() + 24);

      // Store user data with token expiration
      const userDataWithExpiry = {
        ...user,
        token,
        tokenExpiry: tokenExpiry.toISOString(),
      };

      localStorage.setItem('userData', JSON.stringify(userDataWithExpiry));
      localStorage.setItem('token', token);
      setUser(user);

      return user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};