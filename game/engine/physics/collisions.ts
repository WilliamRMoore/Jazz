import { CollisionResult, ICollisionResult } from '../pools/CollisionResult';
import { Pool } from '../pools/Pool';
import { IProjectionResult, ProjectionResult } from '../pools/ProjectResult';
import { PooledVector } from '../pools/PooledVector';
import { FlatVec, Line } from './vector';
import { ClampWithMin } from '../utils';
import { ClosestPointsResult } from '../pools/ClosestPointsResult';
import {
  DivideRaw,
  DotProductRaw,
  DotProductVectorRaw,
  FixedPoint,
  MAX_RAW_VALUE,
  MIN_RAW_VALUE,
  MultiplyRaw,
  NumberToRaw,
} from '../../math/fixedPoint';

const ONE = NumberToRaw(1);

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
    verticiesAVec.SetFromFlatVec(va);
    verticiesBVec.SetFromFlatVec(vb);

    // Get edge vector
    const edge = verticiesBVec.SubtractVec(verticiesAVec);
    // Get perpendicular axis.
    const tempXRaw = edge.X.Raw;
    edge.SetX(edge.Y.Negate());
    edge.SetYRaw(tempXRaw);

    let axis = edge.Normalize();

    // Project verticies for both polygons.

    const vaProj = projectVerticies(verticiesA, axis, projResPool);
    const vbProj = projectVerticies(verticiesB, axis, projResPool);

    if (
      vaProj.Min.GreaterThanOrEqualTo(vbProj.Max) ||
      vbProj.Min.GreaterThanOrEqualTo(vaProj.Max)
    ) {
      return colResPool.Rent();
    }

    const vbVaDepthRaw = vbProj.Max.Raw - vaProj.Min.Raw;
    const vaVbDepthRaw = vaProj.Max.Raw - vbProj.Max.Raw;
    const axisDepthRaw = Math.min(vbVaDepthRaw, vaVbDepthRaw);

    if (axisDepthRaw < depthRaw) {
      depthRaw = axisDepthRaw;
      normal.SetFromPooledVec(axis);
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
    const tempXRaw = edge.X.Raw;
    edge.SetX(edge.Y.Negate());
    edge.SetYRaw(tempXRaw);

    let axis = edge.Normalize();

    // Project verticies for both polygons.

    const vaProj = projectVerticies(verticiesA, axis, projResPool);

    const vbProj = projectVerticies(verticiesB, axis, projResPool);

    if (
      vaProj.Min.GreaterThanOrEqualTo(vbProj.Max) ||
      vbProj.Min.GreaterThanOrEqualTo(vaProj.Max)
    ) {
      return colResPool.Rent();
    }

    const vbVaDepthRaw = vbProj.Max.Raw - vaProj.Min.Raw;
    const vaVbDepthRaw = vaProj.Max.Raw - vbProj.Min.Raw;

    const axisDepthRaw = Math.min(vbVaDepthRaw, vaVbDepthRaw);

    if (axisDepthRaw < depthRaw) {
      depthRaw = axisDepthRaw;
      normal.SetXY(axis.X, axis.Y);
    }
  }

  const centerA = FindArithemticMean(verticiesA, vecPool.Rent());
  const centerB = FindArithemticMean(verticiesB, vecPool.Rent());

  const direction = centerB.SubtractVec(centerA);

  const dp = DotProductRaw(
    direction.X.Raw,
    direction.Y.Raw,
    normal.X.Raw,
    normal.Y.Raw
  );

  if (dp < 0) {
    normal.Negate();
  }

  const res = colResPool.Rent();
  res.SetCollisionTrueRaw(normal.X.Raw, normal.Y.Raw, depthRaw);
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
  const raddiRaw = r1.Raw + r2.Raw;

  if (distRaw > raddiRaw) {
    // false, comes from pool in zeroed state.
    return colResPool.Rent();
  }

  const norm = v2.SubtractVec(v1).Normalize();
  const depthRaw = raddiRaw - distRaw;
  const returnValue = colResPool.Rent();

  returnValue.SetCollisionTrueRaw(norm.X.Raw, norm.Y.Raw, depthRaw);

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
  const isSegment1Point = p1.X.Equals(q1.X) && p1.Y.Equals(q1.Y);
  const isSegment2Point = p2.X.Equals(q2.X) && p2.Y.Equals(q2.Y);

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

  // Use new vectors for direction to avoid mutating inputs q1 and q2
  const d1 = vecPool.Rent().SetFromPooledVec(q1).SubtractVec(p1Dto);
  const d2 = vecPool.Rent().SetFromPooledVec(q2).SubtractVec(p2Dto);
  const r = p1Dto.SubtractVec(p2Dto);

  const aRaw = DotProductVectorRaw(d1, d1);
  const eRaw = DotProductVectorRaw(d2, d2);
  const fRaw = DotProductVectorRaw(d2, r);

  let sRaw = 0;
  let tRaw = 0;

  const bRaw = DotProductVectorRaw(d1, d2);
  const cRaw = DotProductVectorRaw(d1, r);

  //const denom = a * e - b * b;

  const denomT1Raw = MultiplyRaw(aRaw, eRaw);
  const denomT2Raw = MultiplyRaw(bRaw, bRaw);
  const denomRaw = denomT1Raw - denomT2Raw;

  // Check for parallel or near-parallel lines
  if (denomRaw !== 0) {
    // Use a small epsilon to handle near-parallel cases
    const sNumeT1Raw = MultiplyRaw(bRaw, fRaw);
    const sNumeT2Raw = MultiplyRaw(cRaw, eRaw);
    const sNumeRaw = sNumeT1Raw - sNumeT2Raw;

    sRaw = DivideRaw(sNumeRaw, denomRaw);

    sRaw = ClampWithMin(sRaw, 0, ONE);
  } else {
    // Segments are parallel or nearly parallel
    sRaw = 0;
  }

  //  t = (b * s + f) / e;
  const tNumeT1 = MultiplyRaw(bRaw, sRaw);
  const tNume = tNumeT1 + fRaw;

  tRaw = eRaw > 0 ? DivideRaw(tNume, eRaw) : 0;

  if (tRaw < 0) {
    tRaw = 0;
    sRaw = DivideRaw(-cRaw, aRaw);

    sRaw = ClampWithMin(sRaw, 0, ONE);
  } else if (tRaw > ONE) {
    tRaw = ONE; //1;
    const sNumeRaw = bRaw - cRaw;
    sRaw = DivideRaw(sNumeRaw, aRaw);
    sRaw = ClampWithMin(sRaw, 0, ONE);
  }

  // c1 = p1 + s * d1
  const c1X = p1.X.Raw + MultiplyRaw(sRaw, d1.X.Raw);
  const c1Y = p1.Y.Raw + MultiplyRaw(sRaw, d1.Y.Raw);
  // c2 = p2 + t * d2
  const c2X = p2Dto.X.Raw + MultiplyRaw(tRaw, d2.X.Raw);
  const c2Y = p2Dto.Y.Raw + MultiplyRaw(tRaw, d2.Y.Raw);

  const closestPoints = ClosestPointsPool.Rent();

  closestPoints.SetRaw(c1X, c1Y, c2X, c2Y);

  return closestPoints;
}

