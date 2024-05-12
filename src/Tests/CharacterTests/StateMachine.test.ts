import { InitSM, StateMachine } from '../../Game/State/StateMachine';
import { InitPlayer, Player } from '../../Game/Player/Player';
import { beforeEach, expect, test } from '@jest/globals';
import { InputAction, InputActionPacket } from '../../input/GamePadInput';
import { FlatVec } from '../../Physics/FlatVec';

let p: Player;
let SM: StateMachine;

beforeEach(() => {
  p = InitPlayer(new FlatVec(0, 0));
  SM = InitSM(p);
});

test('Default transition', () => {
  SM.SetinitialState('neutralFall');
  let ia = {
    RXAxis: 0,
    RYAxsis: 0,
    LXAxsis: 0,
    LYAxsis: 0,
    Action: 'idle',
  } as InputAction;

  SM.ForceState(0, {
    RXAxis: 0,
    RYAxsis: 0,
    LXAxsis: 0,
    LYAxsis: 0,
    Action: 'impactLand',
  });

  SM.Update(ia);
  SM.Update(ia);
  SM.Update(ia);
  SM.Update(ia);

  expect(p.CurrentStateMachineState).toBe('idle');
});

test('calling with default transition and no transition white list', () => {
  SM.SetinitialState('neutralFall');
  let IDLE_ia = {
    RXAxis: 0,
    RYAxsis: 0,
    LXAxsis: 0,
    LYAxsis: 0,
    Action: 'idle',
  } as InputAction;

  let MOVE_ia = {
    RXAxis: 0,
    RYAxsis: 0,
    LXAxsis: 0,
    LYAxsis: 0,
    Action: 'move',
  } as InputAction;

  SM.ForceState(0, {
    RXAxis: 0,
    RYAxsis: 0,
    LXAxsis: 0,
    LYAxsis: 0,
    Action: 'impactLand',
  });

  SM.SetState(MOVE_ia);

  expect(p.CurrentStateMachineState).toBe('impactLand');

  SM.Update(IDLE_ia);
  SM.Update(IDLE_ia);
  SM.Update(IDLE_ia);
  SM.Update(IDLE_ia);

  expect(p.CurrentStateMachineState).toBe('idle');
});
