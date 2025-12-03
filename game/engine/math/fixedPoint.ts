import { Pool, IPooledObject } from '../pools/Pool';
import { PooledVector } from '../pools/PooledVector';

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

export function DotProductRaw(
  x1Raw: number,
  y1Raw: number,
  x2Raw: number,
  y2Raw: number
) {
  return MultiplyRaw(x1Raw, x2Raw) + MultiplyRaw(y1Raw, y2Raw);
}

export function DotProductVectorRaw(vec1: PooledVector, vec2: PooledVector) {
  return DotProductRaw(vec1.X.Raw, vec1.Y.Raw, vec2.X.Raw, vec2.Y.Raw);
}

export class FixedPoint implements IPooledObject {
  // The raw integer value representing the fixed-point number.
  private _rawValue: number;

  constructor(value: number = 0) {
    this._rawValue = ClampRaw(Math.trunc(value * SCALE));
  }

  // --- Value Conversion ---

  public SetFromNumber(value: number): this {
    this._rawValue = NumberToRaw(value);
    return this;
  }

  public SetFromFp(other: FixedPoint): this {
    this._rawValue = other._rawValue;
    return this;
  }

  public get AsNumber(): number {
    return RawToNumber(this._rawValue);
  }

  public get Raw(): number {
    return this._rawValue;
  }

  public SetFromRaw(raw: number): this {
    if (!Number.isInteger(raw)) {
      throw new Error(`Illegal assigntment to FixedPoint. Raw:${raw}`);
    }
    this._rawValue = raw;
    return this;
  }

  // --- Mutative Arithmetic ---

  public Add(other: FixedPoint): this {
    this._rawValue += other._rawValue;
    return this;
  }

  public AddRaw(otherRaw: number): this {
    this._rawValue += otherRaw;
    return this;
  }

  public Subtract(other: FixedPoint): this {
    this._rawValue -= other._rawValue;
    return this;
  }

  public SubtractRaw(otherRaw: number): this {
    this._rawValue -= otherRaw;
    return this;
  }

  public Multiply(other: FixedPoint): this {
    this._rawValue = MultiplyRaw(this._rawValue, other._rawValue);
    return this;
  }

  public Negate(): this {
    if (this._rawValue !== 0) {
      this._rawValue = -this._rawValue;
    }
    return this;
  }

  public Divide(other: FixedPoint): this {
    this._rawValue = DivideRaw(this._rawValue, other._rawValue);
    return this;
  }

  public Sqrt(): this {
    this._rawValue = SqrtRaw(this._rawValue);
    return this;
  }

  // --- Set-based Arithmetic ---

  public SetAdd(a: FixedPoint, b: FixedPoint): this {
    this._rawValue = a._rawValue + b._rawValue;
    return this;
  }

  public SetSubtract(a: FixedPoint, b: FixedPoint): this {
    this._rawValue = a._rawValue - b._rawValue;
    return this;
  }

  public SetMultiply(a: FixedPoint, b: FixedPoint): this {
    this._rawValue = MultiplyRaw(a._rawValue, b._rawValue);
    return this;
  }

  public SetDivide(a: FixedPoint, b: FixedPoint): this {
    this._rawValue = DivideRaw(a._rawValue, b._rawValue);
    return this;
  }

  // --- Comparison ---

  public Equals(other: FixedPoint): boolean {
    return this._rawValue === other._rawValue;
  }

  public GreaterThan(other: FixedPoint): boolean {
    return this._rawValue > other._rawValue;
  }

  public GreaterThanOrEqualTo(other: FixedPoint): boolean {
    return this._rawValue >= other._rawValue;
  }

  public LessThan(other: FixedPoint): boolean {
    return this._rawValue < other._rawValue;
  }

  public LessThanOrEqualTo(other: FixedPoint): boolean {
    return this._rawValue <= other._rawValue;
  }

  // --- Pool methods ---
  public Zero(): void {
    this._rawValue = 0;
  }
}
