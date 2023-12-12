import { beforeAll, test } from '@jest/globals';
import { LineSegmentIntersection } from '../../Physics/RayCast/RayCast';
import { Boundry } from '../../Physics/RayCast/Boundry';
import expect from 'expect';
import { FlatVec } from '../../Physics/FlatVec';
import { Ray } from '../../Experiments/Ray';

let b: Boundry;
let SUT: Ray;

beforeAll(() => {
  b = new Boundry(100, 100, 100, 200);
  SUT = new Ray(50, 50, 150, 175);
});

// test('Returns intercept', () => {
//   SUT.LookAt(150, 175);
//   let res = SUT.CastWithLength(b);

//   expect(res).toBeTruthy();
// });

// test('Returns intercept with length', () => {
//   SUT.LookAt(150, 175);
//   let res = SUT.Cast(b);

//   expect(res).toBeTruthy();
// });

test('LineSegment return true with point', () => {
  let x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number;
  //Line A start
  x1 = 100;
  y1 = 100;
  //Line A end
  x2 = 100;
  y2 = 200;
  //LineB start
  x3 = 50;
  y3 = 50;
  //LineB end
  x4 = 150;
  y4 = 175;

  let res = LineSegmentIntersection(x1, y1, x2, y2, x3, y3, x4, y4);

  expect(res).toBeTruthy();
  res = res as FlatVec;
  expect(res.Y).toBe(112.5);
});

test('LineSegment return false', () => {
  let x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number;
  //Line A start
  x1 = 100;
  y1 = 100;
  //Line A end
  x2 = 100;
  y2 = 200;
  //LineB start
  x3 = 50;
  y3 = 50;
  //LineB end
  x4 = 75;
  y4 = 75;

  let res = LineSegmentIntersection(x1, y1, x2, y2, x3, y3, x4, y4);

  expect(res).toBeFalsy();
});
