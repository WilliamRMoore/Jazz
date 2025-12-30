import { ECBShapesConfig } from '../../../character/shared';
import { StateId } from '../../finite-state-machine/stateConfigurations/shared';
import { FixedPoint, NumberToRaw, MultiplyRaw } from '../../math/fixedPoint';
import { FlatVec } from '../../physics/vector';
import { FillArrayWithFlatVec } from '../../utils';
import { IHistoryEnabled } from '../componentHistory';

const POINT_FIVE = NumberToRaw(0.5);

export type EcbHistoryDTO = {
  readonly shape: Array<FlatVec>;
  readonly Bottom: FlatVec;
  readonly Left: FlatVec;
  readonly Top: FlatVec;
  readonly Right: FlatVec;
  readonly Zero: () => void;
};

class prevEcbDTO implements EcbHistoryDTO {
  readonly shape: Array<FlatVec>;

  constructor() {
    this.shape = new Array<FlatVec>(4);
    FillArrayWithFlatVec(this.shape);
  }

  public get Bottom(): FlatVec {
    return this.shape[0];
  }

  public get Left(): FlatVec {
    return this.shape[1];
  }

  public get Top(): FlatVec {
    return this.shape[2];
  }

  public get Right(): FlatVec {
    return this.shape[3];
  }

  public Zero() {
    for (let i = 0; i < this.shape.length; i++) {
      this.shape[i].X.Zero();
      this.shape[i].Y.Zero();
    }
  }
}

const diamondDTO = new prevEcbDTO();

export function CreateDiamondFromHistory(ecbSnapshot: ECBSnapShot): prevEcbDTO {
  diamondDTO.Zero();

  const posX = NumberToRaw(ecbSnapshot.posX);
  const posY = NumberToRaw(ecbSnapshot.posY);
  const ecbShape = ecbSnapshot.ecbShape;
  const height = ecbShape.height.Raw;
  const width = ecbShape.width.Raw;
  const yOffset = ecbShape.yOffset.Raw;

  const halfWidth = MultiplyRaw(width, POINT_FIVE);
  const halfHeight = MultiplyRaw(height, POINT_FIVE);

  diamondDTO.Bottom.X.SetFromRaw(posX);
  diamondDTO.Bottom.Y.SetFromRaw(posY + yOffset);
  diamondDTO.Left.X.SetFromRaw(posX - halfWidth);
  diamondDTO.Left.Y.SetFromRaw(posY + yOffset - halfHeight);
  diamondDTO.Top.X.SetFromRaw(posX);
  diamondDTO.Top.Y.SetFromRaw(posY + yOffset - height);
  diamondDTO.Right.X.SetFromRaw(posX + halfWidth);
  diamondDTO.Right.Y.SetFromRaw(posY + yOffset - halfHeight);

  return diamondDTO;
}

export type ECBSnapShot = {
  readonly posX: number;
  readonly posY: number;
  readonly ecbShape: ECBShape;
};

export type ECBShape = {
  readonly height: FixedPoint;
  readonly width: FixedPoint;
  readonly yOffset: FixedPoint;
};

export type ECBShapes = Map<StateId, ECBShape>;

export class ECBComponent implements IHistoryEnabled<ECBSnapShot> {
  public readonly SensorDepth = new FixedPoint(1);
  //private readonly yOffset = new FixedPoint(0);
  private readonly x = new FixedPoint(0);
  private readonly y = new FixedPoint(0);
  // private readonly prevX = new FixedPoint(0);
  // private readonly prevY = new FixedPoint(0);
  //private readonly height = new FixedPoint(0);
  //private readonly width = new FixedPoint(0);
  // private readonly originalHeight = new FixedPoint(0);
  // private readonly originalWidth = new FixedPoint(0);
  // private readonly originalYOffset = new FixedPoint(0);
  private readonly OriginalShape: ECBShape;
  private readonly curVerts = new Array<FlatVec>(4);
  // private readonly prevVerts = new Array<FlatVec>(4);
  // private readonly allVerts = new Array<FlatVec>(8);
  private readonly ecbStateShapes: ECBShapes;
  private currentShape: ECBShape;

  constructor(shapes: ECBShapesConfig, height = 100, width = 100, yOffset = 0) {
    // this.height.SetFromNumber(height);
    // this.width.SetFromNumber(width);
    this.OriginalShape = {
      height: new FixedPoint(height),
      width: new FixedPoint(width),
      yOffset: new FixedPoint(yOffset),
    };
    //this.yOffset.SetFromNumber(yOffset);
    this.ecbStateShapes = new Map<StateId, ECBShape>();
    for (const [Key, val] of shapes) {
      this.ecbStateShapes.set(Key, {
        height: new FixedPoint(val.height),
        width: new FixedPoint(val.width),
        yOffset: new FixedPoint(val.yOffset),
      });
    }
    this.currentShape = this.OriginalShape;
    FillArrayWithFlatVec(this.curVerts);
    //FillArrayWithFlatVec(this.prevVerts);
    //this.loadAllVerts();
    this.update();
  }

  // public GetHull(): FlatVec[] {
  //   return CreateConvexHull(this.allVerts);
  // }

