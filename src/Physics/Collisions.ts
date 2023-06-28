import {
  FlatVec,
  VectorAdder,
  VectorAllocator,
  VectorMultiplier,
  VectorNegator,
  VectorSubtractor,
} from './FlatVec';
import { Distance, DotProduct, Length, Normalize } from './VecMath';

type collisionResult = {
  collision: boolean;
  normal: FlatVec | null;
  depth: number | null;
};

type ProjectionResult = {
  min: number;
  max: number;
};

export function IntersectsPolygons(
  verticiesA: Array<FlatVec>,
  verticiesB: Array<FlatVec>
) {
  let normal = VectorAllocator();
  let depth = Number.MAX_SAFE_INTEGER;

  for (let i = 0; i < verticiesA.length; i++) {
    const va = verticiesA[i];
    const vb = verticiesA[(i + 1) % verticiesA.length]; // Go through verticies in clockwise order.
    const edge = VectorSubtractor(vb, va); // get the edge
    let axis = VectorAllocator(-edge.Y, edge.X); // get the axis
    axis = Normalize(axis);
    // Project verticies for both polygons.
    const vaProj = ProjectVerticies(verticiesA, axis);
    const vbProj = ProjectVerticies(verticiesB, axis);

    if (vaProj.min >= vbProj.max || vbProj.min >= vaProj.max) {
      return { collision: false, normal: null, depth: null } as collisionResult;
    }
    const axisDepth = Math.min(
      vbProj.max - vaProj.min,
      vaProj.max - vbProj.min
    );
    if (axisDepth < depth) {
      depth = axisDepth;
      normal = axis;
    }
  }

  for (let i = 0; i < verticiesB.length; i++) {
    const va = verticiesB[i];
    const vb = verticiesB[(i + 1) % verticiesB.length]; // Go through verticies in clockwise order.
    const edge = VectorSubtractor(vb, va); // get the edge
    let axis = VectorAllocator(-edge.Y, edge.X); // get the axis
    axis = Normalize(axis);

    // Project verticies for both polygons.
    const vaProj = ProjectVerticies(verticiesA, axis);
    const vbProj = ProjectVerticies(verticiesB, axis);

    if (vaProj.min >= vbProj.max || vbProj.min >= vaProj.max) {
      return { collision: false, normal: null, depth: null } as collisionResult;
    }
    const axisDepth = Math.min(
      vbProj.max - vaProj.min,
      vaProj.max - vbProj.min
    );
    if (axisDepth < depth) {
      depth = axisDepth;
      normal = axis;
    }
  }

  const centerA = FindArithemticMean(verticiesA);
  const centerB = FindArithemticMean(verticiesB);

  const direction = VectorSubtractor(centerB, centerA);

  if (DotProduct(direction, normal) < 0) {
    normal = VectorNegator(normal);
  }

  return { collision: true, normal, depth } as collisionResult;
}

export function IntersectCircle(
  v1: FlatVec,
  v1Radius: number,
  v2: FlatVec,
  v2Radius: number
) {
  let dist = Distance(v1, v2);
  let raddi = v1Radius + v2Radius;

  if (dist >= raddi) {
    return collisionResultAllocator(false, null, null);
  }

  return collisionResultAllocator(
    true,
    Normalize(VectorSubtractor(v2, v1)),
    raddi - dist
  );
}

export function IntersectCirclePolygon(
  circleCenter: FlatVec,
  radius: number,
  verticies: FlatVec[]
) {
  let normal = VectorAllocator();
  let depth = Number.MAX_SAFE_INTEGER;

  let axis: FlatVec;
  let axisDepth = 0;
  let vaProj: ProjectionResult;
  let vbProj: ProjectionResult;

  for (let i = 0; i < verticies.length; i++) {
    const va = verticies[i];
    const vb = verticies[(i + 1) % verticies.length]; // Go through verticies in clockwise order.
    const edge = VectorSubtractor(vb, va); // get the edge
    axis = VectorAllocator(-edge.Y, edge.X); // get the axis
    axis = Normalize(axis);
    // Project verticies for polygon.
    vaProj = ProjectVerticies(verticies, axis);
    // Project Circle on axis
    vbProj = ProjectCircle(circleCenter, radius, axis);

    if (vaProj.min >= vbProj.max || vbProj.min >= vaProj.max) {
      return { collision: false, normal: null, depth: null } as collisionResult;
    }
    axisDepth = Math.min(vbProj.max - vaProj.min, vaProj.max - vbProj.min);
    if (axisDepth < depth) {
      depth = axisDepth;
      normal = axis;
    }
  }

  const cpIndex = FindClosestPointOnPolygon(circleCenter, verticies);
  const cp = verticies[cpIndex];

  axis = VectorSubtractor(cp, circleCenter);
  axis = Normalize(axis);

  vaProj = ProjectVerticies(verticies, axis);
  // Project Circle on axis
  vbProj = ProjectCircle(circleCenter, radius, axis);

  if (vaProj.min >= vbProj.max || vbProj.min >= vaProj.max) {
    return { collision: false, normal: null, depth: null } as collisionResult;
  }

  axisDepth = Math.min(vbProj.max - vaProj.min, vaProj.max - vbProj.min);
  if (axisDepth < depth) {
    depth = axisDepth;
    normal = axis;
  }

  const polygonCenter = FindArithemticMean(verticies);

  const direction = VectorSubtractor(polygonCenter, circleCenter);

  if (DotProduct(direction, normal) < 0) {
    normal = VectorNegator(normal);
  }

  return { collision: true, normal, depth } as collisionResult;
}

function ProjectVerticies(verticies: Array<FlatVec>, axis: FlatVec) {
  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;

  for (let i = 0; i < verticies.length; i++) {
    const v = verticies[i];
    const projection = DotProduct(v, axis); // get the projection for the given axis

    // set the minimum projection
    if (projection < min) {
      min = projection;
    }
    //set the maximum projection
    if (projection > max) {
      max = projection;
    }
  }

  return { min, max } as ProjectionResult;
}

function ProjectCircle(center: FlatVec, radius: number, axis: FlatVec) {
  let min: number;
  let max: number;

  const direction = Normalize(axis);
  const directAndRadius = VectorMultiplier(direction, radius);

  const p1 = VectorAdder(center, directAndRadius);
  const p2 = VectorSubtractor(center, directAndRadius);

  min = DotProduct(p1, axis);
  max = DotProduct(p2, axis);

  if (min > max) {
    // swap if necessary
    let temp = min;
    min = max;
    max = temp;
  }

  return { min, max } as ProjectionResult;
}

function FindArithemticMean(verticies: Array<FlatVec>) {
  let sumX = 0;
  let sumY = 0;

  for (let index = 0; index < verticies.length; index++) {
    const v = verticies[index];
    sumX += v.X;
    sumY += v.Y;
  }

  return VectorAllocator(sumX / verticies.length, sumY / verticies.length);
}

// Returns the index of the verticies array that points to the closest point on Polygon.
function FindClosestPointOnPolygon(center: FlatVec, verticies: FlatVec[]) {
  let result = -1;
  let minDist = Number.MAX_SAFE_INTEGER;

  for (let index = 0; index < verticies.length; index++) {
    const v = verticies[index];
    const dist = Distance(v, center);

    if (dist < minDist) {
      minDist = dist;
      result = index;
    }
  }

  return result;
}

function collisionResultAllocator(
  collision: boolean,
  normal: FlatVec | null,
  depth: number | null
) {
  return { collision, normal, depth } as collisionResult;
}
