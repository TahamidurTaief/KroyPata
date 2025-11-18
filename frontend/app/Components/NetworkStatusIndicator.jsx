"use client";

// Network Status Component
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { testApiConnectivity } from '@/app/lib/testApi';

export const NetworkStatusIndicator = () => {
  const [status, setStatus] = useState({ connected: true, checking: false });
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      setStatus(prev => ({ ...prev, checking: true }));
      const result = await testApiConnectivity();
      setStatus({ connected: result.connected, checking: false });
      
      // Show status for a few seconds if there's an issue
      if (!result.connected) {
        setShowStatus(true);
        setTimeout(() => setShowStatus(false), 5000);
      }
    };

    // Check immediately
    checkConnection();

    // Check periodically
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  if (status.connected && !status.checking) {
    return null; // Don't show anything when everything is working
  }

  return (
    <AnimatePresence>
      {(showStatus || status.checking || !status.connected) && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className={`px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm ${
            status.checking 
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              : status.connected
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {status.checking ? (
              <>
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Checking server...</span>
              </>
            ) : status.connected ? (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span>Connected to server</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span>Server offline - using cached data</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NetworkStatusIndicator;
