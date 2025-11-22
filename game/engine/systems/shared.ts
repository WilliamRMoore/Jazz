import { NumberToRaw } from '../../math/fixedPoint';

export const CORRECTION_DEPTH_RAW = NumberToRaw(0.1); //= 0.1;
export const CORNER_JITTER_CORRECTION_RAW = NumberToRaw(2);
export const HARD_LAND_VELOCITY_RAW = NumberToRaw(5);

export function shouldSoftlandRaw(yVelocityRaw: number) {
  return yVelocityRaw < HARD_LAND_VELOCITY_RAW;
}
