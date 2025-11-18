// app/hooks/useAlpineJS.js
import { useEffect } from 'react';

export const useAlpineJS = () => {
  useEffect(() => {
    // Check if Alpine.js is already loaded
    if (typeof window !== 'undefined' && !window.Alpine) {
      // Load Alpine.js from CDN
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js';
      script.defer = true;
      
      // Add the script to the document head
      document.head.appendChild(script);
      
      // Clean up function
      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, []);
};

export default useAlpineJS;
