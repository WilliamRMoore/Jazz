import { NetworkV2 } from '../network/netowrkV2';
import { InputManager } from '../input/InputManager';
import { beforeAll, expect, test } from '@jest/globals';

let inputManager: InputManager<Number>;
let network: NetworkV2<Number>;

beforeAll(() => {
  inputManager = new InputManager<Number>((n1, n2) => {
    return n1 == n2 ? false : true;
  });

  network = new NetworkV2(inputManager);

  for (let frame = 0; frame <= 10; frame++) {
    if (frame != 5) {
      inputManager.UpdateLocalInputs(frame + 1, frame);
      inputManager.UpdateRemoteInputs(frame + 2, frame);
      network.UpdateLocalFrame(frame);
      network.UpdateRemoteFrame(frame);
    } else {
      inputManager.UpdateLocalInputs(frame + 1, frame);
      inputManager.UpdateGuessedInputs(frame + 3, frame);
      inputManager.UpdateRemoteInputs(frame + 2, frame);
      network.UpdateLocalFrame(frame);
      network.UpdateRemoteFrame(frame);
    }
  }
});

test('TimeSync', () => {
  expect(network.TimeSynced()).toBeTruthy();
});

test('Roll Back, should be true', () => {
  expect(network.UpdateSynchronization()).toBeTruthy();
});
