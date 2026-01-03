import { FixedPoint, MultiplyRaw } from '../../math/fixedPoint';
import { IHistoryEnabled } from '../componentHistory';

export type ShieldSnapShot = {
  readonly CurrentRadius: number;
  readonly Active: boolean;
};

export class ShieldComponent implements IHistoryEnabled<ShieldSnapShot> {
  public readonly InitialRadius = new FixedPoint(0);
  public readonly YOffset = new FixedPoint(0);
  public Active: boolean = false;
  public readonly CurrentRadius = new FixedPoint(0);
  private readonly step = new FixedPoint(0);
  private readonly framesToFulll = new FixedPoint(300);
  private readonly damageMult = new FixedPoint(1.5);

  constructor(radius: number, yOffset: number) {
    this.CurrentRadius.SetFromNumber(radius);
    this.InitialRadius.SetFromNumber(radius);
    this.YOffset.SetFromNumber(yOffset);
    this.step.SetDivide(this.CurrentRadius, this.framesToFulll);
  }

  public SnapShot(): ShieldSnapShot {
    return {
      CurrentRadius: this.CurrentRadius.AsNumber,
      Active: this.Active,
    } as ShieldSnapShot;
  }

  public SetFromSnapShot(snapShot: ShieldSnapShot): void {
    this.Active = snapShot.Active;
    this.CurrentRadius.SetFromNumber(snapShot.CurrentRadius);
  }

  public Grow(): void {
    if (this.CurrentRadius.LessThan(this.InitialRadius)) {
      this.CurrentRadius.Add(this.step);
    }

    if (this.CurrentRadius.GreaterThan(this.InitialRadius)) {
      this.CurrentRadius.SetFromFp(this.InitialRadius);
    }
  }

  public ShrinkRaw(intensityRaw: number): void {
    if (this.CurrentRadius.Raw > 0) {
      this.CurrentRadius.SetFromRaw(
        this.CurrentRadius.Raw - MultiplyRaw(this.step.Raw, intensityRaw)
      );
    }

    if (this.CurrentRadius.Raw < 0) {
      this.CurrentRadius.SetFromRaw(0);
    }
  }

  public Damage(d: FixedPoint) {
    const damageMod = MultiplyRaw(d.Raw, this.damageMult.Raw);
    const curRadius = this.CurrentRadius;
    this.CurrentRadius.SetFromRaw(curRadius.Raw - damageMod);
    if (curRadius.Raw < 0) {
      this.CurrentRadius.SetFromRaw(0);
    }
  }

  public get IsBroken(): boolean {
    return this.CurrentRadius.Raw <= 0;
  }

  public Reset() {
    this.CurrentRadius.SetFromFp(this.InitialRadius);
  }
}
