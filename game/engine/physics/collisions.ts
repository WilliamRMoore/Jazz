import { CollisionResult, ICollisionResult } from '../pools/CollisionResult';
import { Pool } from '../pools/Pool';
import { IProjectionResult, ProjectionResult } from '../pools/ProjectResult';
import { PooledVector } from '../pools/PooledVector';
import { FlatVec } from './vector';
import { ClampWithMin } from '../utils';
import { ClosestPointsResult } from '../pools/ClosestPointsResult';
import { FixedPoint } from '../../math/fixedPoint';

export function IntersectsPolygons(
  verticiesA: Array<FlatVec>,
  verticiesB: Array<FlatVec>,
  fpp: Pool<FixedPoint>,
  vecPool: Pool<PooledVector>,
  colResPool: Pool<CollisionResult>,
  projResPool: Pool<ProjectionResult>
): ICollisionResult {
  let normal = vecPool.Rent();
  let depth = FixedPoint.MAX_VALUE; //Number.MAX_SAFE_INTEGER;

  const verticiesAVec = vecPool.Rent();
  const verticiesBVec = vecPool.Rent();

  for (let i = 0; i < verticiesA.length; i++) {
    // Go through verticies in clockwise order.
    const va = verticiesA[i];
    const vb = verticiesA[(i + 1) % verticiesA.length];
    verticiesAVec.SetXY(va.X, va.Y);
    verticiesBVec.SetXY(vb.X, vb.Y);
    const negatedY = fpp
      .Rent()
      .setMultiply(fpp.Rent().setFromNumber(-1), verticiesBVec.Y);
    let axis = verticiesBVec
      .SubtractVec(verticiesAVec)
      .SetY(negatedY)
      .Normalize(fpp);
    // Project verticies for both polygons.
    const vaProj = projectVerticies(
      verticiesA,
      axis,
      fpp,
      vecPool,
      projResPool
    );
    const vbProj = projectVerticies(
      verticiesB,
      axis,
      fpp,
      vecPool,
      projResPool
    );

    if (
      vaProj.Min.greatherThanOrEqualTo(vbProj.Max) ||
      vbProj.Min.greatherThanOrEqualTo(vaProj.Max)
    ) {
      return colResPool.Rent();
    }

    const vbVaDepth = fpp.Rent().setSubtract(vbProj.Max, vaProj.Min);
    const vaVbDepth = fpp.Rent().setSubtract(vaProj.Max, vbProj.Min);
    const axisDepth = FixedPoint.Min(vbVaDepth, vaVbDepth);
    // const axisDepth = Math.min(
    //   vbProj.Max - vaProj.Min,
    //   vaProj.Max - vbProj.Min
    // );

    if (axisDepth.lessThan(depth)) {
      depth = axisDepth;
      normal.SetX(axis.X).SetY(axis.Y);
    }
  }

  verticiesAVec.Zero();
  verticiesBVec.Zero();

  for (let i = 0; i < verticiesB.length; i++) {
    const va = verticiesB[i];
    const vb = verticiesB[(i + 1) % verticiesB.length]; // Go through verticies in clockwise order.
    verticiesAVec.SetXY(va.X, va.Y);
    verticiesBVec.SetXY(vb.X, vb.Y);

    const negatedY = fpp
      .Rent()
      .setMultiply(fpp.Rent().setFromNumber(-1), verticiesBVec.Y);

    const axis = verticiesBVec
      .SubtractVec(verticiesAVec)
      .SetY(negatedY)
      .Normalize(fpp);

    // Project verticies for both polygons.

    const vaProj = projectVerticies(
      verticiesA,
      axis,
      fpp,
      vecPool,
      projResPool
    );

    const vbProj = projectVerticies(
      verticiesB,
      axis,
      fpp,
      vecPool,
      projResPool
    );

    if (
      vaProj.Min.greatherThanOrEqualTo(vbProj.Max) ||
      vbProj.Min.greatherThanOrEqualTo(vaProj.Max)
    ) {
      return colResPool.Rent();
    }

    const vbVaDepth = fpp.Rent().setSubtract(vbProj.Max, vaProj.Min);
    const vaVbDepth = fpp.Rent().setSubtract(vaProj.Max, vbProj.Min);

    const axisDepth = FixedPoint.Min(vbVaDepth, vaVbDepth);

    // const axisDepth = Math.min(
    //   vbProj.Max - vaProj.Min,
    //   vaProj.Max - vbProj.Min
    // );

    if (axisDepth.lessThan(depth)) {
      depth = axisDepth;
      normal.SetX(axis.X).SetY(axis.Y);
    }
  }

  const centerA = FindArithemticMean(verticiesA, fpp, vecPool.Rent());
  const centerB = FindArithemticMean(verticiesB, fpp, vecPool.Rent());

  const direction = centerB.SubtractVec(centerA);

  if (direction.DotProduct(normal, fpp).lessThanZero) {
    normal.Negate();
  }

  const res = colResPool.Rent();
  res.SetCollisionTrue(normal.X, normal.Y, depth);
  return res;
}

