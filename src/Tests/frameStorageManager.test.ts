import { beforeEach, expect, test } from '@jest/globals';
import { FrameStorageManager } from '../network/FrameStorageManager';

let SUT: FrameStorageManager;

beforeEach(() => {
  SUT = new FrameStorageManager();
});

test('previous sync frame is 10', () => {
  SUT.SetCurrentSyncFrame(10);
  SUT.SetCurrentSyncFrame(11);

  expect(SUT.GetSyncFrames().PreviousSyncFrame).toBe(10);
});

test('Current sync frame is 11', () => {
  SUT.SetCurrentSyncFrame(10);
  SUT.SetCurrentSyncFrame(11);

  expect(SUT.GetSyncFrames().CurrentSyncFrame).toBe(11);
});
