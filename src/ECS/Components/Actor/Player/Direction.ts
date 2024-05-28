import { Component, ComponentCollection, Entity } from '../../../ECS';

export class DirectionComponent extends Component {
  static CompName = 'DirectionComp';
  public readonly CompName = DirectionComponent.CompName;
  private FacingRight = false;
  EntId: number = -1;

  FaceRight(): void {
    this.FacingRight = true;
  }

  FaceLeft(): void {
    this.FacingRight = false;
  }

  IsFacingRight(): boolean {
    return this.FacingRight;
  }

  IsFacingLeft(): boolean {
    return !this.IsFacingRight();
  }

  Attach(ent: Entity): void {
    this.EntId = ent.ID;
  }
}

export function UnboxDirectionComponent(
  comps: ComponentCollection
): DirectionComponent | undefined {
  return comps.get(DirectionComponent.CompName) as
    | DirectionComponent
    | undefined;
}
