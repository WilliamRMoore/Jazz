import { DefaultCharacterConfig } from '../../game/character/default';
import { InputStoreLocal } from '../../game/engine/engine-state-management/Managers';
import { Player } from '../../game/engine/entity/playerOrchestrator';
import { FSMStates } from '../../game/engine/finite-state-machine/PlayerStates';
import {
  JumpSquat,
  NeutralFall,
} from '../../game/engine/finite-state-machine/stateConfigurations/states';
import { Flags } from '../../game/engine/systems/flags';
import { World } from '../../game/engine/world/world';
import { InputAction, NewInputAction } from '../../game/input/Input';

describe('TimedFlags system tests', () => {
  let p: Player;
  let w: World;
  let inputStore: InputStoreLocal<InputAction>;

  beforeEach(() => {
    w = new World();
    const pc = new DefaultCharacterConfig();
    const player = new Player(0, pc);
    w.SetPlayer(player);
    p = w.PlayerData.Player(0)!;
    inputStore = w.PlayerData.InputStore(0);
  });

  test('hit pause frames are decremented', () => {
    p.Flags.SetHitPauseFrames(10);
    Flags(w);
    expect(p.Flags.IsInHitPause).toBe(true);
    expect(p.Flags['hitPauseFrames']).toBe(9);
  });

  test('intangibility frames are decremented', () => {
    p.Flags.SetIntangabilityFrames(10);
    Flags(w);
    expect(p.Flags.IsIntangible).toBe(true);
    expect(p.Flags.GetIntangabilityFrames()).toBe(9);
  });

  test('platform detection disabled frames are decremented', () => {
    p.Flags.SetDisablePlatFrames(10);
    Flags(w);
    expect(p.Flags.IsPlatDetectDisabled).toBe(true);
    expect(p.Flags['disablePlatformDetection']).toBe(9);
  });

  test('resets shield jump when trigger is realeased', () => {
    p.Flags.JumpFromShield();
    p.FSMInfo.SetCurrentState(JumpSquat);
    const Ia = NewInputAction();
    Ia.LTVal.SetFromNumber(1);
    inputStore.StoreInputForFrame(w.LocalFrame, Ia);
    p.Flags.JumpFromShield();
    w.LocalFrame++;
    const release = NewInputAction();
    Ia.LTVal.SetFromNumber(0);
    inputStore.StoreInputForFrame(w.LocalFrame, release);
    Flags(w);
    expect(p.Flags.JumpedFromShield).toBe(false);
  });

  test('Shield jump remains on when trigger is held and in relevant state', () => {
    p.Flags.JumpFromShield();
    p.FSMInfo.SetCurrentState(JumpSquat);
    const Ia = NewInputAction();
    Ia.LTVal.SetFromNumber(1);
    inputStore.StoreInputForFrame(w.LocalFrame, Ia);
    p.Flags.JumpFromShield();
    w.LocalFrame++;
    const release = NewInputAction();
    release.LTVal.SetFromNumber(1);
    inputStore.StoreInputForFrame(w.LocalFrame, release);
    Flags(w);
    expect(p.Flags.JumpedFromShield).toBe(true);
  });

  test('Shield jump resetss when in irrelevent state, even if trigger is held', () => {
    p.Flags.JumpFromShield();
    p.FSMInfo.SetCurrentState(JumpSquat);
    const Ia = NewInputAction();
    Ia.LTVal.SetFromNumber(1);
    inputStore.StoreInputForFrame(w.LocalFrame, Ia);
    p.Flags.JumpFromShield();
    w.LocalFrame++;
    const release = NewInputAction();
    Ia.LTVal.SetFromNumber(1);
    inputStore.StoreInputForFrame(w.LocalFrame, release);
    p.FSMInfo.SetCurrentState(NeutralFall);
    Flags(w);
    expect(p.Flags.JumpedFromShield).toBe(false);
  });

  test('flags are not decremented when they are zero', () => {
    p.Flags.SetHitPauseFrames(0);
    p.Flags.SetIntangabilityFrames(0);
    p.Flags.SetDisablePlatFrames(0);
    Flags(w);
    expect(p.Flags.IsInHitPause).toBe(false);
    expect(p.Flags.IsIntangible).toBe(false);
    expect(p.Flags.IsPlatDetectDisabled).toBe(false);
  });
});
