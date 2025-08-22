import { FlatVec } from '../physics/vector';
import { IPooledObject } from './Pool';

export interface IPooledVector {
  AddVec(vec: IPooledVector): IPooledVector;
  SubtractVec(vec: IPooledVector): IPooledVector;
  Multiply(s: number): IPooledVector;
  Negate(): IPooledVector;
  Divide(s: number): IPooledVector;
  Length(): number;
  Distance(vec: IPooledVector): number;
  Normalize(): IPooledVector;
  DotProduct(vec: IPooledVector): number;
  CrossProduct(vec: IPooledVector): number;
  SetFromFlatVec(vec: FlatVec): IPooledVector;
  get X(): number;
  get Y(): number;
  AddToX(x: number): void;
  AddToY(y: number): void;
  SetX(x: number): IPooledVector;
  SetY(y: number): IPooledVector;
  SetXY(x: number, y: number): IPooledVector;
}

export class PooledVector implements IPooledVector, IPooledObject {
  private x: number;
  private y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  public AddVec(vec: PooledVector): PooledVector {
    this.x += vec.X;
    this.y += vec.Y;
    return this;
  }

  public AddXY(x: number, y: number): PooledVector {
    this.x += x;
    this.y += y;
    return this;
  }

  public SubtractVec(vec: PooledVector): PooledVector {
    this.x -= vec.X;
    this.y -= vec.Y;
    return this;
  }

  public SubtractXY(x: number, y: number): PooledVector {
    this.x -= x;
    this.y -= y;
    return this;
  }

  public Multiply(s: number): PooledVector {
    this.x *= s;
    this.y *= s;
    return this;
  }

  public Negate(): PooledVector {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  }

  public Divide(s: number): PooledVector {
    this.x /= s;
    this.y /= s;
    return this;
  }

  public Length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  public Distance(vec: PooledVector): number {
    const dx = this.x - vec.X;
    const dy = this.y - vec.Y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public Normalize(): PooledVector {
    const length = Math.sqrt(this.x * this.x + this.y * this.y);
    this.x /= length;
    this.y /= length;
    return this;
  }

  public DotProduct(vec: PooledVector): number {
    return this.x * vec.X + this.y * vec.Y;
  }

  public CrossProduct(vec: PooledVector) {
    return this.x * vec.Y - this.y * vec.X;
  }

  public SetFromFlatVec(vec: FlatVec): PooledVector {
    this.x = vec.X;
    this.y = vec.Y;
    return this;
  }

  public AddToX(x: number): void {
    this.x += x;
  }

  public AddToY(y: number): void {
    this.y += y;
  }

  get X(): number {
    return this.x;
  }

  get Y(): number {
    return this.y;
  }

  public SetX(x: number): PooledVector {
    this.x = x;
    return this;
  }

  public SetY(y: number): PooledVector {
    this.y = y;
    return this;
  }

  public SetXY(x: number, y: number): PooledVector {
    this.x = x;
    this.y = y;
    return this;
  }

  public Zero(): void {
    this.x = 0;
    this.y = 0;
  }
}
