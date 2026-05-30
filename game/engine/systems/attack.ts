import {
  GAME_EVENT_IDS,
  STATE_IDS,
  StateId,
} from '../finite-state-machine/stateConfigurations/shared';
import {
  NumberToRaw,
  RawToNumber,
  MultiplyRaw,
  FixedPoint,
  DivideRaw,
} from '../math/fixedPoint';
import { COS_LUT, LUT_SIZE as LUT_SIZE_OG, SIN_LUT } from '../math/LUTS';
import {
  ClosestPointsBetweenSegments,
  IntersectsCircles,
  IntersectsCirclesRaw,
} from '../physics/collisions';
import { Player } from '../entity/playerOrchestrator';
import { ActiveHitBubblesDTO } from '../pools/ActiveAttackBubbles';
import { AttackResult } from '../pools/AttackResult';
import { ClosestPointsResult } from '../pools/ClosestPointsResult';
import { CollisionResult } from '../pools/CollisionResult';
import { Pool } from '../pools/Pool';
import { PooledVector } from '../pools/PooledVector';
import {
  THREE,
  POINT_SEVEN_FIVE,
  HALF_CIRCLE,
  FULL_CIRCLE,
  TEN,
  TWENTY,
  ONE_HUNDRED,
  POINT_ZERO_THREE,
  ONE_POINT_FOUR,
  POINT_ZERO_ONE_THREE,
  TWO_HUNDRED,
} from '../math/numberConstants';
import { IInputStore } from '../managers/inputManager';
import { PlayerData, PlayerHistoryTable } from '../world/stateModules';
import { World } from '../world/world';
import { isPlayerGroundedAtAll } from './shared';

const LUT_SIZE = NumberToRaw(LUT_SIZE_OG);

export function PlayerAttacks(world: World): void {
  const playerData: PlayerData = world.PlayerData;
  const pools = world.Pools;
  const historyData = world.HistoryData;
  const currentFrame = world.LocalFrame;
  const playerCount = playerData.PlayerCount;
  if (playerCount === 1) {
    return;
  }

  for (let outerPIdx = 0; outerPIdx < playerCount - 1; outerPIdx++) {
    const p1 = playerData.Player(outerPIdx);
    const p1InputStore = playerData.InputStore(p1.ID);

    for (let innerPIdx = outerPIdx + 1; innerPIdx < playerCount; innerPIdx++) {
      const p2 = playerData.Player(innerPIdx);
      const p2InputStore = playerData.InputStore(p2.ID);

      const p1HitsP2Result = PAvsPB(
        currentFrame,
        pools.ActiveHitBubbleDtoPool,
        pools.AtkResPool,
        pools.VecPool,
        pools.ColResPool,
        pools.ClstsPntsResPool,
        historyData.PlayerHistoryDB,
        p1,
        p2,
        p2InputStore,
      );

      const p2HitsP1Result = PAvsPB(
        currentFrame,
        pools.ActiveHitBubbleDtoPool,
        pools.AtkResPool,
        pools.VecPool,
        pools.ColResPool,
        pools.ClstsPntsResPool,
        historyData.PlayerHistoryDB,
        p2,
        p1,
        p1InputStore,
      );

      if (p1HitsP2Result.Hit && p2HitsP1Result.Hit) {
        //check for clang
        const clang =
          Math.abs(p1HitsP2Result.Damage.Raw - p2HitsP1Result.Damage.Raw) <
          THREE;
      }

      if (p1HitsP2Result.Hit) {
        resolveHitResult(p1, p2, world, p1HitsP2Result, pools.VecPool);
      }

      if (p1HitsP2Result.ShieldHit) {
        resolveShieldHitResult(p1, p2, p1HitsP2Result);
      }

      if (p2HitsP1Result.Hit) {
        resolveHitResult(p2, p1, world, p2HitsP1Result, pools.VecPool);
      }

      if (p2HitsP1Result.ShieldHit) {
        resolveShieldHitResult(p2, p1, p2HitsP1Result);
      }
    }
  }
}

