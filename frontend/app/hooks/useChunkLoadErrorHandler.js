'use client';

import { useEffect } from 'react';

/**
 * Hook to handle chunk loading errors and implement retry logic
 */
export const useChunkLoadErrorHandler = () => {
  useEffect(() => {
    const handleChunkError = (event) => {
      // Check if it's a chunk loading error
      if (
        event.error?.name === 'ChunkLoadError' ||
        event.error?.message?.includes('Loading chunk') ||
        event.error?.message?.includes('ChunkLoadError') ||
        event.error?.message?.includes('timeout')
      ) {
        console.warn('Chunk loading error detected:', event.error);
        
        // Clear Next.js cache
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              if (name.includes('next') || name.includes('static')) {
                caches.delete(name);
                console.log('Cleared cache:', name);
              }
            });
          });
        }
        
        // Reload the page after a short delay
        setTimeout(() => {
          console.log('Reloading page due to chunk error...');
          window.location.reload();
        }, 1500);
      }
    };

    const handleUnhandledRejection = (event) => {
      // Handle promise rejections that might be chunk loading errors
      if (
        event.reason?.message?.includes('Loading chunk') ||
        event.reason?.message?.includes('ChunkLoadError') ||
        event.reason?.name === 'ChunkLoadError'
      ) {
        console.warn('Unhandled chunk loading rejection:', event.reason);
        handleChunkError({ error: event.reason });
        event.preventDefault(); // Prevent the error from being logged as unhandled
      }
    };

    // Add global error handlers
    window.addEventListener('error', handleChunkError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleChunkError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
};

/**
 * Preload critical chunks to prevent loading errors
 */
export const preloadCriticalChunks = () => {
  if (typeof window === 'undefined') return;

  // Preload the layout chunk if it's not already loaded
  const layoutScript = document.querySelector('script[src*="layout"]');
  if (!layoutScript) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = '/_next/static/chunks/app/layout.js';
    document.head.appendChild(link);
  }
};

/**
 * Clear all Next.js related caches
 */
export const clearNextJSCache = async () => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      const nextCaches = cacheNames.filter(name => 
        name.includes('next') || 
        name.includes('static') ||
        name.includes('webpack')
      );
      
      await Promise.all(nextCaches.map(name => caches.delete(name)));
      console.log('Cleared Next.js caches:', nextCaches);
    } catch (error) {
      console.error('Error clearing caches:', error);
    }
  }
};

export default useChunkLoadErrorHandler;
