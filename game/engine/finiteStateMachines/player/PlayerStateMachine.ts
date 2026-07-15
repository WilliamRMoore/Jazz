import { FSMInfoComponent } from '../../entity/components/fsmInfo';
import { Player } from '../../entity/playerOrchestrator';
import { InputAction } from '../../input/Input';
import { World } from '../../world/world';
import { RunCondition } from './states/conditions/conditions';
import {
  ActionMappings,
  ActionStateMappings,
  FSMStates
} from './PlayerStateCollections';
import { GameEventId, STATE_IDS, StateId } from './states/shared';
import { Idle } from './states';

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
    const state = this.getTranslation(gameEventId);

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
  }

  public UpdateFromInput(inputAction: InputAction, world: World): void {
    const fsmInfo = this.player.FSMInfo;
    // if we have a conditional on the state, check it
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
      .get(fsmInfo.CurrentStateId)!
      .GetConditions();

    // We have no conditionals, return
    if (conditions === undefined) {
      return false;
    }

    const conditionalsLength = conditions.length;
    const playerInput = world.PlayerData.InputStore(
      this.player.ID
    ).GetInputForFrame(world.LocalFrame);
    // Loop through all conditionals, if one returns a stateId, change it and return true, otherwise return false
    for (let i = 0; i < conditionalsLength; i++) {
      const stateId = RunCondition(
        conditions[i],
        world,
        this.player,
        playerInput
      );

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
    const state = this.getTranslation(inputAction.Action);

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
    if (!this.isDefaultFrame(fsmInfo)) {
      return false;
    }

    const defaultTransition = this.getDefaultState(
      this.player.FSMInfo.CurrentStateId,
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

  private getTranslation(gameEventId: GameEventId): FSMState | undefined {
    const stateMappings = this.stateMappings.get(
      this.player.FSMInfo.CurrentStateId
    );

    const nextStateId = stateMappings?.GetMapping(gameEventId);

    if (nextStateId !== undefined) {
      const state = this.states.get(nextStateId);
      return state;
    }

    return undefined;
  }

  private getDefaultState(stateId: StateId, w: World): FSMState | undefined {
    const stateMapping = this.stateMappings.get(stateId);

    if (stateMapping === undefined) {
      return undefined;
    }

    const defaultStateConditions = stateMapping.GetDefaults();

    if (defaultStateConditions === undefined) {
      return undefined;
    }

    const defaultConditionsLength = defaultStateConditions.length;
    const playerInput = w.PlayerData.InputStore(
      this.player.ID
    ).GetInputForFrame(w.LocalFrame);

    for (let i = 0; i < defaultConditionsLength; i++) {
      const condition = defaultStateConditions[i];

      const stateId = RunCondition(condition, w, this.player, playerInput);

      if (stateId !== undefined) {
        return this.states.get(stateId);
      }
    }

    return undefined;
  }

  private changeState(state: FSMState, fsmInfo: FSMInfoComponent): void {
    fsmInfo.CurrentState.OnExit(this.player, this.world);
    this.player.ECB.ResetECBShape();
    fsmInfo.SetCurrentState(state);

    if (this.stateMappings.get(state.StateId) === undefined) {
      console.error('No state mapping found for state id: ', state.StateId);
      console.log(JSON.stringify(STATE_IDS));
    }

    fsmInfo.SetStateFrameToZero();
    this.player.ECB.SetECBTrack(fsmInfo.CurrentState.StateId);
    fsmInfo.CurrentState.OnEnter(this.player, this.world);
  }

  private updateState(fsmInfo: FSMInfoComponent): void {
    fsmInfo.CurrentState.OnUpdate(this.player, this.world);
    fsmInfo.IncrementStateFrame();
  }

  private isDefaultFrame(fsmInfo: FSMInfoComponent): boolean {
    const fl = fsmInfo.GetCurrentStateFrameLength();
    if (fl === undefined || fl !== fsmInfo.CurrentStateFrame) {
      return false;
    }
    return true;
  }
}
