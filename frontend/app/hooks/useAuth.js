// app/hooks/useAuth.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  authenticateUser, 
  registerUser, 
  isAuthenticated, 
  logoutUser, 
  getAccessToken,
  refreshAccessToken 
} from '../lib/auth';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const result = await authenticateUser(email, password);
      if (result.success) {
        setIsLoggedIn(true);
        // You might want to fetch user details here if your API provides them
        setUser(result.data.user || null);
      }
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, []);

  const signup = useCallback(async (userData) => {
    setLoading(true);
    try {
      const result = await registerUser(userData);
      if (result.success) {
        setIsLoggedIn(true);
        // You might want to fetch user details here if your API provides them
        setUser(result.data.user || null);
      }
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setIsLoggedIn(false);
    setUser(null);
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      await refreshAccessToken();
      setIsLoggedIn(true);
      return true;
    } catch (error) {
      setIsLoggedIn(false);
      setUser(null);
      return false;
    }
  }, []);

  return {
    isLoggedIn,
    loading,
    user,
    login,
    signup,
    logout,
    refreshToken,
    token: getAccessToken(),
  };
}
