import { FixedPoint, NumberToRaw } from '../math/fixedPoint';
import { AABBIntersect } from '../physics/collisions';
import { FlatVec, Line, VertArrayContainsFlatVec } from '../physics/vector';
import { AABBDTO } from '../pools/AABBDTO';

//TODO: Add Platforms

export function defaultStage() {
  const sv = DefaultStageVerticies();
  const groundPecies = sv.GetGround();
  const grndStart = groundPecies[0];
  const grndEnd = groundPecies[groundPecies.length - 1];
  const topLeftX = grndStart.X1;
  const topLeftY = grndStart.Y1;
  const topRightX = grndEnd.X2;
  const topRighty = grndEnd.Y2;
  const leftLedgePoint = new FlatVec(topLeftX, topLeftY);
  const rightLedgePoint = new FlatVec(topRightX, topRighty);
  const sl = new Ledges(leftLedgePoint, rightLedgePoint);
  const plats = new Array<Line>();
  plats.push(
    Line.FromNumbers(950, 300, 1150, 300),
    Line.FromNumbers(700, 475, 900, 475),
    Line.FromNumbers(1200, 475, 1400, 475)
  );
  return new Stage(sv, sl, plats);
}

export function WallStage() {
  const sv = wallStageVerts();
  const groundPecies = sv.GetGround();
  const grndStart = groundPecies[0];
  const grndEnd = groundPecies[groundPecies.length - 1];
  const topLeftX = grndStart.X1;
  const topLeftY = grndStart.Y1;
  const topRightX = grndEnd.X2;
  const topRighty = grndEnd.Y2;
  const leftLedgePoint = new FlatVec(topLeftX, topLeftY);
  const rightLedgePoint = new FlatVec(topRightX, topRighty);
  const sl = new Ledges(leftLedgePoint, rightLedgePoint);
  return new Stage(sv, sl);
}

function wallStageVerts() {
  const groundPeices: Array<Line> = [Line.FromNumbers(350, 200, 430, 200)];
  const leftFacingWalls: Array<Line> = [Line.FromNumbers(350, 200, 350, 600)];
  const rightFacingWalls: Array<Line> = [Line.FromNumbers(430, 200, 430, 600)];
  const ceilingPeices: Array<Line> = [Line.FromNumbers(350, 600, 430, 600)];
  return new StageVerticies(
    groundPeices,
    leftFacingWalls,
    rightFacingWalls,
    ceilingPeices
  );
}

export class Stage {
  public readonly StageVerticies: StageVerticies;
  public readonly Ledges: Ledges;
  public readonly Platforms: Array<Line> | undefined;

  public readonly AabbMinXRaw: number;
  public readonly AabbMaxXRaw: number;
  public readonly AabbMinYRaw: number;
  public readonly AabbMaxYRaw: number;

  constructor(sv: StageVerticies, sl: Ledges, pl?: Array<Line>) {
    this.StageVerticies = sv;
    this.Ledges = sl;
    this.Platforms = pl;

    let minX = sv.OriginXRaw;
    let maxX = sv.OriginXRaw + sv.WidthRaw;
    let minY = sv.OriginYRaw;
    let maxY = sv.OriginYRaw + sv.HeightRaw;

    if (pl !== undefined) {
      for (let i = 0; i < pl.length; i++) {
        const plat = pl[i];
        if (plat.X1.Raw < minX) minX = plat.X1.Raw;
        if (plat.X2.Raw < minX) minX = plat.X2.Raw;
        if (plat.X1.Raw > maxX) maxX = plat.X1.Raw;
        if (plat.X2.Raw > maxX) maxX = plat.X2.Raw;

        if (plat.Y1.Raw < minY) minY = plat.Y1.Raw;
        if (plat.Y2.Raw < minY) minY = plat.Y2.Raw;
        if (plat.Y1.Raw > maxY) maxY = plat.Y1.Raw;
        if (plat.Y2.Raw > maxY) maxY = plat.Y2.Raw;
      }
    }

    this.AabbMinXRaw = minX;
    this.AabbMaxXRaw = maxX;
    this.AabbMinYRaw = minY;
    this.AabbMaxYRaw = maxY;
  }

  public AABBInterSectCheck(
    xRaw: number,
    yRaw: number,
    widthRaw: number,
    heightRaw: number
  ): boolean {
    const left = xRaw;
    const bottom = yRaw;

    return AABBIntersect(
      left,
      bottom,
      widthRaw,
      heightRaw,
      this.AabbMinXRaw,
      this.AabbMinYRaw,
      this.AabbMaxXRaw - this.AabbMinXRaw,
      this.AabbMaxYRaw - this.AabbMinYRaw
    );
  }

  public AABBIntersectCheckAABBDTO(aabb: AABBDTO) {
    return AABBIntersect(
      aabb.minX.Raw,
      aabb.minY.Raw,
      aabb.width.Raw,
      aabb.height.Raw,
      this.AabbMinXRaw,
      this.AabbMinYRaw,
      this.AabbMaxXRaw - this.AabbMinXRaw,
      this.AabbMaxYRaw - this.AabbMinYRaw
    );
  }
}

