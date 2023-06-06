import { FlatVec, VectorSubtractor } from './FlatVec';
import { Distance, Normalize } from './VecMath';

type collisionResult = {
  collision: boolean;
  normal: FlatVec | null;
  depth: number | null;
};

export function IntersectCircle(
  v1: FlatVec,
  v1Radius: number,
  v2: FlatVec,
  v2Radius: number
) {
  let dist = Distance(v1, v2);
  let raddi = v1Radius + v2Radius;

  if (dist >= raddi) {
    return { collision: false, normal: null, depth: null } as collisionResult;
  }

  let res = {
    collision: true,
    normal: Normalize(VectorSubtractor(v2, v1)),
    depth: raddi - dist,
  } as collisionResult;

  return res;
}
