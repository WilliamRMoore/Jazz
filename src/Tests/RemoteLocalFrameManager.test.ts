import { beforeEach, expect, test } from '@jest/globals';
import { RemoteLocalFrameManager } from '../network/RemoteLocalFrameManager';

let SUT: RemoteLocalFrameManager;

beforeEach(() => {
  SUT = new RemoteLocalFrameManager();
});

test('Set Local Frame as 1', () => {
  SUT.SetLocalFrame(1);
  expect(SUT.GetLocalFrame()).toBe(1);
});

test('Set remote frame as 2', () => {
  SUT.SetRemoteFrame(2);
  expect(SUT.GetRemoteFrame()).toBe(2);
});

test('Local frame Advantage Should be 3', () => {
  SUT.SetLocalFrame(10);
  SUT.SetRemoteFrame(7);
  expect(SUT.GetLocalFrameAdvantage()).toBe(3);
});

test('Remote frame Advantage Should be 3', () => {
  SUT.SetLocalFrame(7);
  SUT.SetRemoteFrame(10);
  expect(SUT.GetRemoteFrameAdvantage()).toBe(3);
});
