import { FixedPoint } from '../../math/fixedPoint';
import { FlatVec } from '../../physics/vector';
import { ToFV } from '../../utils';

export class PositionComponent {
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

  public get Ref(): FlatVec {
    return this.p;
  }

  public SetFromFv(fv: FlatVec) {
    this.p.X.SetFromFp(fv.X);
    this.p.Y.SetFromFp(fv.Y);
  }

  public set CompState(state: PositionHist) {
    this.p.X.SetFromRaw(state.posXRaw);
    this.p.Y.SetFromRaw(state.posYRaw);
  }
}

export type PositionHist = {
  posXRaw: number;
  posYRaw: number;
};
