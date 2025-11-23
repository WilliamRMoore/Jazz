import { DefaultCharacterConfig } from '../game/character/default';
import { Player } from '../game/engine/player/playerOrchestrator';
import { World } from '../game/engine/world/world';
import {
  AirDodge,
  GetAtan2IndexRaw,
  Idle,
  Walk,
  Dash,
} from '../game/engine/finite-state-machine/playerStates/states';
import { STATE_IDS } from '../game/engine/finite-state-machine/playerStates/shared';
import { NewInputAction } from '../game/input/Input';
import {
  MultiplyRaw,
  NumberToRaw,
  RawToNumber,
  DivideRaw,
} from '../game/math/fixedPoint';
import { COS_LUT, SIN_LUT } from '../game/math/LUTS';

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
    w.localFrame = frame;

    const input = NewInputAction();
    const lx = 0.707;
    const ly = 0.707;
    input.LXAxis.SetFromRaw(NumberToRaw(lx));
    input.LYAxis.SetFromRaw(NumberToRaw(ly));
    inputStore.StoreInputForFrame(frame, input);

    const fsm = w.PlayerData.StateMachine(p.ID);
    fsm.ForceState(STATE_IDS.AIR_DODGE_S);

    const angleIndex = GetAtan2IndexRaw(input.LYAxis.Raw, input.LXAxis.Raw);
    const expectedSpeedRaw = p.Speeds.AirDogeSpeed.Raw;
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

    expect(p.Velocity.X.Raw).toBeLessThan(initialVelX);
    expect(p.Velocity.Y.Raw).toBeGreaterThan(initialVelY);

    fsm.UpdateFromInput(NewInputAction(), w);
    expect(p.Flags.GetIntangabilityFrames()).toBe(15);

    // OnExit
    AirDodge.OnExit(p, w);
    expect(p.Flags.HasNoVelocityDecay()).toBeFalsy();
    expect(p.Flags.GetIntangabilityFrames()).toBe(0);
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
    w.localFrame = frame;

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
    w.localFrame = frame;

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
    const expectedImpulseRight = RawToNumber(
      Math.abs(DivideRaw(p.Speeds.MaxDashSpeed.Raw, NumberToRaw(0.33)))
    );
    expect(p.Velocity.X.AsNumber).toBeCloseTo(expectedImpulseRight);

    p.Velocity.X.SetFromNumber(0);
    p.Flags.FaceLeft(); // Test facing left

    Dash.OnEnter(p, w);

    const expectedImpulseLeft = -RawToNumber(
      Math.abs(DivideRaw(p.Speeds.MaxDashSpeed.Raw, NumberToRaw(0.33)))
    );
    expect(p.Velocity.X.AsNumber).toBeCloseTo(expectedImpulseLeft);
  });

  test('Dash state - OnUpdate', () => {
    p.Velocity.X.SetFromNumber(5); // Initial velocity
    const initialVelocityX = p.Velocity.X.Raw;

    const inputStore = w.PlayerData.InputStore(p.ID);
    const frame = 10;
    w.localFrame = frame;

    const input = NewInputAction();
    input.LXAxis.SetFromNumber(0.7); // Simulate strong right input
    inputStore.StoreInputForFrame(frame, input);

    Dash.OnUpdate(p, w);

    // Expect velocity to increase further, clamped by MaxDashSpeed
    expect(p.Velocity.X.AsNumber).toBeLessThanOrEqual(
      p.Speeds.MaxDashSpeed.AsNumber
    );
    expect(p.Velocity.X.Raw).toBeGreaterThan(initialVelocityX);

    p.Velocity.X.SetFromNumber(-5); // Initial velocity to the left
    const initialVelocityXLeft = p.Velocity.X.Raw;
    input.LXAxis.SetFromNumber(-0.7); // Simulate strong left input
    inputStore.StoreInputForFrame(frame, input);

    Dash.OnUpdate(p, w);

    // Expect velocity to decrease further (become more negative), clamped by MaxDashSpeed
    expect(p.Velocity.X.AsNumber).toBeGreaterThanOrEqual(
      -p.Speeds.MaxDashSpeed.AsNumber
    );
    expect(p.Velocity.X.Raw).toBeLessThan(initialVelocityXLeft);
  });
});
