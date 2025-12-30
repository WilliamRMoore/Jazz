import { FixedPoint } from '../../math/fixedPoint';
import { IHistoryEnabled } from '../componentHistory';

export type hitStunSnapShot = {
  readonly hitStunFrames: number;
  readonly vx: number;
  readonly vy: number;
};

export class HitStunComponent implements IHistoryEnabled<hitStunSnapShot> {
  private framesOfHitStun: number = 0;
  private readonly xVelocity: FixedPoint = new FixedPoint(0);
  private readonly yVelocity: FixedPoint = new FixedPoint(0);

  public set FramesOfHitStun(hitStunFrames: number) {
    this.framesOfHitStun = hitStunFrames;
  }

  public get VX(): FixedPoint {
    return this.xVelocity;
  }

  public get VY(): FixedPoint {
    return this.yVelocity;
  }

  public SetHitStun(
    hitStunFrames: number,
    vx: FixedPoint,
    vy: FixedPoint
  ): void {
    this.framesOfHitStun = hitStunFrames;
    this.xVelocity.SetFromFp(vx);
    this.yVelocity.SetFromFp(vy);
  }

  public DecrementHitStun(): void {
    this.framesOfHitStun--;
  }

  public Zero(): void {
    this.framesOfHitStun = 0;
    this.xVelocity.Zero();
    this.yVelocity.Zero();
  }

  public SnapShot(): hitStunSnapShot {
    return {
      hitStunFrames: this.framesOfHitStun,
      vx: this.xVelocity.AsNumber,
      vy: this.yVelocity.AsNumber,
    } as hitStunSnapShot;
  }

  public SetFromSnapShot(snapShot: hitStunSnapShot): void {
    this.framesOfHitStun = snapShot.hitStunFrames;
    this.xVelocity.SetFromNumber(snapShot.vx);
    this.yVelocity.SetFromNumber(snapShot.vy);
  }
}
