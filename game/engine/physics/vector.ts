import { FixedPoint } from '../../math/fixedPoint';

export class FlatVec {
  public readonly X: FixedPoint = new FixedPoint(0);
  public readonly Y: FixedPoint = new FixedPoint(0);

  static FromRaw(xRaw: number, yRaw: number) {
    return new FlatVec(new FixedPoint(xRaw), new FixedPoint(yRaw));
  }

  constructor(x: FixedPoint, y: FixedPoint) {
    this.X.SetFromFp(x);
    this.Y.SetFromFp(y);
  }
}

export const VertArrayContainsFlatVec = (
  verts: Array<FlatVec>,
  vecToFind: FlatVec
) => {
  return verts.some((v) => v.X.Equals(vecToFind.X) && v.Y.Equals(vecToFind.Y));
};

export class Line {
  private readonly x1: FixedPoint = new FixedPoint();
  private readonly y1: FixedPoint = new FixedPoint();
  private readonly x2: FixedPoint = new FixedPoint();
  private readonly y2: FixedPoint = new FixedPoint();

  static FromNumbers(x1: number, y1: number, x2: number, y2: number) {
    return new Line(
      new FixedPoint(x1),
      new FixedPoint(y1),
      new FixedPoint(x2),
      new FixedPoint(y2)
    );
  }

  constructor(x1: FixedPoint, y1: FixedPoint, x2: FixedPoint, y2: FixedPoint) {
    this.x1.SetFromFp(x1);
    this.y1.SetFromFp(y1);
    this.x2.SetFromFp(x2);
    this.y2.SetFromFp(y2);
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
    this.x1.SetFromFp(val);
  }

  public set Y1(val: FixedPoint) {
    this.y1.SetFromFp(val);
  }

  public set X2(val: FixedPoint) {
    this.x2.SetFromFp(val);
  }

  public set Y2(val: FixedPoint) {
    this.y2.SetFromFp(val);
  }
}
