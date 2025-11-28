import { Player } from '../../entity/playerOrchestrator';

export type DeactivateSensorCommand = {
  commandName: string;
  payload: undefined;
};

export function DeactivatePlayerSensor(p: Player) {
  p.Sensors.DeactivateSensors();
}
