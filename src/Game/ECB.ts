import { FlatVec, VectorAllocator } from '../Physics/FlatVec';
import { ECBData } from './GameState/Clone';

export class ECB {
  private Position: FlatVec = new FlatVec(0, 0);
  private Points: ECBPoints;
  private Color: string;
  private Verts = new Array<FlatVec>(4);

  constructor(position: FlatVec, points: ECBPoints, color = 'orange') {
    this.Points = points;
    this.MoveToPosition(position.X, position.Y);
    this.Color = color;
    this.Verts[0] = new FlatVec(0, 0);
    this.Verts[1] = new FlatVec(0, 0);
    this.Verts[2] = new FlatVec(0, 0);
    this.Verts[3] = new FlatVec(0, 0);
  }

  private Transform() {
    this.Verts[0].X = this.Points.top.X;
    this.Verts[0].Y = this.Points.top.Y;

    this.Verts[1].X = this.Points.right.X;
    this.Verts[1].Y = this.Points.right.Y;

    this.Verts[2].X = this.Points.bottom.X;
    this.Verts[2].Y = this.Points.bottom.Y;

    this.Verts[3].X = this.Points.left.X;
    this.Verts[3].Y = this.Points.left.Y;
  }

  public GetVerticies() {
    return this.Verts;
  }

  public GetPosition() {
    return this.Position;
  }

  public GetPoints() {
    return this.Points;
  }

  public GetColor() {
    return this.Color;
  }

  public SetECBState(ECBData: ECBData): void {
    this.SetPositionState(ECBData.position);
    this.SetPointsState(ECBData.points);
    this.SetColorState(ECBData.color);
    this.SetVertsState(ECBData.verts);
  }

  private SetPositionState(pos: FlatVec): void {
    this.Position.X = pos.X;
    this.Position.Y = pos.Y;
  }

  private SetPointsState(ECBPoints: ECBPoints): void {
    this.Points.top.X = ECBPoints.top.X;
    this.Points.top.Y = ECBPoints.top.Y;
    this.Points.right.X = ECBPoints.right.X;
    this.Points.right.Y = ECBPoints.right.Y;
    this.Points.bottom.X = ECBPoints.bottom.X;
    this.Points.bottom.Y = ECBPoints.bottom.Y;
    this.Points.left.X = ECBPoints.left.X;
    this.Points.left.Y = ECBPoints.left.Y;
  }

  private SetColorState(color: string) {
    this.Color = color;
  }

  private SetVertsState(verts: Array<FlatVec>) {
    this.Verts[0].X = verts[0].X;
    this.Verts[0].Y = verts[0].Y;
    this.Verts[1].X = verts[1].X;
    this.Verts[1].Y = verts[1].Y;
    this.Verts[2].X = verts[2].X;
    this.Verts[2].Y = verts[2].Y;
    this.Verts[3].X = verts[3].X;
    this.Verts[3].Y = verts[3].Y;
  }

  public MoveToPosition(x: number, y: number) {
    const defTopOffsetX = 0;
    //Should always bet neg, HTML canvas COORds, subtracting Y raises height.
    const defTopOffsetY = -100;

    const defRightOffsetX = 50;
    const defRightOffsetY = -50;

    const defBotOffsetX = 0;
    const defBotOffsetY = 0;

    const defLeftOffsetX = -50;
    const defLeftOffsetY = -50;

    this.Position.X = x;
    this.Position.Y = y;

    this.Points.top.X = defTopOffsetX + x;
    this.Points.top.Y = y + defTopOffsetY;

    this.Points.right.X = defRightOffsetX + x;
    this.Points.right.Y = y + defRightOffsetY;

    this.Points.bottom.X = defBotOffsetX + x;
    this.Points.bottom.Y = defBotOffsetY + y;

    this.Points.left.X = defLeftOffsetX + x;
    this.Points.left.Y = y + defLeftOffsetY;
  }

  public Update() {
    this.Transform();
  }
}

export function DefaultECB() {
  var points = {
    top: new FlatVec(0, 50),
    right: new FlatVec(50, 50),
    bottom: new FlatVec(0, 0),
    left: new FlatVec(-50, 50),
  } as ECBPoints;

  var position = new FlatVec(300, 300);

  return new ECB(position, points);
}

export type ECBOffsets = {
  top: { xOffset: number; yOffset: number };
  right: { xOffset: number; yOffset: number };
  bottom: { xOffset: number; yOffset: number };
  left: { xOffset: number; yOffset: number };
};

export interface ECBPoints {
  top: FlatVec;
  right: FlatVec;
  bottom: FlatVec;
  left: FlatVec;
}

function MakeTracks() {
  const tracks = new Map<string, Array<ECBOffsets>>();

  const idle = new Array<ECBOffsets>();
  for (let index = 0; index <= 20; index++) {
    let offset = {
      top: { xOffset: 0, yOffset: 0 },
      right: { xOffset: 0, yOffset: 0 },
      bottom: { xOffset: 0, yOffset: 0 },
      left: { xOffset: 0, yOffset: 0 },
    } as ECBOffsets;
    offset.top.xOffset = 0;
    offset.top.yOffset = -index;

    offset.right.xOffset = index;
    offset.right.yOffset = 0;

    offset.bottom.xOffset = 0;
    offset.bottom.yOffset = 0;

    offset.left.xOffset = -index;
    offset.left.yOffset = 0;
    idle.push(offset);
  }

  tracks.set('idle', idle);

  const jump = new Array<ECBOffsets>();
  for (let index = 0; index < 20; index++) {
    let offset = {
      top: { xOffset: 0, yOffset: 0 },
      right: { xOffset: 0, yOffset: 0 },
      bottom: { xOffset: 0, yOffset: 0 },
      left: { xOffset: 0, yOffset: 0 },
    } as ECBOffsets;
    offset.top.xOffset = 0;
    offset.top.yOffset = -index;

    offset.right.xOffset = -index;
    offset.right.yOffset = 0;

    offset.bottom.xOffset = 0;
    offset.bottom.yOffset = 0;

    offset.left.xOffset = index;
    offset.left.yOffset = 0;
    jump.push(offset);
  }

  tracks.set('jump', jump);

  return tracks;
}

function MakePoints() {
  let points = {
    top: VectorAllocator(),
    right: VectorAllocator(),
    bottom: VectorAllocator(),
    left: VectorAllocator(),
  } as ECBPoints;
  points.top.X = 0;
  points.top.Y = -50;

  points.right.X = 50;
  points.right.Y = -25;

  points.bottom.X = 0;
  points.bottom.Y = 0;

  points.left.X = -50;
  points.left.Y = -25;

  return points;
}
