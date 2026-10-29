import { CONFIG } from "../config.js";
import { closestPoint, distance } from "../utils/vector.js";

export class PhysicsEngine {
  update(ball, level, dt) {
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    this.resolveBounds(ball);
    level.obstacles.forEach((obstacle) => this.resolveObstacle(ball, obstacle));

    const inSand = isInSand(ball, level);
    const friction = Math.pow(inSand ? CONFIG.sandFriction : CONFIG.friction, dt * 60);
    ball.vx *= friction;
    ball.vy *= friction;

    if (Math.hypot(ball.vx, ball.vy) < CONFIG.stopSpeed) {
      ball.vx = 0;
      ball.vy = 0;
    }

    return distance(ball, level.hole) < level.hole.radius - 2 && Math.hypot(ball.vx, ball.vy) < CONFIG.captureSpeed;
  }

  resolveBounds(ball) {
    const margin = CONFIG.margin;
    if (ball.x - ball.radius < margin) {
      ball.x = margin + ball.radius;
      ball.vx = Math.abs(ball.vx) * CONFIG.restitution;
    }
    if (ball.x + ball.radius > CONFIG.width - margin) {
      ball.x = CONFIG.width - margin - ball.radius;
      ball.vx = -Math.abs(ball.vx) * CONFIG.restitution;
    }
    if (ball.y - ball.radius < margin) {
      ball.y = margin + ball.radius;
      ball.vy = Math.abs(ball.vy) * CONFIG.restitution;
    }
    if (ball.y + ball.radius > CONFIG.height - margin) {
      ball.y = CONFIG.height - margin - ball.radius;
      ball.vy = -Math.abs(ball.vy) * CONFIG.restitution;
    }
  }

  resolveObstacle(ball, obstacle) {
    const point = closestPoint(ball, obstacle);
    let dx = ball.x - point.x;
    let dy = ball.y - point.y;
    let dist = Math.hypot(dx, dy);
    if (dist >= ball.radius) return;
    if (dist === 0) {
      dx = ball.x < obstacle.x + obstacle.width / 2 ? -1 : 1;
      dy = 0;
      dist = 1;
    }
    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = ball.radius - dist;
    ball.x += nx * overlap;
    ball.y += ny * overlap;
    const velocityAlongNormal = ball.vx * nx + ball.vy * ny;
    if (velocityAlongNormal < 0) {
      ball.vx -= (1 + CONFIG.restitution) * velocityAlongNormal * nx;
      ball.vy -= (1 + CONFIG.restitution) * velocityAlongNormal * ny;
    }
  }
}

export function isInSand(ball, level) {
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
