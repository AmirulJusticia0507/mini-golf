import { CONFIG } from "../config.js";
import { LEVELS } from "../data/levels.js";
import { InputController } from "../components/input.js";
import { PhysicsEngine } from "../components/physics.js";
import { Renderer } from "../components/renderer.js";
import { GameUI } from "../components/ui.js";
import { SoundManager } from "../components/sound.js";

export class MiniGolfGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.physics = new PhysicsEngine();
    this.input = new InputController(canvas, CONFIG.maxPull);
    this.ui = new GameUI();
    this.sound = new SoundManager();
    this.sound.setEnabled(true);
    this.levelIndex = 0; this.scores = []; this.lastTime = 0; this.accumulator = 0; this.finished = false; this.soundOn = true;
    this.input.onRelease = (shot) => this.shoot(shot);
    this.ui.restartButton.addEventListener("click", () => this.loadLevel(this.levelIndex));
    this.ui.nextButton.addEventListener("click", () => this.nextLevel());
    this.ui.soundButton.addEventListener("click", () => this.toggleSound());
    this.loadLevel(0);
  }

  loadLevel(index) {
    this.levelIndex = index; this.level = LEVELS[index]; this.strokes = 0; this.finished = false;
    this.ball = { ...this.level.start, vx: 0, vy: 0, radius: CONFIG.ballRadius };
    this.ui.hideResult(); this.ui.hidePower(); this.ui.setStatus("Giliranmu");
    this.ui.updateScore(index, LEVELS.length, this.level.par, this.strokes);
  }

  shoot(shot) {
    if (!this.canAim()) return;
    this.ball.vx = shot.vector.x * CONFIG.powerScale; this.ball.vy = shot.vector.y * CONFIG.powerScale;
    this.strokes += 1; this.ui.updateScore(this.levelIndex, LEVELS.length, this.level.par, this.strokes); this.ui.hidePower(); this.ui.setStatus("Bola bergerak"); this.sound.shoot();
  }

  canAim() { return !this.finished && this.ball.vx === 0 && this.ball.vy === 0; }

  update(dt) {
    if (!this.finished && (this.ball.vx || this.ball.vy)) {
      if (this.physics.update(this.ball, this.level, dt)) this.completeHole();
      else if (this.canAim()) this.ui.setStatus("Giliranmu");
    }
    this.input.sync(this.ball, this.canAim());
    if (this.input.dragging) this.ui.setPower(this.input.getShot().power, CONFIG.maxPull); else this.ui.hidePower();
  }

  completeHole() {
    this.finished = true; this.ball.vx = this.ball.vy = 0; this.ball.x = this.level.hole.x; this.ball.y = this.level.hole.y;
    this.scores[this.levelIndex] = this.strokes; this.ui.setStatus("Masuk!"); this.sound.hole();
    const final = this.levelIndex === LEVELS.length - 1;
    if (final) setTimeout(() => this.sound.courseComplete(), 500); else setTimeout(() => this.sound.holeComplete(), 460);
    setTimeout(() => this.ui.showResult({ final, strokes: this.strokes, par: this.level.par, total: this.scores.reduce((a, b) => a + b, 0) }), 450);
  }

  nextLevel() {
    if (this.levelIndex === LEVELS.length - 1) { this.scores = []; this.loadLevel(0); }
    else this.loadLevel(this.levelIndex + 1);
  }

  toggleSound() { this.soundOn = !this.soundOn; this.sound.setEnabled(this.soundOn); this.ui.soundButton.textContent = this.soundOn ? "♪" : "×"; this.sound.ui(); }

  frame = (time) => {
    const frameTime = Math.min((time - this.lastTime) / 1000 || 0, CONFIG.maxFrame); this.lastTime = time; this.accumulator += frameTime;
    while (this.accumulator >= CONFIG.fixedStep) { this.update(CONFIG.fixedStep); this.accumulator -= CONFIG.fixedStep; }
    this.renderer.render(this.level, this.ball, this.input); requestAnimationFrame(this.frame);
  };
  start() { requestAnimationFrame(this.frame); }
}
