import { FixedPoint } from '../../math/fixedPoint';
import { IPooledObject } from './Pool';

export interface ICollisionResult {
  SetCollisionTrue(x: FixedPoint, y: FixedPoint, depth: FixedPoint): void;
  SetCollisionFalse(): void;
  get NormX(): FixedPoint;
  get NormY(): FixedPoint;
  get Collision(): boolean;
  get Depth(): FixedPoint;
}

export class CollisionResult implements ICollisionResult, IPooledObject {
  private collision: boolean = false;
  private readonly normX = new FixedPoint();
  private readonly normY = new FixedPoint();
  private readonly depth = new FixedPoint();

  public SetCollisionTrue(
    x: FixedPoint,
    y: FixedPoint,
    depth: FixedPoint
  ): void {
    this.collision = true;
    this.normX.setFromFp(x);
    this.normY.setFromFp(y);
    this.depth.setFromFp(depth);
  }

  public SetCollisionFalse(): void {
    this.collision = false;
    this.normX.Zero();
    this.normY.Zero();
    this.depth.Zero();
  }

  public get Collision(): boolean {
    return this.collision;
  }

  public get Depth(): FixedPoint {
    return this.depth;
  }

  public get NormX(): FixedPoint {
    return this.normX;
  }

  public get NormY(): FixedPoint {
    return this.normY;
  }

  public Zero(): void {
    this.SetCollisionFalse();
  }
}
