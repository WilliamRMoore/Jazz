import { FlatVec } from '../../../../Physics/FlatVec';
import { FillArrayWithFlatVec } from '../../../../utils';
import { Component, ComponentCollection, Entity } from '../../../ECS';

export class LedgeDetectorComponent extends Component {
  static CompName = 'LedgeGrab';
  public readonly CompName = LedgeDetectorComponent.CompName;
  EntId: number = -1;
  //private InLedgeGrab: boolean = false;
  private YOffset: number;
  private Box: LedgeDetectorBox;
  private RightSideBox = new Array<FlatVec>(4);
  private LeftSideBox = new Array<FlatVec>(4);
  private ForwardBoxColor: string = 'blue';
  private BackwardBoxColor: string = 'red';

  constructor(
    x: number,
    y: number,
    height: number,
    width: number,
    yOffset: number = -130
  ) {
    super();
    this.Box = { x, y: y + yOffset, width, height };
    this.YOffset = yOffset;
    FillArrayWithFlatVec(this.RightSideBox);
    FillArrayWithFlatVec(this.LeftSideBox);
    this.Update();
  }

  MoveTo(x: number, y: number): void {
    this.Box.x = x;
    this.Box.y = y + this.YOffset;
    this.Update();
  }

  private Update(): void {
    this.RightSideBox[0].X = this.Box.x;
    this.RightSideBox[0].Y = this.Box.y;

    this.RightSideBox[1].X = this.Box.x + this.Box.width;
    this.RightSideBox[1].Y = this.Box.y;

    this.RightSideBox[2].X = this.Box.x + this.Box.width;
    this.RightSideBox[2].Y = this.Box.y + this.Box.height;

    this.RightSideBox[3].X = this.Box.x;
    this.RightSideBox[3].Y = this.Box.y + this.Box.height;

    //---------------------------------------------------

    this.LeftSideBox[0].X = this.Box.x - this.Box.width;
    this.LeftSideBox[0].Y = this.Box.y;

    this.LeftSideBox[1].X = this.Box.x;
    this.LeftSideBox[1].Y = this.Box.y;

    this.LeftSideBox[2].X = this.Box.x;
    this.LeftSideBox[2].Y = this.Box.y + this.Box.height;

    this.LeftSideBox[3].X = this.Box.x - this.Box.width;
    this.LeftSideBox[3].Y = this.Box.y + this.Box.height;
  }

  GetRightSideDetectorVerts(): FlatVec[] {
    return this.RightSideBox;
  }

  GetLeftSideDetectorVerts(): FlatVec[] {
    return this.LeftSideBox;
  }

  GetForwardColor(): string {
    return this.ForwardBoxColor;
  }

  GetBackwardBoxColor(): string {
    return this.BackwardBoxColor;
  }

  SetForwardBoxColor(color: string): void {
    this.ForwardBoxColor = color;
  }

  SetBackwardBoxColor(color: string): void {
    this.BackwardBoxColor = color;
  }

  Attach(ent: Entity): void {
    this.EntId = ent.ID;
  }
}

type LedgeDetectorBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function UnboxLedgeDetectorComponent(
  comps: ComponentCollection
): LedgeDetectorComponent | undefined {
  return comps.get(LedgeDetectorComponent.CompName) as
    | LedgeDetectorComponent
    | undefined;
}
