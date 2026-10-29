import { CONFIG } from "../config.js";

export const FOCAL = CONFIG.cameraDistance;
const CENTER_X = CONFIG.width / 2;
const CENTER_Y = CONFIG.height / 2;
const COS = Math.cos(CONFIG.tilt);
const SIN = Math.sin(CONFIG.tilt);

/**
 * Projects a point from the game's 2D "floor" plane (x, y) with an optional
 * height (z, in screen units) into canvas space. This is a fixed orthographic
 * camera tilted around the X axis, which gives the course a diorama feel while
 * keeping pointer mapping trivial and lossless.
 */
export function project(x, y, z = 0) {
  const depth = (y - CENTER_Y) * SIN - z * COS;
  const scale = FOCAL / (FOCAL + depth);
  return {
    x: CENTER_X + (x - CENTER_X) * scale,
    y: CENTER_Y + (y - CENTER_Y) * COS * scale - z * SIN * scale,
    scale,
  };
}

/** Inverse of project() for points on the floor plane (z = 0). */
export function unproject(px, py) {
  const sy = (py - CENTER_Y) / COS;
  const depth = -sy;
  const scale = FOCAL / (FOCAL + depth);
  return {
    x: CENTER_X + (px - CENTER_X) / scale,
    y: CENTER_Y + sy,
  };
}
