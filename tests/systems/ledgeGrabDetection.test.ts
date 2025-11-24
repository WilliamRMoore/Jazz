import { DefaultCharacterConfig } from '../../game/character/default';
import {
  Player,
  SetPlayerPosition,
  SetPlayerPositionRaw,
} from '../../game/engine/player/playerOrchestrator';
import { World } from '../../game/engine/world/world';
import { LedgeGrabDetection } from '../../game/engine/systems/ledgeGrabDetection';
import { defaultStage } from '../../game/engine/stage/stageMain';
import { STATE_IDS } from '../../game/engine/finite-state-machine/playerStates/shared';
import { FixedPoint, NumberToRaw } from '../../game/math/fixedPoint';

describe('Ledge Grab Detection system tests', () => {
  let p: Player;
  let w: World;

  beforeEach(() => {
    w = new World();
    const stage = defaultStage();
    w.SetStage(stage);
    const pc = new DefaultCharacterConfig();
    const player = new Player(0, pc);
    w.SetPlayer(player);
    p = w.PlayerData.Player(0)!;
  });

  test('Player grabs a ledge when falling near it', () => {
    const fsm = w.PlayerData.StateMachine(p.ID);
    fsm.ForceState(STATE_IDS.N_FALL_S); // Set state to falling
    p.Velocity.Y.SetFromNumber(10); // Set downward velocity
    p.Flags.FaceLeft(); // Face the ledge

    // Position the player near the right ledge. The right ledge starts at x=1600.
    // The player's ECB is about 100 wide. The ledge detector is in front of the player.
    // A position of x=1650 should put the ledge detector in a position to overlap with the ledge.
    // p.ECB.MoveToPosition(new FixedPoint(1650), new FixedPoint(750));
    // p.LedgeDetector.MoveTo(p.Position.X, p.Position.Y);
    // p.ECB.UpdatePreviousECB();
    SetPlayerPositionRaw(p, NumberToRaw(1650), NumberToRaw(750));

    LedgeGrabDetection(w.PlayerData, w.StageData, w.Pools);

    expect(p.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.LEDGE_GRAB_S);
  });

  test('Player does not grab ledge when moving upwards', () => {
    const fsm = w.PlayerData.StateMachine(p.ID);
    fsm.ForceState(STATE_IDS.N_FALL_S);
    p.Velocity.Y.SetFromNumber(-10); // Upward velocity
    p.Flags.FaceLeft();
    p.ECB.MoveToPosition(new FixedPoint(1650), new FixedPoint(600));
    p.LedgeDetector.MoveTo(p.Position.X, p.Position.Y);
    p.ECB.UpdatePreviousECB();

    const initialState = p.FSMInfo.CurrentState.StateId;
    LedgeGrabDetection(w.PlayerData, w.StageData, w.Pools);
    expect(p.FSMInfo.CurrentState.StateId).toBe(initialState);
  });

  test('Player does not grab ledge when in JUMP_S state', () => {
    const fsm = w.PlayerData.StateMachine(p.ID);
    fsm.ForceState(STATE_IDS.JUMP_S);
    p.Velocity.Y.SetFromNumber(10); // Downward velocity
    p.Flags.FaceLeft();
    p.ECB.MoveToPosition(new FixedPoint(1650), new FixedPoint(600));
    p.LedgeDetector.MoveTo(p.Position.X, p.Position.Y);
    p.ECB.UpdatePreviousECB();

    const initialState = p.FSMInfo.CurrentState.StateId;
    LedgeGrabDetection(w.PlayerData, w.StageData, w.Pools);
    expect(p.FSMInfo.CurrentState.StateId).toBe(initialState);
  });

  test('Player does not grab ledge when in hit pause', () => {
    const fsm = w.PlayerData.StateMachine(p.ID);
    fsm.ForceState(STATE_IDS.N_FALL_S);
    p.Velocity.Y.SetFromNumber(10);
    p.Flags.SetHitPauseFrames(10);
    p.Flags.FaceLeft();
    p.ECB.MoveToPosition(new FixedPoint(1650), new FixedPoint(600));
    p.LedgeDetector.MoveTo(p.Position.X, p.Position.Y);
    p.ECB.UpdatePreviousECB();

    const initialState = p.FSMInfo.CurrentState.StateId;
    LedgeGrabDetection(w.PlayerData, w.StageData, w.Pools);
    expect(p.FSMInfo.CurrentState.StateId).toBe(initialState);
  });

  test('Player does not grab ledge when on the ground', () => {
    const fsm = w.PlayerData.StateMachine(p.ID);
    fsm.ForceState(STATE_IDS.IDLE_S); // on ground state
    p.Velocity.Y.SetFromNumber(0);
    p.Flags.FaceLeft();
    // Position player on the ground
    p.ECB.MoveToPosition(new FixedPoint(600), new FixedPoint(650));
    p.LedgeDetector.MoveTo(p.Position.X, p.Position.Y);
    p.ECB.UpdatePreviousECB();

    const initialState = p.FSMInfo.CurrentState.StateId;
    LedgeGrabDetection(w.PlayerData, w.StageData, w.Pools);
    expect(p.FSMInfo.CurrentState.StateId).toBe(initialState);
  });
});
