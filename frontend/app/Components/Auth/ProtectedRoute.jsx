'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiLock } from 'react-icons/fi';

/**
 * ProtectedRoute component that requires authentication for access
 * Shows a login modal if user is not authenticated
 */
const ProtectedRoute = ({ children, pageName = "this page" }) => {
  const { isAuthenticated, user, openAuthModal, checkAuthStatus } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = async () => {
      setIsLoading(true);
      await checkAuthStatus();
      setIsLoading(false);
    };
    
    checkAuth();
  }, []); // Empty dependency array - only run once on mount

  // Show loading skeleton while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="w-full max-w-md mx-auto p-6">
          {/* Authentication Check Skeleton */}
          <div className="bg-[var(--color-second-bg)] border border-border rounded-lg p-8 shadow-lg">
            {/* Icon skeleton */}
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
              </div>
            </div>
            
            {/* Title skeleton */}
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-3 animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
            </div>
            
            {/* Description skeleton */}
            <div className="space-y-2 mb-6">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
              </div>
            </div>
            
            {/* Button skeletons */}
            <div className="space-y-3">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-full animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
              </div>
              <div className="h-12 bg-gray-100 dark:bg-gray-600 rounded-lg w-full animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
              </div>
            </div>
            
            {/* Footer text skeleton */}
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto mt-4 animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
            </div>
          </div>
        </div>
        
        {/* Global shimmer animation styles */}
        <style jsx global>{`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%) skewX(-12deg);
            }
            100% {
              transform: translateX(200%) skewX(-12deg);
            }
          }
        `}</style>
      </div>
    );
  }

  // Show authentication required modal if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4">
        <motion.div
          className="bg-[var(--color-second-bg)] border border-border rounded-lg p-8 shadow-lg max-w-md w-full text-center"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <FiShoppingCart className="text-4xl text-accent" />
              <FiLock className="text-lg text-red-500 absolute -top-1 -right-1 bg-[var(--color-second-bg)] rounded-full p-0.5" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-text-primary mb-3">
            Authentication Required
          </h2>
          
          <p className="text-text-secondary mb-6">
            You need to be logged in to access {pageName}. Please log in to continue with your purchase.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => openAuthModal('login')}
              className="w-full bg-button-primary text-[var(----color-text-primary)] py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Login to Continue
            </button>
            
            <button
              onClick={() => openAuthModal('signup')}
              className="w-full bg-transparent border border-border text-text-primary py-3 px-6 rounded-lg font-medium hover:bg-[var(--color-background)] transition-colors"
            >
              Create New Account
            </button>
          </div>
          
          <p className="text-text-secondary text-sm mt-4">
            Your shopping cart items are saved and will be available after login.
          </p>
        </motion.div>
      </div>
    );
  }

  // User is authenticated, render the protected content
  return children;
};

export default ProtectedRoute;

