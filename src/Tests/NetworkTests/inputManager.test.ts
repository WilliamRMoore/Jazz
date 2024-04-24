import { beforeEach, expect, test } from '@jest/globals';
import { InputStorageManager } from '../../input/InputStorageManager';

let SUT = {} as InputStorageManager<Number>;

beforeEach(() => {
  SUT = new InputStorageManager<Number>((n1, n2) => {
    return n1 == n2 ? false : true;
  });
});

test('Update Local Calls', () => {
  SUT.StoreLocalInput(6, 0);
  expect(SUT.GetLocalInputForFrame(0)).toBe(6);
});

test('Update Remote Calls', () => {
  SUT.StoreRemoteInput(44, 50);
  expect(SUT.GetRemoteInputForFrame(50)).toBe(44);
});

test('Update Guessed Calls', () => {
  SUT.StoreGuessedInput(72, 23);
  expect(SUT.GetGuessedInputForFrame(23)).toBe(72);
});

test('Retreive Invalid Input Frame Number', () => {
  SUT = setUpIPForInvalidFrameDetection(SUT);
  expect(SUT.ReturnFirstWrongGuess(0, 99)).toBe(49);
});

test('Retreive Invalid Input Frame Number null', () => {
  SUT = setUpIPForInvalidFrameDetection(SUT);
  expect(SUT.ReturnFirstWrongGuess(60, 99)).toBe(null);
});

function setUpIPForInvalidFrameDetection(ip: InputStorageManager<Number>) {
  for (let frame = 0; frame < 100; frame++) {
    ip.StoreRemoteInput(frame + 1, frame);
  }
  for (let frame = 0; frame < 100; frame++) {
    if (frame !== 50) {
      ip.StoreGuessedInput(frame + 1, frame);
    } else {
      ip.StoreGuessedInput(1337, frame);
    }
  }

  return ip;
}