// thresholds
const kbHitSlideTH = NumberToRaw(128);
const KbFlinchTH = NumberToRaw(320);

function resolveHitResult(
  pA: Player,
  pB: Player,
  w: World,
  pAHitsPbResult: AttackResult,
  vecPool: Pool<PooledVector>,
): void {
  const playerData: PlayerData = w.PlayerData;
  const atkDamage = pAHitsPbResult.Damage;
  pB.Damage.AddDamage(atkDamage);
  const hitStopRaw = CalculateHitStop(atkDamage);

  const paIsHoldingPb =
    pA.Hold.heldPlayerId !== undefined && pA.Hold.heldPlayerId === pB.ID;

  if (paIsHoldingPb) {
    pA.Flags.SetHitPauseFrames(Math.floor(RawToNumber(hitStopRaw)));

    pB.Flags.SetHitPauseFrames(Math.floor(RawToNumber(hitStopRaw)));

    return;
  }

  const playerDamage = pB.Damage.Damage;
  const weight = pB.Weight.Value;
  const scailing = pAHitsPbResult.KnockBackScaling;
  const baseKnockBack = pAHitsPbResult.BaseKnockBack;

  const kbRaw = CalculateKnockback(
    playerDamage,
    atkDamage,
    weight,
    scailing,
    baseKnockBack,
  );

  const hitStunFrames = CalculateHitStun(kbRaw);

  let angleRaw = 0;
  let nextStateId: StateId = STATE_IDS.LAUNCH_S;

  if (
    pAHitsPbResult.ThresholdAngle &&
    kbRaw <= kbHitSlideTH &&
    isPlayerGroundedAtAll(pB, w.StageData.Stages)
  ) {
    angleRaw = 0;
    nextStateId = STATE_IDS.HIT_SLIDE_S;
  } else {
    angleRaw = pAHitsPbResult.LaunchAngle.Raw;
  }

  if (kbRaw > kbHitSlideTH && kbRaw <= KbFlinchTH) {
    nextStateId = STATE_IDS.HIT_FLINCH_S;
  }

  const launchVec = CalculateLaunchVector(
    vecPool,
    angleRaw,
    pA.Flags.IsFacingRight,
    kbRaw,
  );

  pA.Flags.SetHitPauseFrames(
    Math.floor(RawToNumber(MultiplyRaw(hitStopRaw, POINT_SEVEN_FIVE))),
  );

  // const victimToTheLeft = pA.Position.X.Raw > pB.Position.X.Raw;
  // const attackerFacingRight = pA.Flags.IsFacingRight;
  // const victimToTheRight = !victimToTheLeft;
  // const attackerFacingLeft = !attackerFacingRight;

  // const isVictimBehindAttackCenter =
  //   victimToTheLeft && attackerFacingRight
  //     ? true
  //     : victimToTheRight && attackerFacingLeft
  //       ? true
  //       : false;

  // if (isVictimBehindAttackCenter) {
  //   launchVec.X.Negate();
  // }

  if (pA.Position.X > pB.Position.X) {
    pB.Flags.FaceRight();
  } else {
    pB.Flags.FaceLeft();
  }

  launchVec.Y.Negate();

  pB.HitStop.SetHitStop(Math.floor(RawToNumber(hitStopRaw)));
  pB.HitStun.SetHitStun(hitStunFrames, launchVec.X, launchVec.Y);
  pB.HitStun.NextStateId = nextStateId;

  const pBSm = playerData.StateMachine(pB.ID);

  pBSm.UpdateFromWorld(GAME_EVENT_IDS.HIT_STOP_GE);
}

