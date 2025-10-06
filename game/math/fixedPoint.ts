import { IPooledObject, Pool } from '../engine/pools/Pool';

export class FixedPoint implements IPooledObject {
  // Q-format: 16.10 (1 sign bit, 15 integer bits, 10 fractional bits)
  private static readonly FRACTIONAL_BITS = 10;
  private static readonly SCALE = 1 << FixedPoint.FRACTIONAL_BITS; // 2^10 = 1024

  // 26-bit signed integer range for the raw value
  private static readonly MAX_RAW_VALUE = (1 << 25) - 1; // 33554431
  private static readonly MIN_RAW_VALUE = -(1 << 25); // -33554432

  public static readonly MAX_VALUE = new FixedPoint().setFromRaw(
    this.MAX_RAW_VALUE
  );
  public static readonly MIN_VALUE = new FixedPoint().setFromRaw(
    this.MIN_RAW_VALUE
  );
  public static readonly EPSILON = new FixedPoint().setFromRaw(1);

  // The raw integer value representing the fixed-point number.
  private rawValue: number;

  constructor(value: number = 0) {
    this.rawValue = FixedPoint._clampRawValue(
      Math.trunc(value * FixedPoint.SCALE)
    );
  }

  /**
   * Creates a FixedPoint instance from a standard number, clamping the input.
   * @param value The number to convert.
   * @param pool The pool to rent the FixedPoint instance from.
   * @returns A new FixedPoint instance.
   */
  public static from(value: number, pool: Pool<FixedPoint>): FixedPoint {
    return pool.Rent().setFromNumber(value);
  }

  // --- Value Conversion ---

  /**
   * Sets the fixed-point value from a standard number.
   * @param value The number to convert.
   * @returns The current instance for chaining.
   */
  public setFromNumber(value: number): this {
    this.rawValue = FixedPoint._clampRawValue(
      Math.trunc(value * FixedPoint.SCALE)
    );
    return this;
  }

  /**
   * Copies the value from another FixedPoint instance.
   * @param other The instance to copy from.
   * @returns The current instance for chaining.
   */
  public setFromFp(other: FixedPoint): this {
    this.rawValue = other.rawValue;
    return this;
  }

  /**
   * Converts the fixed-point value back to a standard number.
   */
  public get AsNumber(): number {
    return this.rawValue / FixedPoint.SCALE;
  }

  /**
   * Returns the raw scaled integer value.
   */
  public getRaw(): number {
    return this.rawValue;
  }

  public setFromRaw(raw: number): this {
    this.rawValue = raw;
    return this;
  }

  // --- Mutative Arithmetic ---

  /**
   * Adds another FixedPoint value to this instance.
   * @param other The value to add.
   * @returns The current instance for chaining.
   */
  public add(other: FixedPoint): this {
    this.rawValue += other.rawValue;
    return this;
  }

  /**
   * Subtracts another FixedPoint value from this instance.
   * @param other The value to subtract.
   * @returns The current instance for chaining.
   */
  public subtract(other: FixedPoint): this {
    this.rawValue -= other.rawValue;
    return this;
  }

  /**
   * Multiplies this instance by another FixedPoint value.
   * @param other The value to multiply by.
   * @returns The current instance for chaining.
   */
  public multiply(other: FixedPoint): this {
    // (a * SCALE) * (b * SCALE) / SCALE = a * b * SCALE
    // The intermediate product can exceed 32 bits, so we must use standard
    // division instead of a bitwise shift, which would overflow.
    const product = this.rawValue * other.rawValue;
    this.rawValue = Math.trunc(product / FixedPoint.SCALE);
    return this;
  }

  public negate(): this {
    if (this.rawValue !== 0) {
      this.rawValue = -this.rawValue;
    }
    return this;
  }

  /**
   * Divides this instance by another FixedPoint value.
   * @param other The value to divide by.
   * @returns The current instance for chaining.
   */
  public divide(other: FixedPoint): this {
    if (other.rawValue === 0) {
      // Or set to a max value, or handle as an error condition
      throw new Error('FixedPoint division by zero.');
    }
    // (a * SCALE) / (b * SCALE) * SCALE = a / b * SCALE
    // The scaled-up numerator can exceed 32 bits, so we must use standard
    // multiplication instead of a bitwise shift, which would overflow.
    const scaledNumerator = this.rawValue * FixedPoint.SCALE;
    this.rawValue = Math.trunc(scaledNumerator / other.rawValue);
    return this;
  }

  /**
   * Calculates the square root of this instance.
   * Throws an error if the value is negative.
   * @returns The current instance for chaining.
   */
  public sqrt(): this {
    if (this.rawValue < 0) {
      throw new Error('FixedPoint square root of negative number.');
    }
    // We want sqrt(x.rawValue / SCALE), which is sqrt(x.rawValue) / sqrt(SCALE).
    // To maintain precision, we compute sqrt(x.rawValue * SCALE) / SCALE * SCALE = sqrt(x.rawValue * SCALE)
    const scaledValue = this.rawValue * FixedPoint.SCALE;
    this.rawValue = Math.trunc(Math.sqrt(scaledValue));
    return this;
  }

