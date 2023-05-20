import { Position } from '../interfaces/interfaces';
import { ctx } from '../Globals/globals';

abstract class Boundry {
  start: Position;
  end: Position;
  thickness: number;

  constructor(
    start: Position,
    end: Position,
    color: string = 'white',
    thickness: number = 1
  ) {
    this.start = start;
    this.end = end;
    this.thickness = thickness;
  }
}

export class Ground extends Boundry {
  constructor(start: Position, end: Position) {
    super(start, end);
  }

  draw() {
    ctx.beginPath();
    ctx.moveTo(this.start.x, this.start.y);
    ctx.lineTo(this.end.x, this.end.y);
    ctx.stroke();
  }
}

export class Wall extends Boundry {
  constructor(start: Position, end: Position) {
    super(start, end, 'pink');
  }

  draw() {
    ctx.beginPath();
    ctx.moveTo(this.start.x, this.start.y);
    ctx.lineTo(this.end.x, this.end.y);
    ctx.stroke();
  }
}

export class Ceiling extends Boundry {
  constructor(start: Position, end: Position) {
    super(start, end, 'green');
  }

  draw() {
    ctx.beginPath();
    ctx.moveTo(this.start.x, this.start.y);
    ctx.lineTo(this.end.x, this.end.y);
    ctx.stroke();
  }
}
