import { CollisionResult, ICollisionResult } from '../pools/CollisionResult';
import { Pool } from '../pools/Pool';
import { IProjectionResult, ProjectionResult } from '../pools/ProjectResult';
import { PooledVector } from '../pools/PooledVector';
import { FlatVec } from './vector';
import { ClampWithMin } from '../utils';
import { ClosestPointsResult } from '../pools/ClosestPointsResult';
import {
  ClampRaw,
  DivideRaw,
  DotProductVectorRaw,
  FixedPoint,
  MAX_RAW_VALUE,
  MIN_RAW_VALUE,
  MultiplyRaw,
  NumberToRaw,
} from '../../math/fixedPoint';

export function IntersectsPolygons(
  verticiesA: Array<FlatVec>,
  verticiesB: Array<FlatVec>,
  vecPool: Pool<PooledVector>,
  colResPool: Pool<CollisionResult>,
  projResPool: Pool<ProjectionResult>
): ICollisionResult {
  let normal = vecPool.Rent();
  let depthRaw = MAX_RAW_VALUE;

  const verticiesAVec = vecPool.Rent();
  const verticiesBVec = vecPool.Rent();

  for (let i = 0; i < verticiesA.length; i++) {
    // Go through verticies in clockwise order.
    const va = verticiesA[i];
    const vb = verticiesA[(i + 1) % verticiesA.length];
    verticiesAVec.SetXY(va.X, va.Y);
    verticiesBVec.SetXY(vb.X, vb.Y);

    // Get edge vector
    const edge = verticiesBVec.SubtractVec(verticiesAVec);

    // Get perpendicular axis.
    const tempX = edge.X.Raw(); //fpp.Rent().setFromFp(edge.X);
    edge.SetX(edge.Y.negate());
    edge.SetYRaw(tempX);

    let axis = edge.Normalize();

    // Project verticies for both polygons.

    const vaProj = projectVerticies(verticiesA, axis, projResPool);
    const vbProj = projectVerticies(verticiesB, axis, projResPool);

    if (
      vaProj.Min.greaterThanOrEqualTo(vbProj.Max) ||
      vbProj.Min.greaterThanOrEqualTo(vaProj.Max)
    ) {
      return colResPool.Rent();
    }

    const vbVaDepthRaw = vbProj.Max.Raw() - vaProj.Min.Raw();
    const vaVbDepthRaw = vaProj.Max.Raw() - vbProj.Max.Raw();
    const axisDepthRaw = Math.min(vbVaDepthRaw, vaVbDepthRaw);

    if (axisDepthRaw < depthRaw) {
      depthRaw = axisDepthRaw;
      normal.SetXY(axis.X, axis.Y);
    }
  }

  verticiesAVec.Zero();
  verticiesBVec.Zero();

  for (let i = 0; i < verticiesB.length; i++) {
    const va = verticiesB[i];
    const vb = verticiesB[(i + 1) % verticiesB.length]; // Go through verticies in clockwise order.
    verticiesAVec.SetXY(va.X, va.Y);
    verticiesBVec.SetXY(vb.X, vb.Y);

    const edge = verticiesBVec.SubtractVec(verticiesAVec);
    const tempX = edge.X.Raw();
    edge.SetX(edge.Y.negate());
    edge.SetYRaw(tempX);

    let axis = edge.Normalize();

    // Project verticies for both polygons.

    const vaProj = projectVerticies(verticiesA, axis, projResPool);

    const vbProj = projectVerticies(verticiesB, axis, projResPool);

    if (
      vaProj.Min.greaterThanOrEqualTo(vbProj.Max) ||
      vbProj.Min.greaterThanOrEqualTo(vaProj.Max)
    ) {
      return colResPool.Rent();
    }

    const vbVaDepthRaw = vbProj.Max.Raw() - vaProj.Min.Raw();
    const vaVbDepthRaw = vaProj.Max.Raw() - vbProj.Min.Raw();

    const axisDepthRaw = Math.min(vbVaDepthRaw, vaVbDepthRaw);

    if (axisDepthRaw < depthRaw) {
      depthRaw = axisDepthRaw;
      normal.SetXY(axis.X, axis.Y);
    }
  }

  const centerA = FindArithemticMean(verticiesA, vecPool.Rent());
  const centerB = FindArithemticMean(verticiesB, vecPool.Rent());

  const direction = centerB.SubtractVec(centerA);

  const dp = DotProductVectorRaw(
    direction.X.Raw(),
    direction.Y.Raw(),
    normal.X.Raw(),
    normal.Y.Raw()
  );

  if (dp < 0) {
    normal.Negate();
  }

  const res = colResPool.Rent();
  res.SetCollisionTrueRaw(normal.X.Raw(), normal.Y.Raw(), depthRaw);
  return res;
}

