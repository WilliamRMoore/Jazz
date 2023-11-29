import { FlatVec, VectorAllocator } from '../Physics/FlatVec';
import { Normalize } from '../Physics/VecMath';
import { Boundry } from './Boundry';

export class Ray {
  private Position: FlatVec;
  private End: FlatVec;
  private Direction: FlatVec;
  //private Length: number;
  constructor(x1: number, y1: number, x2: number, y2: number) {
    this.Position = VectorAllocator(x1, y1);
    this.End = VectorAllocator(x2, y2);
    this.Direction = VectorAllocator(1, 0);
    //this.Length = length;
  }

  public LookAt(x: number, y: number) {
    this.Direction.X = x - this.Direction.X;
    this.Direction.Y = y - this.Direction.Y;
    this.Direction = Normalize(this.Direction);
  }

  public UpdatePosition(x: number, y: number, length: number) {
    this.Position.X = x;
    this.Position.Y = y;
    //this.Length = length;
  }

  public Cast(bound: Boundry): false | FlatVec {
    const x1 = bound.start.X;
    const y1 = bound.start.Y;
    const x2 = bound.end.X;
    const y2 = bound.end.Y;

    const x3 = this.Position.X;
    const y3 = this.Position.Y;
    const x4 = this.Position.X + this.Direction.X;
    const y4 = this.Position.Y + this.Direction.Y;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (den === 0) {
      return false;
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    // bstart,bend
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

    if (t > 0 && t < 1 && u > 0) {
      return VectorAllocator(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
    } else {
      return false;
    }
  }

  public CastWithLength(bound: Boundry): false | FlatVec {
    const x1 = bound.start.X;
    const y1 = bound.start.Y;
    const x2 = bound.end.X;
    const y2 = bound.end.Y;
    const x3 = this.Position.X;
    const y3 = this.Position.Y;
    const x4 = this.End.X;
    const y4 = this.End.Y;

    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    const numeA = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
    const numeB = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);

    if (denom === 0) {
      return false;
    }

    const uA = numeA / denom;
    const uB = numeB / denom;

    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
      return VectorAllocator(x1 + uA * (x2 - x1), y1 + uA * (y2 - y1));
    }

    return false;
  }
}
