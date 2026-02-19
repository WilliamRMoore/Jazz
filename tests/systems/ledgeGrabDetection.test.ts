import { DefaultCharacterConfig } from '../../game/character/default';
import {
  Player,
  SetPlayerPositionRaw,
} from '../../game/engine/entity/playerOrchestrator';
import { World } from '../../game/engine/world/world';
import { LedgeGrabDetection } from '../../game/engine/systems/ledgeGrabDetection';
import { defaultStage } from '../../game/engine/stage/stageMain';
import { STATE_IDS } from '../../game/engine/finite-state-machine/stateConfigurations/shared';
import { NumberToRaw, FixedPoint } from '../../game/engine/math/fixedPoint';
import { RecordHistory } from '../../game/engine/systems/history';

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

  test('Player grabs a ledge when falling very fast confimrs continious collision detection is working', () => {
    const fsm = w.PlayerData.StateMachine(p.ID);
    fsm.ForceState(STATE_IDS.N_FALL_S); // Set state to falling
    p.Flags.FaceLeft(); // Face the ledge

    SetPlayerPositionRaw(p, NumberToRaw(1650), NumberToRaw(500));

    RecordHistory(w);

    w.LocalFrame++;

    SetPlayerPositionRaw(p, NumberToRaw(1650), NumberToRaw(1050));

    LedgeGrabDetection(w);

    expect(p.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.LEDGE_GRAB_S);
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

    LedgeGrabDetection(w);

    expect(p.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.LEDGE_GRAB_S);
  });

  test('Player does not grab ledge when moving upwards', () => {
    const fsm = w.PlayerData.StateMachine(p.ID);
    fsm.ForceState(STATE_IDS.N_FALL_S);
    p.Velocity.Y.SetFromNumber(-10); // Upward velocity
    p.Flags.FaceLeft();
    p.ECB.MoveToPosition(new FixedPoint(1650), new FixedPoint(600));
    p.LedgeDetector.MoveTo(p.Position.X, p.Position.Y);

    const initialState = p.FSMInfo.CurrentState.StateId;
    LedgeGrabDetection(w);
    expect(p.FSMInfo.CurrentState.StateId).toBe(initialState);
  });

  test('Player does not grab ledge when in JUMP_S state', () => {
    const fsm = w.PlayerData.StateMachine(p.ID);
    fsm.ForceState(STATE_IDS.JUMP_S);
    p.Velocity.Y.SetFromNumber(10); // Downward velocity
    p.Flags.FaceLeft();
    p.ECB.MoveToPosition(new FixedPoint(1650), new FixedPoint(600));
    p.LedgeDetector.MoveTo(p.Position.X, p.Position.Y);

    const initialState = p.FSMInfo.CurrentState.StateId;
    LedgeGrabDetection(w);
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

    const initialState = p.FSMInfo.CurrentState.StateId;
    LedgeGrabDetection(w);
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

    const initialState = p.FSMInfo.CurrentState.StateId;
    LedgeGrabDetection(w);
    expect(p.FSMInfo.CurrentState.StateId).toBe(initialState);
  });

  test('Player does not grab an already occupied ledge', () => {
    // Setup p2
    const pc2 = new DefaultCharacterConfig();
    const player2 = new Player(1, pc2);
    w.SetPlayer(player2);
    const p2 = w.PlayerData.Player(1)!;

    // Have p1 grab the right ledge
    const stage = w.StageData.Stages[0];
    const rightLedge = stage.Ledges.GetRightLedge();
    p.LedgeDetector.GrabLedge(rightLedge);
    const fsm1 = w.PlayerData.StateMachine(p.ID);
    fsm1.ForceState(STATE_IDS.LEDGE_GRAB_S);

    // Position p2 to attempt to grab the same ledge
    const fsm2 = w.PlayerData.StateMachine(p2.ID);
    fsm2.ForceState(STATE_IDS.N_FALL_S); // Set state to falling
    p2.Velocity.Y.SetFromNumber(10); // Set downward velocity
    p2.Flags.FaceLeft(); // Face the ledge

    SetPlayerPositionRaw(p2, NumberToRaw(1650), NumberToRaw(750));

    LedgeGrabDetection(w);

    expect(p2.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.N_FALL_S);
  });

  test('Players can grab different ledges', () => {
    // Setup p2
    const pc2 = new DefaultCharacterConfig();
    const player2 = new Player(1, pc2);
    w.SetPlayer(player2);
    const p2 = w.PlayerData.Player(1)!;
    const fsm1 = w.PlayerData.StateMachine(p.ID);
    const fsm2 = w.PlayerData.StateMachine(p2.ID);

    // Position p1 to grab the left ledge (at x=500)
    fsm1.ForceState(STATE_IDS.N_FALL_S);
    p.Velocity.Y.SetFromNumber(10);
    p.Flags.FaceRight(); // Face the ledge
    SetPlayerPositionRaw(p, NumberToRaw(450), NumberToRaw(750));

    // Position p2 to grab the right ledge (at x=1600)
    fsm2.ForceState(STATE_IDS.N_FALL_S);
    p2.Velocity.Y.SetFromNumber(10);
    p2.Flags.FaceLeft(); // Face the ledge
    SetPlayerPositionRaw(p2, NumberToRaw(1650), NumberToRaw(750));

    LedgeGrabDetection(w);

    expect(p.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.LEDGE_GRAB_S);
    expect(p2.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.LEDGE_GRAB_S);
    expect(p.LedgeDetector.GrabbedLedge).toBe(
      w.StageData.Stages[0].Ledges.GetLeftLedge(),
    );
    expect(p2.LedgeDetector.GrabbedLedge).toBe(
      w.StageData.Stages[0].Ledges.GetRightLedge(),
    );
  });
});
