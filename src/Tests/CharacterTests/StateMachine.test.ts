import { test, beforeAll, beforeEach, expect } from '@jest/globals';
import { Player } from '../../Game/Player/Player';
import { StateMachine } from '../../Game/State/StateMachine';
import { run } from '../../Game/State/CharacterStates/Test';
import { DefaultECBFactory } from '../../Game/ECB';
import { VectorAllocator } from '../../Physics/FlatVec';

let p: Player;
let SUT: StateMachine;

beforeEach(() => {
  let ecb = DefaultECBFactory();
  p = new Player(ecb, 1000, 1000, 3, 3, VectorAllocator(100, 100), 20, 2);
  SUT = new StateMachine(p);
  SUT.AddState(run.name, run);
});

test('Can Set State', () => {
  SUT.SetState('run');
  expect(SUT.GetCurrentState()?.name).toBe('run');
});

test('State Updates Player', () => {
  let position = p.PlayerPosition.X;
  SUT.SetState('run');
  SUT.Update();
  console.log(p.PlayerPosition);
  expect(position != p.PlayerPosition.X);
  console.log(p.ECB.GetVerticies());
});
