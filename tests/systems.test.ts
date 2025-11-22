import { DefaultCharacterConfig } from '../game/character/default';
import { defaultStage } from '../game/engine/stage/stageMain';
import { Player } from '../game/engine/player/playerOrchestrator';
import { Gravity } from '../game/engine/systems/gravity';
import { World } from '../game/engine/world/world';
import {
  STATE_IDS,
  ATTACK_IDS,
  GAME_EVENT_IDS,
} from '../game/engine/finite-state-machine/playerStates/shared';
import { FixedPoint } from '../game/math/fixedPoint';
import { Attack } from '../game/engine/player/playerComponents';

describe('Systems tests', () => {
  let p: Player;
  let w: World;

  beforeEach(() => {
    w = new World();
    const stage = defaultStage();
    w.SetStage(stage);
    const pc = new DefaultCharacterConfig();
    const player = new Player(0, pc);
    w.SetPlayer(player);
    p = w.PlayerData.Player(0)!;
  });

  test('Gravity is applied when player is in the air', () => {
    // position player in the air
    p.ECB.MoveToPosition(new FixedPoint(0), new FixedPoint(-100));
    const initialVelocityY = p.Velocity.Y.Raw;

    Gravity(w.PlayerData, w.StageData);

    expect(p.Velocity.Y.Raw).toBeGreaterThan(initialVelocityY);
  });

  test('Gravity is not applied when player is on the ground', () => {
    // position player on the ground
    p.ECB.MoveToPosition(new FixedPoint(500), new FixedPoint(650));
    const initialVelocityY = p.Velocity.Y.Raw;

    Gravity(w.PlayerData, w.StageData);

    expect(p.Velocity.Y.Raw).toBe(initialVelocityY);
  });

  test('Gravity is not applied for specific states', () => {
    const states = [
      STATE_IDS.AIR_DODGE_S,
      STATE_IDS.LEDGE_GRAB_S,
      STATE_IDS.HIT_STOP_S,
    ];
    p.ECB.MoveToPosition(new FixedPoint(0), new FixedPoint(-100));

    for (const state of states) {
      p.FSMInfo.SetCurrentState({ StateId: state } as any);
      const initialVelocityY = p.Velocity.Y.Raw;
      Gravity(w.PlayerData, w.StageData);
      expect(p.Velocity.Y.Raw).toBe(initialVelocityY);
    }
  });

  test('Gravity is not applied when in hit pause', () => {
    p.ECB.MoveToPosition(new FixedPoint(0), new FixedPoint(-100));
    p.Flags.SetHitPauseFrames(10);
    const initialVelocityY = p.Velocity.Y.Raw;

    Gravity(w.PlayerData, w.StageData);

    expect(p.Velocity.Y.Raw).toBe(initialVelocityY);
  });

  test('Gravity is not applied when attack has gravity disabled', () => {
    const charConfig = new DefaultCharacterConfig();
    const attackConf = charConfig.attacks.get(ATTACK_IDS.N_GRND_ATK);

    if (attackConf) {
      const newAttackConf = { ...attackConf, GravityActive: false };
      const newAttack = new Attack(newAttackConf);

      p.Attacks['_attacks'].set(ATTACK_IDS.N_GRND_ATK, newAttack);
      p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.ATTACK_GE);

      p.ECB.MoveToPosition(new FixedPoint(0), new FixedPoint(-100));
      const initialVelocityY = p.Velocity.Y.Raw;

      Gravity(w.PlayerData, w.StageData);
      expect(p.Velocity.Y.Raw).toBe(initialVelocityY);
    } else {
      throw new Error('Attack config not found');
    }
  });

  test('Gravity is applied with fast falling', () => {
    p.ECB.MoveToPosition(new FixedPoint(0), new FixedPoint(-100));
    p.Flags.FastFallOn();
    const initialVelocityY = p.Velocity.Y.Raw;

    Gravity(w.PlayerData, w.StageData);

    const expectedVel = initialVelocityY + p.Speeds.Gravity.Raw * 2;
    // use toBeCloseTo because of fixed point arithmetic
    expect(p.Velocity.Y.Raw).toBeCloseTo(expectedVel);
  });
});
