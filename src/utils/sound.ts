/**
 * Playful sound effects generated dynamically using the Web Audio API.
 * This guarantees audio works offline/locally without requiring heavy audio assets.
 */
class SoundEffects {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
  }

  playBloop() {
    try {
      this.init();
      if (!this.ctx) return;
      
      // Resume context if suspended (browser security policy)
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.12);
      
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {
      console.warn("AudioContext block or unsupported:", e);
    }
  }

  playSparkle() {
    try {
      this.init();
      if (!this.ctx) return;
      
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, this.ctx.currentTime + 0.18); // C6
      
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    } catch (e) {
      console.warn(e);
    }
  }

  playFanfare() {
    try {
      this.init();
      if (!this.ctx) return;
      
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      
      const playTone = (freq: number, delay: number, duration: number, type: 'sine' | 'triangle' = 'sine') => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + duration);
        
        osc.start(this.ctx.currentTime + delay);
        osc.stop(this.ctx.currentTime + delay + duration);
      };
      
      // Beautiful major arpeggio to celebrate
      playTone(261.63, 0.0, 0.3, 'triangle'); // C4
      playTone(329.63, 0.08, 0.3, 'triangle'); // E4
      playTone(392.00, 0.16, 0.3, 'triangle'); // G4
      playTone(523.25, 0.24, 0.6, 'triangle'); // C5
      playTone(659.25, 0.32, 0.8, 'sine'); // E5
    } catch (e) {
      console.warn(e);
    }
  }
}

export const sounds = new SoundEffects();
