import {
  NumberToRaw,
  FixedPoint,
  RawToNumber,
  DivideRaw,
  MultiplyRaw,
} from '../../math/fixedPoint';
import { COS_LUT, SIN_LUT } from '../../math/LUTS';
import { GAME_EVENT_IDS } from '../finite-state-machine/playerStates/shared';
import {
  ClosestPointsBetweenSegments,
  IntersectsCircles,
} from '../physics/collisions';
import { ComponentHistory } from '../player/playerComponents';
import { Player } from '../player/playerOrchestrator';
import { ActiveHitBubblesDTO } from '../pools/ActiveAttackHitBubbles';
import { AttackResult } from '../pools/AttackResult';
import { ClosestPointsResult } from '../pools/ClosestPointsResult';
import { CollisionResult } from '../pools/CollisionResult';
import { Pool } from '../pools/Pool';
import { PooledVector } from '../pools/PooledVector';
import { PlayerData, HistoryData, Pools } from '../world/world';

const POINT_ZERO_ONE_THREE = NumberToRaw(0.013);
const POINT_FOUR = NumberToRaw(0.4);
const POINT_SEVEN_FIVE = NumberToRaw(0.75);
const ONE_POINT_FOUR = NumberToRaw(1.4);
const TWO = NumberToRaw(2);
const THREE = NumberToRaw(3);
const TEN = NumberToRaw(10);
const TWENTY = NumberToRaw(20);
const TWO_HUNDRED = NumberToRaw(200);
const ONE_HUNDRED = NumberToRaw(100);
const HALF_CIRCLE = NumberToRaw(180);
const LUT_SIZE = NumberToRaw(256);
const FULL_CIRCLE = NumberToRaw(360);

export function PlayerAttacks(
  playerData: PlayerData,
  historyData: HistoryData,
  pools: Pools,
  currentFrame: number
): void {
  const playerCount = playerData.PlayerCount;
  if (playerCount === 1) {
    return;
  }

  for (let outerPIdx = 0; outerPIdx < playerCount - 1; outerPIdx++) {
    const p1 = playerData.Player(outerPIdx);
    for (let innerPIdx = outerPIdx + 1; innerPIdx < playerCount; innerPIdx++) {
      const p2 = playerData.Player(innerPIdx);

      const p1HitsP2Result = PAvsPB(
        currentFrame,
        pools.ActiveHitBubbleDtoPool,
        pools.AtkResPool,
        pools.VecPool,
        pools.ColResPool,
        pools.ClstsPntsResPool,
        historyData.PlayerComponentHistories,
        p1,
        p2
      );
      const p2HitsP1Result = PAvsPB(
        currentFrame,
        pools.ActiveHitBubbleDtoPool,
        pools.AtkResPool,
        pools.VecPool,
        pools.ColResPool,
        pools.ClstsPntsResPool,
        historyData.PlayerComponentHistories,
        p2,
        p1
      );

      if (p1HitsP2Result.Hit && p2HitsP1Result.Hit) {
        //check for clang
        const clang =
          Math.abs(p1HitsP2Result.Damage.Raw - p2HitsP1Result.Damage.Raw) <
          THREE;
      }

      if (p1HitsP2Result.Hit) {
        resolveHitResult(p1, p2, playerData, p1HitsP2Result, pools.VecPool);
      }

      if (p1HitsP2Result.ShieldHit) {
        resolveShieldHitResult(p1, p2, p1HitsP2Result);
      }

      if (p2HitsP1Result.Hit) {
        resolveHitResult(p2, p1, playerData, p2HitsP1Result, pools.VecPool);
      }

      if (p2HitsP1Result.ShieldHit) {
        resolveShieldHitResult(p2, p1, p2HitsP1Result);
      }
    }
  }
}

function resolveHitResult(
  pA: Player,
  pB: Player,
  playerData: PlayerData,
  pAHitsPbResult: AttackResult,
  vecPool: Pool<PooledVector>
): void {
  const atkDamage = pAHitsPbResult.Damage;
  pB.Points.AddDamage(atkDamage);

  const playerDamage = pB.Points.Damage;
  const weight = pB.Weight.Value;
  const scailing = pAHitsPbResult.KnockBackScaling;
  const baseKnockBack = pAHitsPbResult.BaseKnockBack;

  const kbRaw = CalculateKnockback(
    playerDamage,
    atkDamage,
    weight,
    scailing,
    baseKnockBack
  );

  const hitStopRaw = CalculateHitStop(atkDamage);
  const hitStunFrames = CalculateHitStun(kbRaw);
  const launchVec = CalculateLaunchVector(
    vecPool,
    pAHitsPbResult.LaunchAngle,
    pA.Flags.IsFacingRight,
    kbRaw
  );

  pA.Flags.SetHitPauseFrames(
    Math.floor(RawToNumber(MultiplyRaw(hitStopRaw, POINT_SEVEN_FIVE)))
  );

  if (pA.Position.X > pB.Position.X) {
    pB.Flags.FaceRight();
  } else {
    pB.Flags.FaceLeft();
  }

  pB.HitStop.SetHitStop(Math.floor(RawToNumber(hitStopRaw)));
  pB.HitStun.SetHitStun(hitStunFrames, launchVec.X, launchVec.Y);

  const pBSm = playerData.StateMachine(pB.ID);

  pBSm.UpdateFromWorld(GAME_EVENT_IDS.HIT_STOP_GE);
}