function resolveShieldHitResult(
  pA: Player,
  pB: Player,
  pAHitsPbResult: AttackResult,
): void {
  const atkDamage = pAHitsPbResult.Damage;

  const hitStopRaw = CalculateHitStop(atkDamage);

  pA.Flags.SetHitPauseFrames(
    Math.floor(RawToNumber(MultiplyRaw(hitStopRaw, POINT_SEVEN_FIVE))),
  );
  pB.Flags.SetHitPauseFrames(
    Math.floor(RawToNumber(MultiplyRaw(hitStopRaw, POINT_SEVEN_FIVE))),
  );

  pB.Shield.Damage(atkDamage);
}

function PAvsPB(
  currentFrame: number,
  activeHbPool: Pool<ActiveHitBubblesDTO>,
  atkResPool: Pool<AttackResult>,
  vecPool: Pool<PooledVector>,
  colResPool: Pool<CollisionResult>,
  clstsPntsResPool: Pool<ClosestPointsResult>,
  componentHistories: Array<PlayerHistoryTable>,
  pA: Player,
  pB: Player,
  pBInputStore: IInputStore,
): AttackResult {
  const pAstateFrame = pA.FSMInfo.CurrentStateFrame;
  const pAAttack = pA.Attacks.GetAttack();

  if (
    pAAttack === undefined ||
    pB.Flags.IsIntangible ||
    pA.Attacks.HasHitPlayer(pB.ID)
  ) {
    return atkResPool.Rent();
  }

  const pAHitBubbles = pAAttack.GetActiveBubblesForFrame(
    pAstateFrame,
    activeHbPool.Rent(),
  );

  if (pAHitBubbles.Length === 0) {
    return atkResPool.Rent();
  }

  const hitLength = pAHitBubbles.Length;
  // Check shield impact

  const pAStateHist = componentHistories[pA.ID];
  const previousWorldFrame = currentFrame > 0 ? currentFrame - 1 : 0;
  const pAPrevState = pAStateHist.get(previousWorldFrame);
  //const prevPosRes = pAPCompHist.PositionHistory[previousWorldFrame];

  let prevXRaw = pAPrevState.posXRaw;
  let prevYRaw = pAPrevState.posYRaw;

  const currentStateFrame = pAstateFrame;
  const previousStateFrame = currentStateFrame > 0 ? currentStateFrame - 1 : 0;
  const pAFacingRight = pA.Flags.IsFacingRight;
  const pBIa = pBInputStore.GetInputForFrame(currentFrame);

  if (pB.Shield.Active) {
    const pBShield = pB.Shield;
    const radiusRaw = pBShield.CalculateCurrentRadiusRaw(
      pBIa.RTValRaw > pBIa.LTValRaw ? pBIa.RTValRaw : pBIa.LTValRaw,
    );
    const shieldYOffset = pBShield.YOffsetConstant;
    const tiltXRaw = pBShield.ShieldTiltX.Raw;
    const tiltYRaw = pBShield.ShieldTiltY.Raw + shieldYOffset.Raw;
    const shieldPos = vecPool
      .Rent()
      .SetXYRaw(pB.Position.X.Raw + tiltXRaw, pB.Position.Y.Raw + tiltYRaw);

    for (let hitIndex = 0; hitIndex < hitLength; hitIndex++) {
      const pAHitBubble = pAHitBubbles.AtIndex(hitIndex)!;

      const pAhitBubbleCurrentPos = pAHitBubble?.GetGlobalPosition(
        vecPool,
        currentStateFrame,
      );

      if (pAhitBubbleCurrentPos === undefined) {
        continue;
      }

      //const prevAttackXRaw = pAPrevState.a

      let pAHitBubblePreviousPos: PooledVector | undefined = undefined;
      const hitBubbleId = pAHitBubble.BubbleId;
      for (let i = 0; i < pAPrevState.comp_attackCircles.length; i++) {
        const previousHitBubble = pAPrevState.comp_attackCircles[i];
        if (hitBubbleId === previousHitBubble.id && previousHitBubble.active) {
          pAHitBubblePreviousPos = vecPool
            .Rent()
            .SetXYRaw(previousHitBubble.xRaw, previousHitBubble.yRaw);
        }
      }

      if (pAHitBubblePreviousPos === undefined) {
        pAHitBubblePreviousPos = vecPool
          .Rent()
          .SetXY(pAhitBubbleCurrentPos.X, pAhitBubbleCurrentPos.Y);
      }
      // pAHitBubble?.GetPreviousGlobalPosition(
      //   vecPool,
      //   prevXRaw,
      //   prevYRaw,
      //   pAFacingRight,
      //   previousStateFrame,
      // ) ??
      //vecPool.Rent().SetXY(pAhitBubbleCurrentPos.X, pAhitBubbleCurrentPos.Y);

      const closestPoints = ClosestPointsBetweenSegments(
        shieldPos,
        shieldPos,
        pAHitBubblePreviousPos,
        pAhitBubbleCurrentPos,
        vecPool,
        clstsPntsResPool,
      );

      const collision = IntersectsCirclesRaw(
        colResPool,
        closestPoints.C1X.Raw,
        closestPoints.C1Y.Raw,
        closestPoints.C2X.Raw,
        closestPoints.C2Y.Raw,
        radiusRaw,
        pAHitBubble.Radius.Raw,
      );

      if (collision.Collision) {
        pA.Attacks.HitPlayer(pB.ID);
        const attackResult = atkResPool.Rent();
        attackResult.SetShieldHitTrue(
          pB.ID,
          pAHitBubble.Damage,
          pAHitBubble.Priority,
          collision.NormX,
          collision.NormY,
          collision.Depth,
          pAAttack.BaseKnockBack,
          pAAttack.KnockBackScaling,
          pAHitBubble.launchAngle,
          pAHitBubble.ThresholdAngle,
        );
        return attackResult;
      }
    }
  }

  const pBHurtBubbles = pB.HurtCircles.HurtCapsules;
  const pBPosition = pB.Position;
  const hurtLength = pBHurtBubbles.length;
  const hitBubbles = pAHitBubbles;

  for (let hitIndex = 0; hitIndex < hitLength; hitIndex++) {
    const pAHitBubble = hitBubbles.AtIndex(hitIndex)!;

    const pAhitBubbleCurrentPos = pAHitBubble?.GetGlobalPosition(
      vecPool,
      currentStateFrame,
    );

    if (pAhitBubbleCurrentPos === undefined) {
      continue;
    }

    const pAHitBubblePreviousPos =
      pAHitBubble?.GetPreviousGlobalPosition(
        vecPool,
        prevXRaw,
        prevYRaw,
        pAFacingRight,
        previousStateFrame,
      ) ??
      vecPool.Rent().SetXY(pAhitBubbleCurrentPos.X, pAhitBubbleCurrentPos.Y);

    for (let hurtIndex = 0; hurtIndex < hurtLength; hurtIndex++) {
      const pBHurtBubble = pBHurtBubbles[hurtIndex];

      const pBStartHurtDto = pBHurtBubble.GetStartPosition(
        pBPosition.X,
        pBPosition.Y,
        vecPool,
      );

      const pBEndHurtDto = pBHurtBubble.GetEndPosition(
        pBPosition.X,
        pBPosition.Y,
        vecPool,
      );

      const pointsToTest = ClosestPointsBetweenSegments(
        pAHitBubblePreviousPos,
        pAhitBubbleCurrentPos,
        pBStartHurtDto,
        pBEndHurtDto,
        vecPool,
        clstsPntsResPool,
      );

      const pARadius = pAHitBubble.Radius;
      const pBRadius = pBHurtBubble.Radius;
      const testPoint1 = vecPool
        .Rent()
        .SetXY(pointsToTest.C1X, pointsToTest.C1Y);
      const testPoint2 = vecPool
        .Rent()
        .SetXY(pointsToTest.C2X, pointsToTest.C2Y);

      const collision = IntersectsCircles(
        colResPool,
        testPoint1,
        testPoint2,
        pARadius,
        pBRadius,
      );

      if (collision.Collision) {
        pA.Attacks.HitPlayer(pB.ID);
        const attackResult = atkResPool.Rent();
        attackResult.SetHitTrue(
          pB.ID,
          pAHitBubble.Damage,
          pAHitBubble.Priority,
          collision.NormX,
          collision.NormY,
          collision.Depth,
          pAAttack.BaseKnockBack,
          pAAttack.KnockBackScaling,
          pAHitBubble.launchAngle,
          pAHitBubble.ThresholdAngle,
        );
        return attackResult;
      }
    }
  }
  return atkResPool.Rent();
}

