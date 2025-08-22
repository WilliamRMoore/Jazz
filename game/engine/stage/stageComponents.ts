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
  return new Stage(sv, sl, db);
}

export class Stage {
  public readonly StageVerticies: StageVerticies;
  public readonly Ledges: Ledges;
  public readonly DeathBoundry: DeathBoundry;

  constructor(sv: StageVerticies, sl: Ledges, db: DeathBoundry) {
    this.StageVerticies = sv;
    this.Ledges = sl;
    this.DeathBoundry = db;
  }
}

export class StageVerticies {
  private Verts: Array<FlatVec> = new Array<FlatVec>();
  private Ground: Array<Line>;
  private leftWall: Array<Line>;
  private RightWall: Array<Line>;
  private Ceiling: Array<Line>;

  public constructor() {
    const groundPeices: Array<Line> = [new Line(500, 650, 1600, 650)];
    const leftFacingWalls: Array<Line> = [new Line(500, 650, 500, 700)];
    const rightFacingWalls: Array<Line> = [new Line(1600, 650, 1600, 700)];
    const ceilingPeices: Array<Line> = [new Line(500, 700, 1600, 700)];

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
    width: number = 50,
    height: number = 20
  ) {
    const leftLedge = [] as FlatVec[];
    const rightLedge = [] as FlatVec[];

    leftLedge.push(topLeft); //
    leftLedge.push(new FlatVec(topLeft.X + width, topLeft.Y));
    leftLedge.push(new FlatVec(topLeft.X + width, topLeft.Y + height));
    leftLedge.push(new FlatVec(topLeft.X, topLeft.Y + height));

    rightLedge.push(topRight);
    rightLedge.push(new FlatVec(topRight.X, topRight.Y + height));
    rightLedge.push(new FlatVec(topRight.X - width, topRight.Y + height));
    rightLedge.push(new FlatVec(topRight.X - width, topRight.Y)); //

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
  public readonly topBoundry: number;
  public readonly bottomBoundry: number;
  public readonly leftBoundry: number;
  public readonly rightBoundry: number;

  constructor(t: number, b: number, l: number, r: number) {
    this.topBoundry = t;
    this.bottomBoundry = b;
    this.leftBoundry = l;
    this.rightBoundry = r;
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
