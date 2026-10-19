class SoundSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Check if muted in localStorage
    const savedMute = localStorage.getItem('math_sound_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('math_sound_muted', String(muted));
    } catch {
      // ignore
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public playClick() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // Audio error safely ignored
    }
  }

  public playCorrect(combo: number = 0) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const pitchOffset = Math.min(combo * 40, 240);
      const notes = [523.25 + pitchOffset, 659.25 + pitchOffset, 783.99 + pitchOffset]; // C5, E5, G5

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.07);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.07 + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.07);
        osc.stop(this.ctx.currentTime + idx * 0.07 + 0.24);
      });
    } catch {
      // ignore
    }
  }

  public playWrong() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(110, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {
      // ignore
    }
  }

  public playTick() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch {
      // ignore
    }
  }

  public playFanfare() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const melody = [
        { freq: 523.25, time: 0.0, dur: 0.12 },
        { freq: 659.25, time: 0.12, dur: 0.12 },
        { freq: 783.99, time: 0.24, dur: 0.14 },
        { freq: 1046.5, time: 0.38, dur: 0.35 },
      ];

      melody.forEach((note) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, this.ctx.currentTime + note.time);

        gain.gain.setValueAtTime(0.14, this.ctx.currentTime + note.time);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + note.time + note.dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + note.time);
        osc.stop(this.ctx.currentTime + note.time + note.dur + 0.05);
      });
    } catch {
      // ignore
    }
  }
}

export const sound = new SoundSystem();
