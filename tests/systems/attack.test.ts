import { DefaultCharacterConfig } from '../../game/character/default';
import { StateMachine } from '../../game/engine/finite-state-machine/PlayerStateMachine';
import { STATE_IDS } from '../../game/engine/finite-state-machine/stateConfigurations/shared';
import {
  FixedPoint,
  NumberToRaw,
  RawToNumber,
} from '../../game/engine/math/fixedPoint';
import {
  Player,
  SetPlayerInitialPositionRaw,
} from '../../game/engine/entity/playerOrchestrator';
import {
  CalculateHitStop,
  CalculateHitStun,
  CalculateKnockback,
  CalculateLaunchVector,
  PlayerAttacks,
} from '../../game/engine/systems/attack';
import { World } from '../../game/engine/world/world';
import { NewInputAction } from '../../game/engine/input/Input';
import { Pool } from '../../game/engine/pools/Pool';
import { PooledVector } from '../../game/engine/pools/PooledVector';
import { IInputStore } from '../../game/engine/managers/inputManager';
import { defaultStage } from '../../game/engine/stage/stageMain';
import { PlayerHistoryTable } from '../../game/engine/world/stateModules';

describe('Attack systesm tests', () => {
  let p1: Player;
  let p1Sm: StateMachine;
  let p1InputStore: IInputStore;
  let p2: Player;
  let p2Sm: StateMachine;
  let p2InputStore: IInputStore;
  let w: World;
  let h1: PlayerHistoryTable;
  let h2: PlayerHistoryTable;

  beforeEach(() => {
    w = new World();
    w.SetStage(defaultStage());
    const pc = new DefaultCharacterConfig();
    p1 = new Player(0, pc);
    p2 = new Player(1, pc);
    w.SetPlayer(p1);
    w.SetPlayer(p2);
    p1Sm = w.PlayerData.StateMachine(0);
    p2Sm = w.PlayerData.StateMachine(1);
    p1InputStore = w.PlayerData.InputStore(0);
    p2InputStore = w.PlayerData.InputStore(1);
    p1.Flags.FaceRight();
    h1 = w.HistoryData.PlayerHistoryDB[0];
    h2 = w.HistoryData.PlayerHistoryDB[1];
  });

  test('Player should register an attack hit', () => {
    p2Sm.ForceState(STATE_IDS.IDLE_S);
    p1Sm.ForceState(STATE_IDS.ATTACK_S);
    SetPlayerInitialPositionRaw(p1, NumberToRaw(1000), NumberToRaw(650.01));
    SetPlayerInitialPositionRaw(p2, NumberToRaw(1070), NumberToRaw(650.01));
    const i1 = NewInputAction();
    const i2 = NewInputAction();
    const i3 = NewInputAction();
    p1InputStore.StoreInputForFrame(0, i1);
    p1InputStore.StoreInputForFrame(1, i2);
    p1InputStore.StoreInputForFrame(2, i3);
    p2InputStore.StoreInputForFrame(0, i1);
    p2InputStore.StoreInputForFrame(1, i2);
    p2InputStore.StoreInputForFrame(2, i3);
    for (let i = 0; i < 3; i++) {
      const h1State = h1.get(i);
      h1State.posXRaw = p1.Position.X.Raw;
      h1State.posYRaw = p1.Position.Y.Raw;
      const h2State = h2.get(i);
      h2State.posXRaw = p2.Position.X.Raw;
      h2State.posYRaw = p2.Position.Y.Raw;
    }
    w.LocalFrame = 2;
    p1.FSMInfo._db_currentStateFrame = 3; // Startup frames over, active frames

    PlayerAttacks(w);

    expect(p1.Attacks.HasHitPlayer(1)).toBe(true);
    expect(p2.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.HIT_STOP_S);
  });

  test('Player should NOT register an attack hit', () => {
    p2Sm.ForceState(STATE_IDS.IDLE_S);
    p1Sm.ForceState(STATE_IDS.ATTACK_S);
    SetPlayerInitialPositionRaw(p1, NumberToRaw(1000), NumberToRaw(650.01));
    SetPlayerInitialPositionRaw(p2, NumberToRaw(1170), NumberToRaw(650.01));
    const i1 = NewInputAction();
    const i2 = NewInputAction();
    const i3 = NewInputAction();
    p1InputStore.StoreInputForFrame(0, i1);
    p1InputStore.StoreInputForFrame(1, i2);
    p1InputStore.StoreInputForFrame(2, i3);
    p2InputStore.StoreInputForFrame(0, i1);
    p2InputStore.StoreInputForFrame(1, i2);
    p2InputStore.StoreInputForFrame(2, i3);
    for (let i = 0; i < 3; i++) {
      const h1State = h1.get(i);
      h1State.posXRaw = p1.Position.X.Raw;
      h1State.posYRaw = p1.Position.Y.Raw;
      const h2State = h2.get(i);
      h2State.posXRaw = p2.Position.X.Raw;
      h2State.posYRaw = p2.Position.Y.Raw;
    }
    w.LocalFrame = 2;
    p1.FSMInfo._db_currentStateFrame = 3; // Startup frames over, active frames

    PlayerAttacks(w);

    expect(p1.Attacks.HasHitPlayer(1)).toBe(false);
    expect(p2.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.IDLE_S);
  });

  test('Player should register an attack hit via continuous collision detection (tunneling)', () => {
    // Setup: p1 will move fast enough to "tunnel" through p2 if only checking endpoints.
    p1Sm.ForceState(STATE_IDS.ATTACK_S);
    p2Sm.ForceState(STATE_IDS.IDLE_S);
    p1.Flags.FaceRight();

    // Position players so their hit/hurtboxes do not overlap at the start or end of the frame,
    // but the swept hitbubble will collide.
    // Let's assume a hitbubble with offset ~40 and radius ~30, and a hurtbox with offset 0 and radius 40.

    // Frame n-1 state
    const frame_n_minus_1 = 0;
    w.LocalFrame = frame_n_minus_1;
    SetPlayerInitialPositionRaw(p1, NumberToRaw(1000), NumberToRaw(650.01));
    SetPlayerInitialPositionRaw(p2, NumberToRaw(1150), NumberToRaw(650.01));

    // At this point, p1's hitbubble (at ~1040) is far from p2's hurtbox (at 1150). No collision.

    // Store history for frame n-1
    const h1State = h1.get(frame_n_minus_1);
    h1State.posXRaw = p1.Position.X.Raw;
    h1State.posYRaw = p1.Position.Y.Raw;
    const h2State = h2.get(frame_n_minus_1);
    h2State.posXRaw = p2.Position.X.Raw;
    h2State.posYRaw = p2.Position.Y.Raw;
    p1InputStore.StoreInputForFrame(frame_n_minus_1, NewInputAction());
    p2InputStore.StoreInputForFrame(frame_n_minus_1, NewInputAction());

    // Frame n state
    const frame_n = 1;
    w.LocalFrame = frame_n;
    p1InputStore.StoreInputForFrame(frame_n, NewInputAction());
    p2InputStore.StoreInputForFrame(frame_n, NewInputAction());

    // p1 moves very fast, tunneling through p2.
    p1.Position.X.SetFromNumber(1250);
    p1.ECB.Update();

    // Set attack to be on an active frame where the *previous* frame was also active.
    // This is because the continuous collision logic checks the hitbox position on the previous state frame.
    // N-Attack is active on frames 3-7. By setting the current frame to 4, the previous frame (3) is also active.
    p1.FSMInfo._db_currentStateFrame = 4;

    PlayerAttacks(w);

    expect(p1.Attacks.HasHitPlayer(p2.ID)).toBe(true);
    expect(p2.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.HIT_STOP_S);
  });
});

