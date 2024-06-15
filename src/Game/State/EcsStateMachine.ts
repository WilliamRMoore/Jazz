import {
  GravityComponent,
  UnboxGravityComponent,
} from '../../ECS/Components/Actor/Gravity';
import {
  CurrentStateComponent,
  UnboxCurrentStateComponent,
} from '../../ECS/Components/Actor/Player/CurrentState';
import {
  DirectionComponent,
  UnboxDirectionComponent,
} from '../../ECS/Components/Actor/Player/Direction';
import {
  ECBComponent,
  UnboxECBComponent,
} from '../../ECS/Components/Actor/Player/ECB';
import {
  GroundedComponent,
  UnboxGroundedComponent,
} from '../../ECS/Components/Actor/Player/Grounded';
import {
  JumpComponent,
  UnboxJumpComponent,
} from '../../ECS/Components/Actor/Player/Jump';
import {
  LedgeDetectorComponent,
  UnboxLedgeDetectorComponent,
} from '../../ECS/Components/Actor/Player/LedgeDetector';
import {
  PositionComponent,
  UnboxPositionComponent,
} from '../../ECS/Components/Actor/Position';
import {
  UnboxVelocityComponent,
  VelocityComponent,
} from '../../ECS/Components/Actor/Velocity';
import { ComponentCollection, Entity } from '../../ECS/ECS';
import { InputAction } from '../../input/GamePadInput';

export interface ECSIState {
  FrameCount: number;
  StateDefaultTransition?: ECSIState;
  Transitions?: Map<string, ECSIState>;
  Name: string;
  OnEnter?: (playerComps: PlayerComponents, ia: InputAction) => void;
  OnUpdate?: (
    playerComps: PlayerComponents,
    ia: InputAction,
    stateFrame: number
  ) => void;
  OnExit?: (playerComps: PlayerComponents) => void;
}

export class EcsStateMachine {
  private PlayerComponents: PlayerComponents;
  private States = new Map<string, ECSIState>();
  private Transitions?: Map<string, ECSIState> | null;
  private CurrentState?: ECSIState | null;
  private CurrentStateFrame: number = 0;

  constructor(playerEnt: Entity) {
    this.PlayerComponents = GetAllPlayerComponents(playerEnt.Components);
  }

  public AddState(state: ECSIState) {
    this.States.set(state.Name, state);
  }

  public SetInitialState(name: string) {
    if (!this.States.has(name)) {
      return; // We don't have that state.
    }

    if (this.CurrentState) {
      return; // We already have a state, this function should only work when there is not state set.
    }

    this.CurrentState = this.States.get(name)!;
    this.Transitions = this.CurrentState?.Transitions;
    this.PlayerComponents.CurrentState.SetCurrentState(this.CurrentState!);

    if (this.CurrentState.OnEnter) {
      this.CurrentState.OnEnter(this.PlayerComponents, {
        Action: name,
        LXAxis: 0,
        LYAxis: 0,
        RXAxis: 0,
        RYAxis: 0,
      });
    }

    this.CurrentStateFrame = 0;
  }

  public ForcseStateForRollBack(state: ECSIState, frame: number) {
    this.CurrentState = state;
    this.Transitions = this.CurrentState?.Transitions;
    this.PlayerComponents.CurrentState.SetCurrentState(state);
    this.CurrentStateFrame = frame;
  }

  public ForState(frame: number, inputAction: InputAction): void {
    let actionname = inputAction.Action;
  }
}

export type PlayerComponents = {
  Position: PositionComponent;
  Velocity: VelocityComponent;
  Gravity: GravityComponent;
  Direction: DirectionComponent;
  Jump: JumpComponent;
  Ground: GroundedComponent;
  CurrentState: CurrentStateComponent;
  ECB: ECBComponent;
  LedgeDetector: LedgeDetectorComponent;
};

function GetAllPlayerComponents(comps: ComponentCollection) {
  let compDto = {
    Position: UnboxPositionComponent(comps)!,
    Velocity: UnboxVelocityComponent(comps)!,
    Gravity: UnboxGravityComponent(comps)!,
    Direction: UnboxDirectionComponent(comps)!,
    Jump: UnboxJumpComponent(comps)!,
    Ground: UnboxGroundedComponent(comps)!,
    CurrentState: UnboxCurrentStateComponent(comps)!,
    ECB: UnboxECBComponent(comps)!,
    LedgeDetector: UnboxLedgeDetectorComponent(comps)!,
  } as PlayerComponents;

  return compDto;
}
