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
import { NumberToRaw, RawToNumber } from '../../game/engine/math/fixedPoint';
import { GrabMeter } from '../../game/engine/systems/grabMeter';
import { World } from '../../game/engine/world/world';
import { InputAction, NewInputAction } from '../../game/engine/input/Input';

describe('GrabMeter system tests', () => {
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
    SetPlayerInitialPositionRaw(p1, NumberToRaw(1000), NumberToRaw(650));
    SetPlayerInitialPositionRaw(p2, NumberToRaw(1050), NumberToRaw(650));
    p2.Flags.FaceLeft();
    p1Sm.ForceState(STATE_IDS.GRAB_HOLD_S);
    p2Sm.ForceState(STATE_IDS.GRAB_HELD_S);
    p2.GrabMeter.SetHoldingPlayerId(p1.ID);
  });

  test('grabMeterShould decay over time when held', () => {
    const p1IAia = NewInputAction();
    const p2IA = NewInputAction();
    p1InputStore.StoreInputForFrame(w.LocalFrame, p1IAia);
    p2InputStore.StoreInputForFrame(w.LocalFrame, p2IA);
    const initialMeter = p2.GrabMeter.Meter.Raw;

    GrabMeter(w);

    const postMeter = p2.GrabMeter.Meter.Raw;

    expect(postMeter).toBeGreaterThan(initialMeter);
  });

  test('grabMeterShould decay faster with different actions', () => {
    const p1IA1 = NewInputAction();
    const p1IA2 = NewInputAction();
    const p2IA1 = NewInputAction();
    const p2IA2 = NewInputAction();
    p2IA2.Action = GAME_EVENT_IDS.JUMP_GE;
    p1InputStore.StoreInputForFrame(w.LocalFrame, p1IA1);
    p1InputStore.StoreInputForFrame(w.LocalFrame + 1, p1IA2);
    p2InputStore.StoreInputForFrame(w.LocalFrame, p2IA1);
    p2InputStore.StoreInputForFrame(w.LocalFrame + 1, p2IA2);
    w.LocalFrame++;
    const initialMeter = p2.GrabMeter.Meter.Raw;

    GrabMeter(w);

    const postMeter = p2.GrabMeter.Meter.Raw;

    expect(postMeter).toBeGreaterThan(initialMeter);

    const diff = RawToNumber(postMeter - initialMeter);
    expect(diff).toBeCloseTo(2.5);
  });

  test('grabMeterShould decay faster with different stick directions', () => {
    const p1IA1 = NewInputAction();
    const p1IA2 = NewInputAction();
    const p2IA1 = NewInputAction();
    const p2IA2 = NewInputAction();
    p2IA2.LXAxis.SetFromNumber(1);
    p2IA2.LYAxis.SetFromNumber(1);
    p2IA2.RXAxis.SetFromNumber(1);
    p2IA2.RYAxis.SetFromNumber(1);
    p1InputStore.StoreInputForFrame(w.LocalFrame, p1IA1);
    p1InputStore.StoreInputForFrame(w.LocalFrame + 1, p1IA2);
    p2InputStore.StoreInputForFrame(w.LocalFrame, p2IA1);
    p2InputStore.StoreInputForFrame(w.LocalFrame + 1, p2IA2);
    w.LocalFrame++;
    const initialMeter = p2.GrabMeter.Meter.Raw;

    GrabMeter(w);

    const postMeter = p2.GrabMeter.Meter.Raw;

    expect(postMeter).toBeGreaterThan(initialMeter);

    const diff = RawToNumber(postMeter - initialMeter);
    expect(diff).toBeCloseTo(2);
  });

  test('grabMeterShould trigger escape when full', () => {
    p2.GrabMeter.Meter.SetFromNumber(59);
    const p1IA = NewInputAction();
    const p2IA = NewInputAction();
    p1InputStore.StoreInputForFrame(w.LocalFrame, p1IA);
    p2InputStore.StoreInputForFrame(w.LocalFrame, p2IA);
    GrabMeter(w);
    expect(p2.FSMInfo.CurrentStatetId).toBe(STATE_IDS.GRAB_ESCAPE_S);
  });

  test('damage should create higher max meter', () => {
    p2.Damage.Damage.SetFromNumber(1);
    p2.GrabMeter.Meter.SetFromNumber(59);
    const p1IA = NewInputAction();
    const p2IA = NewInputAction();
    p1InputStore.StoreInputForFrame(w.LocalFrame, p1IA);
    p2InputStore.StoreInputForFrame(w.LocalFrame, p2IA);
    GrabMeter(w);
    expect(p2.FSMInfo.CurrentStatetId).toBe(STATE_IDS.GRAB_HELD_S);
  });
});
