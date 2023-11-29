import { ctx } from '../Globals/globals';
import { FlatVec } from '../Physics/FlatVec';

export class Boundry {
  start: FlatVec;
  end: FlatVec;
  thickness: number;

  constructor(
    start: FlatVec,
    end: FlatVec,
    color: string = 'white',
    thickness: number = 1
  ) {
    this.start = start;
    this.end = end;
    this.thickness = thickness;
  }
}

export class Ground extends Boundry {
  constructor(start: FlatVec, end: FlatVec) {
    super(start, end);
  }

  draw() {
    ctx.beginPath();
    ctx.moveTo(this.start.X, this.start.Y);
    ctx.lineTo(this.end.X, this.end.Y);
    ctx.stroke();
  }
}

export class Wall extends Boundry {
  constructor(start: FlatVec, end: FlatVec) {
    super(start, end, 'pink');
  }

  draw() {
    ctx.beginPath();
    ctx.moveTo(this.start.X, this.start.Y);
    ctx.lineTo(this.end.X, this.end.Y);
    ctx.stroke();
  }
}

export class Ceiling extends Boundry {
  constructor(start: FlatVec, end: FlatVec) {
    super(start, end, 'green');
  }

  draw() {
    ctx.beginPath();
    ctx.moveTo(this.start.X, this.start.Y);
    ctx.lineTo(this.end.X, this.end.Y);
    ctx.stroke();
  }
}
