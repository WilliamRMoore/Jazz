import { DefaultCharacterConfig } from '../../game/character/default';
import { ComponentHistory } from '../../game/engine/entity/componentHistory';
import {
  Player,
  SetPlayerInitialPositionRaw,
} from '../../game/engine/entity/playerOrchestrator';
import { StateMachine } from '../../game/engine/finite-state-machine/PlayerStateMachine';
import {
  GAME_EVENT_IDS,
  STATE_IDS,
} from '../../game/engine/finite-state-machine/stateConfigurations/shared';
import {
  IInputStore,
  InputStore,
} from '../../game/engine/managers/inputManager';
import { NumberToRaw } from '../../game/engine/math/fixedPoint';
import { PlayerGrabs } from '../../game/engine/systems/grab';
import { World } from '../../game/engine/world/world';
import { InputAction, NewInputAction } from '../../game/engine/input/Input';

describe('Grab SystemTests', () => {
  let w: World;
  let p1: Player;
  let p2: Player;
  let p1Sm: StateMachine;
  let p2Sm: StateMachine;
  let p1InputStore: IInputStore;
  let p2InputStore: IInputStore;
  let h1: ComponentHistory;
  let h2: ComponentHistory;

  beforeEach(() => {
    const defaultCharConfig = new DefaultCharacterConfig();
    w = new World();
    p1 = new Player(0, defaultCharConfig);
    p2 = new Player(1, defaultCharConfig);
    w.SetPlayer(p1);
    w.SetPlayer(p2);
    p1Sm = w.PlayerData.StateMachine(0);
    p2Sm = w.PlayerData.StateMachine(1);
    p1InputStore = w.PlayerData.InputStore(0);
    p2InputStore = w.PlayerData.InputStore(1);
    h1 = w.HistoryData.PlayerComponentHistories[0];
    h2 = w.HistoryData.PlayerComponentHistories[1];
  });

  test('Player should transition to grab', () => {
    SetPlayerInitialPositionRaw(p1, NumberToRaw(1000), NumberToRaw(650));
    p1Sm.ForceState(STATE_IDS.IDLE_S);
    const p1IA = NewInputAction();
    p1IA.Action = GAME_EVENT_IDS.GRAB_GE;
    p1InputStore.StoreInputForFrame(w.LocalFrame, p1IA);
    p1Sm.UpdateFromInput(p1IA, w);
    expect(p1.FSMInfo.CurrentStatetId).toBe(STATE_IDS.GRAB_S);
  });

  test('Player should grab another player', () => {
    SetPlayerInitialPositionRaw(p1, NumberToRaw(1000), NumberToRaw(650));
    SetPlayerInitialPositionRaw(p2, NumberToRaw(1050), NumberToRaw(650));
    p1Sm.ForceState(STATE_IDS.GRAB_S);
    p2Sm.ForceState(STATE_IDS.IDLE_S);
    p1.Flags.FaceRight();
    p2.Flags.FaceRight();

    for (let frame = 0; frame < 6; frame++) {
      const ia = NewInputAction();
      p1InputStore.StoreInputForFrame(frame, ia);
      p2InputStore.StoreInputForFrame(frame, ia);
      p1Sm.UpdateFromInput(ia, w);
      p2Sm.UpdateFromInput(ia, w);
      h1.PositionHistory[frame] =
        (w.LocalFrame + frame, p1.Position.SnapShot());
      h2.PositionHistory[frame] =
        (w.LocalFrame + frame, p2.Position.SnapShot());
      w.LocalFrame++;
    }

    PlayerGrabs(w);

    expect(p1.FSMInfo.CurrentStatetId).toBe(STATE_IDS.GRAB_HOLD_S);
    expect(p2.FSMInfo.CurrentStatetId).toBe(STATE_IDS.GRAB_HELD_S);
    expect(p2.GrabMeter.HoldingPlayerId).toBe(p1.ID);
    expect(p2.Flags.IsFacingLeft).toBe(true);
  });
});