export function IntersectsCircles(
  colResPool: Pool<CollisionResult>,
  v1: PooledVector,
  v2: PooledVector,
  r1: FixedPoint,
  r2: FixedPoint
): CollisionResult {
  const distRaw = v1.DistanceRaw(v2);
  const raddiRaw = r1.Raw() + r2.Raw();

  if (distRaw > raddiRaw) {
    // false, comes from pool in zeroed state.
    return colResPool.Rent();
  }

  const norm = v2.SubtractVec(v1).Normalize();
  const depthRaw = raddiRaw - distRaw;
  const returnValue = colResPool.Rent();

  returnValue.SetCollisionTrueRaw(norm.X.Raw(), norm.Y.Raw(), depthRaw);

  return returnValue;
}

export function ClosestPointsBetweenSegments(
  p1: PooledVector,
  q1: PooledVector,
  p2: PooledVector,
  q2: PooledVector,
  fpp: Pool<FixedPoint>,
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
    return closestPointOnSegmentToPoint(p2, q2, p1, ClosestPointsPool);
  }

  if (isSegment2Point) {
    // Segment 2 is a point
    return closestPointOnSegmentToPoint(p1, q1, p2, ClosestPointsPool);
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
  if (denom.Raw() !== 0) {
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

  // c1 = p1 + s * d1
  const c1X = fpp.Rent().setAdd(p1.X, fpp.Rent().setMultiply(s, d1.X));
  const c1Y = fpp.Rent().setAdd(p1.Y, fpp.Rent().setMultiply(s, d1.Y));
  // c2 = p2 + t * d2 (p2Dto is p2 as a PooledVector)
  const c2X = fpp.Rent().setAdd(p2Dto.X, fpp.Rent().setMultiply(t, d2.X));
  const c2Y = fpp.Rent().setAdd(p2Dto.Y, fpp.Rent().setMultiply(t, d2.Y));

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
    sumX += v.X.Raw();
    sumY += v.Y.Raw();
  }

  const lengthRaw = NumberToRaw(vertLength);
  sumX = DivideRaw(sumX, lengthRaw);
  sumY = DivideRaw(sumY, lengthRaw);
  return pooledVec.SetXYRaw(sumX, sumY);
}

function closestPointOnSegmentToPoint(
  segStart: FlatVec,
  segEnd: FlatVec,
  point: FlatVec,
  ClosestPointsPool: Pool<ClosestPointsResult>
): ClosestPointsResult {
  const segStartXRaw = segStart.X.Raw();
  const segStartYRaw = segStart.Y.Raw();
  const segEndXRaw = segEnd.X.Raw();
  const segEndYRaw = segEnd.Y.Raw();
  const pointXRaw = point.X.Raw();
  const pointYRaw = point.Y.Raw();

  const segVecXRaw = segEndXRaw - segStartXRaw;
  const segVecYRaw = segEndYRaw - segStartYRaw;

  const pointVecXRaw = pointXRaw - segStartXRaw;
  const pointVecYRaw = pointYRaw - segStartYRaw;

  const xLengthRaw = MultiplyRaw(segVecXRaw, segVecXRaw);
  const yLengthRaw = MultiplyRaw(segVecYRaw, segVecYRaw);
  const segLengthSquaredRaw = xLengthRaw + yLengthRaw;

  let tRaw = 0;
  if (segLengthSquaredRaw > 0) {
    const tT1Raw = MultiplyRaw(pointVecXRaw, segVecXRaw);
    const tT2Raw = MultiplyRaw(pointVecYRaw, segVecYRaw);
    const tNumeratorRaw = tT1Raw + tT2Raw;
    tRaw = DivideRaw(tNumeratorRaw, segLengthSquaredRaw);
    // t = (pointVec · segVec) / |seg|^2  (tRaw is in scaled raw units)
    // Clamp tRaw to [0, 1] in raw (scaled) space so the closest point lies on the segment
    const oneRaw = NumberToRaw(1);
    if (tRaw < 0) {
      tRaw = 0;
    } else if (tRaw > oneRaw) {
      tRaw = oneRaw;
    }
  }

  const segXTRaw = MultiplyRaw(segVecXRaw, tRaw);
  const segYTRaw = MultiplyRaw(segVecYRaw, tRaw);
  const closestX = segStartXRaw + segXTRaw;
  const closestY = segStartYRaw + segYTRaw;

  const ret = ClosestPointsPool.Rent();
  ret.SetRaw(closestX, closestY, pointXRaw, pointYRaw);
  return ret;
}