export function CalculateHitStop(damage: FixedPoint): number {
  return DivideRaw(damage.Raw, THREE) + THREE;
}

const POINT_ONE = NumberToRaw(0.1);

export function CalculateHitStun(knockBackRaw: number): number {
  return Math.ceil(RawToNumber(MultiplyRaw(knockBackRaw, POINT_ONE)));
}

const POINT_ZERO_NINE = NumberToRaw(0.9);

export function CalculateLaunchVector(
  vecPool: Pool<PooledVector>,
  launchAngleRaw: number,
  isFacingRight: boolean,
  knockBackRaw: number,
): PooledVector {
  let angleRaw = launchAngleRaw;

  if (!isFacingRight) {
    angleRaw = HALF_CIRCLE - angleRaw;
  }

  // Normalize angle to be within [0, 360) using fixed-point arithmetic
  angleRaw = angleRaw % FULL_CIRCLE;
  if (angleRaw < 0) {
    angleRaw += FULL_CIRCLE;
  }

  // Calculate LUT index using deterministic fixed-point math
  const lutIndexRaw = DivideRaw(MultiplyRaw(angleRaw, LUT_SIZE), FULL_CIRCLE);
  const lutIndex = Math.floor(RawToNumber(lutIndexRaw));
  const cosValue = COS_LUT[lutIndex];
  const sinValue = SIN_LUT[lutIndex];

  const speedRaw = MultiplyRaw(knockBackRaw, POINT_ZERO_THREE);

  const x = MultiplyRaw(cosValue, speedRaw);
  const y = MultiplyRaw(sinValue, speedRaw);

  return vecPool.Rent().SetXYRaw(x, y);
}

