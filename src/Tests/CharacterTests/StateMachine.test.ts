import { StateMachine } from '../../Game/State/StateMachine';
import { Player } from '../../Game/Player/Player';
import { ECB, ECBPoints } from '../../Game/ECB';
import { InputStorageManager } from '../../input/InputStorageManager';
import { FrameStorageManager } from '../../network/FrameStorageManager';
import { beforeAll, beforeEach, expect, test } from '@jest/globals';
import { InputAction, InputActionPacket } from '../../input/GamePadInput';
import { FlatVec } from '../../Physics/FlatVec';
import {
  idle,
  walk,
  turnWalk,
  run,
  jumpSquat,
} from '../../Game/State/CharacterStates/Test';

let p: Player;
let FSM: FrameStorageManager;
let ISM: InputStorageManager<InputActionPacket<InputAction>>;
let SM: StateMachine;
let ecb: ECB;

beforeEach(() => {
  //ecb = new ECB()
  var points = {
    top: new FlatVec(0, 100),
    right: new FlatVec(100, 50),
    bottom: new FlatVec(0, 0),
    left: new FlatVec(-100, 50),
  } as ECBPoints;

  var position = new FlatVec(300, 300);

  ecb = new ECB(position, points);

  p = new Player(ecb, 1000, 1000, 2, 2, position, 20, 2, true, 60, 100);

  FSM = new FrameStorageManager();

  ISM = new InputStorageManager<InputActionPacket<InputAction>>((i1, i2) => {
    return i1.input.Action == i2.input.Action &&
      i1.input.LXAxsis == i2.input.LXAxsis &&
      i1.input.LYAxsis == i2.input.LYAxsis &&
      i1.input.RXAxis == i2.input.RXAxis &&
      i1.input.RYAxsis == i2.input.RYAxsis
      ? false
      : true;
  });

  SM = new StateMachine(p);

  SM.AddState('run', run);
  SM.AddState('idle', idle);
  SM.AddState('walk', walk);
  SM.AddState('turnwalk', turnWalk);
  SM.AddState('JumpSquat', jumpSquat);
});

test.skip('Walk', () => {
  ISM.StoreLocalInput(
    {
      input: { Action: 'walk', RXAxis: 0, RYAxsis: 0, LYAxsis: 0, LXAxsis: 0 },
      frame: 1,
      frameAdvantage: 0,
      hash: '',
    },
    1
  );
  FSM.LocalFrame = 1;
  SM.SetState(ISM.GetLocalInputForFrame(FSM.LocalFrame).input.Action);
  SM.Update(ISM.GetLocalInputForFrame(FSM.LocalFrame).input);

  expect(SM.GetCurrentState()?.name).toBe('walk');
  expect(p.PlayerPosition.X > 300);
  expect(ecb.GetVerticies()[0].X).toBe(301);
});

test('Walk to Run', () => {
  ISM.StoreLocalInput(
    {
      input: {
        Action: 'walk',
        LXAxsis: 1.0,
        LYAxsis: 0.0,
        RXAxis: 0.0,
        RYAxsis: 0.0,
      },
      frame: 1,
      frameAdvantage: 0,
      hash: '',
    },
    1
  );

  FSM.LocalFrame = 1;

  SM.SetState('walk');
  SM.Update(ISM.GetLocalInputForFrame(FSM.LocalFrame).input);

  ISM.StoreLocalInput(
    {
      input: {
        Action: 'run',
        LXAxsis: 4.0,
        LYAxsis: 0.0,
        RXAxis: 0.0,
        RYAxsis: 0.0,
      },
      frame: 2,
      frameAdvantage: 0,
      hash: '',
    },
    2
  );

  FSM.LocalFrame = 2;

  SM.SetState('run');
  SM.Update(ISM.GetLocalInputForFrame(FSM.LocalFrame).input);

  ISM.StoreLocalInput(
    {
      input: {
        Action: 'run',
        LXAxsis: 4.0,
        LYAxsis: 0.0,
        RXAxis: 0.0,
        RYAxsis: 0.0,
      },
      frame: 3,
      frameAdvantage: 0,
      hash: '',
    },
    3
  );

  FSM.LocalFrame = 3;

  SM.SetState('run');
  SM.Update(ISM.GetLocalInputForFrame(FSM.LocalFrame).input);
});
