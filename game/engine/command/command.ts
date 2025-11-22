import { Player } from '../player/playerOrchestrator';
import { World } from '../world/world';
import { ActivatePlayerSensor } from './commands/activateSensor';
import { DeactivatePlayerSensor } from './commands/deactivateSensor';
import { SetJumpCount } from './commands/setJumpCount';
import { SetPlayerSensorReactor } from './commands/setPlayerSensorReactor';
import { SetPlayerVelocity } from './commands/setPlayerVelocity';
import { SwicthPlayerState } from './commands/switchPlayerState';

export type Command = {
  commandName: string;
  payload: any;
};

class CommandNames {
  public readonly PLAYER_SWITCH_STATE = 'PL_SWICTH_STATE';
  public readonly SENSOR_ACTIVATE = 'PL_SENSE_ACTIVATE';
  public readonly SENSOR_DEACTIVATE = 'PL_SENSE_DEACTIVATE';
  public readonly SET_SENSOR_REACT_COMMAND = 'PL_SET_SENSOR_DETECT_COMMAND';
  public readonly VELOCITY_SET = 'PL_SET_VELOCITY';
  public readonly SET_JUMP_COUNT = 'PL_SET_JUMP_COUNT';
}

export const COMMAND_NAMES = new CommandNames();

export function HandleCommand(w: World, p: Player, c: Command) {
  switch (c.commandName) {
    case COMMAND_NAMES.PLAYER_SWITCH_STATE:
      SwicthPlayerState(w, p, c);
      break;
    case COMMAND_NAMES.SENSOR_ACTIVATE:
      ActivatePlayerSensor(p, c);
      break;
    case COMMAND_NAMES.SENSOR_DEACTIVATE:
      DeactivatePlayerSensor(p);
      break;
    case COMMAND_NAMES.SET_SENSOR_REACT_COMMAND:
      SetPlayerSensorReactor(p, c);
      break;
    case COMMAND_NAMES.VELOCITY_SET:
      SetPlayerVelocity(p, c);
      break;
    case COMMAND_NAMES.SET_JUMP_COUNT:
      SetJumpCount(p, c);
      break;
  }
}
