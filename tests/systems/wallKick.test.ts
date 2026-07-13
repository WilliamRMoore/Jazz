import { DefaultCharacterConfig } from '../../game/character/default';
import {
  Player,
  SetPlayerPosition
} from '../../game/engine/entity/playerOrchestrator';
import { NeutralFall } from '../../game/engine/finiteStateMachines/player/states';
import { STATE_IDS } from '../../game/engine/finiteStateMachines/player/shared';
import { NewInputAction } from '../../game/engine/input/Input';
import { FixedPoint } from '../../game/engine/math/fixedPoint';
import { defaultStage } from '../../game/engine/stage/stageMain';
import { WallKick } from '../../game/engine/systems/wallKick';
import { World } from '../../game/engine/world/world';

describe('wall kick tests', () => {
  let p: Player;
  let w: World;

  beforeEach(() => {
    w = new World();
    w.SetStage(defaultStage());

    const pc = new DefaultCharacterConfig();
    const player = new Player(0, pc);
    w.SetPlayer(player);
    p = w.PlayerData.Player(0)!;

    // Set player to a falling state for most tests
    p.FSMInfo.SetCurrentState(NeutralFall);
  });

  test('should perform a wall kick from the left wall', () => {
    // Left wall is at x=500. Player ECB width in N_FALL_S is 70.
    // Position player so their ECB is flush with the left wall.
    SetPlayerPosition(p, new FixedPoint(450.001), new FixedPoint(725));

    // Set up input history for a wall kick
    const prevFrame = 0;
    const currentFrame = 1;
    w.LocalFrame = currentFrame;

    const prevInput = NewInputAction();
    prevInput.LXAxis.SetFromNumber(0); // Neutral stick
    w.PlayerData.InputStore(0).StoreInputForFrame(prevFrame, prevInput);

    const currentInput = NewInputAction();
    currentInput.LXAxis.SetFromNumber(-0.8); // Flick stick to the right
    w.PlayerData.InputStore(0).StoreInputForFrame(currentFrame, currentInput);

    WallKick(w);

    expect(p.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.WALL_KICK_S);
    expect(p.Flags.IsFacingLeft).toBe(true);
  });

  test('should perform a wall kick from the right wall', () => {
    // Right wall is at x=1600.
    SetPlayerPosition(p, new FixedPoint(1649.99), new FixedPoint(725));

    const prevFrame = 0;
    const currentFrame = 1;
    w.LocalFrame = currentFrame;

    const prevInput = NewInputAction();
    prevInput.LXAxis.SetFromNumber(0);
    w.PlayerData.InputStore(0).StoreInputForFrame(prevFrame, prevInput);

    const currentInput = NewInputAction();
    currentInput.LXAxis.SetFromNumber(0.8); // Flick stick to the left
    w.PlayerData.InputStore(0).StoreInputForFrame(currentFrame, currentInput);

    WallKick(w);

    expect(p.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.WALL_KICK_S);
    expect(p.Flags.IsFacingRight).toBe(true);
  });

  test('should not perform a wall kick if input conditions are not met', () => {
    SetPlayerPosition(p, new FixedPoint(465), new FixedPoint(680));

    const prevFrame = 0;
    const currentFrame = 1;
    w.LocalFrame = currentFrame;

    const prevInput = NewInputAction();
    prevInput.LXAxis.SetFromNumber(0.8); // Holding right
    w.PlayerData.InputStore(0).StoreInputForFrame(prevFrame, prevInput);

    const currentInput = NewInputAction();
    currentInput.LXAxis.SetFromNumber(0.8); // Still holding right
    w.PlayerData.InputStore(0).StoreInputForFrame(currentFrame, currentInput);

    WallKick(w);

    expect(p.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.N_FALL_S);
  });

  test('should not perform a wall kick if not in a falling state', () => {
    SetPlayerPosition(p, new FixedPoint(465), new FixedPoint(680));
    const sm = w.PlayerData.StateMachine(0);
    sm.ForceState(STATE_IDS.IDLE_S);

    const prevFrame = 0;
    const currentFrame = 1;
    w.LocalFrame = currentFrame;

    const prevInput = NewInputAction();
    prevInput.LXAxis.SetFromNumber(0);
    w.PlayerData.InputStore(0).StoreInputForFrame(prevFrame, prevInput);

    const currentInput = NewInputAction();
    currentInput.LXAxis.SetFromNumber(0.8);
    w.PlayerData.InputStore(0).StoreInputForFrame(currentFrame, currentInput);

    WallKick(w);

    expect(p.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.IDLE_S);
  });

  test('should not perform a wall kick if not near a wall', () => {
    SetPlayerPosition(p, new FixedPoint(1000), new FixedPoint(800));

    const prevFrame = 0;
    const currentFrame = 1;
    w.LocalFrame = currentFrame;

    const prevInput = NewInputAction();
    prevInput.LXAxis.SetFromNumber(0);
    w.PlayerData.InputStore(0).StoreInputForFrame(prevFrame, prevInput);

    const currentInput = NewInputAction();
    currentInput.LXAxis.SetFromNumber(0.8);
    w.PlayerData.InputStore(0).StoreInputForFrame(currentFrame, currentInput);

    WallKick(w);

    expect(p.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.N_FALL_S);
  });
});