export function IntersectsCircles(
  fpp: Pool<FixedPoint>,
  colResPool: Pool<CollisionResult>,
  v1: PooledVector,
  v2: PooledVector,
  r1: FixedPoint,
  r2: FixedPoint
): CollisionResult {
  const dist = v1.Distance(v2, fpp);
  const raddi = fpp.Rent().setAdd(r1, r2);

  if (dist.greaterThan(raddi)) {
    // false, comes from pool in zeroed state.
    return colResPool.Rent();
  }

  const norm = v2.SubtractVec(v1).Normalize(fpp);
  const depth = raddi.subtract(dist);
  const returnValue = colResPool.Rent();

  returnValue.SetCollisionTrue(norm.X, norm.Y, depth);

  return returnValue;
}

export function ClosestPointsBetweenSegments(
  fpp: Pool<FixedPoint>,
  p1: PooledVector,
  q1: PooledVector,
  p2: PooledVector,
  q2: PooledVector,
  vecPool: Pool<PooledVector>,
  ClosestPointsPool: Pool<ClosestPointsResult>
): ClosestPointsResult {
  const isSegment1Point = p1.X.equals(q1.X) && p1.Y.equals(q1.Y);
  const isSegment2Point = p2.X.equals(q2.X) && p2.Y.equals(q2.Y);

  if (isSegment1Point && isSegment2Point) {
    // Both segments are points
    const ret = ClosestPointsPool.Rent();
    ret.Set(p1.X, p1.Y, p2.X, p2.Y);
    return ret;
  }

  if (isSegment1Point) {
    // Segment 1 is a point
    return closestPointOnSegmentToPoint(p2, q2, p1, vecPool, ClosestPointsPool);
  }

  if (isSegment2Point) {
    // Segment 2 is a point
    return closestPointOnSegmentToPoint(p1, q1, p2, vecPool, ClosestPointsPool);
  }

  const p1Dto = vecPool.Rent().SetXY(p1.X, p1.Y);
  const p2Dto = vecPool.Rent().SetXY(p2.X, p2.Y);

  const d1 = q1.SubtractVec(p1Dto);
  const d2 = q2.SubtractVec(p2Dto);
  const r = p1Dto.SubtractVec(p2Dto);

  const a = d1.DotProduct(d1, fpp); // Squared length of segment 1
  const e = d2.DotProduct(d2, fpp); // Squared length of segment 2
  const f = d2.DotProduct(r, fpp);

  let s = fpp.Rent();
  let t = fpp.Rent();

  const b = d1.DotProduct(d2, fpp);
  const c = d1.DotProduct(r, fpp);

  //const denom = a * e - b * b;

  const denomT1 = fpp.Rent().setMultiply(a, e);
  const denomT2 = fpp.Rent().setMultiply(b, b);
  const denom = fpp.Rent().setSubtract(denomT1, denomT2);

  // Check for parallel or near-parallel lines
  if (denom.getRaw() !== 0) {
    // Use a small epsilon to handle near-parallel cases
    const sNumeT1 = fpp.Rent().setMultiply(b, f);
    const sNumeT2 = fpp.Rent().setMultiply(c, a);
    const sNume = fpp.Rent().setSubtract(sNumeT1, sNumeT2);
    s.setDivide(sNume, denom);

    s.setFromNumber(ClampWithMin(s.AsNumber, 0, 1));
  } else {
    // Segments are parallel or nearly parallel
    s.setFromNumber(0); // Default to one endpoint of segment 1
  }

  //  t = (b * s + f) / e;
  const tNumeT1 = fpp.Rent().setMultiply(b, s);
  const tNume = fpp.Rent().setAdd(tNumeT1, f);
  t.setDivide(tNume, e);

  const zero = fpp.Rent().setFromNumber(0);
  const one = fpp.Rent().setFromNumber(1);

  if (t.lessThan(zero)) {
    t.setFromNumber(0);
    s.setDivide(c.negate(), a);

    s.setFromNumber(ClampWithMin(s.AsNumber, 0, 1));
  } else if (t.greaterThan(one)) {
    t.setFromNumber(1);
    const sNume = fpp.Rent().setSubtract(b, c);
    s.setDivide(sNume, a);
    s.setFromNumber(ClampWithMin(s.AsNumber, 0, 1));
  }

  // let c1X = p1.X + s * d1.X;
  // let c1Y = p1.Y + s * d1.Y;
  // let c2X = p2Dto.X + t * d2.X;
  // let c2Y = p2Dto.Y + t * d2.Y;

  const c1XAdd = fpp.Rent().setAdd(p1.X, fpp.Rent().setMultiply(s, d1.X));
  const c1YAdd = fpp.Rent().setAdd(p1.Y, fpp.Rent().setMultiply(s, d1.Y));
  const c2XAdd = fpp.Rent().setAdd(p2Dto.X, fpp.Rent().setMultiply(t, d2.X));
  const c2YAdd = fpp.Rent().setAdd(p2Dto.Y, fpp.Rent().setMultiply(t, d2.Y));

  const c1X = fpp.Rent().setAdd(p1.X, c1XAdd);
  const c1Y = fpp.Rent().setAdd(p1.Y, c1YAdd);
  const c2X = fpp.Rent().setAdd(p2Dto.X, c2XAdd);
  const c2Y = fpp.Rent().setAdd(p2Dto.Y, c2YAdd);

  const closestPoints = ClosestPointsPool.Rent();

  closestPoints.Set(c1X, c1Y, c2X, c2Y);

  return closestPoints;
}

