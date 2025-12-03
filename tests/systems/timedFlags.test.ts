import { DefaultCharacterConfig } from '../../game/character/default';
import { Player } from '../../game/engine/entity/playerOrchestrator';
import { TimedFlags } from '../../game/engine/systems/timedFlags';
import { World } from '../../game/engine/world/world';

describe('TimedFlags system tests', () => {
  let p: Player;
  let w: World;

  beforeEach(() => {
    w = new World();
    const pc = new DefaultCharacterConfig();
    const player = new Player(0, pc);
    w.SetPlayer(player);
    p = w.PlayerData.Player(0)!;
  });

  test('hit pause frames are decremented', () => {
    p.Flags.SetHitPauseFrames(10);
    TimedFlags(w.PlayerData);
    expect(p.Flags.IsInHitPause).toBe(true);
    expect(p.Flags['hitPauseFrames']).toBe(9);
  });

  test('intangibility frames are decremented', () => {
    p.Flags.SetIntangabilityFrames(10);
    TimedFlags(w.PlayerData);
    expect(p.Flags.IsIntangible).toBe(true);
    expect(p.Flags.GetIntangabilityFrames()).toBe(9);
  });

  test('platform detection disabled frames are decremented', () => {
    p.Flags.SetDisablePlatFrames(10);
    TimedFlags(w.PlayerData);
    expect(p.Flags.IsPlatDetectDisabled).toBe(true);
    expect(p.Flags['disablePlatformDetection']).toBe(9);
  });

  test('flags are not decremented when they are zero', () => {
    p.Flags.SetHitPauseFrames(0);
    p.Flags.SetIntangabilityFrames(0);
    p.Flags.SetDisablePlatFrames(0);
    TimedFlags(w.PlayerData);
    expect(p.Flags.IsInHitPause).toBe(false);
    expect(p.Flags.IsIntangible).toBe(false);
    expect(p.Flags.IsPlatDetectDisabled).toBe(false);
  });
});
