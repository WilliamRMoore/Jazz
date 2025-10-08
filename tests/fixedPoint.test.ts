import { FixedPoint } from '../game/math/fixedPoint';

describe('FixedPoint', () => {
  const SCALE = 1 << 10;

  // Helper to create a FixedPoint from a number for tests
  const fp = (n: number) => new FixedPoint(n);

  // Helper to get the number from a FixedPoint for tests
  const num = (fp: FixedPoint) => fp.AsNumber;

  test('should create a fixed-point number from a whole number', () => {
    const val = 10;
    const fpVal = fp(val);
    expect(fpVal.Raw()).toBe(val * SCALE);
    expect(num(fpVal)).toBe(val);
  });

  test('should create a fixed-point number from a fractional number', () => {
    const val = 10.5;
    const fpVal = fp(val);
    expect(fpVal.Raw()).toBe(Math.trunc(val * SCALE));
    expect(num(fpVal)).toBeCloseTo(val, 2);
  });

  test('should add two fixed-point numbers', () => {
    const fp1 = fp(5.5);
    const fp2 = fp(2.25);
    fp1.add(fp2);
    expect(num(fp1)).toBeCloseTo(7.75, 2);
  });

  test('should subtract two fixed-point numbers', () => {
    const fp1 = fp(5.5);
    const fp2 = fp(2.25);
    fp1.subtract(fp2);
    expect(num(fp1)).toBeCloseTo(3.25, 2);
  });

  test('should multiply two fixed-point numbers', () => {
    const fp1 = fp(3.5);
    const fp2 = fp(2.0);
    fp1.multiply(fp2);
    expect(num(fp1)).toBeCloseTo(7.0, 2);
  });

  test('should divide two fixed-point numbers', () => {
    const fp1 = fp(10.0);
    const fp2 = fp(2.5);
    fp1.divide(fp2);
    expect(num(fp1)).toBeCloseTo(4.0, 2);
  });

  test('should throw an error when dividing by zero', () => {
    const fp1 = fp(10.0);
    const fp2 = fp(0);
    expect(() => fp1.divide(fp2)).toThrow('FixedPoint division by zero.');
  });

  test('should calculate the square root of a fixed-point number', () => {
    const fp1 = fp(16.0);
    fp1.sqrt();
    expect(num(fp1)).toBeCloseTo(4.0, 2);
  });

  test('should throw an error when taking the square root of a negative number', () => {
    const fp1 = fp(-16.0);
    expect(() => fp1.sqrt()).toThrow(
      'FixedPoint square root of negative number.'
    );
  });

  test('should compare two fixed-point numbers correctly', () => {
    const fp1 = fp(10.5);
    const fp2 = fp(5.5);
    const fp3 = fp(10.5);

    expect(fp1.greaterThan(fp2)).toBe(true);
    expect(fp1.lessThan(fp2)).toBe(false);
    expect(fp1.equals(fp3)).toBe(true);
    expect(fp1.greaterThanOrEqualTo(fp3)).toBe(true);
    expect(fp1.lessThanOrEqualTo(fp3)).toBe(true);
  });
});
