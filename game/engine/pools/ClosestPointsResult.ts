import { FixedPoint } from '../math/fixedPoint';
import { IPooledObject } from './Pool';

export class ClosestPointsResult implements IPooledObject {
  private readonly c1X = new FixedPoint();
  private readonly c1Y = new FixedPoint();
  private readonly c2X = new FixedPoint();
  private readonly c2Y = new FixedPoint();

  public Set(
    c1X: FixedPoint,
    c1Y: FixedPoint,
    c2X: FixedPoint,
    c2Y: FixedPoint
  ) {
    this.c1X.SetFromFp(c1X);
    this.c1Y.SetFromFp(c1Y);
    this.c2X.SetFromFp(c2X);
    this.c2Y.SetFromFp(c2Y);
  }

  public SetRaw(
    c1XRaw: number,
    c1YRaw: number,
    c2XRaw: number,
    c2YRaw: number
  ) {
    this.c1X.SetFromRaw(c1XRaw);
    this.c1Y.SetFromRaw(c1YRaw);
    this.c2X.SetFromRaw(c2XRaw);
    this.c2Y.SetFromRaw(c2YRaw);
  }

  public get C1X(): FixedPoint {
    return this.c1X;
  }

  public get C1Y(): FixedPoint {
    return this.c1Y;
  }

  public get C2X(): FixedPoint {
    return this.c2X;
  }

  public get C2Y(): FixedPoint {
    return this.c2Y;
  }

  public Zero(): void {
    this.c1X.Zero();
    this.c1Y.Zero();
    this.c2X.Zero();
    this.c2Y.Zero();
  }
}
