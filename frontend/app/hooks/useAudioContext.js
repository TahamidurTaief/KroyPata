import { useEffect, useRef } from 'react';

/**
 * Custom hook to ensure audio context is initialized properly
 * This handles browser autoplay policies and user interaction requirements
 */
export const useAudioContext = () => {
  const audioContextRef = useRef(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    const initializeAudioContext = () => {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return;
      }
      
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext && !audioContextRef.current) {
          audioContextRef.current = new AudioContext();
          isInitializedRef.current = true;
          console.log('Audio context initialized');
        }
      } catch (error) {
        console.warn('Failed to initialize audio context:', error);
      }
    };

    // Initialize audio context on first user interaction
    const handleUserInteraction = () => {
      if (!isInitializedRef.current) {
        initializeAudioContext();
        
        // Resume context if suspended
        if (audioContextRef.current?.state === 'suspended') {
          audioContextRef.current.resume();
        }
      }
    };

    // Add event listeners for user interaction
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
      
      // Close audio context on cleanup
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);

  return {
    audioContext: audioContextRef.current,
    isInitialized: isInitializedRef.current
  };
};

export default useAudioContext;
