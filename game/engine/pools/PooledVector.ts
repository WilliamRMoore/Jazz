import { FixedPoint } from '../../math/fixedPoint';
import { FlatVec } from '../physics/vector';
import { IPooledObject, Pool } from './Pool';

export class PooledVector implements IPooledObject {
  private readonly x: FixedPoint = new FixedPoint(0);
  private readonly y: FixedPoint = new FixedPoint(0);

  public AddVec(vec: PooledVector): PooledVector {
    this.x.add(vec.X);
    this.y.add(vec.Y);
    return this;
  }

  public AddXY(x: FixedPoint, y: FixedPoint): PooledVector {
    this.x.add(x);
    this.y.add(y);
    return this;
  }

  public SubtractVec(vec: PooledVector): PooledVector {
    this.x.subtract(vec.X);
    this.y.subtract(vec.Y);
    return this;
  }

  public SubtractXY(x: FixedPoint, y: FixedPoint): PooledVector {
    this.x.subtract(x);
    this.y.subtract(y);
    return this;
  }

  public Multiply(s: FixedPoint): PooledVector {
    this.x.multiply(s);
    this.y.multiply(s);
    return this;
  }

  public Negate(): PooledVector {
    this.x.negate();
    this.y.negate();
    return this;
  }

  public Divide(s: FixedPoint): PooledVector {
    this.x.divide(s);
    this.y.divide(s);
    return this;
  }

  public Length(pool: Pool<FixedPoint>): FixedPoint {
    const fp = pool
      .Rent()
      .setMultiply(this.x, this.x)
      .add(pool.Rent().setMultiply(this.y, this.y));
    return FixedPoint.sqrt(fp, pool);
  }

  public Distance(other: PooledVector, fpp: Pool<FixedPoint>): FixedPoint {
    const dx = fpp.Rent().setSubtract(this.x, other.X);
    const dy = fpp.Rent().setSubtract(this.y, other.Y);
    const dx2 = fpp.Rent().setMultiply(dx, dx);
    const dy2 = fpp.Rent().setMultiply(dy, dy);
    const sum = fpp.Rent().setAdd(dx2, dy2);
    return FixedPoint.sqrt(sum, fpp);
  }

  public Normalize(fpp: Pool<FixedPoint>): PooledVector {
    const length = this.Length(fpp);
    if (length.graterThanZero) {
      this.x.divide(length);
      this.y.divide(length);
    }
    return this;
  }

  public DotProduct(other: PooledVector, fpp: Pool<FixedPoint>): FixedPoint {
    const x_prod = fpp.Rent().setMultiply(this.x, other.X);
    const y_prod = fpp.Rent().setMultiply(this.y, other.Y);
    return x_prod.add(y_prod);
  }

  public CrossProduct(other: PooledVector, fpp: Pool<FixedPoint>): FixedPoint {
    const x_prod = fpp.Rent().setMultiply(this.x, other.Y);
    const y_prod = fpp.Rent().setMultiply(this.y, other.X);
    return x_prod.subtract(y_prod);
  }

  public SetFromFlatVec(vec: FlatVec): PooledVector {
    this.x.setFromFp(vec.X);
    this.y.setFromFp(vec.Y);
    return this;
  }

  public AddToX(x: FixedPoint): void {
    this.x.add(x);
  }

  public AddToY(y: FixedPoint): void {
    this.y.add(y);
  }

  get X(): FixedPoint {
    return this.x;
  }

  get Y(): FixedPoint {
    return this.y;
  }

  public SetX(x: FixedPoint): PooledVector {
    this.x.setFromFp(x);
    return this;
  }

  public SetY(y: FixedPoint): PooledVector {
    this.y.setFromFp(y);
    return this;
  }

  public SetXY(x: FixedPoint, y: FixedPoint): PooledVector {
    this.x.setFromFp(x);
    this.y.setFromFp(y);
    return this;
  }

  public Zero(): void {
    this.x.setFromNumber(0);
    this.y.setFromNumber(0);
  }
}
