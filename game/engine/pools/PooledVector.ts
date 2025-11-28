import {
  FixedPoint,
  MultiplyRaw,
  SqrtRaw,
  DivideRaw,
  DotProductRaw,
} from '../math/fixedPoint';
import { FlatVec } from '../physics/vector';
import { IPooledObject, Pool } from './Pool';

export class PooledVector implements IPooledObject {
  private readonly x: FixedPoint = new FixedPoint(0);
  private readonly y: FixedPoint = new FixedPoint(0);

  public AddVec(vec: PooledVector): PooledVector {
    this.x.Add(vec.X);
    this.y.Add(vec.Y);
    return this;
  }

  public AddXY(x: FixedPoint, y: FixedPoint): PooledVector {
    this.x.Add(x);
    this.y.Add(y);
    return this;
  }

  public SubtractVec(vec: PooledVector): PooledVector {
    this.x.Subtract(vec.X);
    this.y.Subtract(vec.Y);
    return this;
  }

  public SubtractVecRaw(xRaw: number, yRaw: number): PooledVector {
    this.x.SetFromRaw(this.x.Raw - xRaw);
    this.y.SetFromRaw(this.y.Raw - yRaw);
    return this;
  }

  public SubtractXY(x: FixedPoint, y: FixedPoint): PooledVector {
    this.x.Subtract(x);
    this.y.Subtract(y);
    return this;
  }

  public Multiply(s: FixedPoint): PooledVector {
    this.x.Multiply(s);
    this.y.Multiply(s);
    return this;
  }

  public Negate(): PooledVector {
    this.x.Negate();
    this.y.Negate();
    return this;
  }

  public Divide(s: FixedPoint): PooledVector {
    this.x.Divide(s);
    this.y.Divide(s);
    return this;
  }

  private LengthRaw(): number {
    // const fp = pool
    //   .Rent()
    //   .setMultiply(this.x, this.x)
    //   .add(pool.Rent().setMultiply(this.y, this.y));
    // return FixedPoint.sqrt(fp, pool);
    const xRaw = this.x.Raw;
    const yRaw = this.y.Raw;
    const sum = MultiplyRaw(xRaw, xRaw) + MultiplyRaw(yRaw, yRaw);
    return SqrtRaw(sum);
  }

  public Distance(other: PooledVector, fpp: Pool<FixedPoint>): FixedPoint {
    // const dx = this.x.Raw() - other.x.Raw(); //fpp.Rent().setSubtract(this.x, other.X);
    // const dy = this.y.Raw() - other.y.Raw(); //fpp.Rent().setSubtract(this.y, other.Y);
    // const dx2 = MultiplyRaw(dx, dx); //fpp.Rent().setMultiply(dx, dx);
    // const dy2 = MultiplyRaw(dy, dy); //this.Multiply(dy, dy);//fpp.Rent().setMultiply(dy, dy);
    // const sum = dx2 + dy2; //fpp.Rent().setAdd(dx2, dy2);
    return fpp.Rent().SetFromRaw(this.DistanceRaw(other)); //FixedPoint.sqrt(sum, fpp);
  }

  public DistanceRaw(other: PooledVector): number {
    const dx = this.x.Raw - other.x.Raw;
    const dy = this.y.Raw - other.y.Raw;
    const dx2 = MultiplyRaw(dx, dx);
    const dy2 = MultiplyRaw(dy, dy);
    const sum = dx2 + dy2;
    return SqrtRaw(sum);
  }

  public Normalize(): PooledVector {
    const length = this.LengthRaw();
    if (length > 0) {
      this.x.SetFromRaw(DivideRaw(this.x.Raw, length));
      this.y.SetFromRaw(DivideRaw(this.y.Raw, length));
    }
    return this;
  }

  public DotProduct(other: PooledVector, fpp: Pool<FixedPoint>): FixedPoint {
    return fpp
      .Rent()
      .SetFromRaw(
        DotProductRaw(this.x.Raw, this.y.Raw, other.x.Raw, other.y.Raw)
      );
  }

  public CrossProduct(other: PooledVector, fpp: Pool<FixedPoint>): FixedPoint {
    const x_prod = fpp.Rent().SetMultiply(this.x, other.Y);
    const y_prod = fpp.Rent().SetMultiply(this.y, other.X);
    return x_prod.Subtract(y_prod);
  }

  public SetFromFlatVec(vec: FlatVec): PooledVector {
    this.x.SetFromFp(vec.X);
    this.y.SetFromFp(vec.Y);
    return this;
  }

  public AddToX(x: FixedPoint): void {
    this.x.Add(x);
  }

  public AddToXRaw(xRaw: number): void {
    this.x.SetFromRaw(this.x.Raw + xRaw);
  }

  public AddToY(y: FixedPoint): void {
    this.y.Add(y);
  }

  public AddToYRaw(yRaw: number): void {
    this.y.SetFromRaw(this.y.Raw + yRaw);
  }

  get X(): FixedPoint {
    return this.x;
  }

  get Y(): FixedPoint {
    return this.y;
  }

  public SetX(x: FixedPoint): PooledVector {
    this.x.SetFromFp(x);
    return this;
  }

  public SetxRaw(xRaw: number): PooledVector {
    this.x.SetFromRaw(xRaw);
    return this;
  }

  public SetY(y: FixedPoint): PooledVector {
    this.y.SetFromFp(y);
    return this;
  }

  public SetYRaw(yRaw: number): PooledVector {
    this.y.SetFromRaw(yRaw);
    return this;
  }

  public SetXY(x: FixedPoint, y: FixedPoint): PooledVector {
    this.x.SetFromFp(x);
    this.y.SetFromFp(y);
    return this;
  }

  public SetXYRaw(x: number, y: number): PooledVector {
    this.x.SetFromRaw(x);
    this.y.SetFromRaw(y);
    return this;
  }

  public SetFromPooledVec(vec: PooledVector): PooledVector {
    this.x.SetFromFp(vec.X);
    this.y.SetFromFp(vec.y);

    return this;
  }

  public Zero(): void {
    this.x.Zero();
    this.y.Zero();
  }
}
