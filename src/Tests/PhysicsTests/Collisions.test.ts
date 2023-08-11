import { beforeEach, expect, test } from '@jest/globals';
import { IntersectsPolygons } from '../../Physics/Collisions';
import { FlatVec, VectorAdder, VectorAllocator } from '../../Physics/FlatVec';

let poly1: Array<FlatVec>;
let poly2: Array<FlatVec>;

beforeEach(() => {
  poly1 = new Array<FlatVec>();
  poly2 = new Array<FlatVec>();

  poly1[0] = VectorAllocator(0, 0);
  poly1[1] = VectorAllocator(50, 0);
  poly1[2] = VectorAllocator(50, 50);
  poly1[3] = VectorAllocator(0, 50);

  poly2[0] = VectorAllocator(0, 0);
  poly2[1] = VectorAllocator(50, 0);
  poly2[2] = VectorAllocator(50, 50);
  poly2[3] = VectorAllocator(0, 50);
});

test('Test Move', () => {
  let p1 = Move(poly1, VectorAllocator(100, 0));

  expect(p1[0].X).toBe(100);
  expect(p1[1].X).toBe(150);
});

test('IntersectsPolygons returns false', () => {
  let p1 = Move(poly1, VectorAllocator(100, 100));
  let p2 = Move(poly2, VectorAllocator(300, 300));

  let res = IntersectsPolygons(p1, p2);

  expect(res.collision).toBeFalsy();
});

test('IntersectsPolygons returns true', () => {
  let p1 = Move(poly1, VectorAllocator(100, 100));
  let p2 = Move(poly2, VectorAllocator(110, 100));

  let res = IntersectsPolygons(p1, p2);

  expect(res.collision).toBeTruthy();
});

test('Continuous collision detection returns true', () => {
  let poly3 = new Array<FlatVec>();
  poly3[0] = VectorAllocator(0, 0);
  poly3[1] = VectorAllocator(50, 0);
  poly3[2] = VectorAllocator(50, 50);
  poly3[3] = VectorAllocator(0, 50);

  let start = Move(poly1, VectorAllocator(100, 100));
  let finish = Move(poly2, VectorAllocator(300, 100));
  let p3 = Move(poly3, VectorAllocator(175, 51));

  let poly4 = start.concat(finish);

  let res = IntersectsPolygons(poly4, p3);

  expect(res.collision).toBe(true);
  //   expect(res.depth).toBe(10);
  //   expect(res.normal?.Y).toBe(1);
  console.log(res);
});

function Move(poly: Array<FlatVec>, pos: FlatVec) {
  poly[0] = pos;

  for (let i = 1; i < poly.length; i++) {
    poly[i] = VectorAdder(poly[i], pos);
  }
  return poly;
}
