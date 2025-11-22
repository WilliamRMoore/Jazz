import { DefaultCharacterConfig } from '../game/character/default';
import { COMMAND_NAMES } from '../game/engine/command/command';
import { SetPlayerSensorDetectCommand } from '../game/engine/command/commands/setPlayerSensorReactor';
import { SetVelcoityCommand } from '../game/engine/command/commands/setPlayerVelocity';
import { SwitchPlayerStateCommand } from '../game/engine/command/commands/switchPlayerState';
import {
  ATTACK_IDS,
  GAME_EVENT_IDS,
  STATE_IDS,
} from '../game/engine/finite-state-machine/PlayerStates';

describe('DefaultCharacterConfig', () => {
  let config: DefaultCharacterConfig;

  beforeAll(() => {
    // We only need to create the config once for these tests
    config = new DefaultCharacterConfig();
  });

  test('should initialize with the correct base character properties', () => {
    expect(config.Weight).toBe(110);
    expect(config.JumpVelocity).toBe(17);
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
    const nAtk = config.attacks.get(ATTACK_IDS.N_GRND_ATK);
    expect(nAtk?.BaseKnockBack).toBe(15);
    expect(nAtk?.KnockBackScaling).toBe(54);
    expect(nAtk?.TotalFrameLength).toBe(18);
    const hb1Offsets = nAtk?.HitBubbles[0].frameOffsets.get(3);
    expect(hb1Offsets?.x).toBe(30);
    expect(hb1Offsets?.y).toBe(-50);
  });

  test('Side special should have thses settings', () => {
    const sideSpecial = config.attacks.get(ATTACK_IDS.S_SPCL_ATK);
    const setVelCommand = sideSpecial?.onEnterCommands.find(
      (c) => c.commandName == COMMAND_NAMES.VELOCITY_SET
    )! as SetVelcoityCommand;
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
});
