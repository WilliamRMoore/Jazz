import { beforeEach, expect, test } from '@jest/globals';
import { InputManager } from '../input/InputManager';

let SUT = {} as InputManager<Number>;

beforeEach(() => {
  SUT = new InputManager<Number>((n1, n2) => {
    return n1 == n2 ? false : true;
  });
});

test('Update Local Calls', () => {
  SUT.UpdateLocalInputs(6, 0);
  expect(SUT.GetLocalInputForFrame(0)).toBe(6);
});

test('Update Remote Calls', () => {
  SUT.UpdateRemoteInputs(44, 50);
  expect(SUT.GetRemoteInputForFrame(50)).toBe(44);
});

test('Update Guessed Calls', () => {
  SUT.UpdateGuessedInputs(72, 23);
  expect(SUT.GetGuessedInputForFrame(23)).toBe(72);
});

test('Retreive Invalid Input Frame Number', () => {
  SUT = setUpIPForInvalidFrameDetection(SUT);
  expect(SUT.RetreiveFirstInvalidInputFrameNumber(0, 99)).toBe(49);
});

test('Retreive Invalid Input Frame Number null', () => {
  SUT = setUpIPForInvalidFrameDetection(SUT);
  expect(SUT.RetreiveFirstInvalidInputFrameNumber(60, 99)).toBe(null);
});

test('Throws Exception when trying to ovewrite Local input', () => {
  SUT.UpdateLocalInputs(1, 1);
  expect(() => SUT.UpdateLocalInputs(2, 1)).toThrow(Error);
});

test('Throws Exception when trying to ovewrite Guessed input', () => {
  SUT.UpdateGuessedInputs(1, 1);
  expect(() => SUT.UpdateGuessedInputs(2, 1)).toThrow(Error);
});
test('Throws Exception when trying to ovewrite Remote input', () => {
  SUT.UpdateRemoteInputs(1, 1);
  expect(() => SUT.UpdateRemoteInputs(2, 1)).toThrow(Error);
});

function setUpIPForInvalidFrameDetection(ip: InputManager<Number>) {
  for (let frame = 0; frame < 100; frame++) {
    ip.UpdateRemoteInputs(frame + 1, frame);
  }
  for (let frame = 0; frame < 100; frame++) {
    if (frame !== 50) {
      ip.UpdateGuessedInputs(frame + 1, frame);
    } else {
      ip.UpdateGuessedInputs(1337, frame);
    }
  }

  return ip;
}
