"use client";

import React, { createContext, useState, useContext, useEffect } from "react";

// Create the context to be consumed by components
const AuthContext = createContext(null);

/**
 * AuthProvider component wraps the application to provide authentication context.
 * It manages the state for the authentication modal (open/closed, login/signup view).
 * @param {object} props - Component properties.
 * @param {React.ReactNode} props.children - The child components to be rendered within the provider.
 */
export const AuthProvider = ({ children }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState("login"); // Can be 'login' or 'signup'
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount (no hook calls inside this effect!)
  useEffect(() => {
    checkAuthStatus();

    const handleAuthRequired = (event) => {
      const reason = event.detail?.reason || 'Authentication required';
      console.log('Auth required:', reason);
      setUser(null);
      setIsAuthenticated(false);
      openAuthModal('login');
    };

    window.addEventListener('authRequired', handleAuthRequired);
    return () => window.removeEventListener('authRequired', handleAuthRequired);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Logout function to clear auth state
    const logout = () => {
      setUser(null);
      setIsAuthenticated(false);
    
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('redirectAfterLogin');
      }
  };

  // Check if user is authenticated
  const checkAuthStatus = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing user data:', error);
          logout();
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    }
  };

  // Login function to update auth state
  const login = (userData, tokens) => {
    console.log('AuthContext: Logging in user:', userData);
    console.log('AuthContext: Setting isAuthenticated to true');
    
    // Set auth state immediately - these should be synchronous
    setUser(userData);
    setIsAuthenticated(true);
    
    // Store tokens and user data
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.access);
      if (tokens.refresh) {
        localStorage.setItem('refreshToken', tokens.refresh);
      }
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log('AuthContext: Stored user data in localStorage');
      
      // Handle redirect only for protected routes that were stored
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        localStorage.removeItem('redirectAfterLogin');
        // Use a small delay to ensure auth state is updated
        setTimeout(() => {
          window.location.href = redirectPath;
        }, 100);
      }
      // If no redirect path is stored, stay on current page (silent login)
    }
    
    // Close auth modal if open
    closeAuthModal();
    
    // Force a re-render by calling checkAuthStatus after a brief delay
    setTimeout(() => {
      console.log('AuthContext: Force checking auth status');
      checkAuthStatus();
    }, 10);
  };

  // Opens the authentication modal, defaulting to the 'login' view
  const openAuthModal = (view = "login") => {
    // Store current page path for redirect after login (if needed)
    if (typeof window !== 'undefined' && !localStorage.getItem('redirectAfterLogin')) {
      const currentPath = window.location.pathname;
      // Only store redirect path for specific protected routes, not for public pages
      const protectedPaths = ['/orders', '/cart', '/checkout', '/profile', '/account'];
      const isProtectedPath = protectedPaths.some(path => currentPath.startsWith(path));
      
      if (isProtectedPath) {
        localStorage.setItem('redirectAfterLogin', currentPath);
      }
    }
    
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  };

  // Closes the authentication modal
  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Functions to switch between views inside the modal
  const switchToLogin = () => setAuthModalView("login");
  const switchToSignup = () => setAuthModalView("signup");

  // Function to get current access token
  const getAccessToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  };

  // The value object contains all state and functions to be provided to consumers
  const value = {
    isAuthModalOpen,
    authModalView,
    user,
    isAuthenticated,
    openAuthModal,
    closeAuthModal,
    switchToLogin,
    switchToSignup,
    login,
    logout,
    checkAuthStatus,
    getAccessToken, // Add this helper function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * A custom hook (useAuth) to simplify accessing the authentication context.
 * It ensures the hook is used within an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
