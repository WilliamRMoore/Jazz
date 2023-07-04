import { ECBPoints } from '../../interfaces/interfaces';
import { ctx } from '../../Globals/globals';
import { FlatVec, VectorAllocator } from '../../Physics/FlatVec';

export type ECBOffsets = {
  top: { xOffset: number; yOffset: number };
  right: { xOffset: number; yOffset: number };
  bottom: { xOffset: number; yOffset: number };
  left: { xOffset: number; yOffset: number };
};

export default class ECB {
  offsets: ECBOffsets;
  points: ECBPoints;
  color: string;

  constructor(ecbOffsets: ECBOffsets) {
    this.offsets = ecbOffsets;
    this.points = {
      top: VectorAllocator(0, 0),
      bottom: VectorAllocator(0, 0),
      right: VectorAllocator(0, 0),
      left: VectorAllocator(0, 0),
    };
    this.color = 'orange';
  }

  GetVerticies() {
    const verts = new Array<FlatVec>(4);

    verts[0] = this.points.top;
    verts[1] = this.points.right;
    verts[2] = this.points.bottom;
    verts[3] = this.points.left;

    return verts;
  }

  draw() {
    ctx.beginPath();
    ctx.moveTo(this.points.top.X, this.points.top.Y);
    ctx.lineTo(this.points.left.X, this.points.left.Y);
    ctx.lineTo(this.points.bottom.X, this.points.bottom.Y);
    ctx.lineTo(this.points.right.X, this.points.right.Y);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
  }

  Move(position: FlatVec) {
    this.points.top.X = position.X + this.offsets.top.xOffset;
    this.points.top.Y = position.Y + this.offsets.top.yOffset;

    this.points.right.X = position.X + this.offsets.right.xOffset;
    this.points.right.Y = position.Y + this.offsets.right.yOffset;

    this.points.bottom.X = position.X + this.offsets.bottom.xOffset;
    this.points.bottom.Y = position.Y + this.offsets.bottom.yOffset;

    this.points.left.X = position.X + this.offsets.left.xOffset;
    this.points.left.Y = position.Y + this.offsets.left.yOffset;
  }
}
