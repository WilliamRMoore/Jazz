import { ctx } from '../../Globals/globals';
import { FlatVec } from '../../Physics/FlatVec';

export default class PlayerPosition {
  position: FlatVec;

  constructor(position: FlatVec) {
    this.position = position;
  }

  draw() {
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(this.position.X, this.position.Y);
    ctx.lineTo(this.position.X + 10, this.position.Y);
    ctx.stroke();
    ctx.moveTo(this.position.X, this.position.Y);
    ctx.lineTo(this.position.X - 10, this.position.Y);
    ctx.stroke();
    ctx.moveTo(this.position.X, this.position.Y);
    ctx.lineTo(this.position.X, this.position.Y + 10);
    ctx.stroke();
    ctx.moveTo(this.position.X, this.position.Y);
    ctx.lineTo(this.position.X, this.position.Y - 10);
    ctx.stroke();
    ctx.closePath();
  }

  update(p: FlatVec | null = null) {
    if (p !== null) {
      this.position = p;
    }
  }

  addVelocity(velocity: FlatVec) {
    this.position.X += velocity.X;
    this.position.Y += velocity.Y;
  }
}
