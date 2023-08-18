import FlatTransform from './FlatTransform';
export class FlatVec {
  X: number;
  Y: number;

  constructor(x: number, y: number) {
    this.X = x;
    this.Y = y;
  }

  Equals(other: FlatVec) {
    return this.X == other.X && this.Y == other.Y;
  }
}

export const VectorAdder = (v1: FlatVec, v2: FlatVec) => {
  return VectorAllocator(v1.X + v2.X, v1.Y + v2.Y);
};

export const VectorAdderMutator = (mutVec: FlatVec, v2: FlatVec) => {
  mutVec.X += v2.X;
  mutVec.Y += v2.Y;
};

export const VectorSubtractor = (v1: FlatVec, v2: FlatVec) => {
  return VectorAllocator(v1.X - v2.X, v1.Y - v2.Y);
};

export const VectorMultiplier = (v: FlatVec, s: number) => {
  return VectorAllocator(v.X * s, v.Y * s);
};

export const VectorNegator = (v: FlatVec) => {
  return VectorAllocator(-v.X, -v.Y);
};

export const VectorDivider = (v: FlatVec, s: number) => {
  return VectorAllocator(v.X / s, v.Y / s);
};

export const VectorAllocator = (x: number = 0, y: number = 0) => {
  return new FlatVec(x, y);
};

export const Transform = (v: FlatVec, transform: FlatTransform) => {
  return VectorAllocator(
    transform.Cos * v.X - transform.Sin * v.Y + transform.PositionX,
    transform.Sin * v.X + transform.Cos * v.Y + transform.PositionY
  );
};
