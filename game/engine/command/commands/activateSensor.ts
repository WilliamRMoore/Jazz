import { NumberToRaw } from '../../math/fixedPoint';
import { Player } from '../../entity/playerOrchestrator';

export type ActivateSensorCommand = {
  commandName: string;
  payload: {
    x: number;
    y: number;
    radius: number;
  };
};

export function ActivatePlayerSensor(p: Player, c: ActivateSensorCommand) {
  const xRaw = NumberToRaw(c.payload.x);
  const yRaw = NumberToRaw(c.payload.y);
  const radiusRaw = NumberToRaw(c.payload.radius);
  p.Sensors.ActivateSensorRaw(xRaw, yRaw, radiusRaw);
}
