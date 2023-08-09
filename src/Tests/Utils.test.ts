import { expect, test } from '@jest/globals';
import * as Util from '../utils';

test('Random int', () => {
  let res = Util.getRandomInt(10);
  expect(res).toBeGreaterThanOrEqual(0);
  expect(res).toBeLessThan(11);
});

test('Random number', () => {
  let res = Util.randomNumber(1, 5);

  expect(res).toBeGreaterThan(0);
  expect(res).toBeLessThanOrEqual(5);
});

test('Hash returns true', () => {
  let input = { x: 1.056, y: 5.632 };
  let hash = Util.HashCode(input);
  let hash2 = Util.HashCode(input);

  expect(hash == hash2).toBe(true);
});

test('Hash returns false', () => {
  let input = { x: 1.056, y: 5.632 };
  let input2 = { x: 1.056, y: 5.633 };
  let hash = Util.HashCode(input);
  let hash2 = Util.HashCode(input2);

  expect(hash == hash2).toBe(false);
});
