import { FixedPoint } from '../../math/fixedPoint';

export class FlatVec {
  public readonly X: FixedPoint = new FixedPoint(0);
  public readonly Y: FixedPoint = new FixedPoint(0);

  constructor(x: FixedPoint, y: FixedPoint) {
    this.X.setFromFp(x);
    this.Y.setFromFp(y);
  }
}

export const VertArrayContainsFlatVec = (
  verts: Array<FlatVec>,
  vecToFind: FlatVec
) => {
  return verts.some((v) => v.X.equals(vecToFind.X) && v.Y.equals(vecToFind.Y));
};

export class Line {
  private readonly x1: FixedPoint = new FixedPoint();
  private readonly y1: FixedPoint = new FixedPoint();
  private readonly x2: FixedPoint = new FixedPoint();
  private readonly y2: FixedPoint = new FixedPoint();

  constructor(x1: FixedPoint, y1: FixedPoint, x2: FixedPoint, y2: FixedPoint) {
    this.x1.setFromFp(x1);
    this.y1.setFromFp(y1);
    this.x2.setFromFp(x2);
    this.y2.setFromFp(y2);
  }

  public get X1(): FixedPoint {
    return this.x1;
  }

  public get Y1(): FixedPoint {
    return this.y1;
  }

  public get X2(): FixedPoint {
    return this.x2;
  }

  public get Y2(): FixedPoint {
    return this.y2;
  }

  public set X1(val: FixedPoint) {
    this.x1.setFromFp(val);
  }

  public set Y1(val: FixedPoint) {
    this.y1.setFromFp(val);
  }

  public set X2(val: FixedPoint) {
    this.x2.setFromFp(val);
  }

  public set Y2(val: FixedPoint) {
    this.y2.setFromFp(val);
  }
}