// suplimental functions ====================================

export function FindArithemticMean(
  verticies: Array<FlatVec>,
  pooledVec: PooledVector
): PooledVector {
  let sumXRaw = 0;
  let sumYRaw = 0;
  const vertLength = verticies.length;

  for (let index = 0; index < vertLength; index++) {
    const v = verticies[index];
    sumXRaw += v.X.Raw;
    sumYRaw += v.Y.Raw;
  }

  const lengthRaw = NumberToRaw(vertLength);
  sumXRaw = DivideRaw(sumXRaw, lengthRaw);
  sumYRaw = DivideRaw(sumYRaw, lengthRaw);
  return pooledVec.SetXYRaw(sumXRaw, sumYRaw);
}

export function closestPointOnSegmentToPoint(
  segStart: FlatVec,
  segEnd: FlatVec,
  point: FlatVec,
  ClosestPointsPool: Pool<ClosestPointsResult>
): ClosestPointsResult {
  const segStartXRaw = segStart.X.Raw;
  const segStartYRaw = segStart.Y.Raw;
  const segEndXRaw = segEnd.X.Raw;
  const segEndYRaw = segEnd.Y.Raw;
  const pointXRaw = point.X.Raw;
  const pointYRaw = point.Y.Raw;

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

    if (tRaw < 0) {
      tRaw = 0;
    } else if (tRaw > ONE) {
      tRaw = ONE;
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

export function projectVerticies(
  verticies: Array<FlatVec>,
  axis: PooledVector,
  projResPool: Pool<ProjectionResult>
): IProjectionResult {
  let min = MAX_RAW_VALUE;
  let max = MIN_RAW_VALUE;

  for (let i = 0; i < verticies.length; i++) {
    const v = verticies[i];

    // get the projection for the given axis
    const projection = DotProductRaw(v.X.Raw, v.Y.Raw, axis.X.Raw, axis.Y.Raw);

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

  const oneRaw = NumberToRaw(1);

  if (uA >= 0 && uA <= oneRaw && uB >= 0 && uB <= oneRaw) {
    return true;
  }

  return false;
}

export function LineSegmentIntersectionFp(
  ax1: FixedPoint,
  ay1: FixedPoint,
  ax2: FixedPoint,
  ay2: FixedPoint,
  bx3: FixedPoint,
  by3: FixedPoint,
  bx4: FixedPoint,
  by4: FixedPoint
): boolean {
  return LineSegmentIntersectionRaw(
    ax1.Raw,
    ay1.Raw,
    ax2.Raw,
    ay2.Raw,
    bx3.Raw,
    by3.Raw,
    bx4.Raw,
    by4.Raw
  );
}

export function LineSegmentIntersectionLine(line1: Line, line2: Line): boolean {
  return LineSegmentIntersectionRaw(
    line1.X1.Raw,
    line1.Y1.Raw,
    line1.X2.Raw,
    line1.Y2.Raw,
    line2.X1.Raw,
    line2.Y1.Raw,
    line2.X2.Raw,
    line2.Y2.Raw
  );
}

// Function to compute the cross product of two vectors
function cross(o: FlatVec, a: FlatVec, b: FlatVec): number {
  const term1_part1Raw = a.X.Raw - o.X.Raw;
  const term1_part2Raw = b.Y.Raw - o.Y.Raw;
  const term1Raw = MultiplyRaw(term1_part1Raw, term1_part2Raw);

  const term2_part1Raw = a.Y.Raw - o.Y.Raw;
  const term2_part2Raw = b.X.Raw - o.X.Raw;
  const term2Raw = MultiplyRaw(term2_part1Raw, term2_part2Raw);

  return term1Raw - term2Raw;
}

function comparePointsXY(a: FlatVec, b: FlatVec): number {
  if (a.X.Equals(b.X)) {
    const diff = a.Y.Raw - b.Y.Raw;
    return diff;
  }
  const diff = a.X.Raw - b.X.Raw;
  return diff;
}

const LOWER: Array<FlatVec> = [];
const UPPER: Array<FlatVec> = [];

export function CreateConvexHull(points: Array<FlatVec>): Array<FlatVec> {
  if (points.length < 3) {
    // A convex hull is not possible with fewer than 3 points
    LOWER.length = 0; // Clear the lower array
    for (let i = 0; i < points.length; i++) {
      LOWER.push(points[i]);
    }
    return LOWER;
  }

  // Sort points lexicographically (by X, then by Y)
  points.sort(comparePointsXY);

  // Clear the lower and upper arrays
  LOWER.length = 0;
  UPPER.length = 0;

  // Build the lower hull
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    while (
      LOWER.length >= 2 &&
      cross(LOWER[LOWER.length - 2], LOWER[LOWER.length - 1], p) <= 0
    ) {
      LOWER.pop();
    }
    LOWER.push(p);
  }

  // Build the upper hull
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i];
    while (
      UPPER.length >= 2 &&
      cross(UPPER[UPPER.length - 2], UPPER[UPPER.length - 1], p) <= 0
    ) {
      UPPER.pop();
    }
    UPPER.push(p);
  }

  // Remove the last point of each half because it's repeated at the beginning of the other half
  LOWER.pop();
  UPPER.pop();

  // Concatenate upper hull into the lower array
  for (let i = 0; i < UPPER.length; i++) {
    LOWER.push(UPPER[i]);
  }

  return LOWER;
}
