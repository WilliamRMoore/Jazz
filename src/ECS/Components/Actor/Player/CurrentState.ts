import { Component, ComponentCollection, Entity } from '../../../ECS';

export class CurrentStateComponent extends Component {
  static CompName = 'CurrentStateComp';
  public readonly CompName = CurrentStateComponent.CompName;
  private CurrentStateName: string = '';
  private CurrentStateFrame: number = 0;
  EntId: number = -1;

  Attach(ent: Entity): void {
    this.EntId = ent.ID;
  }

  GetCurrentStateFrame() {
    this.CurrentStateFrame;
  }

  SetCurrentStateFrame(frameNum: number) {
    this.CurrentStateFrame = frameNum;
  }

  GetCurrentStateName() {
    return this.CurrentStateName;
  }

  SetCurrentStateName(stateName: string) {
    this.CurrentStateName = stateName;
  }
}

export function UnboxCurrentStateComponent(
  comps: ComponentCollection
): CurrentStateComponent | undefined {
  return comps.get(CurrentStateComponent.CompName) as
    | CurrentStateComponent
    | undefined;
}
