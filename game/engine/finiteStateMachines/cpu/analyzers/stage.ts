import { FlatVec } from '../../../physics/vector';
import { Stage } from '../../../stage/stageMain';
import { PlayerCPU } from '../playerCPU';

export const stageCenterRaw = (s: Stage): number => {
  const ground = s.StageVerticies.GetGround();
  if (!ground || ground.length === 0) return 0;
  // Assumes the ground is only 1 line as requested
  const line = ground[0];
  return Math.trunc((line.X1.Raw + line.X2.Raw) / 2);
};

export const nearestEdge = (p: PlayerCPU, s: Stage) => {};
export const distanceToEdge = (p: PlayerCPU, l: FlatVec[]) => {};
export const closestPlatform = (p: PlayerCPU, s: Stage) => {};
