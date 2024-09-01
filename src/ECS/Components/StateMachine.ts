import { EcsStateMachine } from '../../Game/State/EcsStateMachine';
import { Component, ComponentCollection, Entity } from '../ECS';

export class StateMachineComponent extends Component {
  public static CompName: string = 'StateMachine';
  public readonly CompName: string = StateMachineComponent.CompName;
  public readonly StateMachine: EcsStateMachine;

  constructor(sm: EcsStateMachine) {
    super();
    this.StateMachine = sm;
  }

  Attach(ent: Entity): void {
    this.EntId = ent.ID;
  }
}

export function UnboxStateMachineComponent(
  comps: ComponentCollection
): StateMachineComponent | undefined {
  return comps.get(StateMachineComponent.CompName) as
    | StateMachineComponent
    | undefined;
}
