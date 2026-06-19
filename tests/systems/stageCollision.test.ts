import { DefaultCharacterConfig } from '../../game/character/default';
import { defaultStage, WallStage, Stage } from '../../game/engine/stage/stageMain';
import {
  Player,
  SetPlayerPosition,
} from '../../game/engine/entity/playerOrchestrator';
import { StageCollisionDetection } from '../../game/engine/systems/stageCollision';
import { World } from '../../game/engine/world/world';
import { NewInputAction } from '../../game/engine/input/Input';
import { STATE_IDS, GAME_EVENT_IDS } from '../../game/engine/finite-state-machine/stateConfigurations/shared';
import { ApplyVelocity } from '../../game/engine/systems/velocity';
import {
  Launch,
  NeutralFall,
} from '../../game/engine/finite-state-machine/stateConfigurations/states';
import { FixedPoint } from '../../game/engine/math/fixedPoint';
import { RecordHistory } from '../../game/engine/systems/history';
import { ToFp } from '../../game/engine/utils';
import { Line } from '../../game/engine/physics/vector';

describe('Stage Collision system tests', () => {
  let p: Player;
  let w: World;

  beforeEach(() => {
    w = new World();
    w.SetStage(defaultStage());

    const pc = new DefaultCharacterConfig();
    const player = new Player(0, pc);
    w.SetPlayer(player);
    p = w.PlayerData.Player(0)!;

    const input = NewInputAction();
    w.PlayerData.InputStore(0).StoreInputForFrame(0, input);
    w.PlayerData.InputStore(0).StoreInputForFrame(1, input);
    p.FSMInfo.SetCurrentState(NeutralFall);
  });

  function applyVelocity() {
    ApplyVelocity(w);
  }

  test('Player should land on the ground when falling', () => {
    // Stage ground is at y=650
    // NeutralFall ECB: height 70, yOffset -25 -> bottom is at pos.y + 10
    SetPlayerPosition(p, new FixedPoint(1000), new FixedPoint(635)); // bottom at 645
    p.Velocity.Y.SetFromNumber(25);

    RecordHistory(w);
    w.LocalFrame = 1;
    applyVelocity(); // pos.y = 660, bottom at 670. Intersects ground.
    StageCollisionDetection(w);

    expect(p.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.LAND_S);
    // Player's bottom should be at the ground level
    expect(p.ECB.Bottom.Y.AsNumber).toBeCloseTo(650, 0);
  });

  test('Player should collide with the left wall', () => {
    // Left wall is at x=500
    // NeutralFall ECB: width 70 -> right is at pos.x + 35
    // yOffset = -25
    // height = 70
    // right most y coord is posy -25 -35
    // right most ECB point coords at pos 495@600
    SetPlayerPosition(p, new FixedPoint(460), new FixedPoint(735));
    p.Velocity.X.SetFromNumber(20); // move to the irght, ECB right most point should be making contact with stage
    RecordHistory(w);
    w.LocalFrame = 1;
    applyVelocity(); // pos: 480@735, right most ECB point:530@685,
    StageCollisionDetection(w);

    expect(p.ECB.Right.X.AsNumber).toBeCloseTo(500, 0);
  });

  test('Player should collide with the right wall', () => {
    // Right wall is at x=1600
    // NeutralFall ECB: width 70 -> right is at pos.x + 35
    SetPlayerPosition(p, new FixedPoint(1640), new FixedPoint(735)); // right at 1595
    p.Velocity.X.SetFromNumber(-20);
    RecordHistory(w);
    w.LocalFrame = 1;
    applyVelocity(); // pos.x = 1580, right at 1615. Intersects wall.
    StageCollisionDetection(w);

    expect(p.ECB.Left.X.AsNumber).toBeCloseTo(1600, 0);
  });

  test('Player should collide with the ceiling', () => {
    // Ceiling is at y=700
    // NeutralFall ECB: height 70, yOffset -25 -> top is at pos.y - 60
    SetPlayerPosition(p, new FixedPoint(1000), new FixedPoint(765)); // top at 705. Intersects ceiling
    //p.Velocity.Y.SetFromNumber(-20);
    RecordHistory(w);
    w.LocalFrame = 1;
    //applyVelocity(); // pos.y = 745, top at 685.
    StageCollisionDetection(w);

    // Player should be pushed down
    expect(p.ECB.Top.Y.AsNumber).toBeCloseTo(700, 0);
  });

  test('Player should transition to wall slam', () => {
    w.SetStage(WallStage());
    // WallStage has a left facing wall at x=350. 
    // We place the player to the left of it (x=310) and move them right.
    SetPlayerPosition(p, ToFp(310), ToFp(400));
    p.FSMInfo.SetCurrentState(Launch);
    p.Velocity.X.SetFromNumber(20); 
    p.Velocity.Y.SetFromNumber(0); 

    RecordHistory(w);
    w.LocalFrame = 1;
    applyVelocity(); 
    StageCollisionDetection(w);

    expect(p.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.WALL_SLAM_S);
    // expect(Math.abs(p.ECB.Right.X.AsNumber - 350)).toBeLessThanOrEqual(5);
    // console.log(`Wall Slam - p.Position.X: ${p.Position.X.AsNumber}, p.ECB.Right.X: ${p.ECB.Right.X.AsNumber}`);
  });

  test.skip('Player should collide with a bottom-left corner', () => {
    // Corner at 500, 650
    SetPlayerPosition(p, new FixedPoint(540), new FixedPoint(635)); // left at 505, bottom at 645
    p.Velocity.X.SetFromNumber(-20);
    p.Velocity.Y.SetFromNumber(25);
    RecordHistory(w);
    w.LocalFrame = 1;
    applyVelocity(); // pos becomes (520, 660). left at 485, bottom at 670
    StageCollisionDetection(w);

    expect(p.ECB.Left.X.AsNumber).toBeGreaterThanOrEqual(500);
    expect(p.ECB.Bottom.Y.AsNumber).toBeCloseTo(650, 0);
    expect(p.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.LAND_S);
  });

  test('Player transitions to GroundSlam when colliding with ground in Launch state, and advances to GetUp', () => {
    // Stage ground is at y=650
    SetPlayerPosition(p, new FixedPoint(1000), new FixedPoint(635));
    p.FSMInfo.SetCurrentState(Launch);
    p.Velocity.Y.SetFromNumber(25); // fast downward velocity

    RecordHistory(w);
    w.LocalFrame = 1;
    applyVelocity(); // p.Position.y becomes 660. Intersects ground
    
    // Impact with the ground should cause transition to GRND_SLAM_S
    StageCollisionDetection(w);
    expect(p.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.GRND_SLAM_S);
    
    // Simulate updating the state machine to reach the end of GroundSlam (20 frames)
    const sm = w.PlayerData.StateMachine(0);
    const ia = NewInputAction();
    for(let i = 0; i < 20; i++) {
      sm.UpdateFromInput(ia, w);
    }
    expect(p.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.DIRT_NAP_S);
    
    // Simulate updating the state machine to reach the end of DirtNap (480 frames)
    for(let i = 0; i < 480; i++) {
      sm.UpdateFromInput(ia, w);
    }
    expect(p.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.GETUP_S);
  });

  test('Player transitions to TechInPlace when trigger pressed within 20 frames before ground collision', () => {
    SetPlayerPosition(p, new FixedPoint(1000), new FixedPoint(635));
    p.FSMInfo.SetCurrentState(Launch);
    p.Velocity.Y.SetFromNumber(25);

    const is = w.PlayerData.InputStore(0);
    const prevIa = NewInputAction();
    prevIa.LTVal.SetFromNumber(0);
    is.StoreInputForFrame(49, prevIa);

    const techIa = NewInputAction();
    techIa.LTVal.SetFromNumber(1); 
    techIa.LXAxis.SetFromNumber(0); 
    is.StoreInputForFrame(50, techIa);

    w.LocalFrame = 50;
    RecordHistory(w);
    Launch.OnUpdate(p, w); 

    applyVelocity(); 
    StageCollisionDetection(w);
    expect(p.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.TECH_IN_PLACE_S);
  });

  test('Player transitions to Roll Tech when trigger pressed and stick held', () => {
    SetPlayerPosition(p, new FixedPoint(1000), new FixedPoint(635));
    p.FSMInfo.SetCurrentState(Launch);
    p.Velocity.Y.SetFromNumber(25); 

    const is = w.PlayerData.InputStore(0);
    is.StoreInputForFrame(49, NewInputAction());

    const techIa = NewInputAction();
    techIa.LTVal.SetFromNumber(1); 
    techIa.LXAxis.SetFromNumber(-1); // Left roll
    is.StoreInputForFrame(50, techIa);

    w.LocalFrame = 50;
    RecordHistory(w);
    Launch.OnUpdate(p, w); 

    applyVelocity(); 
    StageCollisionDetection(w);
    expect(p.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.ROLL_TECH_S);
    expect(p.Flags.IsFacingRight).toBe(true); 
  });

  test('Player fails to tech if trigger was pressed more than 20 frames before ground collision', () => {
    SetPlayerPosition(p, new FixedPoint(1000), new FixedPoint(635));
    p.FSMInfo.SetCurrentState(Launch);
    p.Velocity.Y.SetFromNumber(25); 

    const is = w.PlayerData.InputStore(0);
    is.StoreInputForFrame(49, NewInputAction());

    const techIa = NewInputAction();
    techIa.LTVal.SetFromNumber(1); 
    is.StoreInputForFrame(50, techIa);

    w.LocalFrame = 50;
    Launch.OnUpdate(p, w); 

    w.LocalFrame = 71;
    RecordHistory(w);
    is.StoreInputForFrame(71, NewInputAction());

    applyVelocity(); 
    StageCollisionDetection(w);
    expect(p.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.GRND_SLAM_S);
  });

  test('Player fails to tech and is locked out if tech attempted again within 40 frames', () => {
    SetPlayerPosition(p, new FixedPoint(1000), new FixedPoint(635));
    p.FSMInfo.SetCurrentState(Launch);
    p.Velocity.Y.SetFromNumber(25);

    const is = w.PlayerData.InputStore(0);
    
    is.StoreInputForFrame(49, NewInputAction());
    const earlyTechIa = NewInputAction(); earlyTechIa.LTVal.SetFromNumber(1);
    is.StoreInputForFrame(50, earlyTechIa);
    
    w.LocalFrame = 50;
    Launch.OnUpdate(p, w);
    expect(p.Flags.LastTechFrame).toBe(50);

    is.StoreInputForFrame(73, NewInputAction());
    const laterTechIa = NewInputAction(); laterTechIa.LTVal.SetFromNumber(1);
    is.StoreInputForFrame(74, laterTechIa);

    w.LocalFrame = 74;
    Launch.OnUpdate(p, w);
    
    expect(p.Flags.LastTechFrame).toBe(50);

    RecordHistory(w);
    applyVelocity(); 
    StageCollisionDetection(w);

    expect(p.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.GRND_SLAM_S);
  });

  test('Player should not be pushed down by stage collision when in LEDGE_GRAB_S', () => {
    // Stage ground is at y=650
    w.SetStage(defaultStage());
    const fsm = w.PlayerData.StateMachine(p.ID);
    fsm.ForceState(STATE_IDS.LEDGE_GRAB_S);
    
    // Position the player so they intersect the stage slightly
    // Player ECB for LEDGE_GRAB_S is height 110, yOffset 0. 
    // Top is pos.y. Bottom is pos.y + 110.
    // If we set pos.y to 640, bottom is 750, intersecting the ground (650).
    SetPlayerPosition(p, new FixedPoint(1000), new FixedPoint(640));
    p.ECB.Update();
    const initialY = p.Position.Y.AsNumber;
    
    RecordHistory(w);
    w.LocalFrame = 1;
    applyVelocity();
    StageCollisionDetection(w);

    // Player should not have been moved by stage collision because LEDGE_GRAB_S is excluded
    expect(p.Position.Y.AsNumber).toBe(initialY);
    expect(p.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.LEDGE_GRAB_S);
  });

  test.skip('Player should trigger TEETER_GE if walking and within 2-unit ledge margin', () => {
    w.SetStage(defaultStage());
    // Stage ground goes from x=500 to x=1600.
    SetPlayerPosition(p, new FixedPoint(1600), new FixedPoint(650));
    const sm = w.PlayerData.StateMachine(0);
    sm.ForceState(STATE_IDS.WALK_S);
    p.ECB.YOffset.SetFromNumber(0);
    p.ECB.Update();
    p.Velocity.X.SetFromRaw(1); // Moves player by 1 raw unit off the ledge, within 2 raw unit margin

    RecordHistory(w);
    w.LocalFrame = 1;
    applyVelocity();
    
    const spy = jest.spyOn(sm, 'UpdateFromWorld');
    StageCollisionDetection(w);

    expect(spy).toHaveBeenCalledWith(GAME_EVENT_IDS.TEETER_GE);
  });

  test('Player cannot walk off ledge during an attack', () => {
    w.SetStage(defaultStage());
    // Stage ground goes from x=500 to x=1600, ground Y is 650.
    SetPlayerPosition(p, new FixedPoint(1595), new FixedPoint(650));
    const sm = w.PlayerData.StateMachine(0);
    sm.ForceState(STATE_IDS.ATTACK_S);
    p.ECB.YOffset.SetFromNumber(0);
    p.ECB.Update();
    p.Velocity.X.SetFromNumber(20); // Moving well off the ledge to 1615

    RecordHistory(w);
    w.LocalFrame = 1;
    applyVelocity();
    StageCollisionDetection(w);

    // Player should be clamped exactly to the right ledge (x=1600)
    expect(p.Position.X.AsNumber).toBeCloseTo(1600, 0);
    // They should remain in the ATTACK_S state (no FALL_GE emitted)
    expect(p.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.ATTACK_S);
  });

  test('Player on platform does not skip wall collision', () => {
    const baseStage = WallStage();
    const customStage = new Stage(
      baseStage.StageVerticies,
      baseStage.Ledges,
      [new Line(ToFp(200), ToFp(500), ToFp(600), ToFp(500))]
    );
    w.SetStage(customStage);

    SetPlayerPosition(p, ToFp(310), ToFp(490)); // Left of the left-facing wall at 350
    const sm = w.PlayerData.StateMachine(0);
    sm.ForceState(STATE_IDS.DASH_S);
    p.Velocity.X.SetFromNumber(60); // Moves them into the wall at 350

    RecordHistory(w);
    w.LocalFrame = 1;
    applyVelocity(); // Moves them into the wall
    StageCollisionDetection(w);

    // The player should not clip through the wall just because they are on a platform.
    expect(p.ECB.Right.X.AsNumber).toBeLessThanOrEqual(355);
  });
});
