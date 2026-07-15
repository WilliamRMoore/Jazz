import { ECBShapesConfig } from '../../../character/shared';
import { StateId } from '../../finiteStateMachines/player/states/shared';
import { FixedPoint, MultiplyRaw, NumberToRaw } from '../../math/fixedPoint';
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

export type ECBShape = {
  readonly height: FixedPoint;
  readonly width: FixedPoint;
  readonly yOffset: FixedPoint;
};

export type ECBShapes = Map<StateId, ECBShape[]>;

export class ECBComponent {
  // this is a reference
  private playerPosRef: FlatVec;
  public readonly SensorDepth = new FixedPoint(1);
  public readonly OriginalShape: ECBShape[];
  private readonly curVerts = new Array<FlatVec>(4);
  public readonly ecbStateShapes: ECBShapes;
  private currentTrack: ECBShape[];
  private currentShape: ECBShape;

  constructor(
    shapes: ECBShapesConfig,
    positionRef: FlatVec,
    height = 100,
    width = 100,
    yOffset = 0
  ) {
    this.OriginalShape = [
      {
        height: new FixedPoint(height),
        width: new FixedPoint(width),
        yOffset: new FixedPoint(yOffset)
      }
    ];
    this.ecbStateShapes = new Map<StateId, ECBShape[]>();
    for (const [Key, val] of shapes) {
      for (let ecbFrame = 0; ecbFrame < val.length; ecbFrame++) {
        const frameShape = val[ecbFrame];
        this.ecbStateShapes.set(Key, [
          {
            height: new FixedPoint(frameShape.height),
            width: new FixedPoint(frameShape.width),
            yOffset: new FixedPoint(frameShape.yOffset)
          }
        ]);
      }
    }
    this.currentTrack = this.OriginalShape;
    this.currentShape = this.currentTrack[0];
    FillArrayWithFlatVec(this.curVerts);
    this.playerPosRef = positionRef;
    this.Update();
  }

  public GetActiveVerts(): FlatVec[] {
    return this.curVerts;
  }

  public SetECBTrack(stateId: StateId): void {
    this.currentTrack = this.ecbStateShapes.get(stateId) || this.OriginalShape;
    this.Update();
  }

  public Update(stateFrame = 0): void {
    const half = POINT_FIVE;
    const px = this.playerPosRef.X.Raw;
    const py = this.playerPosRef.Y.Raw;
    const index = stateFrame % this.currentTrack.length;
    this.currentShape = this.currentTrack[index] ?? this.OriginalShape[0];
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

  public ResetECBShape(): void {
    this.currentTrack = this.OriginalShape;
    this.Update();
  }

  public set CompState(history: ECBHist) {
    this.SetECBTrack(history.stateId);
  }
}

export type ECBHist = {
  stateId: StateId;
};
