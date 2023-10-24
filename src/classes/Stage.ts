//import { ctx } from '../Globals/globals';
import { FlatVec } from '../Physics/FlatVec';
import { IDrawable } from '../interfaces/interfaces';
//import { Position } from '../classes/Position';
export default class Stage implements IDrawable {
  verticies: FlatVec[];
  color: string;

  constructor(verticies: FlatVec[], color: string = 'green') {
    if (verticies.length < 4) {
      throw new Error('Insufficient point count when creating a stage!');
    }
    this.verticies = verticies;
    this.color = color;
  }

  draw(): void {
    // ctx.beginPath();
    // ctx.moveTo(this.verticies[0].X, this.verticies[0].Y);
    // for (let index = 0; index < this.verticies.length; index++) {
    //   const point = this.verticies[index];
    //   ctx.lineTo(point.X, point.Y);
    // }
    // ctx.closePath();
    // ctx.fillStyle = this.color;
    // ctx.fill();
  }

  GetVerticies() {
    return this.verticies;
  }
}
