import { CONFIG } from "../config.js";
import { project } from "../utils/projection.js";
import { clamp } from "../utils/vector.js";

const FLOOR = { width: CONFIG.width - CONFIG.margin * 2, height: CONFIG.height - CONFIG.margin * 2 };
const SLAB_HEIGHT = CONFIG.extrusion;

const SHADOWS = {
  stone: { x: 9, y: 6, color: "rgba(0,0,0,.34)" },
  tree: { x: 10, y: 8, color: "rgba(0,0,0,.30)" },
  shadow: { x: 7, y: 5, color: "rgba(0,0,0,.30)" },
};

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.resize();
    this.ball = { x: 0, y: 0 };
    this.ballPrev = { x: 0, y: 0 };
    this.ballHeight = CONFIG.ballHeight;
    this.surface = "grass";
    this.spin = { x: 0, y: 0, z: 0 };
    this.splash = null;
    this.lastTime = 0;
  }

  resize() {
    const baseWidth = Number(this.canvas.getAttribute("width")) || CONFIG.width;
    const cssRatio = this.canvas.clientWidth ? this.canvas.clientWidth / baseWidth : 1;
    const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
    const ratio = Math.max(1, Math.min(2, cssRatio * dpr));
    this.canvas.width = Math.round(baseWidth * ratio);
    this.canvas.height = Math.round(CONFIG.height * ratio);
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  /** Tracks state the renderer animates but the simulation does not own. */
  push(level, ball, input) {
    this.ballPrev = { x: this.ball.x, y: this.ball.y };
    this.ball = ball;
    this.level = level;
    this.input = input;

    const dx = ball.x - this.ballPrev.x;
    const dy = ball.y - this.ballPrev.y;
    const speed = Math.hypot(dx, dy);
    if (speed > 0.01) {
      this.spin.x += (dy / CONFIG.ballRadius) * 0.5;
      this.spin.y -= (dx / CONFIG.ballRadius) * 0.5;
      this.spin.z += speed * 0.02;
    }

    const sand = isInSand(ball, level);
    const now = performance.now();
    const dt = Math.min((now - (this.lastTime || now)) / 1000, 0.05);
    this.lastTime = now;
    if (sand !== this.surface && dt > 0) {
      const reach = this.surface === "sand" ? 120 : 18;
      if (speed > reach * dt) {
        this.splash = { x: ball.x, y: ball.y, life: 0, particles: makeParticles(sand) };
      }
    }
    this.surface = sand ? "sand" : "grass";
  }

  render() {
    const ctx = this.ctx;
    const { level, ball } = this;
    if (!level) return;

    ctx.clearRect(0, 0, CONFIG.width, CONFIG.height);
    this.drawBackdrop();

    this.drawSlab();
    this.drawFloor();

    level.sand.forEach((sand) => this.drawSand(sand));
    this.drawTextures(level);
    this.drawVignette();

    this.drawTrees(level.trees);
    this.drawObstacles(level.obstacles);
    this.drawHole(level.hole);

    if (this.splash) this.drawSplash();
    this.drawShadow(ball.x, ball.y, CONFIG.ballRadius * 1.55, "shadow");
    if (this.input.dragging) this.drawAim(ball, this.input.getShot());
    this.drawBall(ball);

    const fog = ctx.createLinearGradient(0, 0, 0, CONFIG.height * 0.55);
    fog.addColorStop(0, "rgba(150, 210, 170, .22)");
    fog.addColorStop(1, "rgba(150, 210, 170, 0)");
    ctx.fillStyle = fog;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height * 0.55);
  }

  // ---------------------------------------------------------------- backdrop

  drawBackdrop() {
    const ctx = this.ctx;
    const base = ctx.createLinearGradient(0, 0, 0, CONFIG.height);
    base.addColorStop(0, "#0b1512");
    base.addColorStop(1, "#101f1a");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

    const glow = ctx.createRadialGradient(CONFIG.width * 0.58, CONFIG.height * 0.5, 40, CONFIG.width * 0.58, CONFIG.height * 0.5, 560);
    glow.addColorStop(0, "rgba(130, 205, 130, .32)");
    glow.addColorStop(0.5, "rgba(95, 160, 110, .16)");
    glow.addColorStop(1, "rgba(95, 160, 110, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

    // Stripes along the facing lip of the slab give the diorama a horizon.
    const lip = ctx.createLinearGradient(0, 560, 0, 600);
    lip.addColorStop(0, "rgba(96, 150, 104, .0)");
    lip.addColorStop(1, "rgba(120, 180, 120, .10)");
    ctx.fillStyle = lip;
    ctx.fillRect(0, 560, CONFIG.width, 40);

    ctx.fillStyle = "rgba(200, 243, 106, .35)";
    for (let i = 0; i < 60; i++) {
      const x = pseudo(i * 12.9898) * CONFIG.width;
      const y = pseudo(i * 78.233 + 3) * CONFIG.height;
      const r = 0.6 + pseudo(i * 3.7) * 1.4;
      ctx.globalAlpha = 0.3 + pseudo(i * 5.1) * 0.7;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // --------------------------------------------------------------- the slab

  drawSlab() {
    const ctx = this.ctx;
    const top = project(0, 0, 0);
    const bottom = project(0, 0, SLAB_HEIGHT);
    const left = project(CONFIG.margin, 0, 0);
    const leftBottom = project(CONFIG.margin, 0, SLAB_HEIGHT);
    const right = project(CONFIG.width - CONFIG.margin, 0, 0);
    const rightBottom = project(CONFIG.width - CONFIG.margin, 0, SLAB_HEIGHT);
    const thickness = bottom.y - top.y;

    // Low ambient occlusion beneath the diorama so it reads as floating.
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#050a08";
    ctx.beginPath();
    ctx.roundRect(left.x - 16, bottom.y - 2, right.x - left.x + 32, thickness * 1.1, 30);
    ctx.fill();
    ctx.restore();

    const front = ctx.createLinearGradient(0, top.y + thickness * 0.6, 0, bottom.y + 30);
    front.addColorStop(0, "#2f4a3a");
    front.addColorStop(0.45, "#1f3329");
    front.addColorStop(1, "#16241d");
    ctx.fillStyle = front;
    ctx.beginPath();
    ctx.moveTo(left.x, left.y);
    ctx.lineTo(right.x, right.y);
    ctx.lineTo(rightBottom.x, rightBottom.y);
    ctx.lineTo(leftBottom.x, leftBottom.y);
    ctx.closePath();
    ctx.fill();

    // Grass edge folding over the lip of the slab.
    ctx.strokeStyle = "#5f9448";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(left.x, left.y + 1.5);
    ctx.lineTo(right.x, right.y + 1.5);
    ctx.stroke();

    // Warm bounce light along the bottom edge.
    ctx.strokeStyle = "rgba(200, 243, 106, .10)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(leftBottom.x + 10, leftBottom.y - 1);
    ctx.lineTo(rightBottom.x - 10, rightBottom.y - 1);
    ctx.stroke();
  }

  drawFloor() {
    const ctx = this.ctx;
    const { x, y } = CONFIG.margin;

    ctx.save();
    this.floorPath(x, y);
    ctx.clip();

    const gradient = ctx.createLinearGradient(0, project(0, 0).y, 0, project(0, CONFIG.height).y);
    gradient.addColorStop(0, "#7aab5c");
    gradient.addColorStop(0.55, "#68975a");
    gradient.addColorStop(1, "#4a7a4c");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

    const light = ctx.createRadialGradient(CONFIG.width * 0.36, project(0, CONFIG.height * 0.34).y, 20, CONFIG.width * 0.36, project(0, CONFIG.height * 0.34).y, 720);
    light.addColorStop(0, "rgba(225, 255, 180, .24)");
    light.addColorStop(1, "rgba(225, 255, 180, 0)");
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    ctx.restore();

    ctx.strokeStyle = "rgba(28, 52, 34, .55)";
    ctx.lineWidth = 1.5;
    this.floorPath(x, y);
    ctx.stroke();
  }

  floorPath(x, y) {
    const ctx = this.ctx;
    const a = project(x, y);
    const b = project(x + FLOOR.width, y);
    const c = project(x + FLOOR.width, y + FLOOR.height);
    const d = project(x, y + FLOOR.height);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y + 1);
    ctx.lineTo(b.x, b.y + 1);
    ctx.lineTo(c.x, c.y - 1);
    ctx.lineTo(d.x, d.y - 1);
    ctx.closePath();
  }

  drawTextures(level) {
    const ctx = this.ctx;
    ctx.save();
    this.floorPath(CONFIG.margin, CONFIG.margin);
    ctx.clip();

    ctx.strokeStyle = "rgba(235, 255, 210, .045)";
    ctx.lineWidth = 1;
    for (let y = CONFIG.margin + 14; y < CONFIG.height - CONFIG.margin; y += 14) {
      const a = project(CONFIG.margin, y);
      const b = project(CONFIG.width - CONFIG.margin, y);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    // Tiny blades of grass, denser towards the camera.
    for (let i = 0; i < 190; i++) {
      const tx = CONFIG.margin + 12 + pseudo(i * 12.9898) * (CONFIG.width - CONFIG.margin * 2 - 24);
      const ty = CONFIG.margin + 12 + pseudo(i * 78.233) * (CONFIG.height - CONFIG.margin * 2 - 24);
      if (isInSand({ x: tx, y: ty }, level)) continue;
      const p = project(tx, ty);
      const h = 3 + pseudo(i * 4.1) * 4;
      ctx.strokeStyle = i % 3 === 0 ? "rgba(205, 240, 150, .22)" : "rgba(26, 58, 30, .22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + (pseudo(i * 9.3) - 0.5) * 3, p.y - h * p.scale);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawVignette() {
    const ctx = this.ctx;
    ctx.save();
    this.floorPath(CONFIG.margin, CONFIG.margin);
    ctx.clip();
    const a = project(CONFIG.margin, CONFIG.margin);
    const b = project(CONFIG.width - CONFIG.margin, CONFIG.height - CONFIG.margin);
    const v = ctx.createRadialGradient(a.x, a.y, 60, a.x, a.y, b.x - a.x);
    v.addColorStop(0, "rgba(10, 30, 18, 0)");
    v.addColorStop(1, "rgba(10, 30, 18, .34)");
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    ctx.restore();
  }

  // --------------------------------------------------------------- elements

  drawSand(sand) {
    const ctx = this.ctx;
    const rings = [
      { color: "rgba(74, 82, 49, .20)", size: 1.13 },
      { color: "#dccf98", size: 1.08 },
      { color: "#cdbd80", size: 1.0 },
    ];
    for (const ring of rings) {
      this.ellipsePath(sand, sand.rx * ring.size, sand.ry * ring.size);
      ctx.fillStyle = ring.color;
      ctx.fill();
    }

    ctx.save();
    ctx.clip();
    for (let i = 0; i < 26; i++) {
      const angle = pseudo(i * 7.7 + sand.x) * Math.PI * 2;
      const r = Math.sqrt(pseudo(i * 3.3 + sand.y));
      const lx = Math.cos(angle) * sand.rx * r * 0.9;
      const ly = Math.sin(angle) * sand.ry * r * 0.9;
      const p = this.ellipsePoint(sand, lx, ly);
      ctx.fillStyle = pseudo(i * 2.2) > 0.5 ? "rgba(255, 250, 220, .55)" : "rgba(150, 128, 76, .35)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 0.8 + pseudo(i) * 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  ellipsePath(patch, rx, ry) {
    const ctx = this.ctx;
    ctx.beginPath();
    const segments = Math.max(24, Math.round((rx + ry) / 8));
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const point = this.ellipsePoint(patch, Math.cos(t) * rx, Math.sin(t) * ry);
      if (i === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    }
    ctx.closePath();
  }

  ellipsePoint(patch, lx, ly) {
    const cos = Math.cos(patch.rotation);
    const sin = Math.sin(patch.rotation);
    return project(patch.x + lx * cos - ly * sin, patch.y + lx * sin + ly * cos);
  }

  drawTrees(trees) {
    const sorted = [...trees].sort((a, b) => a.y - b.y);
    sorted.forEach((tree) => this.drawTree(tree));
  }

  drawTree({ x, y }) {
    const ctx = this.ctx;
    const base = project(x, y);
    this.drawShadow(x, y, 30, "tree");

    const trunk = ctx.createLinearGradient(base.x - 7, base.y, base.x + 7, base.y);
    trunk.addColorStop(0, "#4a3524");
    trunk.addColorStop(0.5, "#6f5236");
    trunk.addColorStop(1, "#3d2c1e");
    ctx.fillStyle = trunk;
    ctx.beginPath();
    ctx.moveTo(base.x - 5, base.y);
    ctx.lineTo(base.x - 4, base.y - 34);
    ctx.lineTo(base.x + 4, base.y - 34);
    ctx.lineTo(base.x + 5, base.y);
    ctx.closePath();
    ctx.fill();

    const layers = [
      { cx: 0, cy: 38, r: 30, colors: ["#2c5c3b", "#1b4128"] },
      { cx: 0, cy: 62, r: 25, colors: ["#357046", "#21502f"] },
      { cx: 0, cy: 84, r: 18, colors: ["#468552", "#2c6338"] },
      { cx: 9, cy: 56, r: 15, colors: ["#4c8c58", "#357044"] },
    ];
    for (const layer of layers) {
      const cx = base.x + layer.cx;
      const cy = base.y - layer.cy;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, layer.r, 0, Math.PI * 2);
      ctx.clip();
      const gradient = ctx.createRadialGradient(cx - layer.r * 0.35, cy - layer.r * 0.4, 2, cx, cy, layer.r * 1.35);
      gradient.addColorStop(0, layer.colors[0]);
      gradient.addColorStop(0.7, layer.colors[1]);
      gradient.addColorStop(1, layer.colors[1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(cx - layer.r, cy - layer.r, layer.r * 2, layer.r * 2);
      ctx.restore();
    }
    ctx.fillStyle = "rgba(190, 235, 160, .22)";
    ctx.beginPath();
    ctx.arc(base.x - 8, base.y - 88, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  drawObstacles(obstacles) {
    const sorted = [...obstacles].sort((a, b) => (a.y + a.height) - (b.y + b.height));
    sorted.forEach((item) => this.drawObstacle(item));
  }

  drawObstacle(item) {
    const ctx = this.ctx;
    const height = 20;
    this.drawShadow(item.x + item.width / 2, item.y + item.height / 2, Math.max(item.width, item.height) * 0.55, "stone");

    // Side walls for every edge of the slab, drawn as an extruded solid view.
    const corners = [
      this.point(item.x, item.y, height),
      this.point(item.x + item.width, item.y, height),
      this.point(item.x + item.width, item.y + item.height, height),
      this.point(item.x, item.y + item.height, height),
    ];
    const ground = [
      this.point(item.x, item.y, 0),
      this.point(item.x + item.width, item.y, 0),
      this.point(item.x + item.width, item.y + item.height, 0),
      this.point(item.x, item.y + item.height, 0),
    ];
    // Only the two faces pointing at the camera are visible.
    const front = new Path2D();
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      if (i !== 2 && i !== 3) continue;
      front.moveTo(corners[i][0], corners[i][1]);
      front.lineTo(corners[j][0], corners[j][1]);
      front.lineTo(ground[j][0], ground[j][1]);
      front.lineTo(ground[i][0], ground[i][1]);
      front.closePath();
    }
    const sideGradient = ctx.createLinearGradient(corners[2][0], corners[2][1], ground[2][0], ground[2][1]);
    sideGradient.addColorStop(0, "#8a826c");
    sideGradient.addColorStop(0.35, "#6f6857");
    sideGradient.addColorStop(1, "#413c31");
    ctx.fillStyle = sideGradient;
    ctx.fill(front);
    ctx.strokeStyle = "rgba(255, 255, 255, .16)";
    ctx.lineWidth = 1;
    ctx.stroke(front);

    // Top face.
    const top = this.rectPoints(item.x, item.y, item.width, item.height, height);
    const topGradient = ctx.createLinearGradient(top[0][0], top[0][1], top[2][0], top[2][1]);
    topGradient.addColorStop(0, "#f2ecd9");
    topGradient.addColorStop(1, "#cfc5aa");
    ctx.fillStyle = topGradient;
    ctx.beginPath();
    top.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, .4)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  drawHole(hole) {
    const ctx = this.ctx;
    const top = project(hole.x, hole.y);
    const tip = project(hole.x, hole.y - 64);
    const flagTop = project(hole.x, hole.y - 64 + 20);

    this.drawShadow(hole.x + 8, hole.y + 6, hole.radius * 0.9, "shadow");

    // Rim highlight around the cup.
    this.ellipsePath({ ...hole, rotation: 0 }, hole.radius + 3, hole.radius + 3);
    ctx.fillStyle = "rgba(232, 255, 210, .25)";
    ctx.fill();

    const cup = ctx.createRadialGradient(top.x, top.y - 2, 1, top.x, top.y, hole.radius + 2);
    cup.addColorStop(0, "#000");
    cup.addColorStop(0.75, "#050b08");
    cup.addColorStop(1, "#16241b");
    this.ellipsePath({ ...hole, rotation: 0 }, hole.radius, hole.radius * 1.12);
    ctx.fillStyle = cup;
    ctx.fill();

    // Pole.
    const poleGradient = ctx.createLinearGradient(tip.x - 2, 0, tip.x + 2, 0);
    poleGradient.addColorStop(0, "#cfd9cd");
    poleGradient.addColorStop(0.5, "#ffffff");
    poleGradient.addColorStop(1, "#9aa79c");
    ctx.strokeStyle = poleGradient;
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(top.x, top.y);
    ctx.lineTo(tip.x, tip.y);
    ctx.stroke();

    ctx.fillStyle = "#ffe27a";
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 3, 0, Math.PI * 2);
    ctx.fill();

    // Flag waving in the breeze.
    const t = performance.now() / 1000;
    const width = flagTop.x - tip.x + 46;
    const height = 30;
    const flag = ctx.createLinearGradient(tip.x, tip.y, tip.x + width, tip.y);
    flag.addColorStop(0, "#ff8257");
    flag.addColorStop(1, "#e0532f");
    ctx.fillStyle = flag;
    ctx.beginPath();
    ctx.moveTo(tip.x + 1, tip.y);
    const steps = 10;
    for (let i = 1; i <= steps; i++) {
      const f = i / steps;
      const wave = Math.sin(t * 3.2 + f * 3.4) * f * 3.4;
      ctx.lineTo(tip.x + width * f, tip.y + height * 0.18 * f + wave);
    }
    for (let i = steps; i >= 0; i--) {
      const f = i / steps;
      const wave = Math.sin(t * 3.2 + f * 3.4) * f * 3.4;
      ctx.lineTo(tip.x + width * f, tip.y + height * (1 - 0.12 * f) + wave);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(120, 30, 10, .25)";
    ctx.beginPath();
    ctx.moveTo(tip.x + 1, tip.y + height * 0.5);
    ctx.lineTo(tip.x + width * 0.62, tip.y + height * 0.62);
    ctx.lineTo(tip.x + width * 0.62, tip.y + height * 0.78);
    ctx.lineTo(tip.x + 1, tip.y + height * 0.8);
    ctx.closePath();
    ctx.fill();
  }

  drawSplash() {
    const ctx = this.ctx;
    const splash = this.splash;
    splash.life += 1 / 60;
    if (splash.life > 0.75) {
      this.splash = null;
      return;
    }
    const t = splash.life / 0.75;
    ctx.save();
    splash.particles.forEach((particle) => {
      const x = splash.x + particle.vx * splash.life;
      const y = splash.y + particle.vy * splash.life;
      const z = particle.vz * splash.life - 220 * splash.life * splash.life;
      const [px, py] = this.point(x, y, Math.max(0, z));
      const fade = 1 - t;
      ctx.globalAlpha = fade;
      ctx.fillStyle = particle.sand ? "#e2d5a0" : "#7fae5b";
      ctx.beginPath();
      ctx.arc(px, py, 1.8 * fade + 0.6, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = (1 - t) * 0.5;
    this.ellipsePath({ x: splash.x, y: splash.y, rotation: 0 }, 8 + t * 26, 8 + t * 26);
    ctx.strokeStyle = splash.particles[0]?.sand ? "#e2d5a0" : "#8fc46c";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  drawShadow(x, y, radius, shape = "shadow") {
    const ctx = this.ctx;
    const style = SHADOWS[shape] || SHADOWS.shadow;
    const p = project(x, y);
    ctx.save();
    ctx.translate(p.x + style.x, p.y + style.y);
    ctx.scale(1, 0.55);
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * p.scale);
    gradient.addColorStop(0, style.color);
    gradient.addColorStop(0.7, "rgba(0,0,0,.10)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius * p.scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawBall(ball) {
    const ctx = this.ctx;
    const [x, y] = this.point(ball.x, ball.y, this.ballHeight);
    const radius = CONFIG.ballRadius;

    const gradient = ctx.createRadialGradient(x - radius * 0.38, y - radius * 0.42, radius * 0.12, x, y, radius);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.55, "#eef2ea");
    gradient.addColorStop(1, "#b3c0b1");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Dimples rotate with travel to sell the rolling motion.
    const dimples = [
      [-0.34, -0.22], [0.12, -0.44], [0.42, -0.02], [0.2, 0.36],
      [-0.18, 0.4], [-0.46, 0.12], [0.05, 0.02], [-0.05, -0.6],
    ];
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius - 0.5, 0, Math.PI * 2);
    ctx.clip();
    for (const [dx, dy] of dimples) {
      const cx = Math.cos(this.spin.z) * dx - Math.sin(this.spin.z) * dy;
      const cy = Math.sin(this.spin.z) * dx + Math.cos(this.spin.z) * dy;
      const depth = Math.cos(this.spin.z) * this.spin.y + cy * 0.5;
      if (depth < -0.7) continue;
      ctx.fillStyle = "rgba(120, 140, 120, .30)";
      ctx.beginPath();
      ctx.arc(x + cx * radius * 0.92, y + cy * radius * 0.92 + Math.sin(this.spin.x) * radius * 0.2, 1.7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    const spec = ctx.createRadialGradient(x - radius * 0.35, y - radius * 0.45, 0, x - radius * 0.35, y - radius * 0.45, radius * 0.7);
    spec.addColorStop(0, "rgba(255,255,255,.95)");
    spec.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = spec;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  drawAim(ball, shot) {
    if (!shot.power) return;
    const ctx = this.ctx;
    const unitX = shot.vector.x / shot.power;
    const unitY = shot.vector.y / shot.power;
    const length = 55 + shot.power * 0.65;

    ctx.save();
    ctx.fillStyle = "rgba(200, 243, 106, .85)";
    for (let d = 22; d < length; d += 18) {
      const alpha = 1 - d / length;
      const [px, py] = this.point(ball.x + unitX * d, ball.y + unitY * d, 2);
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(px, py, 2.6 * (1 - d / (length * 1.6)), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    const [bx, by] = this.point(ball.x, ball.y, 0);
    ctx.strokeStyle = "rgba(200, 243, 106, .9)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(bx, by, CONFIG.ballRadius + 7, (CONFIG.ballRadius + 7) * Math.cos(CONFIG.tilt), 0, 0, Math.PI * 2);
    ctx.stroke();

    const [tx, ty] = this.point(ball.x + unitX * (length + 12), ball.y + unitY * (length + 12), 2);
    const angle = Math.atan2(ty - by, tx - bx);
    ctx.translate(tx, ty);
    ctx.rotate(angle);
    ctx.fillStyle = "rgba(200, 243, 106, .95)";
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(-4, 5);
    ctx.lineTo(-4, -5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ---------------------------------------------------------------- helpers

  point(x, y, z) {
    const p = project(x, y, z);
    return [p.x, p.y];
  }

  rectPoints(x, y, width, height, z) {
    return [
      this.point(x, y, z),
      this.point(x + width, y, z),
      this.point(x + width, y + height, z),
      this.point(x, y + height, z),
    ];
  }
}

function isInSand(ball, level) {
  return level.sand.some((patch) => {
    const cos = Math.cos(-patch.rotation);
    const sin = Math.sin(-patch.rotation);
    const dx = ball.x - patch.x;
    const dy = ball.y - patch.y;
    const x = dx * cos - dy * sin;
    const y = dx * sin + dy * cos;
    return (x * x) / (patch.rx * patch.rx) + (y * y) / (patch.ry * patch.ry) < 1;
  });
}

function makeParticles(sand) {
  return Array.from({ length: 14 }, (_, i) => {
    const angle = (i / 14) * Math.PI * 2 + Math.random();
    const speed = 30 + Math.random() * 70;
    return {
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      vz: 60 + Math.random() * 120,
      sand,
    };
  });
}

function pseudo(n) {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
}
