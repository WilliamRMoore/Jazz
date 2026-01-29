import { FixedPoint } from '../../math/fixedPoint';
import { IHistoryEnabled } from '../componentHistory';

export type VelocitySnapShot = { X: number; Y: number };

export class VelocityComponent implements IHistoryEnabled<VelocitySnapShot> {
  private readonly x: FixedPoint = new FixedPoint();
  private readonly y: FixedPoint = new FixedPoint();

  public AddClampedXImpulse(clamp: FixedPoint, impulse: FixedPoint): void {
    this.AddClampedXImpulseRaw(clamp.Raw, impulse.Raw);
  }

  public AddClampedXImpulseRaw(clampRaw: number, impulseRaw: number): void {
    const clampValueRaw = Math.abs(clampRaw);
    const currentVelocityRaw = this.x.Raw;

    // Don't add impulse if we are already at or beyond the clamp limit.
    if (Math.abs(currentVelocityRaw) >= clampValueRaw) {
      return;
    }

    this.x.SetFromRaw(currentVelocityRaw + impulseRaw);
  }

  public AddClampedYImpulse(clamp: FixedPoint, impulse: FixedPoint): void {
    this.AddClampedYImpulseRaw(clamp.Raw, impulse.Raw);
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

  public SnapShot(): VelocitySnapShot {
    return { X: this.x.AsNumber, Y: this.y.AsNumber } as VelocitySnapShot;
  }

  public SetFromSnapShot(snapShot: VelocitySnapShot): void {
    this.x.SetFromNumber(snapShot.X);
    this.y.SetFromNumber(snapShot.Y);
  }
}
