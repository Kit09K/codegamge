/**
 * Zero-Asset Web Audio API Sound Synthesizer for CodeCombat Local
 * Ultra-lightweight (<2KB), zero MP3/WAV downloads required.
 */
const CocoAudio = {
  enabled: true,
  ctx: null,

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  tone(freq, duration = 0.08, type = 'triangle', gainVal = 0.08, delay = 0) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(gainVal, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch (_) {}
  },

  playStep() {
    this.tone(180, 0.045, 'sine', 0.04);
  },

  playPickup() {
    this.tone(587.33, 0.09, 'triangle', 0.09, 0);
    this.tone(880, 0.14, 'triangle', 0.1, 0.06);
  },

  playSlash() {
    this.tone(320, 0.07, 'sawtooth', 0.08, 0);
    this.tone(190, 0.09, 'sawtooth', 0.08, 0.04);
  },

  playCleave() {
    this.tone(440, 0.1, 'sawtooth', 0.1, 0);
    this.tone(330, 0.12, 'sawtooth', 0.1, 0.05);
    this.tone(220, 0.16, 'sawtooth', 0.1, 0.1);
  },

  playFireball() {
    this.tone(520, 0.08, 'square', 0.07, 0);
    this.tone(260, 0.16, 'sawtooth', 0.09, 0.06);
  },

  playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.tone(n, 0.16, 'triangle', 0.11, idx * 0.09);
    });
  },

  playError() {
    this.tone(160, 0.14, 'sawtooth', 0.09, 0);
    this.tone(130, 0.18, 'sawtooth', 0.09, 0.1);
  }
};
