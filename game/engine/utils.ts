import { FlatVec } from './physics/vector';

export function FillArrayWithFlatVec(fvArr: FlatVec[]): void {
  for (let index = 0; index < fvArr.length; index++) {
    fvArr[index] = new FlatVec(0, 0);
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
    const next = this.step(this.seq);
    this.seq = next;
    return next;
  }
}
