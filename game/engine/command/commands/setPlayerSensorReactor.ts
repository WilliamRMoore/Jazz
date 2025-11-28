import { Player } from '../../entity/playerOrchestrator';
import { Command } from '../command';

export type SetPlayerSensorDetectCommand = {
  commandName: string;
  payload: Command;
};

export function SetPlayerSensorReactor(
  p: Player,
  c: SetPlayerSensorDetectCommand
) {
  const newC = c.payload;
  p.Sensors.ReactCommand = newC;
}
