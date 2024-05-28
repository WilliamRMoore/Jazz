import { FlatVec, VectorAllocator } from './Physics/FlatVec';

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

export function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

export function randomNumber(min: number, max: number): number {
  return Math.round(Math.random() * (max - min) + min);
}

export function FillArrayWithFlatVec(fvArr: FlatVec[]): void {
  for (let index = 0; index < fvArr.length; index++) {
    fvArr[index] = VectorAllocator();
  }
}
