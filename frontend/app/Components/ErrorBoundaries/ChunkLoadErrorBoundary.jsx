'use client';

import React from 'react';

class ChunkLoadErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error) {
    // Check if it's a chunk loading error
    if (
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('ChunkLoadError')
    ) {
      return { hasError: true, error };
    }
    return null;
  }

  componentDidCatch(error, errorInfo) {
    if (
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('ChunkLoadError')
    ) {
      console.error('ChunkLoadError caught by boundary:', error, errorInfo);
      
      // Auto-retry after a short delay
      setTimeout(() => {
        if (this.state.retryCount < 3) {
          this.setState(prevState => ({
            hasError: false,
            error: null,
            retryCount: prevState.retryCount + 1
          }));
          
          // Force a page reload to get fresh chunks
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }
      }, 1000);
    }
  }

  handleManualRetry = () => {
    // Clear cache and reload
    if (typeof window !== 'undefined') {
      // Clear Next.js cache
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes('next')) {
              caches.delete(name);
            }
          });
        });
      }
      
      // Force reload
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
              Loading Error
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              Failed to load application resources. This usually happens when the app has been updated.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={this.handleManualRetry}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Refresh Application
              </button>
              
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, retryCount: 0 });
                }}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
            
            {this.state.retryCount > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
                Retry attempt: {this.state.retryCount}/3
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChunkLoadErrorBoundary;
