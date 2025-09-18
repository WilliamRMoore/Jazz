export class FlatVec {
  public X: number;
  public Y: number;

  constructor(x: number, y: number) {
    this.X = x;
    this.Y = y;
  }
}

export const VertArrayContainsFlatVec = (
  verts: Array<FlatVec>,
  vecToFind: FlatVec
) => {
  return verts.some((v) => v.X === vecToFind.X && v.Y === vecToFind.Y);
};

export class Line {
  public X1: number;
  public Y1: number;
  public X2: number;
  public Y2: number;

  constructor(x1: number, y1: number, x2: number, y2: number) {
    this.X1 = x1;
    this.Y1 = y1;
    this.X2 = x2;
    this.Y2 = y2;
  }
}
