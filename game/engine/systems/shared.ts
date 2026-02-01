// 1 dm unit is 4.63 jazz units
// 1 jazz unit is 0.216 dm units

import { HARD_LAND_VELOCITY_RAW } from '../math/numberConstants';

export function ShouldSoftlandRaw(yVelocityRaw: number) {
  return yVelocityRaw < HARD_LAND_VELOCITY_RAW;
}
