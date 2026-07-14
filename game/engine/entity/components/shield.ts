import {
  DivideRaw,
  FixedPoint,
  MultiplyRaw,
  NumberToRaw,
} from '../../math/fixedPoint';

const ONE = NumberToRaw(1);
const TWO = NumberToRaw(2);

export class ShieldComponent {
  private readonly currentRadius = new FixedPoint(0);
  private readonly step = new FixedPoint(0);
  private readonly framesToFulll = new FixedPoint(300);
  private readonly damageMult = new FixedPoint(1.5);
  public readonly maxShieldOffSetRadius = new FixedPoint(0);
  public readonly InitialRadius = new FixedPoint(0);
  public readonly YOffsetConstant = new FixedPoint(0);
  public readonly ShieldTiltX = new FixedPoint(0);
  public readonly ShieldTiltY = new FixedPoint(0);
  private calculatedRadius = new FixedPoint(0);
  public Active: boolean = false;

  constructor(radius: number, yOffset: number) {
    this.currentRadius.SetFromNumber(radius);
    this.InitialRadius.SetFromNumber(radius);
    this.maxShieldOffSetRadius.SetFromNumber(DivideRaw(radius, TWO));
    this.YOffsetConstant.SetFromNumber(yOffset);
    this.step.SetDivide(this.currentRadius, this.framesToFulll);
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

  public SetCalculatedRadiusRaw(triggerRaw: number): void {
    this.calculatedRadius.SetFromRaw(
      CalculateRadiusFromTriggerRaw(triggerRaw, this.currentRadius.Raw),
    );
  }

  public CalculateCurrentRadiusRaw(triggerRaw: number): number {
    return CalculateRadiusFromTriggerRaw(triggerRaw, this.currentRadius.Raw);
  }

  public get CalculatedRadiusRaw(): number {
    return this.calculatedRadius.Raw;
  }

  public get IsBroken(): boolean {
    return this.currentRadius.Raw <= 0;
  }

  public get PreModCurrentRadius(): FixedPoint {
    return this.currentRadius;
  }

  public Reset() {
    this.currentRadius.SetFromFp(this.InitialRadius);
    this.ShieldTiltX.Zero();
    this.ShieldTiltY.Zero();
    this.Active = false;
  }

  public set CompState(state: ShieldHist) {
    this.Active = state.shieldActive;
    this.currentRadius.SetFromRaw(state.shieldRadiusRaw);
    this.calculatedRadius.SetFromRaw(state.calcRadiusRaw);
    this.ShieldTiltX.SetFromRaw(state.shieldTiltXRaw);
    this.ShieldTiltY.SetFromRaw(state.shieldTiltYRaw);
  }
}

export type ShieldHist = {
  shieldActive: boolean;
  shieldRadiusRaw: number;
  calcRadiusRaw: number;
  shieldTiltXRaw: number;
  shieldTiltYRaw: number;
};

export function CalculateRadiusFromTriggerRaw(
  triggerValueRaw: number,
  raddiusRaw: number,
): number {
  return (
    raddiusRaw + MultiplyRaw(raddiusRaw, DivideRaw(ONE - triggerValueRaw, TWO))
  );
}
