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
    this.input = new InputController(canvas, CONFIG.maxPull, { width: CONFIG.width, height: CONFIG.height }, CONFIG.ballHeight);
    this.ui = new GameUI();
    this.sound = new SoundManager();
    this.levelIndex = 0; this.scores = []; this.lastTime = 0; this.accumulator = 0; this.finished = false; this.soundOn = true;
    this.courseHighScore = null;
    this.holeHighScores = Array(LEVELS.length).fill(null);
    this.input.onRelease = (shot) => this.shoot(shot);
    this.input.onShootStart = () => { this.ui.showAwning(true); this.sound.ui(); };
    this.input.onDrag = (power) => this.ui.setPower(power, CONFIG.maxPull);
    this.input.onShootEnd = () => {
      this.ui.showAwning(false);
      if (!this.input.dragging) this.ui.hidePower();
    };
    this.ui.restartButton.addEventListener("click", () => this.loadLevel(this.levelIndex));
    this.ui.nextButton.addEventListener("click", () => this.nextLevel());
    this.ui.soundButton.addEventListener("click", () => this.toggleSound());
    window.addEventListener("resize", () => this.renderer.resize());
    this.loadHighScores();
    this.loadLevel(0);
    // Make the ball grabbable before the first animation frame runs.
    this.input.sync(this.ball, true);
  }

  loadHighScores() {
    try {
      const course = localStorage.getItem("minigolf_highscore_course");
      this.courseHighScore = course !== null ? parseInt(course) : null;
      this.holeHighScores = Array(LEVELS.length).fill(null);
      for (let i = 0; i < LEVELS.length; i++) {
        const h = localStorage.getItem("minigolf_highscore_hole_" + i);
        if (h !== null) this.holeHighScores[i] = parseInt(h);
      }
    } catch (e) {
      this.courseHighScore = null;
      this.holeHighScores = Array(LEVELS.length).fill(null);
    }
  }

  updateHighScoreDisplay() {
    const holeBest = this.holeHighScores && this.holeHighScores[this.levelIndex] !== undefined ? this.holeHighScores[this.levelIndex] : null;
    if (this.ui && typeof this.ui.updateHighScores === "function") {
      this.ui.updateHighScores(this.courseHighScore, holeBest);
    }
  }

  saveHighScores() {
    try {
      if (this.scores.length > 0) {
        const total = this.scores.reduce((a, b) => a + b, 0);
        if (this.courseHighScore === null || total < this.courseHighScore) {
          this.courseHighScore = total;
          localStorage.setItem("minigolf_highscore_course", String(total));
        }
      }
      if (this.levelIndex >= 0 && typeof this.strokes === "number") {
        const key = "minigolf_highscore_hole_" + this.levelIndex;
        const current = this.holeHighScores && this.holeHighScores[this.levelIndex] !== undefined ? this.holeHighScores[this.levelIndex] : null;
        if (current === null || this.strokes < current) {
          localStorage.setItem(key, String(this.strokes));
          if (!this.holeHighScores) this.holeHighScores = Array(LEVELS.length).fill(null);
          this.holeHighScores[this.levelIndex] = this.strokes;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  loadLevel(index) {
    this.levelIndex = index; this.level = LEVELS[index]; this.strokes = 0; this.finished = false;
    this.ball = { ...this.level.start, vx: 0, vy: 0, radius: CONFIG.ballRadius };
    this.renderer.ball = { x: this.ball.x, y: this.ball.y };
    this.renderer.ballPrev = { x: this.ball.x, y: this.ball.y };
    this.ui.hideResult(); this.ui.hidePower(); this.ui.showAwning(false); this.ui.setStatus("Giliranmu");
    this.ui.updateScore(index, LEVELS.length, this.level.par, this.strokes, this.level.name);
    this.renderer.splash = null;
    this.loadHighScores();
    this.updateHighScoreDisplay();
  }

  shoot(shot) {
    if (!this.canAim()) return;
    this.ball.vx = shot.vector.x * CONFIG.powerScale; this.ball.vy = shot.vector.y * CONFIG.powerScale;
    this.strokes += 1; this.ui.updateScore(this.levelIndex, LEVELS.length, this.level.par, this.strokes, this.level.name); this.ui.hidePower(); this.ui.setStatus("Bola bergerak"); this.sound.shoot();
  }

  canAim() { return !this.finished && this.ball.vx === 0 && this.ball.vy === 0; }

  update(dt = 0) {
    if (!this.finished && (this.ball.vx || this.ball.vy)) {
      if (this.physics.update(this.ball, this.level, dt)) this.completeHole();
      else if (this.canAim()) this.ui.setStatus("Giliranmu");
    }
    this.input.sync(this.ball, this.canAim());
    if (this.input.dragging) this.ui.setPower(this.input.getShot().power, CONFIG.maxPull);
  }

  completeHole() {
    this.finished = true; this.ball.vx = this.ball.vy = 0; this.ball.x = this.level.hole.x; this.ball.y = this.level.hole.y;
    this.scores[this.levelIndex] = this.strokes;
    this.saveHighScores();
    this.loadHighScores();
    this.updateHighScoreDisplay();
    this.ui.setStatus("Masuk!"); this.sound.hole();
    setTimeout(() => { if (this.levelIndex === LEVELS.length - 1) this.sound.courseComplete(); else this.sound.holeComplete(); }, 450);
    setTimeout(() => this.ui.showResult({ final: this.levelIndex === LEVELS.length - 1, strokes: this.strokes, par: this.level.par, total: this.scores.reduce((a, b) => a + b, 0) }), 450);
  }

  nextLevel() {
    this.sound.ui();
    if (this.levelIndex === LEVELS.length - 1) {
      this.scores = [];
      this.loadLevel(0);
    } else {
      this.loadLevel(this.levelIndex + 1);
    }
  }

  toggleSound() {
    this.soundOn = !this.soundOn;
    this.sound.setEnabled(this.soundOn);
    this.ui.soundButton.textContent = this.soundOn ? "♪" : "×";
    this.ui.soundButton.classList.toggle("is-off", !this.soundOn);
  }

  frame = (time) => {
    const frameTime = Math.min((time - this.lastTime) / 1000 || 0, CONFIG.maxFrame); this.lastTime = time; this.accumulator += frameTime;
    while (this.accumulator >= CONFIG.fixedStep) { this.update(CONFIG.fixedStep); this.accumulator -= CONFIG.fixedStep; }
    this.renderer.push(this.level, this.ball, this.input);
    this.renderer.render();
    requestAnimationFrame(this.frame);
  };
  start() { requestAnimationFrame(this.frame); }
}
