import { ECBShapesConfig } from '../../../character/shared';
import { StateId } from '../../finite-state-machine/stateConfigurations/shared';
import { FixedPoint, NumberToRaw, MultiplyRaw } from '../../math/fixedPoint';
import { CreateConvexHull } from '../../physics/collisions';
import { FlatVec } from '../../physics/vector';
import { FillArrayWithFlatVec } from '../../utils';
import { IHistoryEnabled } from '../componentHistory';

export type ECBSnapShot = {
  readonly posX: number;
  readonly posY: number;
  readonly prevPosX: number;
  readonly prevPosY: number;
  readonly YOffset: number;
  readonly Height: number;
  readonly Width: number;
};

export type ECBShape = {
  readonly height: FixedPoint;
  readonly width: FixedPoint;
  readonly yOffset: FixedPoint;
};

export type ECBShapes = Map<StateId, ECBShape>;

export class ECBComponent implements IHistoryEnabled<ECBSnapShot> {
  public readonly SensorDepth = new FixedPoint(1);
  private readonly yOffset = new FixedPoint(0);
  private readonly x = new FixedPoint(0);
  private readonly y = new FixedPoint(0);
  private readonly prevX = new FixedPoint(0);
  private readonly prevY = new FixedPoint(0);
  private readonly height = new FixedPoint(0);
  private readonly width = new FixedPoint(0);
  private readonly originalHeight = new FixedPoint(0);
  private readonly originalWidth = new FixedPoint(0);
  private readonly originalYOffset = new FixedPoint(0);
  private readonly curVerts = new Array<FlatVec>(4);
  private readonly prevVerts = new Array<FlatVec>(4);
  private readonly allVerts = new Array<FlatVec>(8);
  private readonly ecbStateShapes: ECBShapes;

  constructor(shapes: ECBShapesConfig, height = 100, width = 100, yOffset = 0) {
    this.height.SetFromNumber(height);
    this.width.SetFromNumber(width);
    this.originalHeight.SetFromNumber(height);
    this.originalWidth.SetFromNumber(width);
    this.originalYOffset.SetFromNumber(yOffset);
    this.yOffset.SetFromNumber(yOffset);
    this.ecbStateShapes = new Map<StateId, ECBShape>();
    for (const [Key, val] of shapes) {
      this.ecbStateShapes.set(Key, {
        height: new FixedPoint(val.height),
        width: new FixedPoint(val.width),
        yOffset: new FixedPoint(val.yOffset),
      });
    }
    FillArrayWithFlatVec(this.curVerts);
    FillArrayWithFlatVec(this.prevVerts);
    this.loadAllVerts();
    this.update();
  }

  public GetHull(): FlatVec[] {
    return CreateConvexHull(this.allVerts);
  }

  public GetActiveVerts(): FlatVec[] {
    return this.curVerts;
  }

  public UpdatePreviousECB(): void {
    this.prevX.SetFromFp(this.x);
    this.prevY.SetFromFp(this.y);

    const prevVert: FlatVec[] = this.prevVerts;
    const curVert: FlatVec[] = this.curVerts;
    prevVert[0].X.SetFromFp(curVert[0].X);
    prevVert[0].Y.SetFromFp(curVert[0].Y);
    prevVert[1].X.SetFromFp(curVert[1].X);
    prevVert[1].Y.SetFromFp(curVert[1].Y);
    prevVert[2].X.SetFromFp(curVert[2].X);
    prevVert[2].Y.SetFromFp(curVert[2].Y);
    prevVert[3].X.SetFromFp(curVert[3].X);
    prevVert[3].Y.SetFromFp(curVert[3].Y);
  }

  public SetInitialPosition(x: FixedPoint, y: FixedPoint): void {
    this.MoveToPosition(x, y);
    this.UpdatePreviousECB();
  }

  public SetInitialPositionRaw(xRaw: number, yRaw: number): void {
    this.x.SetFromRaw(xRaw);
    this.y.SetFromRaw(yRaw);
    this.update();
    this.UpdatePreviousECB();
  }

  public MoveToPosition(x: FixedPoint, y: FixedPoint): void {
    this.x.SetFromFp(x);
    this.y.SetFromFp(y);
    this.update();
  }

  public MoveToPositionRaw(xRaw: number, yRaw: number): void {
    this.x.SetFromRaw(xRaw);
    this.y.SetFromRaw(yRaw);
    this.update();
  }

  public SetECBShape(stateId: StateId): void {
    const shape: ECBShape | undefined = this.ecbStateShapes.get(stateId);
    if (shape === undefined) {
      this.yOffset.SetFromFp(this.originalYOffset);
      this.height.SetFromFp(this.originalHeight);
      this.width.SetFromFp(this.originalWidth);
      this.update();
      return;
    }

    this.yOffset.SetFromFp(shape.yOffset);
    this.height.SetFromFp(shape.height);
    this.width.SetFromFp(shape.width);
    this.update();
  }

