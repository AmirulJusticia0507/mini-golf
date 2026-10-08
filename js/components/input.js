import { clamp, distance, subtract } from "../utils/vector.js";

export class InputController {
  constructor(canvas, maxPull) {
    this.canvas = canvas;
    this.maxPull = maxPull;
    this.dragging = false;
    this.pointer = null;
    this.onRelease = null;
    canvas.addEventListener("pointerdown", (event) => this.start(event));
    canvas.addEventListener("pointermove", (event) => this.move(event));
    canvas.addEventListener("pointerup", (event) => this.end(event));
    canvas.addEventListener("pointercancel", (event) => this.end(event));
  }

  toCanvasPoint(event) {
    const bounds = this.canvas.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) * (this.canvas.width / bounds.width),
      y: (event.clientY - bounds.top) * (this.canvas.height / bounds.height),
    };
  }

  start(event) {
    if (!this.canAim || distance(this.toCanvasPoint(event), this.ball) > 44) return;
    this.dragging = true;
    this.pointer = this.toCanvasPoint(event);
    this.canvas.setPointerCapture(event.pointerId);
  }

  move(event) {
    if (this.dragging) this.pointer = this.toCanvasPoint(event);
  }

  end(event) {
    if (!this.dragging) return;
    this.pointer = this.toCanvasPoint(event);
    const shot = this.getShot();
    this.dragging = false;
    if (shot.power > 4) this.onRelease?.(shot);
  }

  getShot() {
    const delta = subtract(this.ball, this.pointer || this.ball);
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
