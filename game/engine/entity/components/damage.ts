import { FixedPoint } from '../../math/fixedPoint';
import { IHistoryEnabled } from '../componentHistory';

export type DamageSnapShot = {
  damagePoints: number;
};

export class PlayerDamageComponent implements IHistoryEnabled<DamageSnapShot> {
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

  public SnapShot(): DamageSnapShot {
    return {
      damagePoints: this.damagePoints.AsNumber,
    } as DamageSnapShot;
  }

  public SetFromSnapShot(snapShot: DamageSnapShot): void {
    this.damagePoints.SetFromNumber(snapShot.damagePoints);
  }

  public _db_set_damage(number: number): void {
    this.damagePoints.SetFromNumber(number);
  }
}
