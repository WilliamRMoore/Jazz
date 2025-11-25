import { DefaultCharacterConfig } from '../../game/character/default';
import { defaultStage } from '../../game/engine/stage/stageMain';
import { Player } from '../../game/engine/player/playerOrchestrator';
import { PlayerShields } from '../../game/engine/systems/shield';
import { World } from '../../game/engine/world/world';
import { NewInputAction } from '../../game/input/Input';

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
    p.Shield.CurrentRadius.SetFromNumber(100);
    p.Shield.InitialRadius.SetFromNumber(100);
  });

  test('Shield shrinks when trigger is held', () => {
    p.Shield.Active = true;
    const initialShieldValue = p.Shield.CurrentRadius.Raw;
    const input = NewInputAction();
    input.LTVal.SetFromNumber(1); // 1 is max trigger value
    w.PlayerData.InputStore(0).StoreInputForFrame(localFrame, input);

    PlayerShields(w.PlayerData, localFrame);

    expect(p.Shield.CurrentRadius.Raw).toBeLessThan(initialShieldValue);
  });

  test('Shield grows when not active', () => {
    p.Shield.Active = false;
    // Set shield to less than initial radius to allow it to grow
    p.Shield.CurrentRadius.SetFromNumber(50);
    const initialShieldValue = p.Shield.CurrentRadius.Raw;

    PlayerShields(w.PlayerData, localFrame);

    expect(p.Shield.CurrentRadius.Raw).toBeGreaterThan(initialShieldValue);
  });

  test('Shield does not grow past initial radius', () => {
    p.Shield.Active = false;
    p.Shield.CurrentRadius.SetFromNumber(99);

    // Grow for a few frames
    for (let i = 0; i < 10; i++) {
      PlayerShields(w.PlayerData, localFrame);
    }

    expect(p.Shield.CurrentRadius.Raw).toBe(p.Shield.InitialRadius.Raw);
  });

  test('Shield does not shrink or grow when active and no trigger is held', () => {
    p.Shield.Active = true;
    p.Shield.CurrentRadius.SetFromNumber(50);
    const initialShieldValue = p.Shield.CurrentRadius.Raw;
    const input = NewInputAction();
    input.LTVal.SetFromNumber(0);
    w.PlayerData.InputStore(0).StoreInputForFrame(localFrame, input);

    PlayerShields(w.PlayerData, localFrame);

    // It will shrink by 0, so it should be equal
    expect(p.Shield.CurrentRadius.Raw).toBe(initialShieldValue);
  });

  test('Shield shrinks proportionally to trigger value', () => {
    p.Shield.Active = true;
    const initialShieldValue = p.Shield.CurrentRadius.Raw;

    const input1 = NewInputAction();
    input1.LTVal.SetFromNumber(0.5);
    w.PlayerData.InputStore(0).StoreInputForFrame(localFrame, input1);
    PlayerShields(w.PlayerData, localFrame);
    const shieldValue1 = p.Shield.CurrentRadius.Raw;
    const shrinkAmount1 = initialShieldValue - shieldValue1;

    // Reset shield for next part of test
    p.Shield.CurrentRadius.SetFromRaw(initialShieldValue);

    const input2 = NewInputAction();
    input2.LTVal.SetFromNumber(1);
    w.PlayerData.InputStore(0).StoreInputForFrame(localFrame, input2);
    PlayerShields(w.PlayerData, localFrame);
    const shieldValue2 = p.Shield.CurrentRadius.Raw;
    const shrinkAmount2 = initialShieldValue - shieldValue2;

    expect(shrinkAmount2).toBeGreaterThan(shrinkAmount1);
  });

  test('Shield uses the higher of the two trigger values', () => {
    p.Shield.Active = true;
    const initialShieldValue = p.Shield.CurrentRadius.Raw;

    const input1 = NewInputAction();
    input1.LTVal.SetFromNumber(0.8);
    input1.RTVal.SetFromNumber(0.4);
    w.PlayerData.InputStore(0).StoreInputForFrame(localFrame, input1);
    PlayerShields(w.PlayerData, localFrame);
    const shrinkAmount1 = initialShieldValue - p.Shield.CurrentRadius.Raw;

    // Reset shield for next part of test
    p.Shield.CurrentRadius.SetFromRaw(initialShieldValue);

    const input2 = NewInputAction();
    input2.LTVal.SetFromNumber(0.4);
    input2.RTVal.SetFromNumber(0.8);
    w.PlayerData.InputStore(0).StoreInputForFrame(localFrame, input2);
    PlayerShields(w.PlayerData, localFrame);
    const shrinkAmount2 = initialShieldValue - p.Shield.CurrentRadius.Raw;

    expect(shrinkAmount1).toBe(shrinkAmount2);
  });

  test('Shield does not go below zero', () => {
    p.Shield.Active = true;
    p.Shield.CurrentRadius.SetFromNumber(0.1);
    const input = NewInputAction();
    input.LTVal.SetFromNumber(1);
    w.PlayerData.InputStore(0).StoreInputForFrame(localFrame, input);

    PlayerShields(w.PlayerData, localFrame);

    expect(p.Shield.CurrentRadius.Raw).toBe(0);
  });
});
