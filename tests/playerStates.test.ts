import { DefaultCharacterConfig } from '../game/character/default';
import { Player } from '../game/engine/entity/playerOrchestrator';
import { World } from '../game/engine/world/world';
import { GetAtan2IndexRaw } from '../game/engine/utils';
import {
  AirDodge,
  Idle,
  Walk,
  Dash
} from '../game/engine/finite-state-machine/stateConfigurations/states';
import {
  STATE_IDS,
  CanStateWalkOffLedge,
  GAME_EVENT_IDS,
  ATTACK_IDS
} from '../game/engine/finite-state-machine/stateConfigurations/shared';
import { NewInputAction } from '../game/engine/input/Input';
import {
  NumberToRaw,
  RawToNumber,
  MultiplyRaw
} from '../game/engine/math/fixedPoint';
import { COS_LUT, SIN_LUT } from '../game/engine/math/LUTS';
import { ApplyVelocity } from '../game/engine/systems/velocity';
import { defaultStage } from '../game/engine/stage/stageMain';
import { SetPlayerPositionRaw } from '../game/engine/entity/playerOrchestrator';
describe('Player states tests', () => {
  let p: Player;
  let w: World;

  beforeEach(() => {
    w = new World();
    const pc = new DefaultCharacterConfig();
    const player = new Player(0, pc);
    w.SetPlayer(player);
    p = w.PlayerData.Player(0)!;
  });

  test('test Air Dodge', () => {
    const inputStore = w.PlayerData.InputStore(p.ID);
    const frame = 10;
    w.LocalFrame = frame;

    const input = NewInputAction();
    const lx = 0.707;
    const ly = 0.707;
    input.LXAxis.SetFromRaw(NumberToRaw(lx));
    input.LYAxis.SetFromRaw(NumberToRaw(ly));
    inputStore.StoreInputForFrame(frame, input);

    const fsm = w.PlayerData.StateMachine(p.ID);
    fsm.ForceState(STATE_IDS.AIR_DODGE_S);

    const angleIndex = GetAtan2IndexRaw(input.LYAxis.Raw, input.LXAxis.Raw);
    const expectedSpeedRaw = p.Speeds.AirDogeSpeedRaw;
    const expectedVelXRaw = RawToNumber(
      MultiplyRaw(NumberToRaw(COS_LUT[angleIndex]), expectedSpeedRaw)
    );
    const expectedVelYRaw = RawToNumber(
      MultiplyRaw(NumberToRaw(-SIN_LUT[angleIndex]), expectedSpeedRaw)
    );

    expect(p.Velocity.X.Raw).toBeCloseTo(expectedVelXRaw, -1);
    expect(p.Velocity.Y.Raw).toBeCloseTo(expectedVelYRaw, -1);
    expect(p.Flags.HasNoVelocityDecay()).toBeTruthy();

    const initialVelX = p.Velocity.X.Raw;
    const initialVelY = p.Velocity.Y.Raw;

    fsm.UpdateFromInput(NewInputAction(), w);
    fsm.UpdateFromInput(NewInputAction(), w);
    fsm.UpdateFromInput(NewInputAction(), w);

    expect(p.Velocity.X.Raw).toBeLessThan(initialVelX);
    expect(p.Velocity.Y.Raw).toBeGreaterThan(initialVelY);

    fsm.UpdateFromInput(NewInputAction(), w);
    expect(p.Flags.GetIntangabilityFrames()).toBe(15);

    // OnExit
    AirDodge.OnExit(p, w);
    expect(p.Flags.HasNoVelocityDecay()).toBeFalsy();
    expect(p.Flags.GetIntangabilityFrames()).toBe(0);
  });

  test('DownSpecialAerial state', () => {
    const fsm = w.PlayerData.StateMachine(p.ID);

    // Set initial velocity and jump count
    p.Velocity.X.SetFromNumber(10);
    p.Velocity.Y.SetFromNumber(10);
    p.Jump.Set(0);
    p.Flags.FaceRight();

    // Force state and check OnEnter effects
    fsm.ForceState(STATE_IDS.DOWN_SPCL_AIR_S);
    expect(p.Velocity.X.Raw).toBe(0);
    expect(p.Velocity.Y.Raw).toBe(0);

    // Update state machine to check OnUpdate effects
    // The impulse starts at frame 13
    for (let i = 0; i < 15; i++) {
      fsm.UpdateFromInput(NewInputAction(), w);
    }

    // After 15 frames, the impulse should have been applied
    expect(p.Velocity.X.Raw).toBeGreaterThan(0);
    expect(p.Velocity.Y.Raw).toBeGreaterThan(0);

    // Check OnExit effects
    const downSpecialAerialState = p.FSMInfo.CurrentState;
    downSpecialAerialState.OnExit(p, w);
    expect(p.Jump.JumpCount).toBe(1);
  });

  test('Idle state', () => {
    p.FSMInfo.SetCurrentState(Idle);
    p.Velocity.X.SetFromNumber(0);
    p.Velocity.Y.SetFromNumber(0);
    const initialVelocityX = p.Velocity.X.Raw;
    const initialVelocityY = p.Velocity.Y.Raw;

    Idle.OnUpdate(p, w);

    expect(p.Velocity.X.Raw).toBe(initialVelocityX);
    expect(p.Velocity.Y.Raw).toBe(initialVelocityY);
  });

  test('Walk state - walk right', () => {
    p.FSMInfo.SetCurrentState(Walk);
    p.Velocity.X.SetFromNumber(0);
    p.Velocity.Y.SetFromNumber(0);

    const inputStore = w.PlayerData.InputStore(p.ID);
    const frame = 10;
    w.LocalFrame = frame;

    const input = NewInputAction();
    input.LXAxis.SetFromNumber(0.5); // Simulate walking right
    inputStore.StoreInputForFrame(frame, input);

    const initialVelocityX = p.Velocity.X.Raw;

    Walk.OnUpdate(p, w);

    // Expect X velocity to increase due to walk impulse
    expect(p.Velocity.X.Raw).toBeGreaterThan(initialVelocityX);
  });

  test('Walk state - walk left', () => {
    p.FSMInfo.SetCurrentState(Walk);
    p.Velocity.X.SetFromNumber(0); // Reset velocity for this test
    p.Velocity.Y.SetFromNumber(0);

    const inputStore = w.PlayerData.InputStore(p.ID);
    const frame = 10;
    w.LocalFrame = frame;

    const input = NewInputAction();
    input.LXAxis.SetFromNumber(-0.5); // Simulate walking left
    inputStore.StoreInputForFrame(frame, input);

    const initialVelocityX = p.Velocity.X.Raw; // This is 0

    Walk.OnUpdate(p, w);

    // Expect X velocity to decrease (or become more negative) due to walk impulse
    expect(p.Velocity.X.Raw).toBeLessThan(initialVelocityX);
  });

  test('Dash state - OnEnter', () => {
    p.Velocity.X.SetFromNumber(0);
    p.Flags.FaceRight(); // Test facing right

    Dash.OnEnter(p, w);

    // Expect X velocity to be initialized to MaxDashSpeed (or related impulse)
    const expectedImpulseRight = RawToNumber(p.Speeds.MaxDashSpeedRaw);
    expect(p.Velocity.X.AsNumber).toBeCloseTo(expectedImpulseRight);

    p.Velocity.X.SetFromNumber(0);
    p.Flags.FaceLeft(); // Test facing left

    Dash.OnEnter(p, w);

    const expectedImpulseLeft = -RawToNumber(p.Speeds.MaxDashSpeedRaw);
    expect(p.Velocity.X.AsNumber).toBeCloseTo(expectedImpulseLeft);
  });

  test('Dash state - OnUpdate', () => {
    p.Velocity.X.SetFromNumber(5); // Initial velocity
    const initialVelocityX = p.Velocity.X.Raw;

    const inputStore = w.PlayerData.InputStore(p.ID);
    const frame = 10;
    w.LocalFrame = frame;

    const input = NewInputAction();
    input.LXAxis.SetFromNumber(0.7); // Simulate strong right input
    inputStore.StoreInputForFrame(frame, input);

    Dash.OnUpdate(p, w);

    // Expect velocity to increase further, clamped by MaxDashSpeed
    expect(p.Velocity.X.AsNumber).toBeLessThanOrEqual(p.Speeds.MaxDashSpeedRaw);
    expect(p.Velocity.X.Raw).toBeGreaterThan(initialVelocityX);

    p.Velocity.X.SetFromNumber(-5); // Initial velocity to the left
    const initialVelocityXLeft = p.Velocity.X.Raw;
    input.LXAxis.SetFromNumber(-0.7); // Simulate strong left input
    inputStore.StoreInputForFrame(frame, input);

    Dash.OnUpdate(p, w);

    // Expect velocity to decrease further (become more negative), clamped by MaxDashSpeed
    expect(p.Velocity.X.AsNumber).toBeGreaterThanOrEqual(
      -p.Speeds.MaxDashSpeedRaw
    );
    expect(p.Velocity.X.Raw).toBeLessThan(initialVelocityXLeft);
  });

  test('GetUpRollForward state', () => {
    const fsm = w.PlayerData.StateMachine(p.ID);
    const inputStore = w.PlayerData.InputStore(p.ID);

    // 1. Transition from dirt nap
    fsm.ForceState(STATE_IDS.DIRT_NAP_S);
    p.Flags.FaceRight();

    // Create input for roll forward (pressing right while facing right)
    const frame = 10;
    w.LocalFrame = frame;
    const input = NewInputAction();
    input.LXAxis.SetFromNumber(0.8);
    inputStore.StoreInputForFrame(frame, input);

    // Simulate FSM update
    fsm.UpdateFromInput(input, w);

    // Verify transition
    expect(p.FSMInfo.CurrentStateId).toBe(STATE_IDS.GETUP_ROLL_FORWARD_S);

    // 2. Verify it moves the character
    p.Velocity.X.SetFromNumber(0);
    fsm.UpdateFromInput(input, w);

    expect(p.Velocity.X.Raw).toBeGreaterThan(0); // moved right

    // 3. Verify you can't roll off the ledge
    expect(CanStateWalkOffLedge(STATE_IDS.GETUP_ROLL_FORWARD_S)).toBe(false);
  });

  test('GetUpRollBack state', () => {
    const fsm = w.PlayerData.StateMachine(p.ID);
    const inputStore = w.PlayerData.InputStore(p.ID);

    // 1. Transition from dirt nap
    fsm.ForceState(STATE_IDS.DIRT_NAP_S);
    p.Flags.FaceRight();

    // Create input for roll backward (pressing left while facing right)
    const frame = 10;
    w.LocalFrame = frame;
    const input = NewInputAction();
    input.LXAxis.SetFromNumber(-0.8);
    inputStore.StoreInputForFrame(frame, input);

    // Simulate FSM update
    fsm.UpdateFromInput(input, w);

    // Verify transition
    expect(p.FSMInfo.CurrentStateId).toBe(STATE_IDS.GETUP_ROLL_BACK_S);

    // 2. Verify it moves the character
    p.Velocity.X.SetFromNumber(0);
    fsm.UpdateFromInput(input, w);

    expect(p.Velocity.X.Raw).toBeLessThan(0); // moved left

    // 3. Verify you can't roll off the ledge
  });

  test('LedgeGetUp state - transition and properties', () => {
    const fsm = w.PlayerData.StateMachine(p.ID);
    const inputStore = w.PlayerData.InputStore(p.ID);

    // Transition from LedgeGrab
    fsm.ForceState(STATE_IDS.LEDGE_GRAB_S);

    // Simulate jump input
    const frame = 10;
    w.LocalFrame = frame;
    inputStore.StoreInputForFrame(frame - 1, NewInputAction());
    const input = NewInputAction();
    input.Action = GAME_EVENT_IDS.JUMP_GE;
    inputStore.StoreInputForFrame(frame, input);

    // Simulate FSM update
    fsm.UpdateFromInput(input, w);

    // Verify transition
    expect(p.FSMInfo.CurrentStateId).toBe(STATE_IDS.LEDGE_GETUP_S);

    // Verify state properties
    expect(p.Flags.HasNoVelocityDecay()).toBeTruthy();
    expect(p.Flags.GetIntangabilityFrames()).toBe(30);
    expect(CanStateWalkOffLedge(STATE_IDS.LEDGE_GETUP_S)).toBe(false);
  });

  test('LedgeGetUp state - gets back on stage and defaults to IDLE', () => {
    const fsm = w.PlayerData.StateMachine(p.ID);
    const inputStore = w.PlayerData.InputStore(p.ID);

    // Setup stage so the state can find the ledge
    w.SetStage(defaultStage());

    // Position player near the left ledge (left ledge is at X=500, Y=650)
    SetPlayerPositionRaw(p, NumberToRaw(480), NumberToRaw(650));
    p.Flags.FaceRight();

    // Transition from LedgeGrab
    fsm.ForceState(STATE_IDS.LEDGE_GRAB_S);

    const frame = 10;
    w.LocalFrame = frame;
    inputStore.StoreInputForFrame(frame - 1, NewInputAction());
    const input = NewInputAction();
    input.Action = GAME_EVENT_IDS.JUMP_GE;
    inputStore.StoreInputForFrame(frame, input);

    // Trigger transition to LEDGE_GETUP_S
    fsm.UpdateFromInput(input, w);
    expect(p.FSMInfo.CurrentStateId).toBe(STATE_IDS.LEDGE_GETUP_S);

    const getUpFrameLength = p.FSMInfo.GetCurrentStateFrameLength() || 30;

    // Simulate the state over its duration
    for (let i = 0; i < getUpFrameLength; i++) {
      ApplyVelocity(w);
      fsm.UpdateFromInput(NewInputAction(), w);
    }

    // Check if player defaulted to IDLE
    expect(p.FSMInfo.CurrentStateId).toBe(STATE_IDS.IDLE_S);

    // Verify target position: X should be 500 + (LedgeGetUp ECB Width / 2) = 535, Y should be 650
    const expectedX = 535;
    const expectedY = 650 - RawToNumber(p.ECB.YOffset.Raw);

    expect(p.Position.X.AsNumber).toBeCloseTo(expectedX, 0);
    expect(p.Position.Y.AsNumber).toBeCloseTo(expectedY, 0);
  });

  test('GetUpAttack state - transitions from DirtNap and executes fully', () => {
    const fsm = w.PlayerData.StateMachine(p.ID);
    const inputStore = w.PlayerData.InputStore(p.ID);

    SetPlayerPositionRaw(p, NumberToRaw(1000), NumberToRaw(650));
    fsm.ForceState(STATE_IDS.DIRT_NAP_S);

    const frame = 10;
    w.LocalFrame = frame;
    const input = NewInputAction();
    input.Action = GAME_EVENT_IDS.ATTACK_GE;
    inputStore.StoreInputForFrame(frame, input);

    // Trigger transition to GETUP_ATTACK_S
    fsm.UpdateFromInput(input, w);
    expect(p.FSMInfo.CurrentStateId).toBe(STATE_IDS.GETUP_ATTACK_S);
    expect(p.Attacks.GetAttack()?.AttackId).toBe(ATTACK_IDS.GETUP_ATTACK_ATK);

    const getUpAtkFrameLength = p.FSMInfo.GetCurrentStateFrameLength() || 55;

    // Simulate the state over its duration
    for (let i = 0; i < getUpAtkFrameLength; i++) {
      fsm.UpdateFromInput(NewInputAction(), w);
    }

    // Check if player defaulted to IDLE
    expect(p.FSMInfo.CurrentStateId).toBe(STATE_IDS.IDLE_S);
  });

  test('LedgeRoll transition and behavior', () => {
    const fsm = w.PlayerData.StateMachine(p.ID);
    const inputStore = w.PlayerData.InputStore(p.ID);

    SetPlayerPositionRaw(p, NumberToRaw(1000), NumberToRaw(650));
    p.Flags.FaceRight();
    fsm.ForceState(STATE_IDS.LEDGE_GRAB_S);

    const frame = 10;
    w.LocalFrame = frame;
    inputStore.StoreInputForFrame(frame - 1, NewInputAction());
    const input = NewInputAction();
    input.Action = GAME_EVENT_IDS.GUARD_GE;
    inputStore.StoreInputForFrame(frame, input);

    // Trigger transition to LEDGE_ROLL_S
    fsm.UpdateFromInput(input, w);
    expect(p.FSMInfo.CurrentStateId).toBe(STATE_IDS.LEDGE_ROLL_S);

    const rollFrameLength = p.FSMInfo.GetCurrentStateFrameLength() || 43;

    // Simulate the state over its duration
    for (let i = 0; i < rollFrameLength; i++) {
      fsm.UpdateFromInput(NewInputAction(), w);
    }

    // Check if player defaulted to IDLE
    expect(p.FSMInfo.CurrentStateId).toBe(STATE_IDS.IDLE_S);
  });

  test('LedgeAttack state - transition, behavior, and hit detection', () => {
    const fsm = w.PlayerData.StateMachine(p.ID);
    const inputStore = w.PlayerData.InputStore(p.ID);

    // Setup stage so the state can find the ledge
    w.SetStage(defaultStage());

    // Position player near the left ledge (left ledge is at X=500, Y=650)
    SetPlayerPositionRaw(p, NumberToRaw(480), NumberToRaw(650));
    p.Flags.FaceRight();

    fsm.ForceState(STATE_IDS.LEDGE_GRAB_S);

    // Trigger transition to LEDGE_ATTACK_S
    const frame = 10;
    w.LocalFrame = frame;
    inputStore.StoreInputForFrame(frame - 1, NewInputAction());
    const input = NewInputAction();
    input.Action = GAME_EVENT_IDS.ATTACK_GE;
    inputStore.StoreInputForFrame(frame, input);

    fsm.UpdateFromInput(input, w);

    // Verify the attack works (state is active and attack is triggered)
    expect(p.FSMInfo.CurrentStateId).toBe(STATE_IDS.LEDGE_ATTACK_S);
    expect(p.Attacks.GetAttack()?.AttackId).toBe(ATTACK_IDS.LEDGE_ATTACK_ATK);

    const attackFrameLength = p.FSMInfo.GetCurrentStateFrameLength() || 45;

    // Simulate the state over its duration
    for (let i = 0; i < attackFrameLength; i++) {
      ApplyVelocity(w);
      fsm.UpdateFromInput(NewInputAction(), w);
    }

    // Verify that we correctly default to idle when done
    expect(p.FSMInfo.CurrentStateId).toBe(STATE_IDS.IDLE_S);

    // Verify we end up on the stage correctly
    // X should be 500 + (LedgeAttack ECB Width / 2) = 535, Y should be 650
    const expectedX = 535;
    const expectedY = 650 - RawToNumber(p.ECB.YOffset.Raw);

    expect(p.Position.X.AsNumber).toBeCloseTo(expectedX, 0);
    expect(p.Position.Y.AsNumber).toBeCloseTo(expectedY, 0);

    // Now verify we can be hit out of it
    // Reset state back to LedgeAttack
    fsm.ForceState(STATE_IDS.LEDGE_ATTACK_S);
    expect(p.FSMInfo.CurrentStateId).toBe(STATE_IDS.LEDGE_ATTACK_S);

    // Simulate being hit via HIT_STOP_GE (which is in InitLedgeAttackRelations mappings)
    const hitInput = NewInputAction();
    hitInput.Action = GAME_EVENT_IDS.HIT_STOP_GE;
    fsm.UpdateFromInput(hitInput, w);

    // Verify state changed to hit stun/stop
    expect(p.FSMInfo.CurrentStateId).toBe(STATE_IDS.HIT_STOP_S);
  });
});
