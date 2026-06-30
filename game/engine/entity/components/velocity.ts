import { FixedPoint } from '../../math/fixedPoint';

export class VelocityComponent {
  private readonly x: FixedPoint = new FixedPoint();
  private readonly y: FixedPoint = new FixedPoint();

  public AddClampedXImpulseRaw(clampRaw: number, impulseRaw: number): void {
    const clampValueRaw = Math.abs(clampRaw);
    const currentVelocityRaw = this.x.Raw;

    if (impulseRaw > 0) {
      if (currentVelocityRaw >= clampValueRaw) {
        return;
      }
      this.x.SetFromRaw(Math.min(currentVelocityRaw + impulseRaw, clampValueRaw));
    } else if (impulseRaw < 0) {
      if (currentVelocityRaw <= -clampValueRaw) {
        return;
      }
      this.x.SetFromRaw(Math.max(currentVelocityRaw + impulseRaw, -clampValueRaw));
    }
  }

  public AddClampedYImpulseRaw(clampRaw: number, impulse: number): void {
    const clampValueRaw = Math.abs(clampRaw);
    const currentVelocityRaw = this.y.Raw;

    if (impulse > 0) {
      if (currentVelocityRaw >= clampValueRaw) {
        return;
      }
      this.y.SetFromRaw(Math.min(currentVelocityRaw + impulse, clampValueRaw));
    } else if (impulse < 0) {
      if (currentVelocityRaw <= -clampValueRaw) {
        return;
      }
      this.y.SetFromRaw(Math.max(currentVelocityRaw + impulse, -clampValueRaw));
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
