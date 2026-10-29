import { clamp, subtract } from "../utils/vector.js";
import { project, unproject } from "../utils/projection.js";

export class InputController {
  constructor(canvas, maxPull, size, ballHeight = 9) {
    this.canvas = canvas;
    this.maxPull = maxPull;
    this.size = size;
    this.ballHeight = ballHeight;
    this.stage = canvas.closest(".game-stage");
    this.dragging = false;
    this.pointer = null;
    this.pointerId = null;
    this.ball = null;
    this.canAim = true;
    this.onRelease = null;
    this.onShootStart = null;
    this.onShootEnd = null;

    canvas.style.touchAction = "none";
    canvas.addEventListener("pointerdown", (event) => this.start(event), { passive: false });
    canvas.addEventListener("pointermove", (event) => this.move(event), { passive: false });
    canvas.addEventListener("pointerup", (event) => this.end(event), { passive: false });
    canvas.addEventListener("pointercancel", (event) => this.end(event), { passive: false });
    canvas.addEventListener("touchstart", (event) => event.preventDefault(), { passive: false });
    canvas.addEventListener("touchmove", (event) => event.preventDefault(), { passive: false });
    // Releasing outside the canvas must still fire the shot.
    this.stage?.addEventListener("pointerup", (event) => {
      if (event.target !== canvas) this.end(event);
    }, { passive: false });
  }

  stageFrame() {
    return this.stage?.querySelector(".stage-frame") || this.canvas;
  }

  /** Pointer position in game units (960 x 600), even when CSS scales the board. */
  toStagePixels(event) {
    const bounds = this.stageFrame().getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * this.size.width,
      y: ((event.clientY - bounds.top) / bounds.height) * this.size.height,
    };
  }

  /**
   * Converts the pointer into the game's floor plane. The rendered scene is an
   * orthographic tilt, so this inverse is exact: dragging on the ball behaves
   * like the original 2D game, just aimed at the projected board.
   */
  toCanvasPoint(event) {
    const { x, y } = this.toStagePixels(event);
    return unproject(x, y);
  }

  /**
   * The ball is drawn lifted off the floor, so a click on its sphere maps to a
   * floor tile slightly "behind" it. Compare on-screen positions so the grab
   * radius always surrounds the pixel the player is actually touching.
   */
  isNearBall(event) {
    if (!this.ball) return false;
    const pointer = this.toStagePixels(event);
    const drawn = project(this.ball.x, this.ball.y, this.ballHeight);
    return Math.hypot(pointer.x - drawn.x, pointer.y - drawn.y) <= 34;
  }

  start(event) {
    if (!this.canAim || this.dragging || !this.ball) return;
    event.preventDefault();
    if (!this.isNearBall(event)) return;
    this.dragging = true;
    this.pointerId = event.pointerId;
    this.pointer = this.toCanvasPoint(event);
    this.onShootStart?.();
    this.onDrag?.(this.getShot().power);
    try { this.canvas.setPointerCapture(event.pointerId); } catch (e) {}
  }

  move(event) {
    if (!this.dragging) return;
    event.preventDefault();
    this.pointer = this.toCanvasPoint(event);
    this.onDrag?.(this.getShot().power);
  }

  end(event) {
    if (!this.dragging) return;
    event.preventDefault();
    this.pointer = this.toCanvasPoint(event);
    const shot = this.getShot();
    this.dragging = false;
    this.onShootEnd?.();
    try { if (event.pointerId === this.pointerId) this.canvas.releasePointerCapture(event.pointerId); } catch (e) {}
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
    if (!canAim && this.dragging) {
      this.dragging = false;
      this.onShootEnd?.();
    }
  }
}
