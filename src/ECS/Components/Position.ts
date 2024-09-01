import { FlatVec, VectorAllocator } from '../../Physics/FlatVec';
import { Component, ComponentCollection, Entity } from '../ECS';

export class PositionComponent extends Component {
  static CompName = 'PosComp';
  public readonly CompName = PositionComponent.CompName;
  public readonly Pos: FlatVec;

  constructor() {
    super();
    this.Pos = VectorAllocator();
  }

  Attach(ent: Entity): void {
    this.EntId = ent.ID;
  }
}

export function UnboxPositionComponent(
  comps: ComponentCollection
): PositionComponent | undefined {
  return comps.get(PositionComponent.CompName) as PositionComponent | undefined;
}
