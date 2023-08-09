import { beforeEach, expect, test } from '@jest/globals';
import { InputStorageManager } from '../input/InputStorageManager';
import { FrameComparisonManager } from '../network/FrameComparisonManager';
import { FrameStorageManager } from '../network/FrameStorageManager';
import { RollBackManager } from '../network/rollBackManager';

let ISM: InputStorageManager<number>;
let FCM: FrameComparisonManager<number>;
let FSM: FrameStorageManager;
let SUT: RollBackManager<number>;

beforeEach(() => {
  FSM = new FrameStorageManager();
  ISM = new InputStorageManager<number>((g, r) => {
    return g != r;
  });
  FCM = new FrameComparisonManager<number>(ISM, FSM);
  SUT = new RollBackManager<number>(FCM, FSM);
});

test('Should Roll Back return true', () => {
  for (let i = 0; i <= 10; i++) {
    if (i == 5) {
      FSM.LocalFrame = i;
      FSM.RemoteFrame = i;

      ISM.StoreGuessedInput(i + 3, FSM.RemoteFrame);
      ISM.StoreLocalInput(i + 1, FSM.LocalFrame);
      ISM.StoreRemoteInput(i + 2, FSM.RemoteFrame);
    } else {
      FSM.LocalFrame = i;
      FSM.RemoteFrame = i;

      ISM.StoreLocalInput(i + 1, FSM.LocalFrame);
      ISM.StoreRemoteInput(i + 2, FSM.RemoteFrame);
    }
  }

  FCM.UpdateNextSyncFrame();

  expect(SUT.ShouldRollBack()).toBe(true);
});

test('Should Roll Back return false', () => {
  for (let i = 0; i <= 10; i++) {
    FSM.LocalFrame = i;
    FSM.RemoteFrame = i;
    ISM.StoreLocalInput(i + 1, FSM.LocalFrame);
    ISM.StoreRemoteInput(i + 2, FSM.RemoteFrame);
  }

  FCM.UpdateNextSyncFrame();

  expect(SUT.ShouldRollBack()).toBe(false);
});

test('Should roll Back returns true, then false', () => {
  for (let i = 0; i <= 10; i++) {
    if (i == 5) {
      FSM.LocalFrame = i;
      FSM.RemoteFrame = i;

      ISM.StoreGuessedInput(i + 3, FSM.RemoteFrame);
      ISM.StoreLocalInput(i + 1, FSM.LocalFrame);
      ISM.StoreRemoteInput(i + 2, FSM.RemoteFrame);
    } else {
      FSM.LocalFrame = i;
      FSM.RemoteFrame = i;

      ISM.StoreLocalInput(i + 1, FSM.LocalFrame);
      ISM.StoreRemoteInput(i + 2, FSM.RemoteFrame);
    }
  }

  FCM.UpdateNextSyncFrame();
  expect(SUT.ShouldRollBack()).toBe(true);

  ISM.OverWriteGuessedInput(ISM.GetRemoteInputForFrame(5), 5);

  FCM.UpdateNextSyncFrame();

  expect(SUT.ShouldRollBack()).toBeFalsy();
});