  private update(): void {
    const half = NumberToRaw(0.5);
    const px = this.x.Raw;
    const py = this.y.Raw;
    const height = this.height.Raw;
    const width = this.width.Raw;
    const yOffset = this.yOffset.Raw;

    const bottomX = px;
    const bottomY = py + yOffset;

    const topX = px;
    const topY = bottomY - height;

    const halfWidth = MultiplyRaw(width, half);
    const halfHeight = MultiplyRaw(height, half);

    const leftX = bottomX - halfWidth;
    const leftY = bottomY - halfHeight;

    const rightX = bottomX + halfWidth;
    const rightY = leftY;

    this.curVerts[0].X.SetFromRaw(bottomX);
    this.curVerts[0].Y.SetFromRaw(bottomY);

    this.curVerts[1].X.SetFromRaw(leftX);
    this.curVerts[1].Y.SetFromRaw(leftY);

    this.curVerts[2].X.SetFromRaw(topX);
    this.curVerts[2].Y.SetFromRaw(topY);

    this.curVerts[3].X.SetFromRaw(rightX);
    this.curVerts[3].Y.SetFromRaw(rightY);
  }

  public get Bottom(): FlatVec {
    return this.curVerts[0];
  }

  public get PrevBottom(): FlatVec {
    return this.prevVerts[0];
  }

  public get Left(): FlatVec {
    return this.curVerts[1];
  }

  public get PrevLeft(): FlatVec {
    return this.prevVerts[1];
  }

  public get Top(): FlatVec {
    return this.curVerts[2];
  }

  public get PrevTop(): FlatVec {
    return this.prevVerts[2];
  }

  public get Right(): FlatVec {
    return this.curVerts[3];
  }

  public get PrevRight(): FlatVec {
    return this.prevVerts[3];
  }

  public get Height(): FixedPoint {
    return this.height;
  }

  public get Width(): FixedPoint {
    return this.width;
  }

  public get YOffset(): FixedPoint {
    return this.yOffset;
  }

  public get _ecbShapes(): ECBShapes {
    return this.ecbStateShapes;
  }

  public ResetECBShape(): void {
    this.height.SetFromFp(this.originalHeight);
    this.width.SetFromFp(this.originalWidth);
    this.yOffset.SetFromFp(this.originalYOffset);
    this.update();
  }

  public SnapShot(): ECBSnapShot {
    return {
      posX: this.x.AsNumber,
      posY: this.y.AsNumber,
      prevPosX: this.prevX.AsNumber,
      prevPosY: this.prevY.AsNumber,
      YOffset: this.yOffset.AsNumber,
      Height: this.height.AsNumber,
      Width: this.width.AsNumber,
    } as ECBSnapShot;
  }

  public SetFromSnapShot(snapShot: ECBSnapShot): void {
    this.x.SetFromNumber(snapShot.posX);
    this.y.SetFromNumber(snapShot.posY);
    this.prevX.SetFromNumber(snapShot.prevPosX);
    this.prevY.SetFromNumber(snapShot.prevPosY);
    this.yOffset.SetFromNumber(snapShot.YOffset);
    this.height.SetFromNumber(snapShot.Height);
    this.width.SetFromNumber(snapShot.Width);

    this.update();

    // Update prevVerts
    const half = NumberToRaw(0.5);
    const px = this.prevX.Raw;
    const py = this.prevY.Raw;
    const height = this.height.Raw;
    const width = this.width.Raw;
    const yOffset = this.yOffset.Raw;

    const bottomX = px;
    const bottomY = py + yOffset;

    const topX = px;
    const topY = bottomY - height;

    const halfWidth = MultiplyRaw(width, half);
    const halfHeight = MultiplyRaw(height, half);

    const leftX = bottomX - halfWidth;
    const leftY = bottomY - halfHeight;

    const rightX = bottomX + halfWidth;
    const rightY = leftY;

    this.prevVerts[0].X.SetFromRaw(bottomX);
    this.prevVerts[0].Y.SetFromRaw(bottomY);

    this.prevVerts[1].X.SetFromRaw(leftX);
    this.prevVerts[1].Y.SetFromRaw(leftY);

    this.prevVerts[2].X.SetFromRaw(topX);
    this.prevVerts[2].Y.SetFromRaw(topY);

    this.prevVerts[3].X.SetFromRaw(rightX);
    this.prevVerts[3].Y.SetFromRaw(rightY);
  }

  private loadAllVerts(): void {
    this.allVerts.length = 0;

    for (let i = 0; i < 4; i++) {
      this.allVerts.push(this.prevVerts[i]);
    }

    for (let i = 0; i < 4; i++) {
      this.allVerts.push(this.curVerts[i]);
    }
  }
}
