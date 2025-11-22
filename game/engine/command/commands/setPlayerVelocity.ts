import { NumberToRaw } from '../../../math/fixedPoint';
import { Player } from '../../player/playerOrchestrator';

export type SetVelocityCommand = {
  commandName: string;
  payload: { x: number; y: number };
};

export function SetPlayerVelocity(p: Player, c: SetVelocityCommand) {
  const xRaw = NumberToRaw(c.payload.x);
  const yRaw = NumberToRaw(c.payload.y);
  p.Velocity.X.SetFromRaw(xRaw);
  p.Velocity.Y.SetFromRaw(yRaw);
}
