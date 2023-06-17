import {
  FlatVec,
  VectorAllocator,
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
  //debugger;
  let normal = VectorAllocator();
  let depth = Number.MAX_VALUE;

  for (let i = 0; i < verticiesA.length; i++) {
    const va = verticiesA[i];
    const vb = verticiesA[(i + 1) % verticiesA.length]; // Go through verticies in clockwise order.
    const edge = VectorSubtractor(vb, va); // get the edge
    const axis = VectorAllocator(-edge.Y, edge.X); // get the axis

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
    const axis = VectorAllocator(-edge.Y, edge.X); // get the axis

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

  depth /= Length(normal);
  normal = Normalize(normal);

  const centerA = FindArithemticMean(verticiesA);
  const centerB = FindArithemticMean(verticiesB);

  const direction = VectorSubtractor(centerB, centerA);

  if (DotProduct(direction, normal) < 0) {
    normal = VectorNegator(normal);
  }

  return { collision: true, normal, depth } as collisionResult;
}

function ProjectVerticies(verticies: Array<FlatVec>, axis: FlatVec) {
  let min = Number.MAX_VALUE;
  let max = Number.MIN_VALUE;

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

function collisionResultAllocator(
  collision: boolean,
  normal: FlatVec | null,
  depth: number | null
) {
  return { collision, normal, depth } as collisionResult;
}
