import { FlatVec, VectorAllocator } from '../Physics/FlatVec';

export class ECB {
  private Position: FlatVec = new FlatVec(0, 0);
  private Tracks: Map<string, Array<ECBOffsets>>;
  private Points: ECBPoints;
  private Color: string;
  private CurrentTrack: Array<ECBOffsets>;
  private CurrentTrackName: string;
  private CurrentTrackFrame: number;
  private CurrentECBOffset: ECBOffsets;
  private Verts = new Array<FlatVec>(4);

  constructor(
    position: FlatVec,
    tracks: Map<string, Array<ECBOffsets>>,
    points: ECBPoints,
    currentTrack: string = 'idle',
    color = 'orange'
  ) {
    this.Points = points;
    this.MoveToPosition(position.X, position.Y);
    this.Tracks = tracks;
    this.Color = color;
    this.CurrentTrackName = currentTrack;
    this.CurrentTrackFrame = 0;
    if (this.Tracks.has(this.CurrentTrackName)) {
      this.CurrentTrack = this.Tracks.get(this.CurrentTrackName)!;
    } else {
      throw new Error('TRACK DOES NOT EXIST!');
    }
    this.CurrentECBOffset = this.CurrentTrack[this.CurrentTrackFrame];
    this.Verts[0] = new FlatVec(0, 0);
    this.Verts[1] = new FlatVec(0, 0);
    this.Verts[2] = new FlatVec(0, 0);
    this.Verts[3] = new FlatVec(0, 0);
  }

  private Transform() {
    this.Verts[0].X = this.Points.top.X + this.CurrentECBOffset.top.xOffset;
    this.Verts[0].Y = this.Points.top.Y + this.CurrentECBOffset.top.yOffset;

    this.Verts[1].X = this.Points.right.X + this.CurrentECBOffset.right.xOffset;
    this.Verts[1].Y = this.Points.right.Y + this.CurrentECBOffset.right.yOffset;

    this.Verts[2].X =
      this.Points.bottom.X + this.CurrentECBOffset.bottom.xOffset;
    this.Verts[2].Y =
      this.Points.bottom.Y + this.CurrentECBOffset.bottom.yOffset;

    this.Verts[3].X = this.Points.left.X + this.CurrentECBOffset.left.xOffset;
    this.Verts[3].Y = this.Points.left.Y + this.CurrentECBOffset.left.yOffset;
  }

  public GetVerticies() {
    return this.Verts;
  }

  public ChangeTrack(trackName: string) {
    if (this.CurrentTrackName !== trackName) {
      if (this.Tracks.has(trackName)) {
        this.CurrentTrack = this.Tracks.get(trackName)!;
        this.CurrentTrackName = trackName;
        this.CurrentTrackFrame = 0;
      } else {
        throw new Error('TRACK DOES NOT EXIST!!!');
      }
    }
  }
  public MoveToPosition(x: number, y: number) {
    this.Position.X = x;
    this.Position.Y = y;

    this.Points.top.X += x;
    this.Points.top.Y += y;

    this.Points.right.X += x;
    this.Points.right.Y += y;

    this.Points.bottom.X += x;
    this.Points.bottom.Y += y;

    this.Points.left.X += x;
    this.Points.left.Y += y;
  }

  public Update() {
    this.CurrentTrackFrame =
      this.CurrentTrackFrame < this.CurrentTrack.length - 1
        ? this.CurrentTrackFrame + 1
        : 0;
    this.CurrentECBOffset = this.CurrentTrack[this.CurrentTrackFrame];
    this.Transform();
  }

  public GetCurrentTrackName(): string {
    return this.CurrentTrackName;
  }

  public GetCurrentTrackFrame(): number {
    return this.CurrentTrackFrame;
  }

  public GetCurrentOffset(): ECBOffsets {
    return this.CurrentECBOffset;
  }

  public GetCurrentTrack(): Array<ECBOffsets> {
    return this.CurrentTrack;
  }
}

export function DefaultECBFactory() {
  let pos = VectorAllocator(100, 100);
  let points = MakePoints();
  let tracks = MakeTracks();
  return new ECB(pos, tracks, points);
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
