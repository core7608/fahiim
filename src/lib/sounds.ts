// Simple sound utility using AudioContext to avoid external assets
class SoundManager {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playBeep(freq: number = 440, type: OscillatorType = 'sine', duration: number = 0.1) {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playSuccess() {
    this.playBeep(523.25, 'sine', 0.1); // C5
    setTimeout(() => this.playBeep(659.25, 'sine', 0.1), 100); // E5
    setTimeout(() => this.playBeep(783.99, 'sine', 0.2), 200); // G5
  }

  playClick() {
    this.playBeep(440, 'sine', 0.05);
  }

  playToggle() {
    this.playBeep(880, 'sine', 0.05);
  }
}

export const sounds = new SoundManager();
