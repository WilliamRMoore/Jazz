import { CollisionResult, ICollisionResult } from '../pools/CollisionResult';
import { Pool } from '../pools/Pool';
import { IProjectionResult, ProjectionResult } from '../pools/ProjectResult';
import { PooledVector } from '../pools/PooledVector';
import { FlatVec } from './vector';
import { ClampWithMin } from '../utils';
import { ClosestPointsResult } from '../pools/ClosestPointsResult';

export function IntersectsPolygons(
  verticiesA: Array<FlatVec>,
  verticiesB: Array<FlatVec>,
  vecPool: Pool<PooledVector>,
  colResPool: Pool<CollisionResult>,
  projResPool: Pool<ProjectionResult>
): ICollisionResult {
  let normal = vecPool.Rent();
  let depth = Number.MAX_SAFE_INTEGER;

  const verticiesAVec = vecPool.Rent();
  const verticiesBVec = vecPool.Rent();

  for (let i = 0; i < verticiesA.length; i++) {
    // Go through verticies in clockwise order.
    const va = verticiesA[i];
    const vb = verticiesA[(i + 1) % verticiesA.length];
    verticiesAVec.SetXY(va.X, va.Y);
    verticiesBVec.SetXY(vb.X, vb.Y);
    let axis = verticiesBVec
      .SubtractVec(verticiesAVec)
      .SetY(-verticiesBVec.Y)
      .Normalize();
    // Project verticies for both polygons.
    const vaProj = projectVerticies(verticiesA, axis, vecPool, projResPool);
    const vbProj = projectVerticies(verticiesB, axis, vecPool, projResPool);

    if (vaProj.Min >= vbProj.Max || vbProj.Min >= vaProj.Max) {
      return colResPool.Rent();
    }

    const axisDepth = Math.min(
      vbProj.Max - vaProj.Min,
      vaProj.Max - vbProj.Min
    );

    if (axisDepth < depth) {
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
    const axis = verticiesBVec
      .SubtractVec(verticiesAVec)
      .SetY(-verticiesBVec.Y)
      .Normalize();
    // Project verticies for both polygons.
    const vaProj = projectVerticies(verticiesA, axis, vecPool, projResPool);
    const vbProj = projectVerticies(verticiesB, axis, vecPool, projResPool);

    if (vaProj.Min >= vbProj.Max || vbProj.Min >= vaProj.Max) {
      return colResPool.Rent();
    }
    const axisDepth = Math.min(
      vbProj.Max - vaProj.Min,
      vaProj.Max - vbProj.Min
    );
    if (axisDepth < depth) {
      depth = axisDepth;
      normal.SetX(axis.X).SetY(axis.Y);
    }
  }

  const centerA = FindArithemticMean(verticiesA, vecPool.Rent());
  const centerB = FindArithemticMean(verticiesB, vecPool.Rent());

  const direction = centerB.SubtractVec(centerA);

  if (direction.DotProduct(normal) < 0) {
    normal.Negate();
  }

  const res = colResPool.Rent();
  res.SetCollisionTrue(normal.X, normal.Y, depth);
  return res;
}

export function IntersectsCircles(
  colResPool: Pool<CollisionResult>,
  v1: PooledVector,
  v2: PooledVector,
  r1: number,
  r2: number
): CollisionResult {
  let dist = v1.Distance(v2);
  let raddi = r1 + r2;

  if (dist > raddi) {
    // false, comes from pool in zeroed state.
    return colResPool.Rent();
  }

  const norm = v2.SubtractVec(v1).Normalize();
  const depth = raddi - dist;
  const returnValue = colResPool.Rent();

  returnValue.SetCollisionTrue(norm.X, norm.Y, depth);

  return returnValue;
}

export function ClosestPointsBetweenSegments(
  p1: PooledVector,
  q1: PooledVector,
  p2: PooledVector,
  q2: PooledVector,
  vecPool: Pool<PooledVector>,
  ClosestPointsPool: Pool<ClosestPointsResult>
): ClosestPointsResult {
  const isSegment1Point = p1.X === q1.X && p1.Y === q1.Y;
  const isSegment2Point = p2.X === q2.X && p2.Y === q2.Y;

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

  const a = d1.DotProduct(d1); // Squared length of segment 1
  const e = d2.DotProduct(d2); // Squared length of segment 2
  const f = d2.DotProduct(r);

  let s = 0;
  let t = 0;

  const b = d1.DotProduct(d2);
  const c = d1.DotProduct(r);
  const denom = a * e - b * b;

  // Check for parallel or near-parallel lines
  if (Math.abs(denom) > Number.EPSILON) {
    // Use a small epsilon to handle near-parallel cases
    s = ClampWithMin((b * f - c * e) / denom, 0, 1);
  } else {
    // Segments are parallel or nearly parallel
    s = 0; // Default to one endpoint of segment 1
  }

  t = (b * s + f) / e;

  if (t < 0) {
    t = 0;
    s = ClampWithMin(-c / a, 0, 1);
  } else if (t > 1) {
    t = 1;
    s = ClampWithMin((b - c) / a, 0, 1);
  }

  let c1X = p1.X + s * d1.X;
  let c1Y = p1.Y + s * d1.Y;
  let c2X = p2Dto.X + t * d2.X;
  let c2Y = p2Dto.Y + t * d2.Y;

  const closestPoints = ClosestPointsPool.Rent();

  closestPoints.Set(c1X, c1Y, c2X, c2Y);

  return closestPoints;
}

// suplimental functions ====================================

export function FindArithemticMean(
  verticies: Array<FlatVec>,
  pooledVec: PooledVector
): PooledVector {
  let sumX = 0;
  let sumY = 0;
  const vertLength = verticies.length;

  for (let index = 0; index < vertLength; index++) {
    const v = verticies[index];
    sumX += v.X;
    sumY += v.Y;
  }

  return pooledVec.SetXY(sumX, sumY).Divide(vertLength);
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
  vecPool: Pool<PooledVector>,
  projResPool: Pool<ProjectionResult>
): IProjectionResult {
  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;

  const vRes = vecPool.Rent();

  for (let i = 0; i < verticies.length; i++) {
    const v = verticies[i];
    vRes.SetXY(v.X, v.Y);

    // get the projection for the given axis
    const projection = vRes.DotProduct(axis);

    // set the minimum projection
    if (projection < min) {
      min = projection;
    }
    //set the maximum projection
    if (projection > max) {
      max = projection;
    }
  }

  let result = projResPool.Rent();
  result.SetMinMax(min, max);
  return result;
}

export function LineSegmentIntersection(
  ax1: number,
  ay1: number,
  ax2: number,
  ay2: number,
  bx3: number,
  by3: number,
  bx4: number,
  by4: number
): boolean {
  const denom = (by4 - by3) * (ax2 - ax1) - (bx4 - bx3) * (ay2 - ay1);
  const numeA = (bx4 - bx3) * (ay1 - by3) - (by4 - by3) * (ax1 - bx3);
  const numeB = (ax2 - ax1) * (ay1 - by3) - (ay2 - ay1) * (ax1 - bx3);

  if (denom === 0) {
    return false;
  }

  const uA = numeA / denom;
  const uB = numeB / denom;

  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
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
