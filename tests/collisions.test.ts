import {
  FindArithemticMean,
  IntersectsPolygons,
  ClosestPointsBetweenSegments,
  LineSegmentIntersectionFp,
  IntersectsCircles,
  LineSegmentIntersectionLine,
  CreateConvexHull,
} from '../game/engine/physics/collisions';
import { FixedPoint } from '../game/math/fixedPoint';
import { Pool } from '../game/engine/pools/Pool';
import { FlatVec, Line } from '../game/engine/physics/vector';
import { CollisionResult } from '../game/engine/pools/CollisionResult';
import { ProjectionResult } from '../game/engine/pools/ProjectResult';
import { PooledVector } from '../game/engine/pools/PooledVector';
import { ClosestPointsResult } from '../game/engine/pools/ClosestPointsResult';

describe('FindArithemticMean', () => {
  test('should correctly calculate the arithmetic mean of vertices', () => {
    // 1. Arrange
    const pooledVec = new PooledVector();

    const vertices: FlatVec[] = [
      { X: new FixedPoint(10), Y: new FixedPoint(20) },
      { X: new FixedPoint(30), Y: new FixedPoint(40) },
      { X: new FixedPoint(50), Y: new FixedPoint(60) },
    ];

    // 2. Act
    const mean = FindArithemticMean(vertices, pooledVec);

    // 3. Assert
    // Expected mean: X = (10 + 30 + 50) / 3 = 30, Y = (20 + 40 + 60) / 3 = 40
    expect(mean.X.AsNumber).toBeCloseTo(30, 1);
    expect(mean.Y.AsNumber).toBeCloseTo(40, 1);
  });
});

describe('IntersectsPolygons', () => {
  let fpp: Pool<FixedPoint>;
  let vecPool: Pool<PooledVector>;
  let colResPool: Pool<CollisionResult>;
  let projResPool: Pool<ProjectionResult>;

  beforeEach(() => {
    fpp = new Pool<FixedPoint>(1, () => new FixedPoint(0));
    vecPool = new Pool<PooledVector>(1, () => new PooledVector());
    colResPool = new Pool<CollisionResult>(1, () => new CollisionResult());
    projResPool = new Pool<ProjectionResult>(1, () => new ProjectionResult());
  });

  const polyA: FlatVec[] = [
    { X: new FixedPoint(0), Y: new FixedPoint(0) },
    { X: new FixedPoint(10), Y: new FixedPoint(0) },
    { X: new FixedPoint(10), Y: new FixedPoint(10) },
    { X: new FixedPoint(0), Y: new FixedPoint(10) },
  ];

  test('should return true when polygons are intersecting', () => {
    const polyB: FlatVec[] = [
      { X: new FixedPoint(5), Y: new FixedPoint(5) },
      { X: new FixedPoint(15), Y: new FixedPoint(5) },
      { X: new FixedPoint(15), Y: new FixedPoint(15) },
      { X: new FixedPoint(5), Y: new FixedPoint(15) },
    ];

    const result = IntersectsPolygons(
      polyA,
      polyB,
      vecPool,
      colResPool,
      projResPool
    );

    expect(result.Collision).toBe(true);
  });

  test('should return false when polygons are not intersecting', () => {
    const polyC: FlatVec[] = [
      { X: new FixedPoint(20), Y: new FixedPoint(20) },
      { X: new FixedPoint(30), Y: new FixedPoint(20) },
      { X: new FixedPoint(30), Y: new FixedPoint(30) },
      { X: new FixedPoint(20), Y: new FixedPoint(30) },
    ];

    const result = IntersectsPolygons(
      polyA,
      polyC,
      vecPool,
      colResPool,
      projResPool
    );

    expect(result.Collision).toBe(false);
  });
});

describe('LineSegmentIntersection', () => {
  let fpp: Pool<FixedPoint>;

  beforeEach(() => {
    fpp = new Pool<FixedPoint>(1, () => new FixedPoint());
  });

  test('should return true when line segments intersect', () => {
    const ax1 = new FixedPoint(0);
    const ay1 = new FixedPoint(0);
    const ax2 = new FixedPoint(10);
    const ay2 = new FixedPoint(10);
    const bx3 = new FixedPoint(0);
    const by3 = new FixedPoint(10);
    const bx4 = new FixedPoint(10);
    const by4 = new FixedPoint(0);

    const line = new Line(ax1, ay1, ax2, ay2);
    const line2 = new Line(bx3, by3, bx4, by4);

    const intersects = LineSegmentIntersectionFp(
      line.X1,
      line.Y1,
      line.X2,
      line.Y2,
      line2.X1,
      line2.Y1,
      line2.X2,
      line2.Y2
    );

    expect(intersects).toBe(true);
  });

  test('should return false when line segments dont intersect', () => {
    const ax1 = new FixedPoint(0);
    const ay1 = new FixedPoint(0);
    const ax2 = new FixedPoint(10);
    const ay2 = new FixedPoint(10);
    const bx3 = new FixedPoint(5);
    const by3 = new FixedPoint(0);
    const bx4 = new FixedPoint(15);
    const by4 = new FixedPoint(10);

    const line = new Line(ax1, ay1, ax2, ay2);
    const line2 = new Line(bx3, by3, bx4, by4);

    const intersects = LineSegmentIntersectionLine(line, line2);

    expect(intersects).toBe(false);
  });
});