// suplimental functions ====================================

export function FindArithemticMean(
  verticies: Array<FlatVec>,
  fpp: Pool<FixedPoint>,
  pooledVec: PooledVector
): PooledVector {
  const sumX = fpp.Rent();
  const sumY = fpp.Rent();
  const vertLength = verticies.length;
  const vertLengthFp = fpp.Rent().setFromNumber(vertLength);

  for (let index = 0; index < vertLength; index++) {
    const v = verticies[index];
    sumX.add(v.X);
    sumY.add(v.Y);
  }

  return pooledVec.SetXY(sumX, sumY).Divide(vertLengthFp);
}

function closestPointOnSegmentToPoint(
  segStart: FlatVec,
  segEnd: FlatVec,
  point: FlatVec,
  vecPool: Pool<PooledVector>,
  ClosestPointsPool: Pool<ClosestPointsResult>
): ClosestPointsResult {
  const segVec = vecPool
    .Rent()
    .SetXY(segEnd.X - segStart.X, segEnd.Y - segStart.Y);
  const pointVec = vecPool
    .Rent()
    .SetXY(point.X - segStart.X, point.Y - segStart.Y);

  const segLengthSquared = segVec.X * segVec.X + segVec.Y * segVec.Y;

  let t = 0;
  if (segLengthSquared > 0) {
    t = (pointVec.X * segVec.X + pointVec.Y * segVec.Y) / segLengthSquared;
    t = Math.max(0, Math.min(1, t)); // Clamp t to [0, 1]
  }

  const closestX = segStart.X + t * segVec.X;
  const closestY = segStart.Y + t * segVec.Y;

  const ret = ClosestPointsPool.Rent();
  ret.Set(closestX, closestY, point.X, point.Y);
  return ret;
}

function projectVerticies(
  verticies: Array<FlatVec>,
  axis: PooledVector,
  fpp: Pool<FixedPoint>,
  vecPool: Pool<PooledVector>,
  projResPool: Pool<ProjectionResult>
): IProjectionResult {
  let min = FixedPoint.MAX_VALUE; //Number.MAX_SAFE_INTEGER;
  let max = FixedPoint.MIN_VALUE; //Number.MIN_SAFE_INTEGER;

  const vRes = vecPool.Rent();

  for (let i = 0; i < verticies.length; i++) {
    const v = verticies[i];
    vRes.SetXY(v.X, v.Y);

    // get the projection for the given axis
    const projection = vRes.DotProduct(axis, fpp);

    // set the minimum projection
    if (projection.lessThan(min)) {
      min = projection;
    }
    //set the maximum projection
    if (projection.greaterThan(max)) {
      max = projection;
    }
  }

  let result = projResPool.Rent();
  result.SetMinMax(min, max);
  return result;
}

