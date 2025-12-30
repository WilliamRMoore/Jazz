import { DefaultCharacterConfig } from '../../game/character/default';
import { InputStoreLocal } from '../../game/engine/engine-state-management/Managers';
import { StateMachine } from '../../game/engine/finite-state-machine/PlayerStateMachine';
import { STATE_IDS } from '../../game/engine/finite-state-machine/stateConfigurations/shared';
import {
  FixedPoint,
  NumberToRaw,
  RawToNumber,
} from '../../game/engine/math/fixedPoint';
import { ComponentHistory } from '../../game/engine/entity/componentHistory';
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
import { InputAction, NewInputAction } from '../../game/input/Input';
import { Pool } from '../../game/engine/pools/Pool';
import { PooledVector } from '../../game/engine/pools/PooledVector';

describe('Attack systesm tests', () => {
  let p1: Player;
  let p1Sm: StateMachine;
  let p1InputStore: InputStoreLocal<InputAction>;
  let p2: Player;
  let p2Sm: StateMachine;
  let p2InputStore: InputStoreLocal<InputAction>;
  let w: World;
  let h1: ComponentHistory;
  let h2: ComponentHistory;

  beforeEach(() => {
    w = new World();
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
    h1 = w.HistoryData.PlayerComponentHistories[0];
    h2 = w.HistoryData.PlayerComponentHistories[1];
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
    h1.PositionHistory[0] = p1.Position.SnapShot();
    h1.PositionHistory[1] = p1.Position.SnapShot();
    h1.PositionHistory[2] = p1.Position.SnapShot();
    h2.PositionHistory[0] = p2.Position.SnapShot();
    h2.PositionHistory[1] = p2.Position.SnapShot();
    h2.PositionHistory[2] = p2.Position.SnapShot();
    w.localFrame = 3;
    p1.FSMInfo._currentStateFrame = 3; // Startup frames over, active frames

    PlayerAttacks(w);

    expect(p1.Attacks.GetAttack()?.HasHitPlayer(1)).toBe(true);
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
    h1.PositionHistory[0] = p1.Position.SnapShot();
    h1.PositionHistory[1] = p1.Position.SnapShot();
    h1.PositionHistory[2] = p1.Position.SnapShot();
    h2.PositionHistory[0] = p2.Position.SnapShot();
    h2.PositionHistory[1] = p2.Position.SnapShot();
    h2.PositionHistory[2] = p2.Position.SnapShot();
    w.localFrame = 3;
    p1.FSMInfo._currentStateFrame = 3; // Startup frames over, active frames

    PlayerAttacks(w);

    expect(p1.Attacks.GetAttack()?.HasHitPlayer(1)).toBe(false);
    expect(p2.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.IDLE_S);
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
    expect(hitStunFrames).toBe(40);
  });

  test('CalculateKnockback', () => {
    const p = new FixedPoint(100);
    const d = new FixedPoint(10);
    const w = new FixedPoint(100);
    const s = new FixedPoint(100);
    const b = new FixedPoint(20);
    const knockbackRaw = CalculateKnockback(p, d, w, s, b);
    // Calculation is complex, I've calculated an expected value beforehand.
    // See thought process.
    expect(knockbackRaw).toBe(135154);
    expect(RawToNumber(knockbackRaw)).toBeCloseTo(131.986, 3);
  });

  describe('CalculateLaunchVector', () => {
    test('should return correct vector when facing right', () => {
      const launchAngle = new FixedPoint(45);
      const knockBackRaw = NumberToRaw(100);
      const isFacingRight = true;

      const launchVector = CalculateLaunchVector(
        vecPool,
        launchAngle,
        isFacingRight,
        knockBackRaw
      );

      // Angle = 45. cos(45) = 0.707, sin(45) = 0.707
      // x = knockback * cos(angle) = 100 * 0.707 = 70.7
      // y = - (knockback * sin(angle)) / 2 = - (100 * 0.707) / 2 = -35.35
      // The LUT is used, so we expect some approximation.
      // lutIndex for 45 degrees is floor((45*1024 * 1024) / (360*1024) / 1024) = floor(45/360 * LUT_SIZE) = floor(0.125 * 1024) = 128
      // COS_LUT[128] should be close to cos(45) and SIN_LUT[128] to sin(45)
      // I can't access LUTs directly from here without importing, so I'll check against calculated values with some tolerance.
      expect(RawToNumber(launchVector.X.Raw)).toBeCloseTo(70.7, 0); // ~70.7
      expect(RawToNumber(launchVector.Y.Raw)).toBeCloseTo(-35.35, 0); // ~-35.35
    });

    test('should return correct vector when facing left', () => {
      const launchAngle = new FixedPoint(45);
      const knockBackRaw = NumberToRaw(100);
      const isFacingRight = false;

      const launchVector = CalculateLaunchVector(
        vecPool,
        launchAngle,
        isFacingRight,
        knockBackRaw
      );

      // Angle is 180 - 45 = 135. cos(135) = -0.707, sin(135) = 0.707
      // x = knockback * cos(angle) = 100 * -0.707 = -70.7
      // y = - (knockback * sin(angle)) / 2 = - (100 * 0.707) / 2 = -35.35
      expect(RawToNumber(launchVector.X.Raw)).toBeCloseTo(-70.7, 0);
      expect(RawToNumber(launchVector.Y.Raw)).toBeCloseTo(-35.35, 0);
    });

    test('should handle 0 degree angle', () => {
      const launchAngle = new FixedPoint(0);
      const knockBackRaw = NumberToRaw(100);
      const isFacingRight = true;
      const launchVector = CalculateLaunchVector(
        vecPool,
        launchAngle,
        isFacingRight,
        knockBackRaw
      );
      // cos(0) = 1, sin(0) = 0
      expect(RawToNumber(launchVector.X.Raw)).toBeCloseTo(100, 0);
      expect(RawToNumber(launchVector.Y.Raw)).toBeCloseTo(0, 0);
    });

    test('should handle 90 degree angle', () => {
      const launchAngle = new FixedPoint(90);
      const knockBackRaw = NumberToRaw(100);
      const isFacingRight = true;
      const launchVector = CalculateLaunchVector(
        vecPool,
        launchAngle,
        isFacingRight,
        knockBackRaw
      );
      // cos(90) = 0, sin(90) = 1
      expect(RawToNumber(launchVector.X.Raw)).toBeCloseTo(0, 0);
      expect(RawToNumber(launchVector.Y.Raw)).toBeCloseTo(-50, 0);
    });
  });
});
