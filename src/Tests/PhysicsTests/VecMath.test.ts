import { test, expect, beforeEach } from '@jest/globals';

import * as FV from '../../Physics/FlatVec';
import * as VM from '../../Physics/VecMath';

test('Length Of Vector returns correct', () => {
  let v1 = FV.VectorAllocator(3, 5);
  // 3 * 3 = 9, 5 * 5 = 25, 9 + 25 = 34, sqrt of 34 = 5.8309518948
  let length = VM.Length(v1);

  expect(length).toBeCloseTo(5.83);
});

test('Distance between two vectors returns correct', () => {
  let v1 = FV.VectorAllocator(4, 4);
  let v2 = FV.VectorAllocator(3, 3);
  // 4 - 3 = 1, 4 -3 = 1, 1 * 1 + 1 * 1 = 2, sqrt of 2 = 1.4142~
  let dist = VM.Distance(v1, v2);

  expect(dist).toBeCloseTo(1.4142);
});

test('Normalize returns correct', () => {
  let v1 = FV.VectorAllocator(2, 4);
  // 2 * 2 = 4; 4 * 4 = 16; 4 + 16 = 20; sqrt of 20 = 4.4721359549~ = length
  // X = 2 / 4.4721359549, Y = 4 / 4.4721359549
  // x = 0.4472135959, Y = 0.8944271919

  let normal = VM.Normalize(v1);

  expect(normal.X).toBeCloseTo(0.4472135959);
  expect(normal.Y).toBeCloseTo(0.8944271919);

  expect(VM.Length(normal)).toBeCloseTo(1);
});

test('DotProdcut returns correct', () => {
  let v1 = FV.VectorAllocator(10, 5);
  let v2 = FV.VectorAllocator(3, 2);
  // 10 * 3 = 30; 5 * 2 = 10; 30 + 10 = 40;

  let dp = VM.DotProduct(v1, v2);

  expect(dp).toBe(40);
});

test('CrossProduct returns correct', () => {
  let v1 = FV.VectorAllocator(10, 5);
  let v2 = FV.VectorAllocator(3, 2);
  // 10 * 2 = 20;, 5 * 3 = 15; 20 - 15 = 5;

  let cp = VM.CrossProduct(v1, v2);

  expect(cp).toBe(5);
});
