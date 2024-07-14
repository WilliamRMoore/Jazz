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
import { UnboxedPlayer } from '../../ECS/Extensions/ECSBuilderExtensions';
import { InputAction } from '../../input/GamePadInput';

export interface ECSIState {
  FrameCount: number;
  StateDefaultTransition?: ECSIState;
  Transitions?: Map<string, ECSIState>;
  Name: string;
  OnEnter?: (player: UnboxedPlayer, ia: InputAction) => void;
  OnUpdate?: (
    player: UnboxedPlayer,
    ia: InputAction,
    stateFrame: number
  ) => void;
  OnExit?: (player: UnboxedPlayer) => void;
}

export class EcsStateMachine {
  private Player: UnboxedPlayer;
  private States = new Map<string, ECSIState>();
  private Transitions?: Map<string, ECSIState> | undefined;
  private CurrentState?: ECSIState | undefined;
  private CurrentStateFrame: number = 0;

  constructor(playerEnt: Entity) {
    this.Player = new UnboxedPlayer(playerEnt);
  }

  public AddState(state: ECSIState): void {
    this.States.set(state.Name, state);
  }

  public SetInitialState(name: string): void {
    if (!this.States.has(name)) {
      return; // We don't have that state.
    }

    if (this.CurrentState) {
      return; // We already have a state, this function should only work when there is not state set.
    }

    this.CurrentState = this.States.get(name)!;
    this.Transitions = this.CurrentState?.Transitions;
    this.Player.CurrentSateComp.SetCurrentState(this.CurrentState!);

    if (this.CurrentState.OnEnter) {
      this.CurrentState.OnEnter(this.Player, {
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
    this.Player.CurrentSateComp.SetCurrentState(state);
    this.CurrentStateFrame = frame;
  }

  public ForceState(frame: number, inputAction: InputAction): void {
    let actionname = inputAction.Action;

    if (!this.States.has(actionname)) {
      return;
    }

    if (this.CurrentState?.Name === actionname) {
      this.CurrentStateFrame = frame;
      return;
    }

    if (this.CurrentState && this.CurrentState.OnExit) {
      this.CurrentState.OnExit(this.Player);
    }

    this.CurrentState = this.States.get(actionname)!;
    this.Transitions = this.CurrentState?.Transitions;

    if (this.CurrentState.OnEnter) {
      this.CurrentState.OnEnter(this.Player, inputAction);
    }
    this.Player.CurrentSateComp.SetCurrentState(this.CurrentState);
    this.CurrentStateFrame = frame;

    return;
  }

  public SetState(ia: InputAction): void {
    const stateName = ia.Action;

    //if we have legal transitions, and those transitions do not contain the state we are wanting to set, return.
    if (this.Transitions && !this.Transitions.has(stateName)) {
      return;
    }

    //If we don't have the state, return.
    if (!this.CurrentState?.Transitions && !this.States.has(stateName)) {
      return;
    }

    //If current state is the same
    if (this.CurrentState?.Name === stateName) {
      return;
    }

    //If we have a current state, and it has an on exit, call on exit before setting new state.
    if (this.CurrentState && this.CurrentState.OnExit) {
      this.CurrentState.OnExit(this.Player);
    }

    this.setToTransitionIfExists(stateName);
    this.Player.CurrentSateComp.SetCurrentState(this.CurrentState!);
    this.Transitions = this.CurrentState?.Transitions;

    if (this.CurrentState?.OnEnter) {
      this.CurrentState.OnEnter(this.Player, ia);
    }

    this.CurrentStateFrame == 0;
  }

  public Update(inputAction: InputAction): void {
    if (
      this.CurrentState &&
      this.CurrentState.StateDefaultTransition &&
      this.CurrentState.FrameCount &&
      this.CurrentStateFrame >= this.CurrentState.FrameCount
    ) {
      this.setToDefault(inputAction);
      return;
    }

    if (this.CurrentState && this.CurrentState.OnUpdate) {
      this.CurrentState.OnUpdate(
        this.Player,
        inputAction,
        this.CurrentStateFrame
      );
    }

    this.CurrentStateFrame++;
  }

  private setToTransitionIfExists(stateName: string) {
    this.CurrentState =
      this?.Transitions?.get(stateName) ?? this.States.get(stateName);
  }

  private setToDefault(ia: InputAction): void {
    const state = this.CurrentState!.StateDefaultTransition!;

    if (this.CurrentState?.Name === state.Name) {
      return;
    }

    if (this.CurrentState && this.CurrentState.OnExit) {
      this.CurrentState.OnExit(this.Player);
    }

    this.CurrentState = state;
    this.Transitions = this.CurrentState?.Transitions;
    this.Player.CurrentSateComp.SetCurrentState(this.CurrentState);

    if (this.CurrentState?.OnEnter) {
      this.CurrentState.OnEnter(this.Player, ia);
    }

    this.CurrentStateFrame = 0;
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
