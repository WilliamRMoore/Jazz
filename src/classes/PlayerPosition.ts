import { Position } from '../interfaces/interfaces';
import { ctx } from '../Globals/globals';
import ECB from './ECB';

export default class PlayerPostion {
  ECB: ECB;
  position: Position;

  constructor(ecb: ECB, position: Position) {
    this.ECB = ecb;
    this.position = position;
  }

  draw() {
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(this.position.x + 10, this.position.y);
    ctx.stroke();
    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(this.position.x - 10, this.position.y);
    ctx.stroke();
    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(this.position.x, this.position.y + 10);
    ctx.stroke();
    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(this.position.x, this.position.y - 10);
    ctx.stroke();
    ctx.closePath();
    this.ECB.draw();
  }

  update() {
    this.ECB.updatePosition(this.position);
  }
}