describe('InteresectCircles', () => {
  let fpp: Pool<FixedPoint>;
  let vecPool: Pool<PooledVector>;
  let colResPool: Pool<CollisionResult>;

  beforeEach(() => {
    fpp = new Pool<FixedPoint>(1, () => new FixedPoint(0));
    vecPool = new Pool<PooledVector>(1, () => new PooledVector());
    colResPool = new Pool<CollisionResult>(1, () => new CollisionResult());
  });

  test('Should return true when circles intersect', () => {
    const v1 = new PooledVector().SetXY(new FixedPoint(0), new FixedPoint(0));
    const v2 = new PooledVector().SetXY(new FixedPoint(5), new FixedPoint(0));
    const r1 = new FixedPoint(3);
    const r2 = new FixedPoint(3);

    const result = IntersectsCircles(colResPool, v1, v2, r1, r2);

    expect(result.Collision).toBe(true);
  });
});

describe('ClosestPointsBetweenSegments', () => {
  let fpp: Pool<FixedPoint>;
  let vecPool: Pool<PooledVector>;
  let closestPool: Pool<ClosestPointsResult>;

  beforeEach(() => {
    fpp = new Pool<FixedPoint>(1, () => new FixedPoint(0));
    vecPool = new Pool<PooledVector>(1, () => new PooledVector());
    closestPool = new Pool<ClosestPointsResult>(
      1,
      () => new ClosestPointsResult()
    );
  });

  test('crossing segments should return the intersection point for both closest points', () => {
    const p1 = new PooledVector().SetXY(new FixedPoint(0), new FixedPoint(0));
    const q1 = new PooledVector().SetXY(new FixedPoint(10), new FixedPoint(10));

    const p2 = new PooledVector().SetXY(new FixedPoint(0), new FixedPoint(10));
    const q2 = new PooledVector().SetXY(new FixedPoint(10), new FixedPoint(0));

    const res = ClosestPointsBetweenSegments(
      p1,
      q1,
      p2,
      q2,
      vecPool,
      closestPool
    );

    // Deterministic expectation: intersection at (5,5)
    expect(res.C1X.AsNumber).toBeCloseTo(5, 6);
    expect(res.C1Y.AsNumber).toBeCloseTo(5, 6);
    expect(res.C2X.AsNumber).toBeCloseTo(5, 6);
    expect(res.C2Y.AsNumber).toBeCloseTo(5, 6);
  });

  test('segment vs point should return closest point on segment and the original point', () => {
    // segment2 is a segment from (1,0) to (2,0), segment1 is a point at (0,0)
    const p1 = new PooledVector().SetXY(new FixedPoint(0), new FixedPoint(0));
    const q1 = new PooledVector().SetXY(new FixedPoint(0), new FixedPoint(0)); // point

    const p2 = new PooledVector().SetXY(new FixedPoint(1), new FixedPoint(0));
    const q2 = new PooledVector().SetXY(new FixedPoint(2), new FixedPoint(0));

    const res = ClosestPointsBetweenSegments(
      p1,
      q1,
      p2,
      q2,
      vecPool,
      closestPool
    );

    // Deterministic ordering: c1 = closest point on segment (1,0), c2 = original point (0,0)
    expect(res.C1X.AsNumber).toBeCloseTo(1, 6);
    expect(res.C1Y.AsNumber).toBeCloseTo(0, 6);
    expect(res.C2X.AsNumber).toBeCloseTo(0, 6);
    expect(res.C2Y.AsNumber).toBeCloseTo(0, 6);
  });

  test('both segments are points should return the two points unchanged', () => {
    const p1 = new PooledVector().SetXY(new FixedPoint(0), new FixedPoint(0));
    const q1 = new PooledVector().SetXY(new FixedPoint(0), new FixedPoint(0));

    const p2 = new PooledVector().SetXY(new FixedPoint(3), new FixedPoint(4));
    const q2 = new PooledVector().SetXY(new FixedPoint(3), new FixedPoint(4));

    const res = ClosestPointsBetweenSegments(
      p1,
      q1,
      p2,
      q2,
      vecPool,
      closestPool
    );

    expect(res.C1X.AsNumber).toBeCloseTo(0, 5);
    expect(res.C1Y.AsNumber).toBeCloseTo(0, 5);
    expect(res.C2X.AsNumber).toBeCloseTo(3, 5);
    expect(res.C2Y.AsNumber).toBeCloseTo(4, 5);
  });

  test('should trigger tRaw > ONE_RAW condition', () => {
    // p1=(0,0), q1=(1,0)
    const p1 = new PooledVector().SetXY(new FixedPoint(0), new FixedPoint(0));
    const q1 = new PooledVector().SetXY(new FixedPoint(1), new FixedPoint(0));

    // p2=(5,0), q2=(4,0)
    const p2 = new PooledVector().SetXY(new FixedPoint(5), new FixedPoint(0));
    const q2 = new PooledVector().SetXY(new FixedPoint(4), new FixedPoint(0));

    const res = ClosestPointsBetweenSegments(
      p1,
      q1,
      p2,
      q2,
      vecPool,
      closestPool
    );

    // c1 should be (1,0) and c2 should be (4,0)
    expect(res.C1X.AsNumber).toBeCloseTo(1, 6);
    expect(res.C1Y.AsNumber).toBeCloseTo(0, 6);
    expect(res.C2X.AsNumber).toBeCloseTo(4, 6);
    expect(res.C2Y.AsNumber).toBeCloseTo(0, 6);
  });
});

