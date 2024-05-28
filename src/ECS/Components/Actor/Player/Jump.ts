import { Component, ComponentCollection, Entity } from '../../../ECS';

export class JumpComponent extends Component {
  static CompName = 'JumpComp';
  public readonly CompName = JumpComponent.CompName;
  EntId: number = -1;

  public readonly JumpVelocity: number;
  public readonly NumberOfJumps: number = 2;
  public readonly NumberOfAriealJumps: number = 1;
  public JumpCount: number = 0;

  constructor(jumpVelocity: number, numberOfJumps: number = 2) {
    super();
    this.JumpVelocity = jumpVelocity;
    this.NumberOfJumps = numberOfJumps;
    this.NumberOfAriealJumps = numberOfJumps - 1;
  }

  Attach(ent: Entity): void {
    this.EntId = ent.ID;
  }
}

export function UnboxJumpComponent(
  comps: ComponentCollection
): JumpComponent | undefined {
  return comps.get(JumpComponent.CompName) as JumpComponent | undefined;
}
