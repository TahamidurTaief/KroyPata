// app/lib/auth.js
import { loginUser, signupUser } from './api';

// Token management utilities
export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

export const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken');
  }
  return null;
};

export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

export const isAuthenticated = () => {
  const token = getAccessToken();
  if (!token) return false;
  
  try {
    // Check if token is expired (JWT tokens have expiry in payload)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Error checking token validity:', error);
    return false;
  }
};

// Authentication wrapper functions
export const authenticateUser = async (email, password) => {
  try {
    const response = await loginUser(email, password);
    return {
      success: true,
      data: response,
      message: 'Login successful'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Login failed'
    };
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await signupUser(userData);
    return {
      success: true,
      data: response,
      message: 'Registration successful'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Registration failed'
    };
  }
};

export const logoutUser = () => {
  clearTokens();
  // Optionally redirect to login page or refresh the page
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

// Helper function to get authorization headers
export const getAuthHeaders = () => {
  const token = getAccessToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Function to refresh access token using refresh token
export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');
  const response = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    
    if (data.access) {
      localStorage.setItem('accessToken', data.access);
      return data.access;
    }
    
    throw new Error('No access token in refresh response');
  } catch (error) {
    console.error('Token refresh failed:', error);
    clearTokens();
    throw error;
  }
};
