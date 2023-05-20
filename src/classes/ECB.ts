import { Position } from '../interfaces/interfaces';
import { ctx } from '../Globals/globals';

interface ECBPoints {
  top: Position;
  right: Position;
  bottom: Position;
  left: Position;
}

export default class ECB {
  points: ECBPoints;
  color: string;

  constructor(ecbp: ECBPoints) {
    this.points = ecbp;
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

  private topOffset() {
    let offsetX = Math.abs(this.points.top.x - this.points.bottom.x);
    let offsety = Math.abs(this.points.top.y - this.points.bottom.y);

    return { offsetX, offsety };
  }

  private LeftOffset() {
    let offsetX = Math.abs(this.points.left.x - this.points.bottom.x);
    let offsety = Math.abs(this.points.left.y - this.points.bottom.y);

    return { offsetX, offsety };
  }

  private rightOffset() {
    let offsetX = Math.abs(this.points.right.x - this.points.bottom.x);
    let offsety = Math.abs(this.points.right.y - this.points.bottom.y);

    return { offsetX, offsety };
  }

  updatePosition(position: Position) {
    let los = this.LeftOffset();
    let tos = this.topOffset();
    let ros = this.rightOffset();
    this.points.top.x = position.x - tos.offsetX;
    this.points.top.y = position.y - tos.offsety;

    this.points.left.x = position.x - los.offsetX;
    this.points.left.y = position.y - los.offsety;

    this.points.right.x = position.x + ros.offsetX;
    this.points.right.y = position.y - ros.offsety;

    this.points.bottom.x = position.x;
    this.points.bottom.y = position.y;
  }
}
