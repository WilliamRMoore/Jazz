import { FixedPoint } from '../../math/fixedPoint';
import { FlatVec } from '../../physics/vector';
import { FillArrayWithFlatVec } from '../../utils';

export class LedgeDetectorComponent {
  private readonly posRef: FlatVec;
  private maxGrabs: number = 15;
  private numberOfLedgeGrabs: number = 0;
  private readonly yOffset: FixedPoint = new FixedPoint(0);
  private readonly width: FixedPoint = new FixedPoint(0);
  private readonly height: FixedPoint = new FixedPoint(0);
  private readonly rightSide: Array<FlatVec> = new Array<FlatVec>(4);
  private readonly leftSide: Array<FlatVec> = new Array<FlatVec>(4);
  private grabbedLedge: FlatVec[] | undefined;
  public readonly LedgeRollFrames: { ledgeGetUpFrames: number, ledgeRollFrames: [number, number] };

  constructor(
    posRef: FlatVec,
    width: number,
    height: number,
    yOffset = -130,
    ledgeRollFrames: { ledgeGetUpFrames: number, ledgeRollFrames: [number, number] }
  ) {
    this.posRef = posRef;
    this.height.SetFromNumber(height);
    this.width.SetFromNumber(width);
    this.yOffset.SetFromNumber(yOffset);
    this.LedgeRollFrames = ledgeRollFrames;
    FillArrayWithFlatVec(this.rightSide);
    FillArrayWithFlatVec(this.leftSide);
  }

  public MoveToPos(): void {
    this.update();
  }

  public get LeftSide(): Array<FlatVec> {
    return this.leftSide;
  }

  public get RightSide(): Array<FlatVec> {
    return this.rightSide;
  }

  public get Width(): FixedPoint {
    return this.width;
  }

  public get Height(): FixedPoint {
    return this.height;
  }

  public get YOffset(): FixedPoint {
    return this.yOffset;
  }

  private update(): void {
    const rightBottomLeft = this.rightSide[0];
    const rightTopLeft = this.rightSide[1];
    const rightTopRight = this.rightSide[2];
    const rightBottomRight = this.rightSide[3];

    const leftBottomLeft = this.leftSide[0];
    const leftTopLeft = this.leftSide[1];
    const leftTopRight = this.leftSide[2];
    const leftBottomRight = this.leftSide[3];

    const widthRaw = this.width.Raw;
    const heightRaw = this.height.Raw;
    const xRaw = this.posRef.X.Raw; //this.x.Raw;
    const yRaw = this.posRef.Y.Raw + this.yOffset.Raw; // yRaw + yOffsetRaw

    const widthRightRaw = xRaw + widthRaw;
    const widthLeftRaw = xRaw - widthRaw;
    const bottomHeightRaw = yRaw + heightRaw;

    //bottom left
    rightBottomLeft.X.SetFromRaw(xRaw);
    rightBottomLeft.Y.SetFromRaw(bottomHeightRaw);
    //top left
    rightTopLeft.X.SetFromRaw(xRaw);
    rightTopLeft.Y.SetFromRaw(yRaw);
    // top right
    rightTopRight.X.SetFromRaw(widthRightRaw);
    rightTopRight.Y.SetFromRaw(yRaw);
    // bottom right
    rightBottomRight.X.SetFromRaw(widthRightRaw);
    rightBottomRight.Y.SetFromRaw(bottomHeightRaw);

    //bottom left
    leftBottomLeft.X.SetFromRaw(widthLeftRaw);
    leftBottomLeft.Y.SetFromRaw(bottomHeightRaw);
    // top left
    leftTopLeft.X.SetFromRaw(widthLeftRaw);
    leftTopLeft.Y.SetFromRaw(yRaw);
    // top right
    leftTopRight.X.SetFromRaw(xRaw);
    leftTopRight.Y.SetFromRaw(yRaw);
    // bottom right
    leftBottomRight.X.SetFromRaw(xRaw);
    leftBottomRight.Y.SetFromRaw(bottomHeightRaw);
  }

  public get CanGrabLedge(): boolean {
    return this.numberOfLedgeGrabs < this.maxGrabs;
  }

  public IncrementLedgeGrabs(): void {
    this.numberOfLedgeGrabs++;
  }

  public ZeroLedgeGrabCount(): void {
    this.numberOfLedgeGrabs = 0;
  }

  public GrabLedge(l: FlatVec[]) {
    this.grabbedLedge = l;
  }

  public get GrabbedLedge(): FlatVec[] | undefined {
    return this.grabbedLedge;
  }

  public get LedgeGrabCount(): number {
    return this.numberOfLedgeGrabs;
  }

  public ReleaseLedge(): void {
    this.grabbedLedge = undefined;
  }

  public set CompState(state: LedgeDetectorHist) {
    this.numberOfLedgeGrabs = state.ldGrabCount;
    this.grabbedLedge = state.ldgGrbdLdg;
    this.update();
  }
}

export type LedgeDetectorHist = {
  ldGrabCount: number;
  ldgGrbdLdg: FlatVec[] | undefined;
};
