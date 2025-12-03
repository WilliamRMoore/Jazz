import { FixedPoint } from '../../math/fixedPoint';
import { IHistoryEnabled } from '../componentHistory';

export type PositionSnapShot = { readonly X: number; readonly Y: number };

// Player Components
export class PositionComponent implements IHistoryEnabled<PositionSnapShot> {
  private readonly x: FixedPoint = new FixedPoint();
  private readonly y: FixedPoint = new FixedPoint();

  public SnapShot(): PositionSnapShot {
    return {
      X: this.x.AsNumber,
      Y: this.y.AsNumber,
    };
  }

  public SetFromSnapShot(snapShot: PositionSnapShot): void {
    this.x.SetFromNumber(snapShot.X);
    this.y.SetFromNumber(snapShot.Y);
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
}
