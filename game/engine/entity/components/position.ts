import { FixedPoint } from '../../math/fixedPoint';
import { FlatVec } from '../../physics/vector';
import { ToFV } from '../../utils';
import { IHistoryEnabled } from '../componentHistory';

export type PositionSnapShot = { X: number; Y: number };

// Player Components
export class PositionComponent implements IHistoryEnabled<PositionSnapShot> {
  private readonly p: FlatVec = ToFV(0, 0);

  public get X(): FixedPoint {
    return this.p.X;
  }

  public get Y(): FixedPoint {
    return this.p.Y;
  }

  public set X(val: FixedPoint) {
    this.p.X.SetFromFp(val);
  }

  public set Y(val: FixedPoint) {
    this.p.Y.SetFromFp(val);
  }

  public SetFromFv(fv: FlatVec) {
    this.p.X.SetFromFp(fv.X);
    this.p.Y.SetFromFp(fv.Y);
  }

  public SnapShot(): PositionSnapShot {
    return {
      X: this.p.X.AsNumber,
      Y: this.p.Y.AsNumber,
    };
  }

  public SetFromSnapShot(snapShot: PositionSnapShot): void {
    this.p.X.SetFromNumber(snapShot.X);
    this.p.Y.SetFromNumber(snapShot.Y);
  }
}
