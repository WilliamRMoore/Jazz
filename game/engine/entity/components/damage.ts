import { FixedPoint } from '../../math/fixedPoint';
import { IHistoryEnabled } from '../componentHistory';

export type PlayerPointsSnapShot = {
  damagePoints: number;
};

export class PlayerDamageComponent
  implements IHistoryEnabled<PlayerPointsSnapShot>
{
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

  public SnapShot(): PlayerPointsSnapShot {
    return {
      damagePoints: this.damagePoints.AsNumber,
    } as PlayerPointsSnapShot;
  }

  public SetFromSnapShot(snapShot: PlayerPointsSnapShot): void {
    this.damagePoints.SetFromNumber(snapShot.damagePoints);
  }
}
