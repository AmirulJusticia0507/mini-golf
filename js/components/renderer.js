import { CONFIG } from "../config.js";

export class Renderer {
  constructor(canvas) {
    this.ctx = canvas.getContext("2d");
  }

  render(level, ball, input) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CONFIG.width, CONFIG.height);

    this.drawCourse(level);
    this.drawHole(level.hole);
    level.obstacles.forEach((item) => this.drawObstacle(item));
    this.drawBall(ball);

    if (input.dragging) {
      this.drawAim(ball, input.getShot());
    }
  }

  drawCourse(level) {
    const ctx = this.ctx;
    const gradient = ctx.createLinearGradient(0, 0, CONFIG.width, CONFIG.height);
    gradient.addColorStop(0, "#6f9e55");
    gradient.addColorStop(1, "#426e42");

    ctx.fillStyle = "#213c31";
    this.roundRect(0, 0, CONFIG.width, CONFIG.height, 30);
    ctx.fill();

    ctx.fillStyle = gradient;
    this.roundRect(34, 34, CONFIG.width - 68, CONFIG.height - 68, 23);
    ctx.fill();

    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    for (let y = 48; y < CONFIG.height - 40; y += 18) {
      ctx.beginPath();
      ctx.moveTo(42, y);
      ctx.lineTo(CONFIG.width - 42, y);
      ctx.stroke();
    }
    ctx.restore();

    level.sand.forEach((sand) => {
      ctx.save();
      ctx.translate(sand.x, sand.y);
      ctx.rotate(sand.rotation);
      ctx.fillStyle = "#d6c683";
      ctx.beginPath();
      ctx.ellipse(0, 0, sand.rx, sand.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(74,82,49,.22)";
      ctx.setLineDash([3, 7]);
      ctx.stroke();
      ctx.restore();
    });

    level.trees.forEach((tree) => this.drawTree(tree));
  }

  drawTree(tree) {
    const ctx = this.ctx;
    ctx.fillStyle = "rgba(13,36,27,.25)";
    ctx.beginPath();
    ctx.ellipse(tree.x + 7, tree.y + 11, 32, 19, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ["#244b36", "#2f6040", "#3e7148"].forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(tree.x + (i - 1) * 10, tree.y + (i % 2) * 8, 20 - i * 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  drawHole(hole) {
    const ctx = this.ctx;
    ctx.strokeStyle = "#e9f2e2";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(hole.x, hole.y);
    ctx.lineTo(hole.x, hole.y - 69);
    ctx.stroke();

    ctx.fillStyle = "#f46f45";
    ctx.beginPath();
    ctx.moveTo(hole.x + 1, hole.y - 68);
    ctx.lineTo(hole.x + 43, hole.y - 54);
    ctx.lineTo(hole.x + 1, hole.y - 40);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(7,18,13,.32)";
    ctx.beginPath();
    ctx.ellipse(hole.x + 5, hole.y + 8, 25, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#101814";
    ctx.beginPath();
    ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  drawObstacle(item) {
    const ctx = this.ctx;
    ctx.save();
    ctx.shadowColor = "rgba(9,25,18,.28)";
    ctx.shadowBlur = 13;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = "#d5ccb4";
    this.roundRect(item.x, item.y, item.width, item.height, item.radius);
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = "rgba(83,77,61,.18)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  drawBall(ball) {
    const ctx = this.ctx;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.35)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 6;

    const g = ctx.createRadialGradient(ball.x - 4, ball.y - 5, 2, ball.x, ball.y, ball.radius);
    g.addColorStop(0, "#fff");
    g.addColorStop(1, "#dce5d9");
    ctx.fillStyle = g;

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawAim(ball, shot) {
    const ctx = this.ctx;
    const unitX = shot.power ? shot.vector.x / shot.power : 0;
    const unitY = shot.power ? shot.vector.y / shot.power : 0;

    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,.8)";
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 9]);
    ctx.beginPath();
    ctx.moveTo(ball.x + unitX * 20, ball.y + unitY * 20);
    ctx.lineTo(ball.x + unitX * (55 + shot.power * 0.65), ball.y + unitY * (55 + shot.power * 0.65));
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.strokeStyle = "#c8f36a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  roundRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, width, height, radius);
  }
}
