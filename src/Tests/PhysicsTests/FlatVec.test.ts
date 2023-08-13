import { test, expect, beforeEach } from '@jest/globals';
import * as FV from '../../Physics/FlatVec';

test('VectorAllocator Returns correct vector', () => {
  let v = FV.VectorAllocator(3, 5);

  expect(v.X).toBe(3);
  expect(v.Y).toBe(5);

  v = FV.VectorAllocator();

  expect(v.X).toBe(0);
  expect(v.Y).toBe(0);
});

test('VectorAdder Returns correct', () => {
  let v1 = FV.VectorAllocator(2, 2);
  let v2 = FV.VectorAllocator(3, 3);

  let v3 = FV.VectorAdder(v1, v2);

  expect(v3.X).toBe(5);
  expect(v3.Y).toBe(5);

  let v1b = FV.VectorAllocator(7, 4);
  let v2b = FV.VectorAllocator(2, 9);

  let v3b = FV.VectorAdder(v1b, v2b);

  expect(v3b.X).toBe(9);
  expect(v3b.Y).toBe(13);
});

test('VectorSubtractor Returns Correct', () => {
  let v1 = FV.VectorAllocator(7, 4);
  let v2 = FV.VectorAllocator(2, 9);

  let v3 = FV.VectorSubtractor(v1, v2);
  let v4 = FV.VectorSubtractor(v2, v1);

  expect(v3.X).toBe(5);
  expect(v3.Y).toBe(-5);

  expect(v4.X).toBe(-5);
  expect(v4.Y).toBe(5);
});

test('VectorMultiplier Returns Correct', () => {
  let v1 = FV.VectorAllocator(2, 3);

  let v2 = FV.VectorMultiplier(v1, 2);

  expect(v2.X).toBe(4);
  expect(v2.Y).toBe(6);
});

test('VectorNegator returns correct', () => {
  let v1 = FV.VectorAllocator(12, 34);

  let v2 = FV.VectorNegator(v1);
  let v3 = FV.VectorNegator(v2);

  expect(v2.X).toBe(-12);
  expect(v2.Y).toBe(-34);

  expect(v3.X).toBe(12);
  expect(v3.Y).toBe(34);
});

test('VectorDivider returns correct', () => {
  let v1 = FV.VectorAllocator(7, 66);
  let v2 = FV.VectorDivider(v1, 2);

  expect(v2.X).toBe(3.5);
  expect(v2.Y).toBe(33);
});
