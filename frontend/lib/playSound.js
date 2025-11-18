/**
 * Simple sound utility for playing notification sounds
 * This is a lightweight wrapper used by NotificationModal and other components
 * @param {string} type - The type of sound to play: 'success', 'error', or 'warning'
 */
export function playSound(type) {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    console.log(`🔊 Sound playback skipped - not in browser environment`);
    return;
  }
  
  console.log(`🔊 Attempting to play ${type} sound`);
  
  try {
    // Check if Audio is supported in the browser
    if (typeof Audio === 'undefined') {
      console.warn('❌ Audio not supported in this browser');
      return;
    }

    // Sound file paths
    const soundPaths = {
      success: '/sounds/success.mp3',
      error: '/sounds/error.mp3',
      warning: '/sounds/warning.mp3'
    };

    const soundPath = soundPaths[type];
    
    if (soundPath) {
      console.log(`🎵 Trying to load sound file: ${soundPath}`);
      const audio = new Audio(soundPath);
      audio.volume = 0.5;
      
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`✅ ${type} sound played successfully from file`);
          })
          .catch(error => {
            console.log(`⚠️ Sound file failed:`, error.message);
          });
      }
    }

  } catch (error) {
    console.warn(`❌ Error playing ${type} sound:`, error.message);
  }
}

export default playSound;
