export const length = (v) => Math.hypot(v.x, v.y);
export const subtract = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const distance = (a, b) => length(subtract(a, b));
export const closestPoint = (point, rect) => ({
  x: clamp(point.x, rect.x, rect.x + rect.width),
  y: clamp(point.y, rect.y, rect.y + rect.height),
});
