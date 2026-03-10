// 1 dm unit is 4.63 jazz units
// 1 jazz unit is 0.216 dm units

import {
  Player,
  PlayerOnStage,
  PlayerOnStageOrPlats,
} from '../entity/playerOrchestrator';
import { FixedPoint } from '../math/fixedPoint';
import { HARD_LAND_VELOCITY_RAW } from '../math/numberConstants';
import { FlatVec } from '../physics/vector';
import { Stage } from '../stage/stageMain';

export function ShouldSoftlandRaw(yVelocityRaw: number) {
  return yVelocityRaw < HARD_LAND_VELOCITY_RAW;
}

export function isPlayerOnAnyStage(
  ecbBottom: FlatVec,
  stages: Stage[],
  sensorDepth: FixedPoint,
): boolean {
  const stageLength = stages.length;
  for (let i = 0; i < stageLength; i++) {
    const stage = stages[i];
    if (PlayerOnStage(stage, ecbBottom, sensorDepth)) {
      return true;
    }
  }
  return false;
}

export function isPlayerGroundedAtAll(p: Player, stages: Stage[]): boolean {
  const stageLength = stages.length;
  for (let i = 0; i < stageLength; i++) {
    const stage = stages[i];
    if (PlayerOnStageOrPlats(stage, p)) {
      return true;
    }
  }
  return false;
}