describe('CreateConvexHull', () => {
  let fpp: Pool<FixedPoint>;

  beforeEach(() => {
    fpp = new Pool<FixedPoint>(100, () => new FixedPoint());
  });

  test('should form a square', () => {
    const points: FlatVec[] = [
      { X: new FixedPoint(0), Y: new FixedPoint(0) },
      { X: new FixedPoint(10), Y: new FixedPoint(0) },
      { X: new FixedPoint(10), Y: new FixedPoint(10) },
      { X: new FixedPoint(0), Y: new FixedPoint(10) },
    ];

    const hull = CreateConvexHull(points);

    expect(hull.length).toBe(4);
  });

  test('should form a rectangle from two squares', () => {
    const points: FlatVec[] = [
      { X: new FixedPoint(0), Y: new FixedPoint(0) },
      { X: new FixedPoint(10), Y: new FixedPoint(0) },
      { X: new FixedPoint(10), Y: new FixedPoint(10) },
      { X: new FixedPoint(0), Y: new FixedPoint(10) },
      //
      { X: new FixedPoint(5), Y: new FixedPoint(0) },
      { X: new FixedPoint(15), Y: new FixedPoint(0) },
      { X: new FixedPoint(15), Y: new FixedPoint(10) },
      { X: new FixedPoint(5), Y: new FixedPoint(10) },
    ];

    const hull = CreateConvexHull(points);

    expect(hull.length).toBe(4);

    expect(hull[0].X.AsNumber).toBe(0);
    expect(hull[0].Y.AsNumber).toBe(0);
    expect(hull[1].X.AsNumber).toBe(15);
    expect(hull[1].Y.AsNumber).toBe(0);
    expect(hull[2].X.AsNumber).toBe(15);
    expect(hull[2].Y.AsNumber).toBe(10);
    expect(hull[3].X.AsNumber).toBe(0);
    expect(hull[3].Y.AsNumber).toBe(10);
  });

  test('should form a hull pointing in the positive X direction', () => {
    const points: FlatVec[] = [
      { X: new FixedPoint(0), Y: new FixedPoint(0) },
      { X: new FixedPoint(10), Y: new FixedPoint(5) },
      { X: new FixedPoint(0), Y: new FixedPoint(10) },
    ];

    const hull = CreateConvexHull(points);

    expect(hull.length).toBe(3);
  });

  test('should form a hull pointing in the positive Y direction', () => {
    const points: FlatVec[] = [
      { X: new FixedPoint(0), Y: new FixedPoint(0) },
      { X: new FixedPoint(5), Y: new FixedPoint(10) },
      { X: new FixedPoint(10), Y: new FixedPoint(0) },
    ];

    const hull = CreateConvexHull(points);

    expect(hull.length).toBe(3);
  });

  test('should form a hull pointing in the negative X direction', () => {
    const points: FlatVec[] = [
      { X: new FixedPoint(10), Y: new FixedPoint(0) },
      { X: new FixedPoint(0), Y: new FixedPoint(5) },
      { X: new FixedPoint(10), Y: new FixedPoint(10) },
    ];

    const hull = CreateConvexHull(points);

    expect(hull.length).toBe(3);
  });

  test('should form a hull pointing in the negative Y direction', () => {
    const points: FlatVec[] = [
      { X: new FixedPoint(0), Y: new FixedPoint(10) },
      { X: new FixedPoint(5), Y: new FixedPoint(0) },
      { X: new FixedPoint(10), Y: new FixedPoint(10) },
    ];

    const hull = CreateConvexHull(points);

    expect(hull.length).toBe(3);
  });
});
