import { Player } from '../playerOrchestrator';
import { World } from '../../world/world';
import { InputAction } from '../../../input/Input';
import {
  ActionStateMappings,
  FSMStates,
  GameEventId,
  Idle,
  RunCondition,
  StateId,
  ActionMappings,
} from './PlayerStates';
import { FSMInfoComponent } from '../playerComponents';

export type FSMState = {
  StateName: string;
  StateId: number;
  OnEnter: (p: Player, w: World) => void;
  OnUpdate: (p: Player, w: World) => void;
  OnExit: (p: Player, w: World) => void;
};

export class StateMachine {
  private player: Player;
  private world: World;
  private stateMappings: Map<StateId, ActionStateMappings>;
  private states: Map<StateId, FSMState>;

  constructor(p: Player, world: World) {
    this.player = p;
    this.world = world;
    this.player.FSMInfo.SetCurrentState(Idle);
    this.stateMappings = ActionMappings;
    this.states = FSMStates;
  }

  public SetInitialState(stateId: StateId): void {
    this.changeState(this.states.get(stateId)!, this.player.FSMInfo);
  }

  public UpdateFromWorld(gameEventId: GameEventId): void {
    // world events should still have to follow mapping rules
    const state = this.GetTranslation(gameEventId);

    if (state === undefined) {
      return;
    }

    const fsmInfo = this.player.FSMInfo;

    this.changeState(state, fsmInfo);
    fsmInfo.CurrentState.OnUpdate?.(this.player, this.world);
    fsmInfo.IncrementStateFrame();
  }

  public ForceState(sateId: StateId): void {
    //ignore mapping rules and force a state change
    const state = this.states.get(sateId);

    if (state === undefined) {
      return;
    }

    const fsmInfo = this.player.FSMInfo;

    this.changeState(state, fsmInfo);
    fsmInfo.CurrentState.OnUpdate?.(this.player, this.world);
    fsmInfo.IncrementStateFrame();
  }

  public UpdateFromInput(inputAction: InputAction, world: World): void {
    // if we have a conditional on the state, check it
    const fsmInfo = this.player.FSMInfo;

    if (this.runConditional(world, fsmInfo)) {
      return;
    }

    // if our input is a valid transition, run it
    if (this.runNext(inputAction, fsmInfo)) {
      return;
    }

    // if we have a default state, run it
    if (this.runDefault(world, fsmInfo)) {
      return;
    }

    // None of the above? Update current state
    this.updateState(fsmInfo);
  }

  private runConditional(world: World, fsmInfo: FSMInfoComponent): boolean {
    const conditions = this.stateMappings
      .get(fsmInfo.CurrentStatetId)!
      .GetConditions();

    // We have no conditionals, return
    if (conditions === undefined) {
      return false;
    }

    const conditionalsLength = conditions.length;

    // Loop through all conditionals, if one returns a stateId, run it and return true, otherwise return false
    for (let i = 0; i < conditionalsLength; i++) {
      const stateId = RunCondition(conditions[i], world, this.player.ID);

      // Condition returned a stateId, check it
      if (stateId !== undefined) {
        const state = this.states.get(stateId);

        // stateId did not resolve, return false
        if (state === undefined) {
          console.error('StateId not found in state machine: ', stateId);
          return false;
        }

        // stateId resolved, change state and return true
        this.changeState(state, fsmInfo);
        this.updateState(fsmInfo);

        return true;
      }
    }

    // None of the conditions returned a stateId, return false
    return false;
  }

  private runNext(
    inputAction: InputAction,
    fsmInfo: FSMInfoComponent
  ): boolean {
    const state = this.GetTranslation(inputAction.Action);

    if (state !== undefined) {
      this.changeState(state, fsmInfo);
      this.updateState(fsmInfo);
      return true;
    }

    return false;
  }

  private runDefault(w: World, fsmInfo: FSMInfoComponent): boolean {
    // Check to see if we are on a default frame
    // If not, return false
    if (this.IsDefaultFrame(fsmInfo) === false) {
      return false;
    }

    const defaultTransition = this.GetDefaultState(
      this.player.FSMInfo.CurrentStatetId,
      w
    );

    // No default transition resolved, return false
    if (defaultTransition === undefined) {
      return false;
    }

    // Default transition resolved, change/update state, return true
    this.changeState(defaultTransition, fsmInfo);
    this.updateState(fsmInfo);

    return true;
  }

  private GetTranslation(gameEventId: GameEventId): FSMState | undefined {
    const stateMappings = this.stateMappings.get(
      this.player.FSMInfo.CurrentStatetId
    );
    const nextStateId = stateMappings?.GetMapping(gameEventId);

    if (nextStateId !== undefined) {
      const state = this.states.get(nextStateId);
      return state;
    }

    return undefined;
  }

  private GetDefaultState(stateId: StateId, w: World): FSMState | undefined {
    const stateMapping = this.stateMappings.get(stateId);

    if (stateMapping === undefined) {
      return undefined;
    }

    const defaultStateConditions = stateMapping.GetDefaults();

    if (defaultStateConditions === undefined) {
      return undefined;
    }

    const defaultConditionsLength = defaultStateConditions.length;

    for (let i = 0; i < defaultConditionsLength; i++) {
      const condition = defaultStateConditions[i];

      const stateId = RunCondition(condition, w, this.player.ID);

      if (stateId !== undefined) {
        return this.states.get(stateId);
      }
    }

    return undefined;
  }

  private changeState(state: FSMState, fsmInfo: FSMInfoComponent): void {
    fsmInfo.SetStateFrameToZero();
    fsmInfo.CurrentState.OnExit(this.player, this.world);
    fsmInfo.SetCurrentState(state);
    fsmInfo.CurrentState.OnEnter(this.player, this.world);
  }

  private updateState(fsmInfo: FSMInfoComponent): void {
    fsmInfo.CurrentState.OnUpdate(this.player, this.world);
    fsmInfo.IncrementStateFrame();
  }

  private IsDefaultFrame(fsmInfo: FSMInfoComponent): boolean {
    const fl = fsmInfo.GetCurrentStateFrameLength();

    if (fl === undefined) {
      return false;
    }

    if (fl === fsmInfo.CurrentStateFrame) {
      return true;
    }

    return false;
  }
}
