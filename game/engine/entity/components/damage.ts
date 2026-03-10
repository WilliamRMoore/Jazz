import { FixedPoint } from '../../math/fixedPoint';

export class PlayerDamageComponent {
  private readonly damagePoints: FixedPoint = new FixedPoint(0);

  public constructor() {}

  public AddDamage(number: FixedPoint): void {
    this.damagePoints.Add(number);
  }

  public SubtractDamage(number: FixedPoint): void {
    this.damagePoints.Subtract(number);
  }

  public ResetDamagePoints(): void {
    this.damagePoints.Zero();
  }

  public get Damage(): FixedPoint {
    return this.damagePoints;
  }

  public _db_set_damage(number: number): void {
    this.damagePoints.SetFromNumber(number);
  }

  public set CompState(history: DamageHist) {
    this.damagePoints.SetFromRaw(history.damageRaw);
  }
}

export type DamageHist = {
  damageRaw: number;
};
