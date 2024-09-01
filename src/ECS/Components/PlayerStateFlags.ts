import { Component, ComponentCollection, Entity } from '../ECS';

export class PlayerFlagsComponent extends Component {
  static CompName = 'PlayerFlagsComp';
  public readonly CompName = PlayerFlagsComponent.CompName;

  private FacingRight = false;
  private Grounded: boolean = false;
  //private LastFrameGrounded: number = -1;
  private InLedgeGrab: boolean = false;

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

  Ground(/*frameNumber: number*/): void {
    //this.LastFrameGrounded = frameNumber;
    this.Grounded = true;
  }

  Unground(): void {
    this.Grounded = false;
  }

  IsGrounded(): boolean {
    return this.Grounded;
  }

  // GetLastFrameGrounded(): number {
  //   return this.LastFrameGrounded;
  // }

  GrabLedge() {
    this.InLedgeGrab = true;
  }

  UnGrabLedge() {
    this.InLedgeGrab = false;
  }

  IsInLedgeGrab(): boolean {
    return this.InLedgeGrab;
  }

  Attach(ent: Entity): void {
    this.EntId = ent.ID;
  }
}

export function UnboxPlayerFlagsComponent(
  comps: ComponentCollection
): PlayerFlagsComponent | undefined {
  return comps.get(PlayerFlagsComponent.CompName) as
    | PlayerFlagsComponent
    | undefined;
}
