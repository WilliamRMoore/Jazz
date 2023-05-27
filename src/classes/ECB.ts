import { ECBPoints } from '../interfaces/interfaces';
import { ctx } from '../Globals/globals';
import { Position } from './Position';

export type ECBOffsets = {
  top: { xOffset: number; yOffset: number };
  right: { xOffset: number; yOffset: number };
  bottom: { xOffset: number; yOffset: number };
  left: { xOffset: number; yOffset: number };
};

export default class ECB {
  offsets: ECBOffsets;
  points: ECBPoints;
  color: string;

  constructor(ecbOffsets: ECBOffsets) {
    this.offsets = ecbOffsets;
    this.points = {
      top: { x: 0, y: 0 },
      bottom: { x: 0, y: 0 },
      right: { x: 0, y: 0 },
      left: { x: 0, y: 0 },
    };
    this.color = 'orange';
  }

  draw() {
    ctx.beginPath();
    ctx.moveTo(this.points.top.x, this.points.top.y);
    ctx.lineTo(this.points.left.x, this.points.left.y);
    ctx.lineTo(this.points.bottom.x, this.points.bottom.y);
    ctx.lineTo(this.points.right.x, this.points.right.y);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
  }

  updatePosition(position: Position) {
    this.points.top.x = position.x + this.offsets.top.xOffset;
    this.points.top.y = position.y + this.offsets.top.yOffset;

    this.points.right.x = position.x + this.offsets.right.xOffset;
    this.points.right.y = position.y + this.offsets.right.yOffset;

    this.points.bottom.x = position.x + this.offsets.bottom.xOffset;
    this.points.bottom.y = position.y + this.offsets.bottom.yOffset;

    this.points.left.x = position.x + this.offsets.left.xOffset;
    this.points.left.y = position.y + this.offsets.left.yOffset;
  }
}
