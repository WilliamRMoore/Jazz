import {
  DivideRaw,
  MultiplyRaw,
  NumberToRaw,
  FixedPoint,
} from '../../math/fixedPoint';
import { IHistoryEnabled } from '../componentHistory';

const ONE = NumberToRaw(1);
const TWO = NumberToRaw(2);

export type ShieldSnapShot = {
  CurrentRadius: number;
  Active: boolean;
  ShieldTiltX: number;
  ShieldTiltY: number;
};

export class ShieldComponent implements IHistoryEnabled<ShieldSnapShot> {
  private readonly currentRadius = new FixedPoint(0);
  private readonly step = new FixedPoint(0);
  private readonly framesToFulll = new FixedPoint(300);
  private readonly damageMult = new FixedPoint(1.5);
  public readonly maxShieldOffSetRadius = new FixedPoint(0);
  public readonly InitialRadius = new FixedPoint(0);
  public readonly YOffsetConstant = new FixedPoint(0);
  public readonly ShieldTiltX = new FixedPoint(0);
  public readonly ShieldTiltY = new FixedPoint(0);
  public Active: boolean = false;

  constructor(radius: number, yOffset: number) {
    this.currentRadius.SetFromNumber(radius);
    this.InitialRadius.SetFromNumber(radius);
    this.maxShieldOffSetRadius.SetFromNumber(DivideRaw(radius, TWO));
    this.YOffsetConstant.SetFromNumber(yOffset);
    this.step.SetDivide(this.currentRadius, this.framesToFulll);
  }

  public SnapShot(): ShieldSnapShot {
    return {
      CurrentRadius: this.currentRadius.AsNumber,
      Active: this.Active,
      ShieldTiltX: this.ShieldTiltX.AsNumber,
      ShieldTiltY: this.ShieldTiltY.AsNumber,
    } as ShieldSnapShot;
  }

  public SetFromSnapShot(snapShot: ShieldSnapShot): void {
    this.Active = snapShot.Active;
    this.currentRadius.SetFromNumber(snapShot.CurrentRadius);
    this.ShieldTiltX.SetFromNumber(snapShot.ShieldTiltX);
    this.ShieldTiltY.SetFromNumber(snapShot.ShieldTiltY);
  }

  public Grow(): void {
    if (this.currentRadius.LessThan(this.InitialRadius)) {
      this.currentRadius.Add(this.step);
    }

    if (this.currentRadius.GreaterThan(this.InitialRadius)) {
      this.currentRadius.SetFromFp(this.InitialRadius);
    }
  }

  public ShrinkRaw(intensityRaw: number): void {
    if (this.currentRadius.Raw > 0) {
      this.currentRadius.SetFromRaw(
        this.currentRadius.Raw - MultiplyRaw(this.step.Raw, intensityRaw),
      );
    }

    if (this.currentRadius.Raw < 0) {
      this.currentRadius.SetFromRaw(0);
    }
  }

  public Damage(d: FixedPoint) {
    const damageMod = MultiplyRaw(d.Raw, this.damageMult.Raw);
    const curRadius = this.currentRadius;
    this.currentRadius.SetFromRaw(curRadius.Raw - damageMod);
    if (curRadius.Raw < 0) {
      this.currentRadius.SetFromRaw(0);
    }
  }

  public CalculateCurrentRadiusRaw(triggerValueRaw: number): number {
    const curRadRaw = this.currentRadius.Raw;
    return CalculateRadiusFromTriggerRaw(triggerValueRaw, curRadRaw);
  }

  public get IsBroken(): boolean {
    return this.currentRadius.Raw <= 0;
  }

  public get PreModeCurrentRadius(): FixedPoint {
    return this.currentRadius;
  }

  public Reset() {
    this.currentRadius.SetFromFp(this.InitialRadius);
    this.ShieldTiltX.Zero();
    this.ShieldTiltY.Zero();
    this.Active = false;
  }
}

export function CalculateRadiusFromTriggerRaw(
  triggerValueRaw: number,
  raddiusRaw: number,
): number {
  return (
    raddiusRaw + MultiplyRaw(raddiusRaw, DivideRaw(ONE - triggerValueRaw, TWO))
  );
}
