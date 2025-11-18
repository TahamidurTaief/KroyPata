/**
 * Utility to generate and download simple notification sound files
 * Run this in browser console to create MP3 files
 */

class SoundGenerator {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  // Generate a simple tone
  generateTone(frequency, duration, volume = 0.3) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
    
    return new Promise(resolve => {
      setTimeout(resolve, duration * 1000 + 100);
    });
  }

  // Generate success sound (ascending chime)
  async generateSuccessSound() {
    await this.generateTone(523.25, 0.15); // C5
    await this.generateTone(659.25, 0.15); // E5
    await this.generateTone(783.99, 0.3);  // G5
  }

  // Generate error sound (descending tone)
  async generateErrorSound() {
    await this.generateTone(440, 0.2);    // A4
    await this.generateTone(349.23, 0.3); // F4
  }

  // Generate warning sound (double beep)
  async generateWarningSound() {
    await this.generateTone(523.25, 0.15); // C5
    setTimeout(() => {
      this.generateTone(523.25, 0.15);     // C5
    }, 200);
  }
}

// Usage in browser console:
/*
const generator = new SoundGenerator();

// Test sounds
generator.generateSuccessSound(); // Success
generator.generateErrorSound();   // Error  
generator.generateWarningSound(); // Warning
*/

console.log('SoundGenerator class loaded. Create instance with: const gen = new SoundGenerator();');
console.log('Then call: gen.generateSuccessSound(), gen.generateErrorSound(), gen.generateWarningSound()');

export default SoundGenerator;
