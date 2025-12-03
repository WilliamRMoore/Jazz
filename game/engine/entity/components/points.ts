import { FixedPoint } from '../../math/fixedPoint';
import { IHistoryEnabled } from '../componentHistory';

export type PlayerPointsSnapShot = {
  damagePoints: number;
  matchPoints: number;
};

export class PlayerPointsComponent
  implements IHistoryEnabled<PlayerPointsSnapShot>
{
  private readonly damagePoints: FixedPoint = new FixedPoint(0);
  private matchPoints: number = 0;
  private defaultMatchPoints: number;

  public constructor(defaultMatchPoints: number = 4) {
    this.defaultMatchPoints = defaultMatchPoints;
  }

  public AddDamage(number: FixedPoint): void {
    this.damagePoints.Add(number);
  }

  public SubtractDamage(number: FixedPoint): void {
    this.damagePoints.Subtract(number);
  }

  public AddMatchPoints(number: number): void {
    this.matchPoints += number;
  }

  public SubtractMatchPoints(number: number): void {
    this.matchPoints -= number;
  }

  public ResetMatchPoints(): void {
    this.matchPoints = this.defaultMatchPoints;
  }

  public ResetDamagePoints(): void {
    this.damagePoints.Zero();
  }

  public get Damage(): FixedPoint {
    return this.damagePoints;
  }

  public get MatchPoints(): number {
    return this.matchPoints;
  }

  public SnapShot(): PlayerPointsSnapShot {
    return {
      damagePoints: this.damagePoints.AsNumber,
      matchPoints: this.matchPoints,
    } as PlayerPointsSnapShot;
  }

  public SetFromSnapShot(snapShot: PlayerPointsSnapShot): void {
    this.damagePoints.SetFromNumber(snapShot.damagePoints);
    this.matchPoints = snapShot.matchPoints;
  }
}
