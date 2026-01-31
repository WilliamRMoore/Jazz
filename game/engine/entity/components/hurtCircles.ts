import { HurtCapsuleConfig } from '../../../character/shared';
import { FixedPoint } from '../../math/fixedPoint';
import { Circle } from '../../physics/circle';
import { FlatVec } from '../../physics/vector';
import { Pool } from '../../pools/Pool';
import { PooledVector } from '../../pools/PooledVector';

export type HurtCirclesSnapShot = {
  position: FlatVec;
  circls: Array<Circle>;
};

export class HurtCapsule {
  public readonly StartOffsetX: FixedPoint = new FixedPoint();
  public readonly StartOffsetY: FixedPoint = new FixedPoint();
  public readonly EndOffsetX: FixedPoint = new FixedPoint();
  public readonly EndOffsetY: FixedPoint = new FixedPoint();
  public readonly Radius: FixedPoint = new FixedPoint();

  constructor(
    startOffsetX: number,
    startOffsetY: number,
    endOffsetX: number,
    endOffsetY: number,
    radius: number,
  ) {
    this.StartOffsetX.SetFromNumber(startOffsetX);
    this.StartOffsetY.SetFromNumber(startOffsetY);
    this.EndOffsetX.SetFromNumber(endOffsetX);
    this.EndOffsetY.SetFromNumber(endOffsetY);
    this.Radius.SetFromNumber(radius);
  }

  public GetStartPosition(
    x: FixedPoint,
    y: FixedPoint,
    vecPool: Pool<PooledVector>,
  ): PooledVector {
    const xsRaw = this.StartOffsetX.Raw + x.Raw;
    const ysRaw = this.StartOffsetY.Raw + y.Raw;
    return vecPool.Rent().SetXYRaw(xsRaw, ysRaw);
  }

  public GetEndPosition(
    x: FixedPoint,
    y: FixedPoint,
    vecPool: Pool<PooledVector>,
  ): PooledVector {
    const xeRaw = this.EndOffsetX.Raw + x.Raw;
    const yeRaw = this.EndOffsetY.Raw + y.Raw;
    return vecPool.Rent().SetXYRaw(xeRaw, yeRaw);
  }
}

export class HurtCapsulesComponent {
  public readonly HurtCapsules: Array<HurtCapsule>;

  constructor(hurtCapsules: Array<HurtCapsuleConfig>) {
    this.HurtCapsules = [];
    hurtCapsules.forEach((hc) => {
      this.HurtCapsules.push(
        new HurtCapsule(hc.x1, hc.y1, hc.x2, hc.y2, hc.radius),
      );
    });
  }
}
