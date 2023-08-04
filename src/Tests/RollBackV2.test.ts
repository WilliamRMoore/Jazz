import { beforeAll, beforeEach, expect, test } from '@jest/globals';
import { InputStorageManager } from '../input/InputStorageManager';
import { FrameComparisonManager } from '../network/FrameComparisonManager';
import { RemoteLocalFrameManager } from '../network/RemoteLocalFrameManager';
import { NetworkV3 } from '../network/netowrkV2';

let ISM: InputStorageManager<number>;
let FCM: FrameComparisonManager<number>;
let RLFM: RemoteLocalFrameManager;
let SUT: NetworkV3<number>;

beforeEach(() => {
  RLFM = new RemoteLocalFrameManager();
  ISM = new InputStorageManager<number>((g, r) => {
    return g != r;
  });
  FCM = new FrameComparisonManager<number>(ISM);
  SUT = new NetworkV3<number>(FCM, RLFM);
});

test('Are Frames Synced Return true', () => {
  for (let i = 0; i <= 10; i++) {
    RLFM.SetLocalFrame(i);
    RLFM.SetRemoteFrame(i);

    ISM.StoreLocalInput(i + 1, RLFM.GetLocalFrame());
    ISM.StoreRemoteInput(i + 2, RLFM.GetRemoteFrame());
  }

  expect(SUT.AreFramesSynced()).toBe(true);
});

test('Are Frames Synced Return false', () => {
  for (let i = 0; i <= 10; i++) {
    RLFM.SetLocalFrame(i);
    RLFM.SetRemoteFrame(i <= 4 ? 0 : i - 4);

    ISM.StoreLocalInput(i + 1, RLFM.GetLocalFrame());
    let currentRemote = RLFM.GetRemoteFrame();

    if (
      ISM.GetRemoteInputForFrame(currentRemote) === null ||
      ISM.GetRemoteInputForFrame(currentRemote) === undefined
    ) {
      ISM.StoreRemoteInput(i + 2, RLFM.GetRemoteFrame());
    }
  }

  expect(SUT.AreFramesSynced()).toBeFalsy();
});

test('ShouldRollBack returns true', () => {
  for (let i = 0; i <= 10; i++) {
    if (i == 5) {
      RLFM.SetLocalFrame(i);
      RLFM.SetRemoteFrame(i);

      ISM.StoreGuessedInput(i + 3, RLFM.GetRemoteFrame());
      ISM.StoreLocalInput(i + 1, RLFM.GetLocalFrame());
      ISM.StoreRemoteInput(i + 2, RLFM.GetRemoteFrame());
    } else {
      RLFM.SetLocalFrame(i);
      RLFM.SetRemoteFrame(i);

      ISM.StoreLocalInput(i + 1, RLFM.GetLocalFrame());
      ISM.StoreRemoteInput(i + 2, RLFM.GetRemoteFrame());
    }
  }

  expect(SUT.ShouldRollBack()).toBeTruthy();
});

test('ShouldRollBack returns false', () => {
  for (let i = 0; i <= 10; i++) {
    if (i == 5) {
      RLFM.SetLocalFrame(i);
      RLFM.SetRemoteFrame(i);

      ISM.StoreGuessedInput(i + 2, RLFM.GetRemoteFrame());
      ISM.StoreLocalInput(i + 1, RLFM.GetLocalFrame());
      ISM.StoreRemoteInput(i + 2, RLFM.GetRemoteFrame());
    } else {
      RLFM.SetLocalFrame(i);
      RLFM.SetRemoteFrame(i);

      ISM.StoreLocalInput(i + 1, RLFM.GetLocalFrame());
      ISM.StoreRemoteInput(i + 2, RLFM.GetRemoteFrame());
    }
  }

  expect(SUT.ShouldRollBack()).toBeFalsy();
});
