import { FlatVec, VectorAllocator } from '../Physics/FlatVec';
import { IDrawable } from '../interfaces/interfaces';
export default class Stage implements IDrawable {
  verticies: FlatVec[];
  ledgeVerts: { left: FlatVec[]; right: FlatVec[] };
  color: string;

  constructor(verticies: FlatVec[], color: string = 'green') {
    if (verticies.length < 4) {
      throw new Error('Insufficient point count when creating a stage!');
    }
    this.verticies = verticies;
    this.color = color;
    this.CalcLedges();
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.moveTo(this.verticies[0].X, this.verticies[0].Y);
    for (let index = 0; index < this.verticies.length; index++) {
      const point = this.verticies[index];
      ctx.lineTo(point.X, point.Y);
    }
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  GetVerticies() {
    return this.verticies;
  }

  GetLedges() {
    return this.ledgeVerts;
  }

  private CalcLedges() {
    let rightPoint = this.verticies[1];
    let leftPoint = this.verticies[0];

    let rightLedge = new Array<FlatVec>();
    rightLedge.push(VectorAllocator(rightPoint.X - 60, rightPoint.Y));
    rightLedge.push(VectorAllocator(rightPoint.X, rightPoint.Y));
    rightLedge.push(VectorAllocator(rightPoint.X, rightPoint.Y + 20));
    rightLedge.push(VectorAllocator(rightPoint.X - 60, rightPoint.Y + 20));

    let leftLedge = new Array<FlatVec>();
    leftLedge.push(VectorAllocator(leftPoint.X, leftPoint.Y));
    leftLedge.push(VectorAllocator(leftPoint.X + 60, leftPoint.Y));
    leftLedge.push(VectorAllocator(leftPoint.X + 60, leftPoint.Y + 20));
    leftLedge.push(VectorAllocator(leftPoint.X, leftPoint.Y + 20));

    this.ledgeVerts = { left: leftLedge, right: rightLedge };
  }
}

export function InitStage() {
  let stageVecs = new Array<FlatVec>();

  stageVecs.push(
    new FlatVec(510, 600),
    new FlatVec(1410, 600),
    new FlatVec(1410, 640),
    new FlatVec(510, 640)
  );

  const stage = new Stage(stageVecs);

  return stage;
}