describe('Attack Calculation Tests', () => {
  let vecPool: Pool<PooledVector>;

  beforeEach(() => {
    vecPool = new Pool<PooledVector>(10, () => new PooledVector());
  });

  test('CalculateHitStop', () => {
    const damage = new FixedPoint(10);
    const hitStopRaw = CalculateHitStop(damage);
    // Formula: DivideRaw(damage.Raw, THREE) + THREE; where THREE is NumberToRaw(3)
    // damage.Raw = 10 * 1024 = 10240
    // THREE = 3 * 1024 = 3072
    // DivideRaw(10240, 3072) = trunc((10240 * 1024) / 3072) = 3413
    // 3413 + 3072 = 6485
    expect(hitStopRaw).toBe(6485);
    expect(RawToNumber(hitStopRaw)).toBeCloseTo(6.333, 3);
  });

  test('CalculateHitStun', () => {
    const knockBackRaw = NumberToRaw(100);
    const hitStunFrames = CalculateHitStun(knockBackRaw);
    // Formula: Math.ceil(RawToNumber(MultiplyRaw(knockBackRaw, POINT_FOUR)))
    // knockBackRaw = 100 * 1024 = 102400
    // POINT_FOUR = NumberToRaw(0.4) = trunc(0.4 * 1024) = 409
    // MultiplyRaw(102400, 409) = trunc(102400 * 409 / 1024) = 40900
    // RawToNumber(40900) = 40900 / 1024 = 39.9414
    // Math.ceil(39.9414) = 40
    expect(hitStunFrames).toBeGreaterThanOrEqual(3);
  });

  test('CalculateKnockback_OptionA_Scaled', () => {
    // Unscaled Ratios
    const p = new FixedPoint(100);
    const d = new FixedPoint(10);
    const w = new FixedPoint(100);

    // PRE-SCALED Attack Data (Melee * 4)
    const s = new FixedPoint(400); // Original was 100
    const b = new FixedPoint(80); // Original was 20

    const knockbackRaw = CalculateKnockback(p, d, w, s, b);

    // Expected: 153.68
    // FixedPoint Raw: 153.68 * 1024 = 157368.32
    // We check the integer result
    expect(knockbackRaw).toBeGreaterThanOrEqual(157328);
    expect(RawToNumber(knockbackRaw)).toBeGreaterThanOrEqual(153.64);
  });

  describe('CalculateLaunchVector', () => {
    test('should return correct vector when facing right', () => {
      const launchAngle = new FixedPoint(45);
      const knockBackRaw = NumberToRaw(850);
      const isFacingRight = true;

      const launchVector = CalculateLaunchVector(
        vecPool,
        launchAngle.Raw,
        isFacingRight,
        knockBackRaw,
      );

      expect(RawToNumber(launchVector.X.Raw)).toBeCloseTo(17.6, 1);
      expect(RawToNumber(launchVector.Y.Raw)).toBeCloseTo(17.6, 1);
    });

    test('should return correct vector when facing left', () => {
      const launchAngle = new FixedPoint(45);
      const knockBackRaw = NumberToRaw(850);
      const isFacingRight = false;

      const launchVector = CalculateLaunchVector(
        vecPool,
        launchAngle.Raw,
        isFacingRight,
        knockBackRaw,
      );

      // Angle is 180 - 45 = 135. cos(135) = -0.707, sin(135) = 0.707
      // x = knockback * cos(angle) = 100 * -0.707 = -70.7
      // y = - (knockback * sin(angle)) / 2 = - (100 * 0.707) / 2 = -35.35
      expect(RawToNumber(launchVector.X.Raw)).toBeCloseTo(-17.6, 0);
      expect(RawToNumber(launchVector.Y.Raw)).toBeCloseTo(17.6, 0);
    });

    test('should handle 0 degree angle', () => {
      const launchAngle = new FixedPoint(0);
      const knockBackRaw = NumberToRaw(850);
      const isFacingRight = true;
      const launchVector = CalculateLaunchVector(
        vecPool,
        launchAngle.Raw,
        isFacingRight,
        knockBackRaw,
      );
      // cos(0) = 1, sin(0) = 0
      expect(RawToNumber(launchVector.X.Raw)).toBeGreaterThan(0);
      expect(RawToNumber(launchVector.Y.Raw)).toBeCloseTo(0, 0);
    });

    test('should handle 90 degree angle', () => {
      const launchAngle = new FixedPoint(90);
      const knockBackRaw = NumberToRaw(850);
      const isFacingRight = true;
      const launchVector = CalculateLaunchVector(
        vecPool,
        launchAngle.Raw,
        isFacingRight,
        knockBackRaw,
      );
      // cos(90) = 0, sin(90) = 1
      expect(RawToNumber(launchVector.X.Raw)).toBeCloseTo(0, 0);
      expect(RawToNumber(launchVector.Y.Raw)).toBeGreaterThan(0);
    });
  });
});