function DefaultStageVerticies() {
  const groundPeices: Array<Line> = [Line.FromNumbers(500, 650, 1600, 650)];
  const leftFacingWalls: Array<Line> = [Line.FromNumbers(500, 650, 500, 700)];
  const rightFacingWalls: Array<Line> = [
    Line.FromNumbers(1600, 650, 1600, 700)
  ];
  const ceilingPeices: Array<Line> = [Line.FromNumbers(500, 700, 1600, 700)];
  return new StageVerticies(
    groundPeices,
    leftFacingWalls,
    rightFacingWalls,
    ceilingPeices
  );
}

export class StageVerticies {
  private Verts: Array<FlatVec> = new Array<FlatVec>();
  private Ground: Array<Line>;
  private leftWall: Array<Line>;
  private RightWall: Array<Line>;
  private Ceiling: Array<Line>;
  public readonly OriginXRaw: number;
  public readonly OriginYRaw: number;
  public readonly WidthRaw: number;
  public readonly HeightRaw: number;

  public constructor(
    groundPeices: Array<Line>,
    leftFacingWalls: Array<Line>,
    rightFacingWalls: Array<Line>,
    ceilingPeices: Array<Line>
  ) {
    this.Ground = groundPeices;
    this.leftWall = leftFacingWalls;
    this.RightWall = rightFacingWalls;
    this.Ceiling = ceilingPeices;

    const pushFunc = (l: Line) => {
      const start = new FlatVec(l.X1, l.Y1);
      const end = new FlatVec(l.X2, l.Y2);
      if (VertArrayContainsFlatVec(this.Verts, start) === false) {
        this.Verts.push(start);
      }
      if (VertArrayContainsFlatVec(this.Verts, end) === false) {
        this.Verts.push(end);
      }
    };

    this.Ground.forEach(pushFunc);

    this.RightWall.forEach(pushFunc);

    this.Ceiling.forEach(pushFunc);

    this.leftWall.forEach(pushFunc);
    this.OriginXRaw = this.Ground[0].X1.Raw;
    this.OriginYRaw = this.Ground[0].Y1.Raw;
    this.WidthRaw =
      this.Ground[this.Ground.length - 1].X2.Raw - this.OriginXRaw;
    this.HeightRaw = this.Ceiling[0].Y1.Raw - this.OriginYRaw;
  }

  public GetVerts(): Array<FlatVec> {
    return this.Verts;
  }

  public GetGround(): Array<Line> {
    return this.Ground;
  }

  public GetLeftWall(): Array<Line> {
    return this.leftWall;
  }

  public GetRightWall(): Array<Line> {
    return this.RightWall;
  }

  public GetCeiling(): Array<Line> {
    return this.Ceiling;
  }
}

export class Ledges {
  private leftLedge: FlatVec[];
  private rightLedge: FlatVec[];

  constructor(
    topLeft: FlatVec,
    topRight: FlatVec,
    widthRaw: number = NumberToRaw(50),
    heightRaw: number = NumberToRaw(20)
  ) {
    const leftLedge = [] as FlatVec[];
    const rightLedge = [] as FlatVec[];

    leftLedge.push(topLeft); //
    leftLedge.push(FlatVec.FromRaw(topLeft.X.Raw + widthRaw, topLeft.Y.Raw));
    leftLedge.push(
      FlatVec.FromRaw(topLeft.X.Raw + widthRaw, topLeft.Y.Raw + heightRaw)
    );
    leftLedge.push(FlatVec.FromRaw(topLeft.X.Raw, topLeft.Y.Raw + heightRaw));

    rightLedge.push(topRight);
    rightLedge.push(
      FlatVec.FromRaw(topRight.X.Raw, topRight.Y.Raw + heightRaw)
    );
    rightLedge.push(
      FlatVec.FromRaw(topRight.X.Raw - widthRaw, topRight.Y.Raw + heightRaw)
    );
    rightLedge.push(FlatVec.FromRaw(topRight.X.Raw - widthRaw, topRight.Y.Raw));

    this.leftLedge = leftLedge;
    this.rightLedge = rightLedge;
  }

  public GetLeftLedge() {
    return this.leftLedge;
  }

  public GetRightLedge() {
    return this.rightLedge;
  }
}

export class DeathBoundry {
  public readonly topBoundry: FixedPoint;
  public readonly bottomBoundry: FixedPoint;
  public readonly leftBoundry: FixedPoint;
  public readonly rightBoundry: FixedPoint;

  constructor(t: number, b: number, l: number, r: number) {
    this.topBoundry = new FixedPoint(t);
    this.bottomBoundry = new FixedPoint(b);
    this.leftBoundry = new FixedPoint(l);
    this.rightBoundry = new FixedPoint(r);
  }
}

class StageVerticiesBuilder {
  private groundVerts: Array<FlatVec> | undefined;
  private leftWallVerts: Array<FlatVec> | undefined;
  private rightWallVerts: Array<FlatVec> | undefined;
  private cielingVerts: Array<FlatVec> | undefined;
  private leftLedgeVerts: Array<FlatVec> | undefined;
  private rightLedgeVerts: Array<FlatVec> | undefined;

  public SetGroundVerts(verts: Array<FlatVec>) {
    this.groundVerts = verts;
  }

  public SetLeftWallVerts(verts: Array<FlatVec>) {
    this.leftWallVerts = verts;
  }

  public SetRightWallVerts(verts: Array<FlatVec>) {
    this.rightWallVerts = verts;
  }
}