function projectVerticies(
  verticies: Array<FlatVec>,
  axis: PooledVector,
  projResPool: Pool<ProjectionResult>
): IProjectionResult {
  let min = MAX_RAW_VALUE;
  let max = MIN_RAW_VALUE;

  for (let i = 0; i < verticies.length; i++) {
    const v = verticies[i];

    // get the projection for the given axis
    const projection = DotProductVectorRaw(
      v.X.Raw(),
      v.Y.Raw(),
      axis.X.Raw(),
      axis.Y.Raw()
    );

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
  result.SetMinMaxRaw(min, max);
  return result;
}

export function LineSegmentIntersectionRaw(
  ax1: number,
  ay1: number,
  ax2: number,
  ay2: number,
  bx3: number,
  by3: number,
  bx4: number,
  by4: number
): boolean {
  const denom =
    MultiplyRaw(by4 - by3, ax2 - ax1) - MultiplyRaw(bx4 - bx3, ay2 - ay1);
  if (denom === 0) {
    return false;
  }

  const numeA =
    MultiplyRaw(bx4 - bx3, ay1 - by3) - MultiplyRaw(by4 - by3, ax1 - bx3);
  const numeB =
    MultiplyRaw(ax2 - ax1, ay1 - by3) - MultiplyRaw(ay2 - ay1, ax1 - bx3);

  const uA = DivideRaw(numeA, denom);
  const uB = DivideRaw(numeB, denom);

  const one = NumberToRaw(1);

  if (uA >= 0 && uA <= one && uB >= 0 && uB <= one) {
    return true;
  }

  return false;
}

export function LineSegmentIntersectionFp(
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

  if (denom.Raw() === 0) {
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
  const zero = fpp.Rent().setFromNumber(0);

  if (
    uA.greaterThanOrEqualTo(zero) &&
    uA.lessThanOrEqualTo(one) &&
    uB.greaterThanOrEqualTo(zero) &&
    uB.lessThanOrEqualTo(one)
  ) {
    return true;
  }

  return false;
}

// Function to compute the cross product of two vectors
function cross(
  o: FlatVec,
  a: FlatVec,
  b: FlatVec,
  fpp: Pool<FixedPoint>
): FixedPoint {
  const term1_part1 = fpp.Rent().setSubtract(a.X, o.X);
  const term1_part2 = fpp.Rent().setSubtract(b.Y, o.Y);
  const term1 = term1_part1.multiply(term1_part2); // term1_part1 is now term1

  const term2_part1 = fpp.Rent().setSubtract(a.Y, o.Y);
  const term2_part2 = fpp.Rent().setSubtract(b.X, o.X);
  const term2 = term2_part1.multiply(term2_part2); // term2_part1 is now term2

  return term1.subtract(term2); // term1 is now the result
}

// let fppLoc: Pool<FixedPoint> = new Pool<FixedPoint>(
//   100,
//   () => new FixedPoint()
// );

function comparePointsXY(a: FlatVec, b: FlatVec): number {
  if (a.X.equals(b.X)) {
    const diff = a.Y.Raw() - b.Y.Raw(); //fppLoc.Rent().setSubtract(a.Y, b.Y);
    return diff;
  }
  const diff = a.X.Raw() - b.X.Raw(); //fppLoc.Rent().setSubtract(a.X, b.X);
  return diff;
}

const lower: Array<FlatVec> = [];
const upper: Array<FlatVec> = [];

export function CreateConvexHull(
  points: Array<FlatVec>,
  fpp: Pool<FixedPoint>
): Array<FlatVec> {
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
      cross(lower[lower.length - 2], lower[lower.length - 1], p, fpp)
        .AsNumber <= 0
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
      cross(upper[upper.length - 2], upper[upper.length - 1], p, fpp)
        .AsNumber <= 0
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
