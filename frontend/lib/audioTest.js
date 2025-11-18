// Test utility to check audio capabilities
export const testAudioCapabilities = () => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    console.log("🔊 Audio test skipped - not in browser environment");
    return;
  }
  
  console.log("🔊 Audio Capabilities Test:");
  console.log("- AudioContext supported:", !!window.AudioContext || !!window.webkitAudioContext);
  console.log("- HTML5 Audio supported:", !!window.Audio);
  
  // Test Web Audio API
  if (window.AudioContext || window.webkitAudioContext) {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      console.log("- AudioContext state:", audioCtx.state);
      console.log("- Sample rate:", audioCtx.sampleRate);
      audioCtx.close();
    } catch (error) {
      console.log("- AudioContext error:", error.message);
    }
  }

  // Test HTML5 Audio
  if (window.Audio) {
    try {
      const audio = new Audio();
      console.log("- Audio element created successfully");
      console.log("- Supported formats:", {
        mp3: audio.canPlayType('audio/mpeg'),
        wav: audio.canPlayType('audio/wav'),
        ogg: audio.canPlayType('audio/ogg')
      });
    } catch (error) {
      console.log("- Audio element error:", error.message);
    }
  }
};

// Test function for programmatic sound generation
export const testProgrammaticSound = async () => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    console.log("🎵 Programmatic sound test skipped - not in browser environment");
    return;
  }
  
  console.log("🎵 Testing programmatic sound generation...");
  
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    if (audioCtx.state === 'suspended') {
      console.log("🔇 AudioContext suspended, attempting to resume...");
      await audioCtx.resume();
    }
    
    console.log("🎼 Creating oscillator...");
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4 note
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.5);
    
    console.log("✅ Programmatic sound test completed");
    
    setTimeout(() => {
      audioCtx.close();
    }, 1000);
    
  } catch (error) {
    console.log("❌ Programmatic sound test failed:", error.message);
  }
};
