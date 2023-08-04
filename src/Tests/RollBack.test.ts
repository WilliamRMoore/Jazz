import { NetworkV2 } from '../network/netowrkV2';
import { InputStorageManager } from '../input/InputStorageManager';
import { beforeAll, expect, test } from '@jest/globals';

let inputManager: InputStorageManager<Number>;
let network: NetworkV2<Number>;

beforeAll(() => {
  inputManager = new InputStorageManager<Number>((n1, n2) => {
    return n1 == n2 ? false : true;
  });

  network = new NetworkV2(inputManager);

  for (let frame = 0; frame <= 10; frame++) {
    if (frame != 5) {
      inputManager.StoreLocalInput(frame + 1, frame);
      inputManager.StoreRemoteInput(frame + 2, frame);
      network.UpdateLocalFrame(frame);
      network.UpdateRemoteFrame(frame);
    } else {
      inputManager.StoreLocalInput(frame + 1, frame);
      inputManager.StoreGuessedInput(frame + 3, frame);
      inputManager.StoreRemoteInput(frame + 2, frame);
      network.UpdateLocalFrame(frame);
      network.UpdateRemoteFrame(frame);
    }
  }
});

test('TimeSync', () => {
  expect(network.IsTimeSynced()).toBeTruthy();
});

test('Roll Back, should be true', () => {
  expect(network.UpdateSynchronization()).toBeTruthy();
});
