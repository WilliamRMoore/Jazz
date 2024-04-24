import { test, expect, beforeAll, beforeEach } from '@jest/globals';
import { BuildSynchroService } from '../../Containers/Services';
import { SyncroManager } from '../../network/SyncroManager';
import { KeyInput } from '../../input/SimpleInput';

let SUT: SyncroManager<KeyInput>;

beforeEach(() => {
  // const invalidGuessedFrameSpec = (g: KeyInput, r: KeyInput) => {
  //   return g.action != r.action;
  // };
  // const defaultInputFactory = (frameAdvantage: number, frame: number) => {
  //   let def = {
  //     action: 'n/a',
  //     frameAdvantage: frameAdvantage,
  //     inputFrame: frame,
  //   } as KeyInput;
  //   return def;
  // };
  // SUT = BuildSynchroService<KeyInput>(
  //   invalidGuessedFrameSpec,
  //   defaultInputFactory
  // );
});

test.skip('IsWithinFrameAdvantage to return true', () => {
  // SetSutForTenFrames(SUT);
  // expect(SUT.IsWithinFrameAdvantage()).toBeTruthy();
});

test.skip('IsWithinFrameAdvantage to return false', () => {
  // SetSutForTenFramesOutOfAdvantage(SUT);
  // expect(SUT.IsWithinFrameAdvantage()).toBeFalsy();
});

test.skip('GetCurrentSyncFrame returns 10', () => {
  // SetSutForTenFrames(SUT);
  // expect(SUT.GetCurrentSyncFrame()).toBe(10);
});

test.skip('Frame Advantage to be 4', () => {
  // SUT.SetLocalFrameNumber(10);
  // SUT.SetRemoteFrameNumber(6);
  // SUT.SetRemoteFrameAdvantage(0);
  // expect(SUT.GetFrameAdvantageDifference()).toBe(4);
});

test.skip('Frame Advantage to be -4', () => {
  // SUT.SetLocalFrameNumber(6);
  // SUT.SetRemoteFrameNumber(10);
  // SUT.SetRemoteFrameAdvantage(0);
  // expect(SUT.GetFrameAdvantageDifference()).toBe(-4);
});

test.skip('Frame Advantage to be -2', () => {
  // SUT.SetLocalFrameNumber(6);
  // SUT.SetRemoteFrameNumber(10);
  // SUT.SetRemoteFrameAdvantage(-2);
  // expect(SUT.GetFrameAdvantageDifference()).toBe(-2);
});

test.skip('Should Rollback true', () => {
  // RollBackConditions(SUT);
  // SUT.UpdateNextSynFrame();
  // expect(SUT.ShouldRollBack()).toBeTruthy();
  // expect(SUT.GetCurrentSyncFrame()).toBe(7);
  // RollBack(SUT, 10);
});

function SetSutForTenFrames(mySUT: SyncroManager<KeyInput>) {
  // for (let i = 0; i <= 10; i++) {
  //   let KeyInput = {
  //     action: 'n/a',
  //     frameAdvantage: 0,
  //     inputFrame: i,
  //   } as KeyInput;
  //   mySUT.SetRemoteFrameNumber(i);
  //   mySUT.SetRemoteFrameAdvantage(0);
  //   mySUT.StoreRemoteInput(KeyInput, i);
  //   mySUT.IsWithinFrameAdvantage();
  //   mySUT.SetLocalFrameNumber(i);
  //   mySUT.StoreLocalInput(KeyInput, i);
  //   mySUT.UpdateNextSynFrame();
  // }
}

function RollBackConditions(mySut: SyncroManager<KeyInput>) {
  // for (let i = 0; i <= 10; i++) {
  //   let KeyInput = {
  //     action: 'walk',
  //     frameAdvantage: 0,
  //     inputFrame: i,
  //   } as KeyInput;
  //   if (i != 8) {
  //     if (i == 7) {
  //       KeyInput.action = 'punch';
  //     }
  //     mySut.SetRemoteFrameNumber(i);
  //     mySut.SetRemoteFrameAdvantage(0);
  //     mySut.StoreRemoteInput(KeyInput, i);
  //     mySut.IsWithinFrameAdvantage();
  //     mySut.SetLocalFrameNumber(i);
  //     mySut.StoreLocalInput(KeyInput, i);
  //     mySut.UpdateNextSynFrame();
  //   } else {
  //     let remoteInput = mySut.GetOrGuessRemoteInputForFrame(i);
  //     mySut.StoreGuessedInput(remoteInput, i);
  //     mySut.IsWithinFrameAdvantage();
  //     mySut.SetLocalFrameNumber(i);
  //     mySut.StoreLocalInput(KeyInput, i);
  //     mySut.UpdateNextSynFrame();
  //   }
  // }
  // mySut.StoreRemoteInput(
  //   { action: 'run', frameAdvantage: 0, inputFrame: 8 },
  //   8
  // );
}

function SetSutForTenFramesOutOfAdvantage(mySUT: SyncroManager<KeyInput>) {
  // for (let i = 0; i <= 10; i++) {
  //   let KeyInput = {
  //     action: 'n/a',
  //     frameAdvantage: 0,
  //     inputFrame: i,
  //   } as KeyInput;
  //   mySUT.IsWithinFrameAdvantage();
  //   mySUT.SetLocalFrameNumber(i);
  //   mySUT.StoreLocalInput(KeyInput, i);
  //   mySUT.UpdateNextSynFrame();
  //   if (i < 7) {
  //     mySUT.SetRemoteFrameNumber(i);
  //     mySUT.SetRemoteFrameAdvantage(0);
  //     mySUT.StoreRemoteInput(KeyInput, i);
  //   }
  // }
}

function RollBack(mySUT: SyncroManager<KeyInput>, currentFrame: number) {
  // const syncFrame = mySUT.GetCurrentSyncFrame();
  // //GET STATE FOR CURRENT SYNC FRAME
  // // State.GetStateForFrame(syncFrame) <-- start here
  // for (let i = syncFrame + 1; i <= currentFrame; i++) {
  //   const localInput = mySUT.GetLocalInput(i);
  //   let remoteInput = mySUT.GetRemoteInputForFrame(i);
  //   let remoteGuess = mySUT.GetGuessedInputForFrame(i);
  //   //Run simulation
  //   if (
  //     (remoteGuess != null || remoteGuess != undefined) &&
  //     remoteInput.action !== remoteGuess.action
  //   ) {
  //     mySUT.OverWriteGuessedInputForFrame(remoteInput, i);
  //   }
  // }
  // mySUT.UpdateNextSynFrame();
}
