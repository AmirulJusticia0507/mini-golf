import { clamp, distance, subtract } from "../utils/vector.js";

export class InputController {
  constructor(canvas, maxPull) {
    this.canvas = canvas;
    this.maxPull = maxPull;
    this.dragging = false;
    this.pointer = null;
    this.ball = null;
    this.canAim = true;
    this.onRelease = null;

    if (this.canvas) {
      this.canvas.style.touchAction = "none";
      this.canvas.addEventListener("pointerdown", (event) => this.start(event), { passive: false });
      this.canvas.addEventListener("pointermove", (event) => this.move(event), { passive: false });
      this.canvas.addEventListener("pointerup", (event) => this.end(event), { passive: false });
      this.canvas.addEventListener("pointercancel", (event) => this.end(event), { passive: false });
      this.canvas.addEventListener("touchstart", (event) => event.preventDefault(), { passive: false });
      this.canvas.addEventListener("touchmove", (event) => event.preventDefault(), { passive: false });
    }
  }

  toCanvasPoint(event) {
    const bounds = this.canvas.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) * (this.canvas.width / bounds.width),
      y: (event.clientY - bounds.top) * (this.canvas.height / bounds.height),
    };
  }

  start(event) {
    if (!this.canAim) return;
    event.preventDefault();
    const point = this.toCanvasPoint(event);
    if (!this.ball || distance(point, this.ball) > 56) return;
    this.dragging = true;
    this.pointer = point;
    try { this.canvas.setPointerCapture(event.pointerId); } catch (e) {}
  }

  move(event) {
    if (this.dragging) {
      event.preventDefault();
      this.pointer = this.toCanvasPoint(event);
    }
  }

  end(event) {
    if (!this.dragging) return;
    event.preventDefault();
    this.pointer = this.toCanvasPoint(event);
    const shot = this.getShot();
    this.dragging = false;
    try { this.canvas.releasePointerCapture(event.pointerId); } catch (e) {}
    if (shot.power > 4) this.onRelease?.(shot);
  }

  getShot() {
    const target = this.pointer || this.ball;
    const delta = subtract(this.ball, target);
    const rawPower = Math.hypot(delta.x, delta.y);
    const power = clamp(rawPower, 0, this.maxPull);
    const ratio = rawPower ? power / rawPower : 0;
    return { vector: { x: delta.x * ratio, y: delta.y * ratio }, power };
  }

  sync(ball, canAim) {
    this.ball = ball;
    this.canAim = canAim;
    if (!canAim) this.dragging = false;
  }
}
