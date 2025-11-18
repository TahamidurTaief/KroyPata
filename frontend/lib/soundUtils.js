// Sound utility for checkout notifications
// Place this in: /lib/soundUtils.js

/**
 * Plays notification sounds for checkout actions
 * @param {string} soundType - 'success', 'error', or 'warning'
 * @param {number} volume - Volume level (0.0 to 1.0, default: 0.5)
 */
export const playNotificationSound = (soundType, volume = 0.5) => {
  // Check if audio is supported and user hasn't disabled sounds
  if (typeof Audio === 'undefined') {
    console.log('Audio not supported');
    return;
  }

  try {
    const audio = new Audio(`/sounds/${soundType}.mp3`);
    audio.volume = Math.min(Math.max(volume, 0), 1); // Clamp volume between 0 and 1
    
    // Promise-based play with error handling
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log(`${soundType} sound played successfully`);
        })
        .catch(error => {
          console.log(`Sound play failed (user interaction may be required):`, error);
        });
    }
  } catch (error) {
    console.log(`Error creating audio:`, error);
  }
};

/**
 * Preload all notification sounds for better performance
 * Call this when the checkout page loads
 */
export const preloadNotificationSounds = () => {
  const sounds = ['success', 'error', 'warning'];
  
  sounds.forEach(soundType => {
    try {
      const audio = new Audio(`/sounds/${soundType}.mp3`);
      audio.preload = 'auto';
      audio.volume = 0; // Silent preload
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
      }).catch(() => {
        // Ignore preload errors
      });
    } catch (error) {
      console.log(`Failed to preload ${soundType} sound:`, error);
    }
  });
};

/**
 * Sound helper functions for specific checkout actions
 */
export const checkoutSounds = {
  // Success sounds
  couponApplied: () => playNotificationSound('success', 0.6),
  paymentSuccess: () => playNotificationSound('success', 0.7),
  orderConfirmed: () => playNotificationSound('success', 0.8),
  
  // Error sounds
  couponInvalid: () => playNotificationSound('error', 0.5),
  paymentFailed: () => playNotificationSound('error', 0.6),
  formError: () => playNotificationSound('error', 0.4),
  
  // Warning sounds
  formValidation: () => playNotificationSound('warning', 0.4),
  generalAlert: () => playNotificationSound('warning', 0.5),
  infoMessage: () => playNotificationSound('warning', 0.3),
};

// Export individual sound functions for convenience
export const {
  couponApplied,
  paymentSuccess,
  orderConfirmed,
  couponInvalid,
  paymentFailed,
  formError,
  formValidation,
  generalAlert,
  infoMessage
} = checkoutSounds;
