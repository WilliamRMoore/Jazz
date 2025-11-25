import { DefaultCharacterConfig } from '../../game/character/default';
import { defaultStage } from '../../game/engine/stage/stageMain';
import {
  Player,
  SetPlayerPosition,
} from '../../game/engine/player/playerOrchestrator';
import { PlatformDetection } from '../../game/engine/systems/platformCollision';
import { World } from '../../game/engine/world/world';
import { FixedPoint } from '../../game/math/fixedPoint';
import { NewInputAction } from '../../game/input/Input';
import { STATE_IDS } from '../../game/engine/finite-state-machine/playerStates/shared';
import { ApplyVelocity } from '../../game/engine/systems/velocity';
import { NeutralFall } from '../../game/engine/finite-state-machine/playerStates/states';

describe('Platform Collision system tests', () => {
  let p: Player;
  let w: World;

  beforeEach(() => {
    w = new World();
    w.SetStage(defaultStage());

    const pc = new DefaultCharacterConfig();
    const player = new Player(0, pc);
    w.SetPlayer(player);
    p = w.PlayerData.Player(0)!;
  });

  function fallOneFrame() {
    p.ECB.UpdatePreviousECB();
    p.Velocity.Y.SetFromNumber(25);
    ApplyVelocity(w.PlayerData);
  }

  test('Player should land on a platform when falling on it', () => {
    const input = NewInputAction();
    w.PlayerData.InputStore(0).StoreInputForFrame(0, input);
    w.PlayerData.InputStore(0).StoreInputForFrame(1, input);
    w.PlayerData.Player(0).FSMInfo.SetCurrentState(NeutralFall);
    // Platform is at y=300
    SetPlayerPosition(p, new FixedPoint(1000), new FixedPoint(280));

    fallOneFrame();

    PlatformDetection(w.PlayerData, w.StageData, 1);

    expect(p.ECB.Bottom.Y.AsNumber).toBeCloseTo(300, 0);

    expect(p.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.LAND_S);
  });

  test('Player should drop through a platform with a fast down-flick', () => {
    // Position player on the platform
    SetPlayerPosition(
      p,
      new FixedPoint(1000),
      new FixedPoint(300 - p.ECB.Height.AsNumber)
    );
    p.FSMInfo.SetCurrentState({ StateId: STATE_IDS.IDLE_S } as any);

    const frame = 10;
    const prevInput = NewInputAction();
    prevInput.LYAxis.SetFromNumber(0);
    w.PlayerData.InputStore(0).StoreInputForFrame(frame - 1, prevInput);

    const currentInput = NewInputAction();
    currentInput.LYAxis.SetFromNumber(-0.9);
    w.PlayerData.InputStore(0).StoreInputForFrame(frame, currentInput);

    const MOCK_Y_COORD = new FixedPoint(300);
    jest
      .spyOn(
        require('../../game/engine/player/playerOrchestrator'),
        'PlayerOnPlatsReturnsYCoord'
      )
      .mockReturnValue(MOCK_Y_COORD);

    PlatformDetection(w.PlayerData, w.StageData, frame);

    expect(p.Flags.IsPlatDetectDisabled).toBe(true);
  });

  test('Player should phase through platform when falling and holding down', () => {
    // Platform at y=300
    const initialY = 280;
    SetPlayerPosition(p, new FixedPoint(1000), new FixedPoint(initialY));

    const frame = 10;
    const input = NewInputAction();
    input.LYAxis.SetFromNumber(-0.9);
    w.PlayerData.InputStore(0).StoreInputForFrame(frame, input);
    w.PlayerData.InputStore(0).StoreInputForFrame(frame - 1, input);

    fallOneFrame();

    PlatformDetection(w.PlayerData, w.StageData, frame);

    expect(p.FSMInfo.CurrentState.StateId).not.toBe(STATE_IDS.LAND_S);
    expect(p.FSMInfo.CurrentState.StateId).not.toBe(STATE_IDS.SOFT_LAND_S);
    expect(p.Position.Y.AsNumber).toBe(initialY + 25);
  });

  test('Player should NOT phase through platform when falling and NOT holding down', () => {
    // Platform at y=300
    SetPlayerPosition(p, new FixedPoint(1000), new FixedPoint(280));

    const frame = 10;
    const input = NewInputAction();
    input.LYAxis.SetFromNumber(0);
    w.PlayerData.InputStore(0).StoreInputForFrame(frame, input);
    w.PlayerData.InputStore(0).StoreInputForFrame(frame - 1, input);

    fallOneFrame();

    PlatformDetection(w.PlayerData, w.StageData, frame);

    expect(p.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.LAND_S);
    expect(p.ECB.Bottom.Y.AsNumber).toBeCloseTo(300, 0);
  });
});
