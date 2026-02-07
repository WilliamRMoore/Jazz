import { FixedPoint, NumberToRaw } from '../../math/fixedPoint';
import { FlatVec } from '../../physics/vector';
import { FillArrayWithFlatVec } from '../../utils';
import { IHistoryEnabled } from '../componentHistory';

export type LedgeDetectorSnapShot = {
  middleX: number;
  middleY: number;
  numberOfLedgeGrabs: number;
};

export class LedgeDetectorComponent implements IHistoryEnabled<LedgeDetectorSnapShot> {
  private maxGrabs: number = 15;
  private numberOfLedgeGrabs: number = 0;
  private readonly yOffset: FixedPoint = new FixedPoint(0);
  private readonly x: FixedPoint = new FixedPoint(0);
  private readonly y: FixedPoint = new FixedPoint(0);
  private readonly width: FixedPoint = new FixedPoint(0);
  private readonly height: FixedPoint = new FixedPoint(0);
  private readonly rightSide: Array<FlatVec> = new Array<FlatVec>(4);
  private readonly leftSide: Array<FlatVec> = new Array<FlatVec>(4);

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    yOffset = -130,
  ) {
    this.height.SetFromNumber(height);
    this.width.SetFromNumber(width);
    this.yOffset.SetFromNumber(yOffset);
    FillArrayWithFlatVec(this.rightSide);
    FillArrayWithFlatVec(this.leftSide);
    this.MoveToRaw(NumberToRaw(x), NumberToRaw(y));
  }

  public MoveTo(x: FixedPoint, y: FixedPoint): void {
    this.x.SetFromFp(x);
    this.y.SetAdd(y, this.yOffset);
    this.update();
  }

  public MoveToRaw(xRaw: number, yRaw: number): void {
    this.x.SetFromRaw(xRaw);
    this.y.SetFromRaw(this.yOffset.Raw + yRaw);
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
    const xRaw = this.x.Raw;
    const yRaw = this.y.Raw;

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

  public SnapShot(): LedgeDetectorSnapShot {
    return {
      middleX: this.x.AsNumber,
      middleY: this.y.AsNumber,
      numberOfLedgeGrabs: this.numberOfLedgeGrabs,
    } as LedgeDetectorSnapShot;
  }

  public SetFromSnapShot(snapShot: LedgeDetectorSnapShot): void {
    const middleXRaw = NumberToRaw(snapShot.middleX);
    const middleYRaw = NumberToRaw(snapShot.middleY);
    this.MoveToRaw(middleXRaw, middleYRaw);
    this.numberOfLedgeGrabs = snapShot.numberOfLedgeGrabs;
  }
}
