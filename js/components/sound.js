export class SoundManager {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  _ctx() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  setEnabled(v) { this.enabled = !!v; }

  _tone(freq, dur, type = "sine", gain = 0.06, slide = 0) {
    if (!this.enabled) return;
    const ctx = this._ctx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(1, freq + slide), t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  }

  shoot() { this._tone(170, 0.035, "square", 0.05); }
  hole() { this._tone(520, 0.13, "sine", 0.07, 300); }
  holeComplete() { this._tone(660, 0.18, "sine", 0.08, 400); setTimeout(() => this._tone(880, 0.2, "sine", 0.08, 200), 120); }
  courseComplete() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this._tone(f, 0.22, "triangle", 0.09), i * 140)); }
  ui() { this._tone(900, 0.05, "sine", 0.04); }
}
