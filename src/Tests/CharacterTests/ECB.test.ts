import { ECB, ECBOffsets, ECBPoints } from '../../Game/ECB';
import { test, beforeEach, beforeAll, expect } from '@jest/globals';
import { FlatVec, VectorAllocator } from '../../Physics/FlatVec';

let SUT: ECB;
beforeEach(() => {
  let pos = VectorAllocator(100, 100);
  let points = MakePoints();

  SUT = new ECB(pos, points);
});

test('Move Updates Points correctly', () => {
  SUT.MoveToPosition(50, 50);
  SUT.Update();
  console.log(SUT.GetVerticies());
});

function MakeECBStates() {
  const states = new Map<string, ECBOffsets>();

  const idle = {
    top: { xOffset: 0, yOffset: 0 },
    right: { xOffset: 0, yOffset: 0 },
    bottom: { xOffset: 0, yOffset: 0 },
    left: { xOffset: 0, yOffset: 0 },
  } as ECBOffsets;
  const jump = {
    top: { xOffset: 0, yOffset: 10 },
    right: { xOffset: -10, yOffset: 0 },
    bottom: { xOffset: 0, yOffset: 0 },
    left: { xOffset: 10, yOffset: 0 },
  } as ECBOffsets;
  const walk = {
    top: { xOffset: 0, yOffset: 0 },
    right: { xOffset: 10, yOffset: 0 },
    bottom: { xOffset: 0, yOffset: 0 },
    left: { xOffset: 5, yOffset: 0 },
  } as ECBOffsets;
  const run = {
    top: { xOffset: 0, yOffset: 0 },
    right: { xOffset: 15, yOffset: 0 },
    bottom: { xOffset: 0, yOffset: 0 },
    left: { xOffset: 10, yOffset: 0 },
  } as ECBOffsets;

  states.set('idle', idle);
  states.set('jump', jump);
  states.set('walk', walk);
  states.set('run', run);

  return states;
}

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
