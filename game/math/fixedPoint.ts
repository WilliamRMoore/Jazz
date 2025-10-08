import { IPooledObject, Pool } from '../engine/pools/Pool';

// Q-format: 16.10 (1 sign bit, 15 integer bits, 10 fractional bits)
export const FRACTIONAL_BITS = 10;
export const SCALE = 1 << FRACTIONAL_BITS; // 2^10 = 1024

// 26-bit signed integer range for the raw value
export const MAX_RAW_VALUE = (1 << 25) - 1; // 33554431
export const MIN_RAW_VALUE = -(1 << 25); // -33554432

// Pure helpers that operate on raw (scaled integer) values.
export function ClampRaw(rawValue: number): number {
  return Math.max(MIN_RAW_VALUE, Math.min(MAX_RAW_VALUE, rawValue));
}

export function NumberToRaw(value: number): number {
  return ClampRaw(Math.trunc(value * SCALE));
}

export function RawToNumber(raw: number): number {
  return raw / SCALE;
}

export function MultiplyRaw(aRaw: number, bRaw: number): number {
  // (a * SCALE) * (b * SCALE) / SCALE = a * b * SCALE
  //const product = aRaw * bRaw;
  return Math.trunc((aRaw * bRaw) / SCALE);
}

export function DivideRaw(aRaw: number, bRaw: number): number {
  if (bRaw === 0) {
    throw new Error('FixedPoint division by zero.');
  }
  //const scaledNumerator = aRaw * SCALE;
  return Math.trunc((aRaw * SCALE) / bRaw);
}

export function SqrtRaw(aRaw: number): number {
  if (aRaw < 0) {
    throw new Error('FixedPoint square root of negative number.');
  }
  return Math.trunc(Math.sqrt(aRaw * SCALE));
}

export function DotProductVectorRaw(
  x1Raw: number,
  y1Raw: number,
  x2Raw: number,
  y2Raw: number
) {
  return MultiplyRaw(x1Raw, x2Raw) + MultiplyRaw(y1Raw, y2Raw);
}

export class FixedPoint implements IPooledObject {
  public static readonly MAX_VALUE = new FixedPoint().setFromRaw(MAX_RAW_VALUE);
  public static readonly MIN_VALUE = new FixedPoint().setFromRaw(MIN_RAW_VALUE);
  public static readonly EPSILON = new FixedPoint().setFromRaw(1);

  // The raw integer value representing the fixed-point number.
  private _rawValue: number;

  constructor(value: number = 0) {
    this._rawValue = ClampRaw(Math.trunc(value * SCALE));
  }

  public static from(value: number, pool: Pool<FixedPoint>): FixedPoint {
    return pool.Rent().setFromNumber(value);
  }

  // --- Value Conversion ---

  public setFromNumber(value: number): this {
    this._rawValue = NumberToRaw(value);
    return this;
  }

  public setFromFp(other: FixedPoint): this {
    this._rawValue = other._rawValue;
    return this;
  }

  public get AsNumber(): number {
    return RawToNumber(this._rawValue);
  }

  public Raw(): number {
    return this._rawValue;
  }

  public setFromRaw(raw: number): this {
    if (!Number.isInteger(raw)) {
      throw new Error(`Illegal assigntment to FixedPoint. Raw:${raw}`);
    }
    this._rawValue = raw;
    return this;
  }

  // --- Mutative Arithmetic ---

  public add(other: FixedPoint): this {
    this._rawValue += other._rawValue;
    return this;
  }

  public subtract(other: FixedPoint): this {
    this._rawValue -= other._rawValue;
    return this;
  }

  public multiply(other: FixedPoint): this {
    this._rawValue = MultiplyRaw(this._rawValue, other._rawValue);
    return this;
  }

  public negate(): this {
    if (this._rawValue !== 0) {
      this._rawValue = -this._rawValue;
    }
    return this;
  }

  public divide(other: FixedPoint): this {
    this._rawValue = DivideRaw(this._rawValue, other._rawValue);
    return this;
  }

  public sqrt(): this {
    this._rawValue = SqrtRaw(this._rawValue);
    return this;
  }

  // --- Set-based Arithmetic ---

  public setAdd(a: FixedPoint, b: FixedPoint): this {
    this._rawValue = a._rawValue + b._rawValue;
    return this;
  }

  public setSubtract(a: FixedPoint, b: FixedPoint): this {
    this._rawValue = a._rawValue - b._rawValue;
    return this;
  }

  public setMultiply(a: FixedPoint, b: FixedPoint): this {
    this._rawValue = MultiplyRaw(a._rawValue, b._rawValue);
    return this;
  }

  public setDivide(a: FixedPoint, b: FixedPoint): this {
    this._rawValue = DivideRaw(a._rawValue, b._rawValue);
    return this;
  }

  // --- Static (Non-Mutative) Arithmetic ---

  public static Min(a: FixedPoint, b: FixedPoint): FixedPoint {
    return a._rawValue < b._rawValue ? a : b;
  }

  public static sqrt(a: FixedPoint, pool: Pool<FixedPoint>): FixedPoint {
    const result = pool.Rent();
    result._rawValue = SqrtRaw(a._rawValue);
    return result;
  }
  // --- Comparison ---

  public equals(other: FixedPoint): boolean {
    return this._rawValue === other._rawValue;
  }

  public greaterThan(other: FixedPoint): boolean {
    return this._rawValue > other._rawValue;
  }

  public greaterThanOrEqualTo(other: FixedPoint): boolean {
    return this._rawValue >= other._rawValue;
  }

  public lessThan(other: FixedPoint): boolean {
    return this._rawValue < other._rawValue;
  }

  public lessThanOrEqualTo(other: FixedPoint): boolean {
    return this._rawValue <= other._rawValue;
  }

  // --- Private Helpers ---

  // --- Pool methods ---
  public Zero(): void {
    this._rawValue = 0;
  }
}
