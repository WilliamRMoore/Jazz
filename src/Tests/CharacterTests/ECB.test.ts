import { ECB, ECBOffsets, ECBPoints } from '../../Game/ECB';
import { test, beforeEach, beforeAll, expect } from '@jest/globals';
import { FlatVec, VectorAllocator } from '../../Physics/FlatVec';

let SUT: ECB;
beforeEach(() => {
  let pos = VectorAllocator(100, 100);
  let points = MakePoints();
  let tracks = MakeTracks();

  SUT = new ECB(pos, tracks, points);
});

test('update ecb track', () => {
  SUT.ChangeTrack('jump');

  expect(SUT.GetCurrentTrackName()).toBe('jump');
});

test('TrackFrame Updates', () => {
  UpdateTrackFrames(SUT, 5);

  expect(SUT.GetCurrentTrackFrame()).toBe(5);
});

test('Verts Correct for frame 5', () => {
  UpdateTrackFrames(SUT, 5);

  const vs = SUT.GetVerticies();
  expect(vs[0].X).toBe(100);
  expect(vs[0].Y).toBe(45);

  expect(vs[1].X).toBe(155);
  expect(vs[1].Y).toBe(75);

  expect(vs[2].X).toBe(100);
  expect(vs[2].Y).toBe(100);

  expect(vs[3].X).toBe(45);
  expect(vs[3].Y).toBe(75);
});

test('Updates wrap around Track array when exceeding length', () => {
  UpdateTrackFrames(SUT, 22);

  const vs = SUT.GetVerticies();
  expect(vs[0].X).toBe(100);
  expect(vs[0].Y).toBe(49);

  expect(vs[1].X).toBe(151);
  expect(vs[1].Y).toBe(75);

  expect(vs[2].X).toBe(100);
  expect(vs[2].Y).toBe(100);

  expect(vs[3].X).toBe(49);
  expect(vs[3].Y).toBe(75);

  UpdateTrackFrames(SUT, 21);

  expect(vs[0].X).toBe(100);
  expect(vs[0].Y).toBe(49);

  expect(vs[1].X).toBe(151);
  expect(vs[1].Y).toBe(75);

  expect(vs[2].X).toBe(100);
  expect(vs[2].Y).toBe(100);

  expect(vs[3].X).toBe(49);
  expect(vs[3].Y).toBe(75);

  UpdateTrackFrames(SUT, 21);

  expect(vs[0].X).toBe(100);
  expect(vs[0].Y).toBe(49);

  expect(vs[1].X).toBe(151);
  expect(vs[1].Y).toBe(75);

  expect(vs[2].X).toBe(100);
  expect(vs[2].Y).toBe(100);

  expect(vs[3].X).toBe(49);
  expect(vs[3].Y).toBe(75);
});

test('track frame resets', () => {
  UpdateTrackFrames(SUT, 5);

  expect(SUT.GetCurrentTrackFrame()).toBe(5);

  SUT.ChangeTrack('jump');

  expect(SUT.GetCurrentTrackFrame()).toBe(0);
});

test('Move Updates Points correctly', () => {});

function MakeTracks() {
  const tracks = new Map<string, Array<ECBOffsets>>();

  const idle = new Array<ECBOffsets>();
  for (let index = 0; index <= 20; index++) {
    let offset = {
      top: { xOffset: 0, yOffset: 0 },
      right: { xOffset: 0, yOffset: 0 },
      bottom: { xOffset: 0, yOffset: 0 },
      left: { xOffset: 0, yOffset: 0 },
    } as ECBOffsets;
    offset.top.xOffset = 0;
    offset.top.yOffset = -index;

    offset.right.xOffset = index;
    offset.right.yOffset = 0;

    offset.bottom.xOffset = 0;
    offset.bottom.yOffset = 0;

    offset.left.xOffset = -index;
    offset.left.yOffset = 0;
    idle.push(offset);
  }

  tracks.set('idle', idle);

  const jump = new Array<ECBOffsets>();
  for (let index = 0; index < 20; index++) {
    let offset = {
      top: { xOffset: 0, yOffset: 0 },
      right: { xOffset: 0, yOffset: 0 },
      bottom: { xOffset: 0, yOffset: 0 },
      left: { xOffset: 0, yOffset: 0 },
    } as ECBOffsets;
    offset.top.xOffset = 0;
    offset.top.yOffset = -index;

    offset.right.xOffset = -index;
    offset.right.yOffset = 0;

    offset.bottom.xOffset = 0;
    offset.bottom.yOffset = 0;

    offset.left.xOffset = index;
    offset.left.yOffset = 0;
    jump.push(offset);
  }

  tracks.set('jump', jump);

  return tracks;
}

function MakePoints() {
  let points = {
    top: VectorAllocator(),
    right: VectorAllocator(),
    bottom: VectorAllocator(),
    left: VectorAllocator(),
  } as ECBPoints;
  points.top.X = 0;
  points.top.Y = -50;

  points.right.X = 50;
  points.right.Y = -25;

  points.bottom.X = 0;
  points.bottom.Y = 0;

  points.left.X = -50;
  points.left.Y = -25;

  return points;
}

function UpdateTrackFrames(ecb: ECB, iterations: number) {
  for (let i = 0; i < iterations; i++) {
    ecb.Update();
  }
}