export function LineSegmentIntersection(
  fpp: Pool<FixedPoint>,
  ax1: FixedPoint,
  ay1: FixedPoint,
  ax2: FixedPoint,
  ay2: FixedPoint,
  bx3: FixedPoint,
  by3: FixedPoint,
  bx4: FixedPoint,
  by4: FixedPoint
): boolean {
  // (by4 - by3) * (ax2 - ax1) - (bx4 - bx3) * (ay2 - ay1)
  const term1 = fpp
    .Rent()
    .setSubtract(by4, by3)
    .multiply(fpp.Rent().setSubtract(ax2, ax1));
  const term2 = fpp
    .Rent()
    .setSubtract(bx4, bx3)
    .multiply(fpp.Rent().setSubtract(ay2, ay1));
  const denom = fpp.Rent().setSubtract(term1, term2);

  if (denom.getRaw() === 0) {
    return false;
  }

  // (bx4 - bx3) * (ay1 - by3) - (by4 - by3) * (ax1 - bx3)
  const numeATerm1 = fpp
    .Rent()
    .setSubtract(bx4, bx3)
    .multiply(fpp.Rent().setSubtract(ay1, by3));
  const numeATerm2 = fpp
    .Rent()
    .setSubtract(by4, by3)
    .multiply(fpp.Rent().setSubtract(ax1, bx3));
  const numeA = fpp.Rent().setSubtract(numeATerm1, numeATerm2);

  // (ax2 - ax1) * (ay1 - by3) - (ay2 - ay1) * (ax1 - bx3)
  const numeBTerm1 = fpp
    .Rent()
    .setSubtract(ax2, ax1)
    .multiply(fpp.Rent().setSubtract(ay1, by3));
  const numeBTerm2 = fpp
    .Rent()
    .setSubtract(ay2, ay1)
    .multiply(fpp.Rent().setSubtract(ax1, bx3));
  const numeB = fpp.Rent().setSubtract(numeBTerm1, numeBTerm2);

  const uA = fpp.Rent().setDivide(numeA, denom);
  const uB = fpp.Rent().setDivide(numeB, denom);

  const one = fpp.Rent().setFromNumber(1);

  if (
    uA.greaterThanOrEqualZero &&
    uA.lessThanOrEqualTo(one) &&
    uB.greaterThanOrEqualZero &&
    uB.lessThanOrEqualTo(one)
  ) {
    return true;
  }

  return false;
}

// Function to compute the cross product of two vectors
function cross(o: FlatVec, a: FlatVec, b: FlatVec): number {
  return (a.X - o.X) * (b.Y - o.Y) - (a.Y - o.Y) * (b.X - o.X);
}

function comparePointsXY(a: FlatVec, b: FlatVec): number {
  if (a.X === b.X) {
    return a.Y - b.Y;
  }
  return a.X - b.X;
}

const lower: Array<FlatVec> = [];
const upper: Array<FlatVec> = [];

export function CreateConvexHull(points: Array<FlatVec>): Array<FlatVec> {
  if (points.length < 3) {
    // A convex hull is not possible with fewer than 3 points
    lower.length = 0; // Clear the lower array
    for (let i = 0; i < points.length; i++) {
      lower.push(points[i]);
    }
    return lower;
  }

  // Sort points lexicographically (by X, then by Y)
  points.sort(comparePointsXY);

  // Clear the lower and upper arrays
  lower.length = 0;
  upper.length = 0;

  // Build the lower hull
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
    ) {
      lower.pop();
    }
    lower.push(p);
  }

  // Build the upper hull
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i];
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
    ) {
      upper.pop();
    }
    upper.push(p);
  }

  // Remove the last point of each half because it's repeated at the beginning of the other half
  lower.pop();
  upper.pop();

  // Concatenate upper hull into the lower array
  for (let i = 0; i < upper.length; i++) {
    lower.push(upper[i]);
  }

  return lower;
}
