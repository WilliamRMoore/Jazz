import { FixedPoint } from '../../math/fixedPoint';

export class VelocityComponent {
  private readonly x: FixedPoint = new FixedPoint();
  private readonly y: FixedPoint = new FixedPoint();

  public AddClampedXImpulseRaw(clampRaw: number, impulseRaw: number): void {
    const clampValueRaw = Math.abs(clampRaw);
    const currentVelocityRaw = this.x.Raw;
    // Don't add impulse if we are already at or beyond the clamp limit.
    if (Math.abs(currentVelocityRaw) >= clampValueRaw) {
      return;
    }
    this.x.SetFromRaw(currentVelocityRaw + impulseRaw);
  }

  public AddClampedYImpulseRaw(clampRaw: number, impulse: number): void {
    const newVelocityRaw = this.y.Raw + impulse;
    const clampValueRaw = Math.abs(clampRaw);
    if (newVelocityRaw > 0) {
      this.y.SetFromRaw(Math.min(newVelocityRaw, clampValueRaw));
    } else {
      this.y.SetFromRaw(newVelocityRaw);
    }
  }

  public get X(): FixedPoint {
    return this.x;
  }

  public get Y(): FixedPoint {
    return this.y;
  }

  public set X(val: FixedPoint) {
    this.x.SetFromFp(val);
  }

  public set Y(val: FixedPoint) {
    this.y.SetFromFp(val);
  }

  public set CompState(state: VelocityHist) {
    this.x.SetFromRaw(state.velXRaw);
    this.y.SetFromRaw(state.velYRaw);
  }
}

export type VelocityHist = {
  velXRaw: number;
  velYRaw: number;
};
