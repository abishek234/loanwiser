import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // API base URL
  const API_URL = 'http://localhost:8000/api/users';

  // Load user from localStorage on refresh/initial load
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Configure auth header
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        
        // Fetch user profile
        const res = await axios.get(`${API_URL}/profile`, config);
        
        if (res.data.success) {
          setUser(res.data.user);
          setIsAuthenticated(true);
        }
      } catch (err) {
        localStorage.removeItem('authToken');
        setError('Authentication failed');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Register user
  const register = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post(`${API_URL}/register`, formData);
      
      if (res.data.success) {
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  // Request OTP for login
  const requestOTP = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post(`${API_URL}/login/request-otp`, { email });
      
      if (res.data.success) {
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
      return { success: false, message: err.response?.data?.message || 'Failed to send OTP' };
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and login
  const verifyOTP = async (email, otp) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post(`${API_URL}/login/verify-otp`, { email, otp });
      
      if (res.data.success) {
        // Save token to localStorage
        localStorage.setItem('authToken', res.data.token);
        
        // Set user and authentication state
        setUser(res.data.user);
        setIsAuthenticated(true);
        
        return { success: true };
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
      return { success: false, message: err.response?.data?.message || 'OTP verification failed' };
    } finally {
      setLoading(false);
    }
  };

  // Login with password (fallback)
  const loginWithPassword = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post(`${API_URL}/login/password`, { email, password });
      
      if (res.data.success) {
        // Save token to localStorage
        localStorage.setItem('authToken', res.data.token);
        
        // Set user and authentication state
        setUser(res.data.user);
        setIsAuthenticated(true);
        
        return { success: true };
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);
    
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated,
        register,
        requestOTP,
        verifyOTP,
        loginWithPassword,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;