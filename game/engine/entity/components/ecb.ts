import { ECBShapesConfig } from '../../../character/shared';
import { StateId } from '../../finite-state-machine/stateConfigurations/shared';
import { FixedPoint, NumberToRaw, MultiplyRaw } from '../../math/fixedPoint';
import { FlatVec } from '../../physics/vector';
import { DiamondDTO } from '../../pools/ECBDiamonDTO';
import { Pool } from '../../pools/Pool';
import { FillArrayWithFlatVec } from '../../utils';

const POINT_FIVE = NumberToRaw(0.5);

export type EcbHistoryDTO = {
  shape: Array<FlatVec>;
  Bottom: FlatVec;
  Left: FlatVec;
  Top: FlatVec;
  Right: FlatVec;
};

export function CreateDiamondFromHistory(
  ecbShape: ECBShape,
  posXRaw: number,
  posYRaw: number,
  pool: Pool<DiamondDTO>,
): DiamondDTO {
  const diamondDTO = pool.Rent();
  const height = ecbShape.height.Raw;
  const width = ecbShape.width.Raw;
  const yOffset = ecbShape.yOffset.Raw;

  const halfWidth = MultiplyRaw(width, POINT_FIVE);
  const halfHeight = MultiplyRaw(height, POINT_FIVE);

  diamondDTO.Bottom.X.SetFromRaw(posXRaw);
  diamondDTO.Bottom.Y.SetFromRaw(posYRaw + yOffset);
  diamondDTO.Left.X.SetFromRaw(posXRaw - halfWidth);
  diamondDTO.Left.Y.SetFromRaw(posYRaw + yOffset - halfHeight);
  diamondDTO.Top.X.SetFromRaw(posXRaw);
  diamondDTO.Top.Y.SetFromRaw(posYRaw + yOffset - height);
  diamondDTO.Right.X.SetFromRaw(posXRaw + halfWidth);
  diamondDTO.Right.Y.SetFromRaw(posYRaw + yOffset - halfHeight);

  return diamondDTO;
}

export type ECBShape = {
  readonly height: FixedPoint;
  readonly width: FixedPoint;
  readonly yOffset: FixedPoint;
};

export type ECBShapes = Map<StateId, ECBShape>;

export class ECBComponent {
  // this is a reference
  private playerPosRef: FlatVec;
  public readonly SensorDepth = new FixedPoint(1);
  public readonly OriginalShape: ECBShape;
  private readonly curVerts = new Array<FlatVec>(4);
  public readonly ecbStateShapes: ECBShapes;
  private currentShape: ECBShape;

  constructor(
    shapes: ECBShapesConfig,
    positionRef: FlatVec,
    height = 100,
    width = 100,
    yOffset = 0,
  ) {
    this.OriginalShape = {
      height: new FixedPoint(height),
      width: new FixedPoint(width),
      yOffset: new FixedPoint(yOffset),
    };
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
    this.playerPosRef = positionRef;
    this.Update();
  }

  public GetActiveVerts(): FlatVec[] {
    return this.curVerts;
  }

  public SetECBShape(stateId: StateId): void {
    this.currentShape = this.ecbStateShapes.get(stateId) || this.OriginalShape;
    this.Update();
  }

  public Update(): void {
    const half = POINT_FIVE;
    const px = this.playerPosRef.X.Raw;
    const py = this.playerPosRef.Y.Raw;
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

  public get Left(): FlatVec {
    return this.curVerts[1];
  }

  public get Top(): FlatVec {
    return this.curVerts[2];
  }

  public get Right(): FlatVec {
    return this.curVerts[3];
  }

  public get Height(): FixedPoint {
    return this.currentShape.height;
  }

  public get Width(): FixedPoint {
    return this.currentShape.width;
  }

  public get YOffset(): FixedPoint {
    return this.currentShape.yOffset;
  }

  public get _db_ecbShapes() {
    return this.ecbStateShapes;
  }

  public get AABBOrgXRaw(): number {
    return this.Left.X.Raw;
  }

  public get AABBOrgYRaw(): number {
    return this.Top.Y.Raw;
  }

  public get ECBWidthRaw(): number {
    return this.currentShape.width.Raw;
  }

  public get ECBHeightRaw(): number {
    return this.currentShape.height.Raw;
  }

  public ResetECBShape(): void {
    this.currentShape = this.OriginalShape;
    this.Update();
  }

  public set CompState(history: ECBHist) {
    this.SetECBShape(history.stateId);
  }
}

export type ECBHist = {
  stateId: StateId;
};
