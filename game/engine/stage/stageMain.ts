import { FixedPoint, NumberToRaw } from '../../math/fixedPoint';
import { FlatVec, Line, VertArrayContainsFlatVec } from '../physics/vector';

//TODO: Add Platforms

export function defaultStage() {
  const sv = new StageVerticies();
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
  const db = new DeathBoundry(-100, 1180, -100, 2020);
  const plats = new Array<Line>();
  plats.push(
    Line.FromNumbers(950, 300, 1150, 300),
    Line.FromNumbers(700, 475, 900, 475),
    Line.FromNumbers(1200, 475, 1400, 475)
  );
  return new Stage(sv, sl, db, plats);
}

export class Stage {
  public readonly StageVerticies: StageVerticies;
  public readonly Ledges: Ledges;
  public readonly DeathBoundry: DeathBoundry;
  public readonly Platforms: Array<Line> | undefined;

  constructor(
    sv: StageVerticies,
    sl: Ledges,
    db: DeathBoundry,
    pl?: Array<Line>
  ) {
    this.StageVerticies = sv;
    this.Ledges = sl;
    this.DeathBoundry = db;
    this.Platforms = pl;
  }
}

export class StageVerticies {
  private Verts: Array<FlatVec> = new Array<FlatVec>();
  private Ground: Array<Line>;
  private leftWall: Array<Line>;
  private RightWall: Array<Line>;
  private Ceiling: Array<Line>;

  public constructor() {
    const groundPeices: Array<Line> = [Line.FromNumbers(500, 650, 1600, 650)];
    const leftFacingWalls: Array<Line> = [Line.FromNumbers(500, 650, 500, 700)];
    const rightFacingWalls: Array<Line> = [
      Line.FromNumbers(1600, 650, 1600, 700),
    ];
    const ceilingPeices: Array<Line> = [Line.FromNumbers(500, 700, 1600, 700)];

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
    rightLedge.push(FlatVec.FromRaw(topRight.X.Raw - widthRaw, topRight.Y.Raw)); //

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
