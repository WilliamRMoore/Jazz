import { Component, ComponentCollection, Entity } from '../../../ECS';

export class GroundedComponent extends Component {
  static CompName = 'GroundedComp';
  public readonly CompName = GroundedComponent.CompName;
  EntId: number = -1;
  private Grounded: boolean = false;
  public LastFrameGrounded: number = -1;

  Attach(ent: Entity): void {
    this.EntId = ent.ID;
  }

  Ground(frameNumber: number) {
    this.LastFrameGrounded = frameNumber;
    this.Grounded = true;
  }

  Unground() {
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
