import { Component, ComponentCollection, Entity } from '../ECS';

export class GravityComponent extends Component {
  static CompName = 'GravComp';
  public readonly CompName = GravityComponent.CompName;

  Attach(ent: Entity): void {
    this.EntId = ent.ID;
  }
}

export function UnboxGravityComponent(
  comps: ComponentCollection
): GravityComponent | undefined {
  return comps.get(GravityComponent.CompName) as GravityComponent | undefined;
}
