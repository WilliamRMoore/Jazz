import {
  STATE_IDS,
  StateId,
} from '../../finite-state-machine/stateConfigurations/shared';
import { FixedPoint } from '../../math/fixedPoint';

export class HitStunComponent {
  private framesOfHitStun: number = 0;
  private readonly xVelocity: FixedPoint = new FixedPoint(0);
  private readonly yVelocity: FixedPoint = new FixedPoint(0);
  public NextStateId: StateId = STATE_IDS.LAUNCH_S;

  public set Frames(hitStunFrames: number) {
    this.framesOfHitStun = hitStunFrames;
  }

  public get Frames(): number {
    return this.framesOfHitStun;
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
    vy: FixedPoint,
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

  public set CompState(history: HitStunHist) {
    this.framesOfHitStun = history.hitStunFrames;
    this.xVelocity.SetFromRaw(history.hitStunVxRaw);
    this.yVelocity.SetFromRaw(history.hitStunVyRaw);
    this.NextStateId = history.hitStunNextStateId;
  }
}

export type HitStunHist = {
  hitStunFrames: number;
  hitStunVxRaw: number;
  hitStunVyRaw: number;
  hitStunNextStateId: StateId;
};
