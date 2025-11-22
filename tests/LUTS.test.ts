import {
  SIN_LUT,
  COS_LUT,
  ATAN2_LUT,
  LUT_SIZE,
  ATAN2_SIZE,
} from '../game/math/LUTS';
import { NumberToRaw } from '../game/math/fixedPoint';

describe('LUTS tests', () => {
  test('test SIN_LUT', () => {
    const epsilon = 1; // Epsilon for comparison
    const lutSize = SIN_LUT.length;

    for (let i = 0; i < lutSize; i += 10) {
      const angleDegrees = (i * 360) / lutSize;
      const angleRadians = (angleDegrees * Math.PI) / 180;
      const expectedSin = Math.sin(angleRadians);
      const expectedSinRaw = NumberToRaw(expectedSin);

      const actualSinRaw = SIN_LUT[i];

      expect(Math.abs(actualSinRaw - expectedSinRaw)).toBeLessThanOrEqual(
        epsilon
      );
    }
  });

  test('test COS_LUT', () => {
    const epsilon = 1; // Epsilon for comparison
    const lutSize = COS_LUT.length;

    for (let i = 0; i < lutSize; i += 10) {
      const angleDegrees = (i * 360) / lutSize;
      const angleRadians = (angleDegrees * Math.PI) / 180;
      const expectedCos = Math.cos(angleRadians);
      const expectedCosRaw = NumberToRaw(expectedCos);

      const actualCosRaw = COS_LUT[i];

      expect(Math.abs(actualCosRaw - expectedCosRaw)).toBeLessThanOrEqual(
        epsilon
      );
    }
  });

  test('test ATAN2_LUT', () => {
    const epsilon = 1; // Epsilon for comparison

    for (let y = 0; y < ATAN2_SIZE; y += 10) {
      for (let x = 0; x < ATAN2_SIZE; x += 10) {
        const xf = (x - ATAN2_SIZE / 2) / (ATAN2_SIZE / 2);
        const yf = (y - ATAN2_SIZE / 2) / (ATAN2_SIZE / 2);

        const angle = Math.atan2(yf, xf);
        const expectedAngleIndex = Math.floor(
          ((angle + Math.PI) / (2 * Math.PI)) * LUT_SIZE
        );

        const actualAngleIndex = ATAN2_LUT[y * ATAN2_SIZE + x];

        expect(Math.abs(actualAngleIndex - expectedAngleIndex)).toBeLessThanOrEqual(
          epsilon
        );
      }
    }
  });
});
