import { FrameComparisonManager } from '../network/FrameComparisonManager';
import { InputStorageManager } from '../input/InputStorageManager';
import { FrameStorageManager } from '../network/FrameStorageManager';
import { beforeEach, expect, test } from '@jest/globals';

let FSM: FrameStorageManager;
let ISM: InputStorageManager<number>;
let SUT: FrameComparisonManager<number>;

beforeEach(() => {
  FSM = new FrameStorageManager();
  ISM = new InputStorageManager<number>((n1, n2) => {
    return n1 == n2 ? false : true;
  });
  SUT = new FrameComparisonManager<number>(ISM, FSM);
});

test('IsWithinFrameAdvatnage return true', () => {
  FSM.LocalFrame = 10;
  FSM.RemoteFrame = 7;

  FSM.RemoteFrameAdvantage = 3;

  expect(SUT.GetLocalFrameAdvantage()).toBe(3);

  expect(SUT.IsWithinFrameAdvatnage()).toBe(true);
});

test('IsWithinFrameAdvantage return false', () => {
  FSM.LocalFrame = 10;
  FSM.RemoteFrame = 7;

  FSM.RemoteFrameAdvantage = -1;

  expect(SUT.GetLocalFrameAdvantage()).toBe(3);

  expect(SUT.IsWithinFrameAdvatnage()).toBe(false);
});

test('GetCurrentSyncFrame ', () => {
  FSM.LocalFrame = 10;
  FSM.RemoteFrame = 10;
  FSM.RemoteFrameAdvantage = 0;

  SUT.UpdateNextSyncFrame();

  expect(SUT.GetCurrentSyncFrame()).toBe(10);
});
