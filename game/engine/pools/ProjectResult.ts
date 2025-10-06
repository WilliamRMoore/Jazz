import { FixedPoint } from '../../math/fixedPoint';
import { IPooledObject } from './Pool';

export class ProjectionResult implements IProjectionResult, IPooledObject {
  private readonly min: FixedPoint = new FixedPoint();
  private readonly max: FixedPoint = new FixedPoint();

  public get Max(): FixedPoint {
    return this.max;
  }

  public get Min(): FixedPoint {
    return this.min;
  }

  public SetMinMax(min: FixedPoint, max: FixedPoint): void {
    this.min.setFromFp(min);
    this.max.setFromFp(max);
  }

  public Zero() {
    this.min.Zero();
    this.max.Zero();
  }
}

export interface IProjectionResult {
  get Max(): FixedPoint;
  get Min(): FixedPoint;
  SetMinMax(x: FixedPoint, y: FixedPoint): void;
}
