import { ECSIState } from '../../../../Game/State/EcsStateMachine';
import { Component, ComponentCollection, Entity } from '../../../ECS';

export class CurrentStateComponent extends Component {
  static CompName = 'CurrentStateComp';
  public readonly CompName = CurrentStateComponent.CompName;
  private CurrentState: ECSIState;
  //private CurrentStateFrame: number = 0;
  EntId: number = -1;

  Attach(ent: Entity): void {
    this.EntId = ent.ID;
  }

  // GetCurrentStateFrame() {
  //   this.CurrentStateFrame;
  // }

  // SetCurrentStateFrame(frameNum: number) {
  //   this.CurrentStateFrame = frameNum;
  // }

  GetCurrentState() {
    return this.CurrentState;
  }

  SetCurrentState(state: ECSIState) {
    this.CurrentState = state;
  }
}

export function UnboxCurrentStateComponent(
  comps: ComponentCollection
): CurrentStateComponent | undefined {
  return comps.get(CurrentStateComponent.CompName) as
    | CurrentStateComponent
    | undefined;
}
