import { Position } from './Position';
import { ctx } from '../Globals/globals';
import ECB from './ECB';

export default class PlayerPosition {
  position: Position;

  constructor(position: Position) {
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
  }

  update(p: Position | null = null) {
    if (p !== null) {
      this.position = p;
    }
  }
}