function resolveShieldHitResult(
  pA: Player,
  pB: Player,
  pAHitsPbResult: AttackResult
): void {
  const atkDamage = pAHitsPbResult.Damage;

  const hitStopRaw = CalculateHitStop(atkDamage);

  pA.Flags.SetHitPauseFrames(
    Math.floor(RawToNumber(MultiplyRaw(hitStopRaw, POINT_SEVEN_FIVE)))
  );
  pB.Flags.SetHitPauseFrames(
    Math.floor(RawToNumber(MultiplyRaw(hitStopRaw, POINT_SEVEN_FIVE)))
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
  componentHistories: Array<ComponentHistory>,
  pA: Player,
  pB: Player
): AttackResult {
  const pAstateFrame = pA.FSMInfo.CurrentStateFrame;
  const pAAttack = pA.Attacks.GetAttack();

  if (pAAttack === undefined) {
    return atkResPool.Rent();
  }

  if (pB.Flags.IsIntangible) {
    return atkResPool.Rent();
  }

  if (pAAttack.HasHitPlayer(pB.ID)) {
    return atkResPool.Rent();
  }

  const pAHitBubbles = pAAttack.GetActiveHitBubblesForFrame(
    pAstateFrame,
    activeHbPool.Rent()
  );

  if (pAHitBubbles.Length === 0) {
    return atkResPool.Rent();
  }

  const hitLength = pAHitBubbles.Length;
  // Check shield impact

  if (pB.Shield.Active) {
    const pBShield = pB.Shield;
    const radius = pBShield.CurrentRadius;
    const shieldYOffset = pBShield.YOffset;
    const shieldPos = vecPool
      .Rent()
      .SetXYRaw(pB.Position.X.Raw, pB.Position.Y.Raw + shieldYOffset.Raw);

    for (let hitIndex = 0; hitIndex < hitLength; hitIndex++) {
      const pAHitBubble = pAHitBubbles.AtIndex(hitIndex)!;
      const pAPositionHistory = componentHistories[pA.ID].PositionHistory;
      const previousWorldFrame = currentFrame - 1 < 0 ? 0 : currentFrame - 1;
      const prevPos = pAPositionHistory[previousWorldFrame];
      const xRaw = NumberToRaw(prevPos.X);
      const yRaw = NumberToRaw(prevPos.Y);

      const pAPrevPositionDto = vecPool.Rent().SetXYRaw(xRaw, yRaw);
      const pACurPositionDto = vecPool
        .Rent()
        .SetXY(pA.Position.X, pA.Position.Y);
      const currentStateFrame = pAstateFrame;
      const pAFacingRight = pA.Flags.IsFacingRight;

      const pAhitBubbleCurrentPos = pAHitBubble?.GetGlobalPosition(
        vecPool,
        pACurPositionDto.X,
        pACurPositionDto.Y,
        pAFacingRight,
        currentStateFrame
      );

      if (pAhitBubbleCurrentPos === undefined) {
        continue;
      }

      let pAHitBubblePreviousPos =
        pAHitBubble?.GetGlobalPosition(
          vecPool,
          pAPrevPositionDto.X,
          pAPrevPositionDto.Y,
          pAFacingRight,
          currentStateFrame - 1 < 0 ? 0 : currentStateFrame - 1
        ) ??
        vecPool.Rent().SetXY(pAhitBubbleCurrentPos.X, pAhitBubbleCurrentPos.Y);

      let closestPoints = ClosestPointsBetweenSegments(
        shieldPos,
        shieldPos,
        pAHitBubblePreviousPos,
        pAhitBubbleCurrentPos,
        vecPool,
        clstsPntsResPool
      );

      const testPoint1 = vecPool
        .Rent()
        .SetXY(closestPoints.C1X, closestPoints.C1Y);
      const testPoint2 = vecPool
        .Rent()
        .SetXY(closestPoints.C2X, closestPoints.C2Y);

      const collision = IntersectsCircles(
        colResPool,
        testPoint1,
        testPoint2,
        radius,
        pAHitBubble.Radius
      );

      if (collision.Collision) {
        pAAttack.HitPlayer(pB.ID);
        let attackResult = atkResPool.Rent();
        attackResult.SetShieldHitTrue(
          pB.ID,
          pAHitBubble.Damage,
          pAHitBubble.Priority,
          collision.NormX,
          collision.NormY,
          collision.Depth,
          pAAttack.BaseKnockBack,
          pAAttack.KnockBackScaling,
          pAHitBubble.launchAngle
        );
        return attackResult;
      }
    }
  }

  const pBHurtBubbles = pB.HurtCircles.HurtCapsules;

  const hurtLength = pBHurtBubbles.length;

  for (let hurtIndex = 0; hurtIndex < hurtLength; hurtIndex++) {
    const pBHurtBubble = pBHurtBubbles[hurtIndex];

    for (let hitIndex = 0; hitIndex < hitLength; hitIndex++) {
      const pAHitBubble = pAHitBubbles.AtIndex(hitIndex)!;
      const pAPositionHistory = componentHistories[pA.ID].PositionHistory;
      const previousWorldFrame = currentFrame - 1 < 0 ? 0 : currentFrame - 1;
      const prevPos = pAPositionHistory[previousWorldFrame];
      const xRaw = NumberToRaw(prevPos.X);
      const yRaw = NumberToRaw(prevPos.Y);

      const pAPrevPositionDto = vecPool.Rent().SetXYRaw(xRaw, yRaw);
      const pACurPositionDto = vecPool
        .Rent()
        .SetXY(pA.Position.X, pA.Position.Y);

      const currentStateFrame = pAstateFrame;
      const pAFacingRight = pA.Flags.IsFacingRight;

      const pAhitBubbleCurrentPos = pAHitBubble?.GetGlobalPosition(
        vecPool,
        pACurPositionDto.X,
        pACurPositionDto.Y,
        pAFacingRight,
        currentStateFrame
      );

      if (pAhitBubbleCurrentPos === undefined) {
        continue;
      }

      let pAHitBubblePreviousPos =
        pAHitBubble?.GetGlobalPosition(
          vecPool,
          pAPrevPositionDto.X,
          pAPrevPositionDto.Y,
          pAFacingRight,
          currentStateFrame - 1 < 0 ? 0 : currentStateFrame - 1
        ) ??
        vecPool.Rent().SetXY(pAhitBubbleCurrentPos.X, pAhitBubbleCurrentPos.Y);

      const pBPosition = pB.Position;

      const pBStartHurtDto = pBHurtBubble.GetStartPosition(
        pBPosition.X,
        pBPosition.Y,
        vecPool
      );

      const pBEndHurtDto = pBHurtBubble.GetEndPosition(
        pBPosition.X,
        pBPosition.Y,
        vecPool
      );

      const pointsToTest = ClosestPointsBetweenSegments(
        pAHitBubblePreviousPos,
        pAhitBubbleCurrentPos,
        pBStartHurtDto,
        pBEndHurtDto,
        vecPool,
        clstsPntsResPool
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
        pBRadius
      );

      if (collision.Collision) {
        pAAttack.HitPlayer(pB.ID);
        let attackResult = atkResPool.Rent();
        attackResult.SetHitTrue(
          pB.ID,
          pAHitBubble.Damage,
          pAHitBubble.Priority,
          collision.NormX,
          collision.NormY,
          collision.Depth,
          pAAttack.BaseKnockBack,
          pAAttack.KnockBackScaling,
          pAHitBubble.launchAngle
        );
        return attackResult;
      }
    }
  }
  return atkResPool.Rent();
}

function CalculateHitStop(damage: FixedPoint): number {
  return DivideRaw(damage.Raw, THREE) + THREE;
}

function CalculateHitStun(knockBackRaw: number): number {
  return Math.ceil(RawToNumber(MultiplyRaw(knockBackRaw, POINT_FOUR)));
  //return Math.ceil(knockBack) * 0.4;
}

function CalculateLaunchVector(
  vecPool: Pool<PooledVector>,
  launchAngle: FixedPoint,
  isFacingRight: boolean,
  knockBackRaw: number
): PooledVector {
  let angleRaw = launchAngle.Raw;

  if (!isFacingRight) {
    angleRaw = HALF_CIRCLE - angleRaw;
  }

  // Normalize angle to be within [0, 360) using fixed-point arithmetic
  angleRaw = angleRaw % FULL_CIRCLE;
  if (angleRaw < 0) {
    angleRaw += FULL_CIRCLE;
  }

  // Calculate LUT index using deterministic fixed-point math
  const lutIndex = DivideRaw(MultiplyRaw(angleRaw, LUT_SIZE), FULL_CIRCLE);

  const cosValue = COS_LUT[lutIndex];
  const sinValue = SIN_LUT[lutIndex];

  const x = MultiplyRaw(cosValue, knockBackRaw);
  const y = -DivideRaw(MultiplyRaw(sinValue, knockBackRaw), TWO);

  return vecPool.Rent().SetXYRaw(x, y);
}

function CalculateKnockback(
  p: FixedPoint,
  d: FixedPoint,
  w: FixedPoint,
  s: FixedPoint,
  b: FixedPoint
): number {
  return CalculateKnockbackRaw(p.Raw, d.Raw, w.Raw, s.Raw, b.Raw);
}

function CalculateKnockbackRaw(
  pRaw: number,
  dRaw: number,
  wRaw: number,
  sRaw: number,
  brAW: number
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
