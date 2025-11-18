'use client';

import React from 'react';
import { formatErrorMessage, ERROR_CODES } from '@/app/lib/apiErrorHandler';

/**
 * Enhanced Error Boundary with better recovery and user feedback
 */
class EnhancedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by Enhanced Error Boundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log to error reporting service if available
    if (typeof window !== 'undefined' && window.errorReporter) {
      window.errorReporter.logError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({ 
      hasError: false, 
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
    
    // Call onRetry prop if provided
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null,
      retryCount: 0,
    });
    
    // Navigate to home page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'An unexpected error occurred';
      const isAPIError = this.state.error?.code && Object.values(ERROR_CODES).includes(this.state.error.code);
      const userMessage = isAPIError ? formatErrorMessage(this.state.error) : errorMessage;
      
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          retry: this.handleRetry,
          reset: this.handleReset,
        });
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
          <div className="max-w-md w-full bg-[var(--color-second-bg)] rounded-lg shadow-lg p-8 border border-border">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <svg 
                  className="w-10 h-10 text-red-600 dark:text-red-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                  />
                </svg>
              </div>
            </div>
            
            {/* Error Title */}
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4 text-center">
              {isAPIError && this.state.error.code === ERROR_CODES.NETWORK_ERROR
                ? 'Connection Error'
                : 'Something Went Wrong'}
            </h2>
            
            {/* Error Message */}
            <p className="text-[var(--color-text-secondary)] mb-6 text-center">
              {userMessage}
            </p>
            
            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                <summary className="cursor-pointer font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Error Details (Dev Only)
                </summary>
                <pre className="whitespace-pre-wrap text-gray-600 dark:text-gray-400 overflow-auto">
                  {this.state.error?.stack || JSON.stringify(this.state.error, null, 2)}
                </pre>
              </details>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                className="flex-1 px-4 py-3 bg-[var(--color-button-primary)] text-white rounded-lg hover:bg-[var(--color-button-primary-hover)] transition-colors font-medium"
                onClick={this.handleRetry}
              >
                Try Again
                {this.state.retryCount > 0 && ` (${this.state.retryCount})`}
              </button>
              
              <button
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-[var(--color-text-primary)] rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                onClick={this.handleReset}
              >
                Go Home
              </button>
            </div>
            
            {/* Help Text */}
            <p className="mt-6 text-sm text-center text-[var(--color-text-secondary)]">
              If the problem persists, please{' '}
              <a 
                href="/contact" 
                className="text-blue-500 hover:text-blue-600 underline"
              >
                contact support
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;