  public GetActiveVerts(): FlatVec[] {
    return this.curVerts;
  }

  // public UpdatePreviousECB(): void {
  //   this.prevX.SetFromFp(this.x);
  //   this.prevY.SetFromFp(this.y);

  //   const prevVert: FlatVec[] = this.prevVerts;
  //   const curVert: FlatVec[] = this.curVerts;
  //   prevVert[0].X.SetFromFp(curVert[0].X);
  //   prevVert[0].Y.SetFromFp(curVert[0].Y);
  //   prevVert[1].X.SetFromFp(curVert[1].X);
  //   prevVert[1].Y.SetFromFp(curVert[1].Y);
  //   prevVert[2].X.SetFromFp(curVert[2].X);
  //   prevVert[2].Y.SetFromFp(curVert[2].Y);
  //   prevVert[3].X.SetFromFp(curVert[3].X);
  //   prevVert[3].Y.SetFromFp(curVert[3].Y);
  // }

  public SetInitialPosition(x: FixedPoint, y: FixedPoint): void {
    this.MoveToPosition(x, y);
    //this.UpdatePreviousECB();
  }

  public SetInitialPositionRaw(xRaw: number, yRaw: number): void {
    this.x.SetFromRaw(xRaw);
    this.y.SetFromRaw(yRaw);
    this.update();
    //this.UpdatePreviousECB();
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
    this.currentShape = this.ecbStateShapes.get(stateId) || this.OriginalShape;
    this.update();
  }

  private update(): void {
    const half = POINT_FIVE;
    const px = this.x.Raw;
    const py = this.y.Raw;
    const shape = this.currentShape;
    const height = shape.height.Raw;
    const width = shape.width.Raw;
    const yOffset = shape.yOffset.Raw;

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

  // public get PrevBottom(): FlatVec {
  //   return this.prevVerts[0];
  // }

  public get Left(): FlatVec {
    return this.curVerts[1];
  }

  // public get PrevLeft(): FlatVec {
  //   return this.prevVerts[1];
  // }

  public get Top(): FlatVec {
    return this.curVerts[2];
  }

  // public get PrevTop(): FlatVec {
  //   return this.prevVerts[2];
  // }

  public get Right(): FlatVec {
    return this.curVerts[3];
  }

  // public get PrevRight(): FlatVec {
  //   return this.prevVerts[3];
  // }

  public get Height(): FixedPoint {
    return this.currentShape.height;
  }

  public get Width(): FixedPoint {
    return this.currentShape.width;
  }

  public get YOffset(): FixedPoint {
    return this.currentShape.yOffset;
  }

  public get _ecbShapes(): ECBShapes {
    return this.ecbStateShapes;
  }

  public ResetECBShape(): void {
    // this.height.SetFromFp(this.originalHeight);
    // this.width.SetFromFp(this.originalWidth);
    // this.yOffset.SetFromFp(this.originalYOffset);
    this.currentShape = this.OriginalShape;
    this.update();
  }

  public SnapShot(): ECBSnapShot {
    return {
      posX: this.x.AsNumber,
      posY: this.y.AsNumber,
      ecbShape: this.currentShape,
    } as ECBSnapShot;
  }

  public SetFromSnapShot(snapShot: ECBSnapShot): void {
    this.x.SetFromNumber(snapShot.posX);
    this.y.SetFromNumber(snapShot.posY);
    this.currentShape = snapShot.ecbShape;
    // this.prevX.SetFromNumber(snapShot.prevPosX);
    // this.prevY.SetFromNumber(snapShot.prevPosY);

    this.update();

    // Update prevVerts
    // const half = NumberToRaw(0.5);
    // const px = this.prevX.Raw;
    // const py = this.prevY.Raw;
    // const height = this.height.Raw;
    // const width = this.width.Raw;
    // const yOffset = this.yOffset.Raw;

    // const bottomX = px;
    // const bottomY = py + yOffset;

    // const topX = px;
    // const topY = bottomY - height;

    // const halfWidth = MultiplyRaw(width, half);
    // const halfHeight = MultiplyRaw(height, half);

    // const leftX = bottomX - halfWidth;
    // const leftY = bottomY - halfHeight;

    // const rightX = bottomX + halfWidth;
    // const rightY = leftY;

    // this.prevVerts[0].X.SetFromRaw(bottomX);
    // this.prevVerts[0].Y.SetFromRaw(bottomY);

    // this.prevVerts[1].X.SetFromRaw(leftX);
    // this.prevVerts[1].Y.SetFromRaw(leftY);

    // this.prevVerts[2].X.SetFromRaw(topX);
    // this.prevVerts[2].Y.SetFromRaw(topY);

    // this.prevVerts[3].X.SetFromRaw(rightX);
    // this.prevVerts[3].Y.SetFromRaw(rightY);
  }

  // private loadAllVerts(): void {
  //   this.allVerts.length = 0;

  //   for (let i = 0; i < 4; i++) {
  //     this.allVerts.push(this.prevVerts[i]);
  //   }

  //   for (let i = 0; i < 4; i++) {
  //     this.allVerts.push(this.curVerts[i]);
  //   }
  // }
}
