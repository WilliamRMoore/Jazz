import { test, expect, beforeAll, beforeEach } from '@jest/globals';
import { BuildSynchroService } from '../../Containers/Services';
import { SyncroManager } from '../../network/SyncroManager';
import { KeyInput } from '../../input/SimpleInput';

let SUT: SyncroManager<KeyInput>;

beforeEach(() => {
  const invalidGuessedFrameSpec = (g: KeyInput, r: KeyInput) => {
    return g.action != r.action;
  };
  const defaultInputFactory = (frameAdvantage: number, frame: number) => {
    let def = {
      action: 'n/a',
      frameAdvantage: frameAdvantage,
      inputFrame: frame,
    } as KeyInput;
    return def;
  };
  SUT = BuildSynchroService<KeyInput>(
    invalidGuessedFrameSpec,
    defaultInputFactory
  );
});

test('IsWithinFrameAdvantage to return true', () => {
  SetSutForTenFrames(SUT);
  expect(SUT.IsWithinFrameAdvantage()).toBeTruthy();
});

test('IsWithinFrameAdvantage to return false', () => {
  SetSutForTenFramesOutOfAdvantage(SUT);
  expect(SUT.IsWithinFrameAdvantage()).toBeFalsy();
});

test('GetCurrentSyncFrame returns 10', () => {
  SetSutForTenFrames(SUT);

  expect(SUT.GetCurrentSyncFrame()).toBe(10);
});

test('Frame Advantage to be 4', () => {
  SUT.SetLocalFrameNumber(10);
  SUT.SetRemoteFrameNumber(6);
  SUT.SetRemoteFrameAdvantage(0);

  expect(SUT.GetFrameAdvantageDifference()).toBe(4);
});

test('Frame Advantage to be -4', () => {
  SUT.SetLocalFrameNumber(6);
  SUT.SetRemoteFrameNumber(10);
  SUT.SetRemoteFrameAdvantage(0);

  expect(SUT.GetFrameAdvantageDifference()).toBe(-4);
});

test('Frame Advantage to be -2', () => {
  SUT.SetLocalFrameNumber(6);
  SUT.SetRemoteFrameNumber(10);
  SUT.SetRemoteFrameAdvantage(-2);

  expect(SUT.GetFrameAdvantageDifference()).toBe(-2);
});

test('Should Rollback true', () => {
  RollBackConditions(SUT);

  SUT.UpdateNextSynFrame();
  expect(SUT.ShouldRollBack()).toBeTruthy();
});

function SetSutForTenFrames(mySUT: SyncroManager<KeyInput>) {
  for (let i = 0; i <= 10; i++) {
    let KeyInput = {
      action: 'n/a',
      frameAdvantage: 0,
      inputFrame: i,
    } as KeyInput;

    mySUT.SetRemoteFrameNumber(i);
    mySUT.SetRemoteFrameAdvantage(0);
    mySUT.StoreRemoteInput(KeyInput, i);
    mySUT.IsWithinFrameAdvantage();
    mySUT.SetLocalFrameNumber(i);
    mySUT.StoreLocalInput(KeyInput, i);
    mySUT.UpdateNextSynFrame();
  }
}

function RollBackConditions(mySut: SyncroManager<KeyInput>) {
  for (let i = 0; i <= 10; i++) {
    let KeyInput = {
      action: 'walk',
      frameAdvantage: 0,
      inputFrame: i,
    } as KeyInput;

    if (i != 8) {
      mySut.SetRemoteFrameNumber(i);
      mySut.SetRemoteFrameAdvantage(0);
      mySut.StoreRemoteInput(KeyInput, i);
      mySut.IsWithinFrameAdvantage();
      mySut.SetLocalFrameNumber(i);
      mySut.StoreLocalInput(KeyInput, i);
      mySut.UpdateNextSynFrame();
    } else {
      let remoteInput = mySut.GetOrGuessRemoteInputForFrame(i);
      mySut.StoreGuessedInput(remoteInput, i);
      mySut.IsWithinFrameAdvantage();
      mySut.SetLocalFrameNumber(i);
      mySut.StoreLocalInput(KeyInput, i);
      mySut.UpdateNextSynFrame();
    }
  }

  mySut.StoreRemoteInput(
    { action: 'run', frameAdvantage: 0, inputFrame: 8 },
    8
  );
}

function SetSutForTenFramesOutOfAdvantage(mySUT: SyncroManager<KeyInput>) {
  for (let i = 0; i <= 10; i++) {
    let KeyInput = {
      action: 'n/a',
      frameAdvantage: 0,
      inputFrame: i,
    } as KeyInput;
    mySUT.IsWithinFrameAdvantage();
    mySUT.SetLocalFrameNumber(i);
    mySUT.StoreLocalInput(KeyInput, i);
    mySUT.UpdateNextSynFrame();
    if (i < 7) {
      mySUT.SetRemoteFrameNumber(i);
      mySUT.SetRemoteFrameAdvantage(0);
      mySUT.StoreRemoteInput(KeyInput, i);
    }
  }
}
