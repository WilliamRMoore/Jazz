import { ctx } from '../Globals/globals';
import { IDrawable } from '../interfaces/interfaces';
import { Position } from '../classes/Position';
export default class Stage implements IDrawable {
  points: Position[];
  length: number;
  color: string;

  constructor(points: Position[], color: string = 'green') {
    if (points.length < 4) {
      throw new Error('Insufficient point count when creating a stage!');
    }
    this.points = points;
    this.length = points.length;
    this.color = color;
  }

  draw(): void {
    // debugger;
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let index = 1; index < this.length; index++) {
      const point = this.points[index];
      ctx.lineTo(point.x, point.y);
    }
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}
