import { FlatVec } from '../../../../Physics/FlatVec';
import { FillArrayWithFlatVec } from '../../../../utils';
import { Component, ComponentCollection, Entity } from '../../../ECS';

export class ECBComponent extends Component {
  public static CompName = 'ECBComp';
  public readonly CompName = ECBComponent.CompName;
  private Position: FlatVec = new FlatVec(0, 0);
  private EcbOffsets: ECBOffsets;
  private Verts = new Array<FlatVec>(4);
  private Color: string;
  EntId: number = -1;

  constructor() {
    super();
    this.EcbOffsets = {
      topX: 0,
      topY: -100,
      rightX: 50,
      rightY: -50,
      bottX: 0,
      bottY: 0,
      leftX: -50,
      leftY: -50,
    } as ECBOffsets;
    this.Color = 'orange';
    FillArrayWithFlatVec(this.Verts);
    this.Update();
  }

  public MoveToPosition(x: number, y: number) {
    this.Position.X = x;
    this.Position.Y = y;
    this.Update();
  }

  Update(): void {
    this.Verts[0].X = this.Position.X + this.EcbOffsets.topX;
    this.Verts[0].Y = this.Position.Y + this.EcbOffsets.topY;

    this.Verts[1].X = this.Position.X + this.EcbOffsets.rightX;
    this.Verts[1].Y = this.Position.Y + this.EcbOffsets.rightY;

    this.Verts[2].X = this.Position.X + this.EcbOffsets.bottX;
    this.Verts[2].Y = this.Position.Y + this.EcbOffsets.bottY;

    this.Verts[3].X = this.Position.X + this.EcbOffsets.leftX;
    this.Verts[3].Y = this.Position.Y + this.EcbOffsets.leftY;
  }

  Top(): FlatVec {
    return this.Verts[0];
  }

  Right(): FlatVec {
    return this.Verts[1];
  }

  Bottom(): FlatVec {
    return this.Verts[2];
  }

  Left(): FlatVec {
    return this.Verts[3];
  }

  GetColor(): string {
    return this.Color;
  }

  SetColor(color: string): void {
    this.Color = color;
  }

  Attach(ent: Entity): void {
    this.EntId = ent.ID;
  }

  public GetVerticies() {
    return this.Verts;
  }
}

type ECBOffsets = {
  topX: number;
  topY: number;
  rightX: number;
  rightY: number;
  bottX: number;
  bottY: number;
  leftX: number;
  leftY: number;
};

export function UnboxECBComponent(
  comps: ComponentCollection
): ECBComponent | undefined {
  return comps.get(ECBComponent.CompName) as ECBComponent | undefined;
}
