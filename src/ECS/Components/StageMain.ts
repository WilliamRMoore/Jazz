import { Component, ComponentCollection, Entity } from '../ECS';
import { FlatVec, VectorAllocator } from '../../Physics/FlatVec';

export class StageMainComponent extends Component {
  static CompName = 'StageMainComp';
  public CompName = StageMainComponent.CompName;
  EntId: number = -1;

  private Verticies: FlatVec[];
  private ledgeVerts: { left: FlatVec[]; right: FlatVec[] };
  public Color: string;
  public LegdeColor: string;

  constructor(
    verts: FlatVec[],
    color: string = 'green',
    legdeColor: string = 'yellow'
  ) {
    super();
    if (verts.length < 4) {
      throw new Error('Insufficient point count when creating a stage!');
    }
    this.Verticies = verts;
    this.Color = color;
    this.LegdeColor = legdeColor;
    this.CalcLedges();
  }

  private CalcLedges() {
    let rightPoint = this.Verticies[1];
    let lefPoint = this.Verticies[0];

    let rightLedge = new Array<FlatVec>();
    rightLedge.push(VectorAllocator(rightPoint.X - 60, rightPoint.Y));
    rightLedge.push(VectorAllocator(rightPoint.X, rightPoint.Y));
    rightLedge.push(VectorAllocator(rightPoint.X, rightPoint.Y + 20));
    rightLedge.push(VectorAllocator(rightPoint.X - 60, rightPoint.Y + 20));

    let leftLedge = new Array<FlatVec>();
    leftLedge.push(VectorAllocator(lefPoint.X, lefPoint.Y));
    leftLedge.push(VectorAllocator(lefPoint.X + 60, lefPoint.Y));
    leftLedge.push(VectorAllocator(lefPoint.X + 60, lefPoint.Y + 20));
    leftLedge.push(VectorAllocator(lefPoint.X, lefPoint.Y + 20));

    this.ledgeVerts = { left: leftLedge, right: rightLedge };
  }

  GetVerticies() {
    return this.Verticies;
  }

  GetLedges() {
    return this.ledgeVerts;
  }

  Attach(ent: Entity): void {
    this.EntId = ent.ID;
  }
}

export function InitStageManinComponent() {
  let stageVecs = new Array<FlatVec>();

  stageVecs.push(
    new FlatVec(510, 600),
    new FlatVec(1410, 600),
    new FlatVec(1410, 640),
    new FlatVec(510, 640)
  );

  const stage = new StageMainComponent(stageVecs);
}

export function UnboxStageMainComponent(
  comps: ComponentCollection
): StageMainComponent | undefined {
  return comps.get(StageMainComponent.CompName) as
    | StageMainComponent
    | undefined;
}

export class UnboxxedStage {
  public MainStage: StageMainComponent;

  constructor(ent: Entity) {
    this.MainStage = UnboxStageMainComponent(ent.Components)!;
  }
}
