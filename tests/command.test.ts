import { DefaultCharacterConfig } from '../game/character/default';
import { COMMAND_NAMES, HandleCommand } from '../game/engine/command/command';
import { ActivateSensorCommand } from '../game/engine/command/commands/activateSensor';
import { SwitchPlayerStateCommand } from '../game/engine/command/commands/switchPlayerState';
import {
  STATE_IDS,
  GAME_EVENT_IDS,
} from '../game/engine/finite-state-machine/stateConfigurations/shared';

import { Player } from '../game/engine/entity/playerOrchestrator';
import { World } from '../game/engine/world/world';

describe('CommandTests', () => {
  let world: World;
  let player: Player;
  const config = new DefaultCharacterConfig();

  beforeEach(() => {
    world = new World();
    player = new Player(0, config);
    world.SetPlayer(player);
    const stateMachine = world.PlayerData.StateMachine(player.ID);
    stateMachine.SetInitialState(STATE_IDS.IDLE_S);
  });

  test('should switch player state', () => {
    expect(player.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.IDLE_S);

    const switchStateCommand: SwitchPlayerStateCommand = {
      commandName: COMMAND_NAMES.PLAYER_SWITCH_STATE,
      payload: GAME_EVENT_IDS.JUMP_GE,
    };

    HandleCommand(world, player, switchStateCommand);

    expect(player.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.JUMP_SQUAT_S);
  });

  test('should activate player sensor', () => {
    player.Attacks.SetCurrentAttack(GAME_EVENT_IDS.SIDE_SPCL_GE);

    expect(player.Sensors.NumberActive).toBe(0);

    const activateSensorCommand: ActivateSensorCommand = {
      commandName: COMMAND_NAMES.SENSOR_ACTIVATE,
      payload: {
        x: 45,
        y: -15,
        radius: 30,
      },
    };

    HandleCommand(world, player, activateSensorCommand);

    expect(player.Sensors.NumberActive).toBe(1);
    const sensor = player.Sensors.Sensors[0];
    expect(sensor.IsActive).toBe(true);
    expect(sensor.Radius.AsNumber).toBe(30);
    expect(sensor.XOffset.AsNumber).toBe(45);
    expect(sensor.YOffset.AsNumber).toBe(-15);
  });

  test('should deactivate player sensor', () => {
    player.Attacks.SetCurrentAttack(GAME_EVENT_IDS.SIDE_SPCL_GE);

    expect(player.Sensors.NumberActive).toBe(0);

    const activateSensorCommand: ActivateSensorCommand = {
      commandName: COMMAND_NAMES.SENSOR_ACTIVATE,
      payload: {
        x: 45,
        y: -15,
        radius: 30,
      },
    };

    HandleCommand(world, player, activateSensorCommand);

    expect(player.Sensors.NumberActive).toBe(1);
    expect(player.Sensors.Sensors[0].IsActive).toBe(true);

    const deactivateSensorCommand = {
      commandName: COMMAND_NAMES.SENSOR_DEACTIVATE,
      payload: undefined,
    };

    HandleCommand(world, player, deactivateSensorCommand);

    expect(player.Sensors.NumberActive).toBe(0);
    expect(player.Sensors.Sensors[0].IsActive).toBe(false);
  });

  test('should set player sensor reactor', () => {
    expect(player.Sensors.ReactCommand).toBeUndefined();

    const switchStatePayload: SwitchPlayerStateCommand = {
      commandName: COMMAND_NAMES.PLAYER_SWITCH_STATE,
      payload: GAME_EVENT_IDS.SIDE_SPCL_EX_GE,
    };

    const setSensorReactorCommand = {
      commandName: COMMAND_NAMES.SET_SENSOR_REACT_COMMAND,
      payload: switchStatePayload,
    };

    HandleCommand(world, player, setSensorReactorCommand);

    expect(player.Sensors.ReactCommand).toBe(switchStatePayload);
  });

  test('should set player velocity', () => {
    expect(player.Velocity.X.AsNumber).toBe(0);
    expect(player.Velocity.Y.AsNumber).toBe(0);

    const setVelocityCommand = {
      commandName: COMMAND_NAMES.VELOCITY_SET,
      payload: { x: 10, y: 20 },
    };

    HandleCommand(world, player, setVelocityCommand);

    expect(player.Velocity.X.AsNumber).toBe(10);
    expect(player.Velocity.Y.AsNumber).toBe(20);
  });

  test('should set jump count', () => {
    expect(player.Jump.SnapShot()).toBe(0);

    const setJumpCountCommand = {
      commandName: COMMAND_NAMES.SET_JUMP_COUNT,
      payload: 2,
    };

    HandleCommand(world, player, setJumpCountCommand);

    expect(player.Jump.SnapShot()).toBe(2);
  });
});
