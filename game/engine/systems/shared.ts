// 1 dm unit is 4.63 jazz units
// 1 jazz unit is 0.216 dm units

import { NumberToRaw } from '../math/fixedPoint';

export const CORRECTION_DEPTH_RAW = NumberToRaw(0.1); //= 0.1;

export const HARD_LAND_VELOCITY_RAW = NumberToRaw(5);

export function shouldSoftlandRaw(yVelocityRaw: number) {
  return yVelocityRaw < HARD_LAND_VELOCITY_RAW;
}
