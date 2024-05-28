import { Component, ComponentCollection, Entity } from '../../../ECS';

export class GroundedComponent extends Component {
  static CompName = 'GroundedComp';
  public readonly CompName = GroundedComponent.CompName;
  EntId: number = -1;
  private Grounded: boolean = false;

  Attach(ent: Entity): void {
    this.EntId = ent.ID;
  }

  Ground() {
    this.Grounded = true;
  }

  Ungroung() {
    this.Grounded = false;
  }

  IsGrounded() {
    return this.Grounded;
  }
}

export function UnboxGroundedComponent(
  comps: ComponentCollection
): GroundedComponent | undefined {
  return comps.get(GroundedComponent.CompName) as GroundedComponent | undefined;
}
