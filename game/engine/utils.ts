import {
  NumberToRaw,
  FixedPoint,
  MultiplyRaw,
  DivideRaw,
  RawToNumber,
} from './math/fixedPoint';
import { ATAN2_LUT, ATAN2_SIZE, LUT_SIZE } from './math/LUTS';
import { FlatVec } from './physics/vector';

const ONE = NumberToRaw(1);
const TWO = NumberToRaw(2);

export function FillArrayWithFlatVec(fvArr: FlatVec[]): void {
  for (let index = 0; index < fvArr.length; index++) {
    fvArr[index] = new FlatVec(new FixedPoint(), new FixedPoint());
  }
}

export function HashCode(obj: any): number {
  const j = JSON.stringify(obj);

  var hash = 0;
  for (var i = 0; i < j.length; i++) {
    var code = j.charCodeAt(i);
    hash = (hash << 5) - hash + code;
    hash = hash & hash;
  }
  return hash;
}

export function Clamp(val: number, clamp: number): number {
  return Math.min(Math.max(val, -clamp), clamp);
}

export function ClampWithMin(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

export function Lerp(start: number, end: number, alpha: number): number {
  return start + (end - start) * alpha;
}

export function EaseIn(t: number) {
  return t * t;
}

export function EaseInRaw(tRaw: number): number {
  return MultiplyRaw(tRaw, tRaw);
}

export function EaseOut(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

export function EaseOutRaw(tRaw: number): number {
  const oneMinusT = ONE - tRaw;
  const oneMinusTSquared = MultiplyRaw(oneMinusT, oneMinusT);
  return ONE - oneMinusTSquared;
}

export function EaseInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function EaseInOutRaw(tRaw: number): number {
  const pointFiveRaw = NumberToRaw(0.5);
  if (tRaw < pointFiveRaw) {
    return MultiplyRaw(TWO, MultiplyRaw(tRaw, tRaw));
  }

  const oneMinusTRaw = ONE - tRaw;
  const exprRaw = MultiplyRaw(TWO, oneMinusTRaw);

  const exprSquaredRaw = MultiplyRaw(exprRaw, exprRaw);

  const exprSquaredDividedBy2Raw = DivideRaw(exprSquaredRaw, TWO);

  return ONE - exprSquaredDividedBy2Raw;
}

export function EaseInPower(t: number, p: number) {
  return Math.pow(t, p);
}

export class Sequencer {
  private seq: number = 0;
  private step: (seq: number) => number;

  constructor(step?: (seq: number) => number) {
    if (step !== undefined) {
      this.step = step;
      return;
    }
    this.step = (seq: number) => {
      return seq + 1;
    };
  }

  public set SeqStart(val: number) {
    this.seq = val;
  }

  public get Next(): number {
    const ret = this.seq;
    const next = this.step(this.seq);
    this.seq = next;
    return ret;
  }
}

export function ToFp(num: number): FixedPoint {
  return new FixedPoint(num);
}

export function ToFV(x: number, y: number): FlatVec {
  return new FlatVec(ToFp(x), ToFp(y));
}

export function GetAtan2IndexRaw(yRaw: number, xRaw: number): number {
  if (xRaw === 0 && yRaw === 0) {
    return 0;
  }

  const xF = -RawToNumber(xRaw);
  const yF = -RawToNumber(yRaw);

  const atan2SizeHalf = ATAN2_SIZE / 2;
  let xLut = Math.floor(xF * atan2SizeHalf + atan2SizeHalf);
  let yLut = Math.floor(yF * atan2SizeHalf + atan2SizeHalf);

  xLut = Math.max(0, Math.min(ATAN2_SIZE - 1, xLut));
  yLut = Math.max(0, Math.min(ATAN2_SIZE - 1, yLut));

  const lutIndex = yLut * ATAN2_SIZE + xLut;

  return ATAN2_LUT[lutIndex] % LUT_SIZE;
}
