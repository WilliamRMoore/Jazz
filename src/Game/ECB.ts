import { FlatVec, VectorAllocator } from '../Physics/FlatVec';

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

  public MoveToPosition(x: number, y: number) {
    const defTopOffsetX = this.Points.top.X - this.Position.X;
    const defTopOffsetY = this.Points.top.Y - this.Position.Y;

    const defRightOffsetX = this.Points.right.X - this.Position.X;
    const defRightOffsetY = this.Points.right.Y - this.Position.Y;

    const defBotOffsetX = this.Points.bottom.X - this.Position.X;
    const defBotOffsetY = this.Points.bottom.Y - this.Position.Y;

    const defLeftOffsetX = this.Points.left.X - this.Position.X;
    const defLeftOffsetY = this.Points.left.Y - this.Position.Y;

    this.Position.X = x;
    this.Position.Y = y;

    this.Points.top.X = defTopOffsetX + x;
    this.Points.top.Y = defTopOffsetY + y;

    this.Points.right.X = defRightOffsetX + x;
    this.Points.right.Y = defRightOffsetY + y;

    this.Points.bottom.X = defBotOffsetX + x;
    this.Points.bottom.Y = defBotOffsetY + y;

    this.Points.left.X = defLeftOffsetX + x;
    this.Points.left.Y = defLeftOffsetY + y;
  }

  public Update() {
    this.Transform();
  }
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