export function CalculateKnockback(
  p: FixedPoint,
  d: FixedPoint,
  w: FixedPoint,
  s: FixedPoint,
  b: FixedPoint,
): number {
  return CalculateKnockbackRaw(p.Raw, d.Raw, w.Raw, s.Raw, b.Raw);
}

function CalculateKnockbackRaw(
  pRaw: number,
  dRaw: number,
  wRaw: number,
  sRaw: number,
  brAW: number,
): number {
  //((p / 10 + (p * d) / 20) * (200 / (w + 100)) * 1.4 + b) * s * 0.013;
  // Convert floating-point and integer constants to raw fixed-point values

  // term1 = pRaw / 10
  const term1 = DivideRaw(pRaw, TEN);

  // term2 = (pRaw * dRaw) / 20
  const p_x_d = MultiplyRaw(pRaw, dRaw);
  const term2 = DivideRaw(p_x_d, TWENTY);

  // term3 = term1 + term2
  const term3 = term1 + term2;

  // term4 = 200 / (wRaw + 100)
  const w_plus_100 = wRaw + ONE_HUNDRED;
  const term4 = DivideRaw(TWO_HUNDRED, w_plus_100);

  // ((...)*term4 * 1.4 + bkb) * s
  const temp_kb = MultiplyRaw(MultiplyRaw(term3, term4), ONE_POINT_FOUR) + brAW;

  return MultiplyRaw(MultiplyRaw(temp_kb, sRaw), POINT_ZERO_ONE_THREE);
}
