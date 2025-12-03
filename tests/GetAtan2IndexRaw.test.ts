import { GetAtan2IndexRaw } from '../game/engine/utils';
import { NumberToRaw } from '../game/engine/math/fixedPoint';
import { LUT_SIZE } from '../game/engine/math/LUTS';

// This is a helper function to get the expected index based on Math.atan2,
// which is the ground truth we are testing against.
const getExpectedAngleIndex = (y: number, x: number): number => {
  const angle = Math.atan2(-y, -x); // Angle in radians
  // Map [-π, π] to [0, LUT_SIZE)
  const index = Math.floor(((angle + Math.PI) / (2 * Math.PI)) * LUT_SIZE);
  // Wrap around if necessary, as index can be LUT_SIZE
  return index % LUT_SIZE;
};

describe('GetAtan2IndexRaw', () => {
  it('should return 0 for (0, 0)', () => {
    expect(GetAtan2IndexRaw(0, 0)).toBe(0);
  });

  // Test axes, simulating input where positive Y is "up".
  it('should return correct index for UP input (90 degrees)', () => {
    // Input: Y=1 (up), X=0
    const yInput = 1;
    const xInput = 0;
    const expectedIndex = getExpectedAngleIndex(yInput, xInput); // Should be around 128 for 90 deg

    const actualIndex = GetAtan2IndexRaw(
      NumberToRaw(yInput),
      NumberToRaw(xInput)
    );

    expect(Math.abs(actualIndex - expectedIndex)).toBeLessThanOrEqual(1);
  });

  it('should return correct index for RIGHT input (0 degrees)', () => {
    // Input: Y=0, X=1 (right)
    const yInput = 0;
    const xInput = 1;
    const expectedIndex = getExpectedAngleIndex(yInput, xInput); // Should be 0 for 0 deg

    const actualIndex = GetAtan2IndexRaw(
      NumberToRaw(yInput),
      NumberToRaw(xInput)
    );

    expect(Math.abs(actualIndex - expectedIndex)).toBeLessThanOrEqual(1);
  });

  it('should return correct index for DOWN input (270 degrees)', () => {
    // Input: Y=-1 (down), X=0
    const yInput = -1;
    const xInput = 0;
    const expectedIndex = getExpectedAngleIndex(yInput, xInput); // Should be around 384 for 270 deg

    const actualIndex = GetAtan2IndexRaw(
      NumberToRaw(yInput),
      NumberToRaw(xInput)
    );

    expect(Math.abs(actualIndex - expectedIndex)).toBeLessThanOrEqual(1);
  });

  it('should return correct index for LEFT input (180 degrees)', () => {
    // Input: Y=0, X=-1 (left)
    const yInput = 0;
    const xInput = -1;
    const expectedIndex = getExpectedAngleIndex(yInput, xInput); // Should be around 256 for 180 deg

    const actualIndex = GetAtan2IndexRaw(
      NumberToRaw(yInput),
      NumberToRaw(xInput)
    );

    expect(Math.abs(actualIndex - expectedIndex)).toBeLessThanOrEqual(1);
  });

  // Test diagonals
  it('should return correct index for UP-RIGHT input (45 degrees)', () => {
    const val = Math.sqrt(0.5); // ~0.707
    const yInput = val;
    const xInput = val;
    const expectedIndex = getExpectedAngleIndex(yInput, xInput); // Should be around 64 for 45 deg

    const actualIndex = GetAtan2IndexRaw(
      NumberToRaw(yInput),
      NumberToRaw(xInput)
    );

    expect(Math.abs(actualIndex - expectedIndex)).toBeLessThanOrEqual(1);
  });

  it('should return correct index for UP-LEFT input (135 degrees)', () => {
    const val = Math.sqrt(0.5);
    const yInput = val;
    const xInput = -val;
    const expectedIndex = getExpectedAngleIndex(yInput, xInput); // Should be around 192 for 135 deg

    const actualIndex = GetAtan2IndexRaw(
      NumberToRaw(yInput),
      NumberToRaw(xInput)
    );

    expect(Math.abs(actualIndex - expectedIndex)).toBeLessThanOrEqual(1);
  });

  it('should return correct index for DOWN-LEFT input (225 degrees)', () => {
    const val = Math.sqrt(0.5);
    const yInput = -val;
    const xInput = -val;
    const expectedIndex = getExpectedAngleIndex(yInput, xInput); // Should be around 320 for 225 deg

    const actualIndex = GetAtan2IndexRaw(
      NumberToRaw(yInput),
      NumberToRaw(xInput)
    );

    expect(Math.abs(actualIndex - expectedIndex)).toBeLessThanOrEqual(1);
  });

  it('should return correct index for DOWN-RIGHT input (315 degrees)', () => {
    const val = Math.sqrt(0.5);
    const yInput = -val;
    const xInput = val;
    const expectedIndex = getExpectedAngleIndex(yInput, xInput); // Should be around 448 for 315 deg

    const actualIndex = GetAtan2IndexRaw(
      NumberToRaw(yInput),
      NumberToRaw(xInput)
    );

    expect(Math.abs(actualIndex - expectedIndex)).toBeLessThanOrEqual(1);
  });
});
