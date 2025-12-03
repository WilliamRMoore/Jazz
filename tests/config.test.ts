import { DefaultCharacterConfig } from '../game/character/default';
import { COMMAND_NAMES } from '../game/engine/command/command';
import { SetPlayerSensorDetectCommand } from '../game/engine/command/commands/setPlayerSensorReactor';
import { SetVelocityCommand } from '../game/engine/command/commands/setPlayerVelocity';
import { SwitchPlayerStateCommand } from '../game/engine/command/commands/switchPlayerState';
import {
  ATTACK_IDS,
  GAME_EVENT_IDS,
  STATE_IDS,
} from '../game/engine/finite-state-machine/stateConfigurations/shared';

describe('DefaultCharacterConfig', () => {
  let config: DefaultCharacterConfig;

  beforeAll(() => {
    // We only need to create the config once for these tests
    config = new DefaultCharacterConfig();
  });

  test('should initialize with the correct base character properties', () => {
    expect(config.Weight).toBe(110);
    expect(config.JumpVelocity).toBe(20);
    expect(config.NumberOfJumps).toBe(2);
    expect(config.ShieldRadius).toBe(75);
    expect(config.ShieldYOffset).toBe(-50);
    expect(config.ECBHeight).toBe(100);
    expect(config.ECBWidth).toBe(100);
  });

  test('should have the correct frame lengths for specific states', () => {
    expect(config.FrameLengths.get(STATE_IDS.JUMP_SQUAT_S)).toBe(4);
    expect(config.FrameLengths.get(STATE_IDS.DASH_S)).toBe(20);
    expect(config.FrameLengths.get(STATE_IDS.AIR_DODGE_S)).toBe(22);
    expect(config.FrameLengths.get(STATE_IDS.LAND_S)).toBe(11);
  });

  test('neutralAtk should have thses settings', () => {
    const nAtk = config.Attacks.get(ATTACK_IDS.N_GRND_ATK);
    expect(nAtk?.BaseKnockBack).toBe(15);
    expect(nAtk?.KnockBackScaling).toBe(54);
    expect(nAtk?.TotalFrameLength).toBe(18);
    const hb1Offsets = nAtk?.HitBubbles[0].frameOffsets.get(3);
    expect(hb1Offsets?.x).toBe(30);
    expect(hb1Offsets?.y).toBe(-50);
  });

  test('Side special should have thses settings', () => {
    const sideSpecial = config.Attacks.get(ATTACK_IDS.S_SPCL_ATK);
    const setVelCommand = sideSpecial?.onEnterCommands.find(
      (c) => c.commandName == COMMAND_NAMES.VELOCITY_SET
    )! as SetVelocityCommand;
    const payLoad = setVelCommand.payload;
    expect(payLoad.x).toBe(0);
    expect(payLoad.y).toBe(0);

    const c = sideSpecial?.onEnterCommands.find(
      (c) => c.commandName == COMMAND_NAMES.SET_SENSOR_REACT_COMMAND
    )! as SetPlayerSensorDetectCommand;
    const cPayload = c.payload as SwitchPlayerStateCommand;
    const ge = cPayload.payload;

    expect(ge).toBe(GAME_EVENT_IDS.SIDE_SPCL_EX_GE);
  });

  test('upTilt should have the correct properties', () => {
    const upTilt = config.Attacks.get(ATTACK_IDS.U_TILT_ATK);

    expect(upTilt).toBeDefined();
    if (!upTilt) {
      return;
    }

    expect(upTilt.AttackId).toBe(ATTACK_IDS.U_TILT_ATK);
    expect(upTilt.TotalFrameLength).toBe(60);
    expect(upTilt.BaseKnockBack).toBe(30);
    expect(upTilt.KnockBackScaling).toBe(45);
    expect(upTilt.GravityActive).toBe(true);

    expect(upTilt.HitBubbles.length).toBe(2);

    const hitBubble1 = upTilt.HitBubbles[0];
    expect(hitBubble1.Damage).toBe(16);
    expect(hitBubble1.Radius).toBe(30);
    expect(hitBubble1.LaunchAngle).toBe(65);

    const hitBubble2 = upTilt.HitBubbles[1];
    expect(hitBubble2.Damage).toBe(32);
    expect(hitBubble2.Radius).toBe(50);
    expect(hitBubble2.LaunchAngle).toBe(65);

    const hitBubble2Offsets = hitBubble2.frameOffsets;
    expect(hitBubble2Offsets.size).toBe(2);
    expect(hitBubble2Offsets.has(59)).toBe(true);
    expect(hitBubble2Offsets.has(60)).toBe(true);

    const offset59 = hitBubble2Offsets.get(59);
    expect(offset59?.x).toBe(110);
    expect(offset59?.y).toBe(-40);

    const offset60 = hitBubble2Offsets.get(60);
    expect(offset60?.x).toBe(110);
    expect(offset60?.y).toBe(-40);
  });

  test('sideTilt should have the correct properties', () => {
    const sideTilt = config.Attacks.get(ATTACK_IDS.S_TILT_ATK);

    expect(sideTilt).toBeDefined();
    if (!sideTilt) {
      return;
    }

    expect(sideTilt.AttackId).toBe(ATTACK_IDS.S_TILT_ATK);
    expect(sideTilt.TotalFrameLength).toBe(33);
    expect(sideTilt.BaseKnockBack).toBe(20);
    expect(sideTilt.KnockBackScaling).toBe(30);
    expect(sideTilt.GravityActive).toBe(true);

    expect(sideTilt.HitBubbles.length).toBe(3);

    const hitBubble1 = sideTilt.HitBubbles[0];
    expect(hitBubble1.Damage).toBe(12);
    expect(hitBubble1.Radius).toBe(27);
    expect(hitBubble1.LaunchAngle).toBe(40);
    expect(hitBubble1.frameOffsets.size).toBe(6);
    expect(hitBubble1.frameOffsets.get(9)?.x).toBe(100);
    expect(hitBubble1.frameOffsets.get(9)?.y).toBe(-40);

    const hitBubble2 = sideTilt.HitBubbles[1];
    expect(hitBubble2.Damage).toBe(11);
    expect(hitBubble2.Radius).toBe(25);
    expect(hitBubble2.LaunchAngle).toBe(40);
    expect(hitBubble2.frameOffsets.size).toBe(6);
    expect(hitBubble2.frameOffsets.get(10)?.x).toBe(60);
    expect(hitBubble2.frameOffsets.get(10)?.y).toBe(-40);

    const hitBubble3 = sideTilt.HitBubbles[2];
    expect(hitBubble3.Damage).toBe(10);
    expect(hitBubble3.Radius).toBe(23);
    expect(hitBubble3.LaunchAngle).toBe(40);
    expect(hitBubble3.frameOffsets.size).toBe(6);
    expect(hitBubble3.frameOffsets.get(11)?.x).toBe(10);
    expect(hitBubble3.frameOffsets.get(11)?.y).toBe(-40);
  });

  test('sideTiltUp should have the correct properties', () => {
    const sideTiltUp = config.Attacks.get(ATTACK_IDS.S_TILT_U_ATK);

    expect(sideTiltUp).toBeDefined();
    if (!sideTiltUp) {
      return;
    }

    expect(sideTiltUp.AttackId).toBe(ATTACK_IDS.S_TILT_U_ATK);
    expect(sideTiltUp.TotalFrameLength).toBe(33);
    expect(sideTiltUp.BaseKnockBack).toBe(20);
    expect(sideTiltUp.KnockBackScaling).toBe(30);
    expect(sideTiltUp.GravityActive).toBe(true);

    expect(sideTiltUp.HitBubbles.length).toBe(3);

    const hitBubble1 = sideTiltUp.HitBubbles[0];
    expect(hitBubble1.Damage).toBe(12);
    expect(hitBubble1.Radius).toBe(27);
    expect(hitBubble1.LaunchAngle).toBe(40);
    expect(hitBubble1.frameOffsets.size).toBe(6);
    expect(hitBubble1.frameOffsets.get(9)?.x).toBe(100);
    expect(hitBubble1.frameOffsets.get(9)?.y).toBe(-65);

    const hitBubble2 = sideTiltUp.HitBubbles[1];
    expect(hitBubble2.Damage).toBe(11);
    expect(hitBubble2.Radius).toBe(25);
    expect(hitBubble2.LaunchAngle).toBe(40);
    expect(hitBubble2.frameOffsets.size).toBe(6);
    expect(hitBubble2.frameOffsets.get(9)?.x).toBe(60);
    expect(hitBubble2.frameOffsets.get(9)?.y).toBe(-53);

    const hitBubble3 = sideTiltUp.HitBubbles[2];
    expect(hitBubble3.Damage).toBe(10);
    expect(hitBubble3.Radius).toBe(23);
    expect(hitBubble3.LaunchAngle).toBe(40);
    expect(hitBubble3.frameOffsets.size).toBe(6);
    expect(hitBubble3.frameOffsets.get(9)?.x).toBe(10);
    expect(hitBubble3.frameOffsets.get(9)?.y).toBe(-40);
  });
});
