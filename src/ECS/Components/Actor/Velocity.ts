import { FlatVec, VectorAllocator } from '../../../Physics/FlatVec';
import { Component, ComponentCollection, Entity } from '../../ECS';

export class VelocityComponent extends Component {
  static CompName = 'VelComp';
  public readonly CompName = VelocityComponent.CompName;
  EntId: number = -1;
  public Vel: FlatVec;

  constructor() {
    super();
    this.Vel = VectorAllocator();
  }

  Attach(ent: Entity): void {
    this.EntId = ent.ID;
  }
}

export function UnboxVelocityComponent(
  comps: ComponentCollection
): VelocityComponent | undefined {
  return comps.get(VelocityComponent.CompName) as VelocityComponent | undefined;
}
