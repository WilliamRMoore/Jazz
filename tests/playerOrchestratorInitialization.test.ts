import { DefaultCharacterConfig } from '../game/character/default';
import { COMMAND_NAMES } from '../game/engine/command/command';
import { SetPlayerSensorDetectCommand } from '../game/engine/command/commands/setPlayerSensorReactor';
import { SetVelocityCommand } from '../game/engine/command/commands/setPlayerVelocity';
import { SwitchPlayerStateCommand } from '../game/engine/command/commands/switchPlayerState';
import {
  ATTACK_IDS,
  GAME_EVENT_IDS,
  STATE_IDS,
} from '../game/engine/finite-state-machine/PlayerStates';
import { Player } from '../game/engine/player/playerOrchestrator';

describe('Player Orechstraotr Initialization', () => {
  let config: DefaultCharacterConfig;
  let po: Player;

  beforeAll(() => {
    config = new DefaultCharacterConfig();
    po = new Player(0, config);
  });

  test('Should have weight of 110', () => {
    expect(po.Weight.Weight.AsNumber).toBe(110);
  });

  test('Should have side special configuration', () => {
    const attacks = po.Attacks._attacks;

    const sideSpecial = attacks.get(ATTACK_IDS.S_SPCL_ATK); //config.attacks.get(ATTACK_IDS.S_SPCL_ATK);
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

  test('Should have shape', () => {
    const shapes = po.ECB._ecbShapes;
    const jumpShape = shapes.get(STATE_IDS.JUMP_S)!;
    expect(jumpShape.height.AsNumber).toBe(60);
    expect(jumpShape.width.AsNumber).toBe(70);
    expect(jumpShape.yOffset.AsNumber).toBe(-15);
  });

  test('Should have shield component configured correctly', () => {
    const shield = po.Shield;
    expect(shield.InitialRadius.AsNumber).toBe(75);
    expect(shield.YOffset.AsNumber).toBe(-50);
  });
});
