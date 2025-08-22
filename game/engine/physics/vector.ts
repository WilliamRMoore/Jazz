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

// function AlternateLineSegmentIntersection(
//   x1: number,
//   y1: number,
//   x2: number,
//   y2: number,
//   x3: number,
//   y3: number,
//   x4: number,
//   y4: number,
//   vecPool: Pool<PooledVector>
// ): LineSegmentIntersectionResult {
//   const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
//   const numeA = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
//   const numeB = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);

//   if (denom === 0) {
//     return LineSegmentIntersectionResult.False();
//   }

//   const uA = numeA / denom;
//   const uB = numeB / denom;

//   if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
//     //return true;
//     return LineSegmentIntersectionResult.True(
//       vecPool.Rent().SetXY(x1 + uA * (x2 - x1), y1 + uA * (y2 - y1))
//     );
//   }

//   return LineSegmentIntersectionResult.False();
// }

// class LineSegmentIntersectionResult {
//   private Success: boolean;
//   private VecResult: IPooledVector | undefined;

//   private constructor(
//     flag: boolean,
//     vecRes: IPooledVector | undefined = undefined
//   ) {
//     this.Success = flag;
//     this.VecResult = vecRes;
//   }

//   static True(vecRes: IPooledVector): LineSegmentIntersectionResult {
//     return new LineSegmentIntersectionResult(true, vecRes);
//   }

//   static False(): LineSegmentIntersectionResult {
//     return new LineSegmentIntersectionResult(false);
//   }
// }
