import { FlatVec, VectorAllocator } from './FlatVec';

export const Length = (v: FlatVec) => {
  return Math.sqrt(v.X * v.X + v.Y * v.Y);
};

export const Distance = (v1: FlatVec, v2: FlatVec) => {
  const dx = v1.X - v2.X;
  const dy = v1.Y - v2.Y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const Normalize = (v: FlatVec) => {
  const length = Length(v);
  return VectorAllocator(v.X / length, v.Y / length);
};

export const DotProduct = (v1: FlatVec, v2: FlatVec) => {
  return v1.X * v2.X + v1.Y * v2.Y;
};

export const CrossProduct = (v1: FlatVec, v2: FlatVec) => {
  return v1.X * v2.Y - v1.Y * v2.X;
};
