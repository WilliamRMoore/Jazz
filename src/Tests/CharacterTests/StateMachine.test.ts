import { StateMachine } from '../../Game/State/StateMachine';
import { Player } from '../../Game/Player/Player';
import { ECB, ECBPoints } from '../../Game/ECB';
import { InputStorageManager } from '../../input/InputStorageManager';
import { FrameStorageManager } from '../../network/FrameStorageManager';
import { beforeAll, beforeEach, expect, test } from '@jest/globals';
import { InputAction } from '../../input/GamePadInput';
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
let ISM: InputStorageManager<InputAction>;
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

  ISM = new InputStorageManager<InputAction>((i1, i2) => {
    return i1.Action == i2.Action &&
      i1.LXAxsis == i2.LXAxsis &&
      i1.LYAxsis == i2.LYAxsis &&
      i1.RXAxis == i2.RXAxis &&
      i1.RYAxsis == i2.RYAxsis
      ? false
      : true;
  });

  SM = new StateMachine(p, ISM, FSM);

  SM.AddState('run', run);
  SM.AddState('idle', idle);
  SM.AddState('walk', walk);
  SM.AddState('turnwalk', turnWalk);
  SM.AddState('JumpSquat', jumpSquat);
});

test('Walk', () => {
  ISM.StoreLocalInput(
    { Action: 'walk', LXAxsis: 1.0, LYAxsis: 0.0, RXAxis: 0.0, RYAxsis: 0.0 },
    1
  );
  FSM.LocalFrame = 1;
  SM.SetState(ISM.GetLocalInputForFrame(1).Action);
  SM.Update();

  expect(SM.GetCurrentState()?.name).toBe('walk');
  expect(p.PlayerPosition.X > 300);
  expect(ecb.GetVerticies()[0].X).toBe(301);
});

test('Walk to Run', () => {
  ISM.StoreLocalInput(
    { Action: 'walk', LXAxsis: 1.0, LYAxsis: 0.0, RXAxis: 0.0, RYAxsis: 0.0 },
    1
  );

  FSM.LocalFrame = 1;

  SM.SetState('walk');
  SM.Update();

  ISM.StoreLocalInput(
    { Action: 'run', LXAxsis: 4.0, LYAxsis: 0.0, RXAxis: 0.0, RYAxsis: 0.0 },
    2
  );

  FSM.LocalFrame = 2;

  SM.SetState('run');
  SM.Update();

  ISM.StoreLocalInput(
    { Action: 'run', LXAxsis: 4.0, LYAxsis: 0.0, RXAxis: 0.0, RYAxsis: 0.0 },
    3
  );

  FSM.LocalFrame = 3;

  SM.SetState('run');
  SM.Update();
});
