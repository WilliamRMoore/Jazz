import { DefaultCharacterConfig } from '../../game/character/default';
import { defaultStage } from '../../game/engine/stage/stageMain';
import { Player } from '../../game/engine/entity/playerOrchestrator';
import { ShieldRegen } from '../../game/engine/systems/shieldRegen';
import { World } from '../../game/engine/world/world';
import { NewInputAction } from '../../game/input/Input';
import {
  GAME_EVENT_IDS,
  STATE_IDS,
} from '../../game/engine/finite-state-machine/stateConfigurations/shared';

describe('Shield system tests', () => {
  let p: Player;
  let w: World;
  let localFrame: number;

  beforeEach(() => {
    w = new World();
    const stage = defaultStage();
    w.SetStage(stage);
    const pc = new DefaultCharacterConfig();
    const player = new Player(0, pc);
    w.SetPlayer(player);
    p = w.PlayerData.Player(0)!;
    localFrame = 0;
    // Set a known initial radius for predictable testing
    p.Shield.PreModeCurrentRadius.SetFromNumber(100);
    p.Shield.InitialRadius.SetFromNumber(100);
  });

  test('Shield shrinks when trigger is held', () => {
    p.Shield.Active = true;
    const initialShieldValue = p.Shield.PreModeCurrentRadius.Raw;
    const input = NewInputAction();
    input.Action = GAME_EVENT_IDS.GUARD_GE;
    input.LTVal.SetFromNumber(1); // 1 is max trigger value
    w.PlayerData.InputStore(0).StoreInputForFrame(localFrame, input);
    const sm = w.PlayerData.StateMachine(0)!;
    sm.ForceState(STATE_IDS.SHIELD_S);
    sm.UpdateFromInput(input, w);

    expect(p.Shield.PreModeCurrentRadius.Raw).toBeLessThan(initialShieldValue);
  });

  test('Shield grows when not active', () => {
    p.Shield.Active = false;
    // Set shield to less than initial radius to allow it to grow
    p.Shield.PreModeCurrentRadius.SetFromNumber(50);
    const initialShieldValue = p.Shield.PreModeCurrentRadius.Raw;

    ShieldRegen(w);

    expect(p.Shield.PreModeCurrentRadius.Raw).toBeGreaterThan(
      initialShieldValue,
    );
  });

  test('Shield does not grow past initial radius', () => {
    p.Shield.Active = false;
    p.Shield.PreModeCurrentRadius.SetFromNumber(99);

    // Grow for a few frames
    for (let i = 0; i < 10; i++) {
      ShieldRegen(w);
    }

    expect(p.Shield.PreModeCurrentRadius.Raw).toBe(p.Shield.InitialRadius.Raw);
  });

  test('Shield shrinks proportionally to trigger value', () => {
    const initialShieldValue = p.Shield.InitialRadius.Raw;
    const sm = w.PlayerData.StateMachine(0)!;
    sm.ForceState(STATE_IDS.SHIELD_S);

    const input1 = NewInputAction();
    input1.Action = GAME_EVENT_IDS.GUARD_GE;
    input1.LTVal.SetFromNumber(0.5);
    w.PlayerData.InputStore(0).StoreInputForFrame(localFrame, input1);
    sm.UpdateFromInput(input1, w);
    const shieldValue1 = p.Shield.PreModeCurrentRadius.Raw;
    const shrinkAmount1 = initialShieldValue - shieldValue1;

    // Reset shield for next part of test
    p.Shield.PreModeCurrentRadius.SetFromRaw(initialShieldValue);
    p.FSMInfo.SetStateFrameToZero();

    const input2 = NewInputAction();
    input2.Action = GAME_EVENT_IDS.GUARD_GE;
    input2.LTVal.SetFromNumber(1);
    w.PlayerData.InputStore(0).StoreInputForFrame(localFrame, input2);
    sm.UpdateFromInput(input2, w);
    const shieldValue2 = p.Shield.PreModeCurrentRadius.Raw;
    const shrinkAmount2 = initialShieldValue - shieldValue2;

    expect(shrinkAmount2).toBeGreaterThan(shrinkAmount1);
  });

  test('Shield uses the higher of the two trigger values', () => {
    p.Shield.Active = true;
    const initialShieldValue = p.Shield.PreModeCurrentRadius.Raw;

    const input1 = NewInputAction();
    input1.Action = GAME_EVENT_IDS.GUARD_GE;
    input1.LTVal.SetFromNumber(0.8);
    input1.RTVal.SetFromNumber(0.4);
    w.PlayerData.InputStore(0).StoreInputForFrame(localFrame, input1);
    //SheildRegen(w);
    const sm = w.PlayerData.StateMachine(0)!;
    sm.ForceState(STATE_IDS.SHIELD_S);
    sm.UpdateFromInput(input1, w);
    const shrinkAmount1 =
      initialShieldValue - p.Shield.PreModeCurrentRadius.Raw;

    // Reset shield for next part of test
    p.Shield.PreModeCurrentRadius.SetFromRaw(initialShieldValue);
    p.FSMInfo.SetStateFrameToZero();

    const input2 = NewInputAction();
    input2.Action = GAME_EVENT_IDS.GUARD_GE;
    input2.LTVal.SetFromNumber(0.4);
    input2.RTVal.SetFromNumber(0.8);
    w.PlayerData.InputStore(0).StoreInputForFrame(localFrame, input2);
    sm.UpdateFromInput(input2, w);
    const shrinkAmount2 =
      initialShieldValue - p.Shield.PreModeCurrentRadius.Raw;

    expect(shrinkAmount1).toBe(shrinkAmount2);
  });

  test('Shield does not go below zero', () => {
    p.Shield.Active = true;
    p.Shield.PreModeCurrentRadius.SetFromNumber(0.1);
    const input = NewInputAction();
    input.Action = GAME_EVENT_IDS.GUARD_GE;
    input.LTVal.SetFromNumber(1);
    w.PlayerData.InputStore(0).StoreInputForFrame(localFrame, input);

    const sm = w.PlayerData.StateMachine(0)!;
    sm.ForceState(STATE_IDS.SHIELD_S);
    sm.UpdateFromInput(input, w);

    expect(p.Shield.PreModeCurrentRadius.Raw).not.toBeLessThan(0);
    expect(p.Shield.PreModeCurrentRadius.Raw).not.toBeGreaterThan(0);
  });
});