  // --- Set-based Arithmetic ---

  /**
   * Sets this instance to the result of adding two other FixedPoint numbers.
   * @param a The first operand.
   * @param b The second operand.
   * @returns The current instance for chaining.
   */
  public setAdd(a: FixedPoint, b: FixedPoint): this {
    this.rawValue = a.rawValue + b.rawValue;
    return this;
  }

  /**
   * Sets this instance to the result of subtracting one FixedPoint number from another.
   * @param a The first operand (minuend).
   * @param b The second operand (subtrahend).
   * @returns The current instance for chaining.
   */
  public setSubtract(a: FixedPoint, b: FixedPoint): this {
    this.rawValue = a.rawValue - b.rawValue;
    return this;
  }

  /**
   * Sets this instance to the result of multiplying two other FixedPoint numbers.
   * @param a The first operand.
   * @param b The second operand.
   * @returns The current instance for chaining.
   */
  public setMultiply(a: FixedPoint, b: FixedPoint): this {
    // See multiply() for explanation on avoiding bitwise shifts.
    const product = a.rawValue * b.rawValue;
    this.rawValue = Math.trunc(product / FixedPoint.SCALE);
    return this;
  }

  /**
   * Sets this instance to the result of dividing one FixedPoint number by another.
   * @param a The first operand (dividend).
   * @param b The second operand (divisor).
   * @returns The current instance for chaining.
   */
  public setDivide(a: FixedPoint, b: FixedPoint): this {
    if (b.rawValue === 0) {
      throw new Error('FixedPoint division by zero.');
    }
    // See divide() for explanation on avoiding bitwise shifts.
    const scaledNumerator = a.rawValue * FixedPoint.SCALE;
    this.rawValue = Math.trunc(scaledNumerator / b.rawValue);
    return this;
  }

  // --- Static (Non-Mutative) Arithmetic ---

  /**
   * Adds two FixedPoint numbers.
   * @returns A new FixedPoint instance with the result.
   */
  public static add(
    a: FixedPoint,
    b: FixedPoint,
    pool: Pool<FixedPoint>
  ): FixedPoint {
    const result = pool.Rent();
    result.rawValue = a.rawValue + b.rawValue;
    return result;
  }

  /**
   * Subtracts one FixedPoint number from another.
   * @returns A new FixedPoint instance with the result.
   */
  public static subtract(
    a: FixedPoint,
    b: FixedPoint,
    pool: Pool<FixedPoint>
  ): FixedPoint {
    return pool.Rent().setSubtract(a, b);
  }

  /**
   * Multiplies two FixedPoint numbers.
   * @returns A new FixedPoint instance with the result.
   */
  public static multiply(
    a: FixedPoint,
    b: FixedPoint,
    pool: Pool<FixedPoint>
  ): FixedPoint {
    return pool.Rent().setMultiply(a, b);
  }

  /**
   * Divides one FixedPoint number by another.
   * @returns A new FixedPoint instance with the result.
   */
  public static divide(
    a: FixedPoint,
    b: FixedPoint,
    pool: Pool<FixedPoint>
  ): FixedPoint {
    return pool.Rent().setDivide(a, b);
  }

  public static Min(a: FixedPoint, b: FixedPoint): FixedPoint {
    return a.rawValue < b.rawValue ? a : b;
  }

  /**
   * Calculates the square root of a FixedPoint number.
   * Throws an error if the value is negative.
   * @returns A new FixedPoint instance with the result.
   */
  public static sqrt(a: FixedPoint, pool: Pool<FixedPoint>): FixedPoint {
    if (a.rawValue < 0) {
      throw new Error('FixedPoint square root of negative number.');
    }
    const result = pool.Rent();
    result.rawValue = Math.trunc(Math.sqrt(a.rawValue * FixedPoint.SCALE));
    return result;
  }
  // --- Comparison ---

  public equals(other: FixedPoint): boolean {
    return this.rawValue === other.rawValue;
  }

  public greaterThan(other: FixedPoint): boolean {
    return this.rawValue > other.rawValue;
  }

  public greatherThanOrEqualTo(other: FixedPoint): boolean {
    return this.rawValue >= other.rawValue;
  }

  public get graterThanZero(): boolean {
    return this.rawValue > 0;
  }

  public get greaterThanOrEqualZero(): boolean {
    return this.rawValue >= 0;
  }

  public lessThan(other: FixedPoint): boolean {
    return this.rawValue < other.rawValue;
  }

  public lessThanOrEqualTo(other: FixedPoint): boolean {
    return this.rawValue <= other.rawValue;
  }

  public get lessThanZero(): boolean {
    return this.rawValue < 0;
  }

  // --- Private Helpers ---

  /**
   * Clamps a raw integer value to the valid range of this FixedPoint type.
   * @param rawValue The scaled integer value to clamp.
   * @returns The clamped raw value.
   */
  private static _clampRawValue(rawValue: number): number {
    return Math.max(this.MIN_RAW_VALUE, Math.min(this.MAX_RAW_VALUE, rawValue));
  }

  // --- Pool methods ---
  public Zero(): void {
    this.rawValue = 0;
  }
}
