import {
  ClosestPointsBetweenSegments,
  IntersectsCircles,
  IntersectsPolygons,
  LineSegmentIntersectionFp,
} from '../physics/collisions';
import {
  CanStateWalkOffLedge,
  GAME_EVENT_IDS,
  STATE_IDS,
} from '../finite-state-machine/PlayerStates';
import {
  HistoryData,
  PlayerData,
  Pools,
  StageData,
  World,
} from '../world/world';
import { StateMachine } from '../finite-state-machine/PlayerStateMachine';
import {
  Player,
  PlayerOnPlats,
  PlayerOnPlatsReturnsYCoord,
  PlayerOnStage,
  PlayerOnStageOrPlats,
} from '../player/playerOrchestrator';
import { AttackResult } from '../pools/AttackResult';
import { PooledVector } from '../pools/PooledVector';
import { Pool } from '../pools/Pool';
import { CollisionResult } from '../pools/CollisionResult';
import { ComponentHistory } from '../player/playerComponents';
import { ClosestPointsResult } from '../pools/ClosestPointsResult';
import { ActiveHitBubblesDTO } from '../pools/ActiveAttackHitBubbles';
import { Stage } from '../stage/stageMain';

/**
 * TODO:
 * Add Projectile Systems
 */

const correctionDepth: number = 0.1;
const cornerJitterCorrection = 2;
const hardLandVelocty = 5;

export function StageCollisionDetection(
  playerData: PlayerData,
  stageData: StageData,
  pools: Pools
): void {
  const fpp = pools.Fpp;
  const playerCount = playerData.PlayerCount;
  const stage = stageData.Stage;
  const stageGround = stage.StageVerticies.GetGround();
  const leftMostPiece = stageGround[0];
  const rightMostPiece = stageGround[stageGround.length - 1];
  const leftStagePoint = pools.VecPool.Rent().SetXY(
    leftMostPiece.X1,
    leftMostPiece.Y1
  );
  const rightStagePoint = pools.VecPool.Rent().SetXY(
    rightMostPiece.X2,
    rightMostPiece.Y2
  );

  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerData.Player(playerIndex);
    const ecb = p.ECB;

    const playerOnPlats = PlayerOnPlats(stage, ecb.Bottom, ecb.SensorDepth);

    if (playerOnPlats) {
      continue;
    }

    const sm = playerData.StateMachine(playerIndex);
    const playerVerts = ecb.GetHull();
    const fsmIno = p.FSMInfo;
    const preResolutionStateId = fsmIno.CurrentStatetId;
    const preResolutionYOffset = ecb.YOffset;
    const stageVerts = stage.StageVerticies.GetVerts();

    // --- 1. Always resolve collision first ---
    const collisionResult = IntersectsPolygons(
      playerVerts,
      stageVerts,
      pools.VecPool,
      pools.ColResPool,
      pools.ProjResPool
    );

    if (collisionResult.Collision) {
      const normalX = collisionResult.NormX;
      const normalY = collisionResult.NormY;
      const move = pools.VecPool.Rent()
        .SetXY(normalX, normalY)
        .Negate()
        .Multiply(collisionResult.Depth);

      // Ground correction
      if (normalX === 0 && normalY > 0) {
        move.AddToY(correctionDepth);
      }
      // Right wall correction
      else if (normalX > 0 && normalY === 0) {
        move.AddToX(correctionDepth);
      }
      // Left wall correction
      else if (normalX < 0 && normalY === 0) {
        move.AddToX(-correctionDepth);
      }
      // Ceiling
      else if (normalX === 0 && normalY < 0) {
        move.AddToY(-correctionDepth);
      }
      // Corner case (top corners, normalY < 0)
      else if (Math.abs(normalX) > 0 && normalY > 0) {
        move.AddToX(move.X <= 0 ? move.Y : -move.Y);
      }

      p.AddToPlayerPosition(move.X, move.Y);
    }

    // --- 2. Jitter correction after collision resolution ---
    const onStage = PlayerOnStage(stage, p.ECB.Bottom, p.ECB.SensorDepth);
    const standingOnLeftLedge =
      Math.abs(p.Position.X - leftStagePoint.X) <= cornerJitterCorrection;
    const standingOnRightLedge =
      Math.abs(p.Position.X - rightStagePoint.X) <= cornerJitterCorrection;

    if (standingOnLeftLedge && onStage) {
      p.SetPlayerPosition(
        leftStagePoint.X + cornerJitterCorrection,
        p.Position.Y
      );
    } else if (standingOnRightLedge && onStage) {
      p.SetPlayerPosition(
        rightStagePoint.X - cornerJitterCorrection,
        p.Position.Y
      );
    }

    // --- 3. Grounded check and state update ---
    const grnd = PlayerOnStage(stage, p.ECB.Bottom, p.ECB.SensorDepth);
    const prvGrnd = PlayerOnStage(stage, p.ECB.PrevBottom, p.ECB.SensorDepth);

    if (prvGrnd && !grnd) {
      // Player has just walked off the stage. Check if they should be snapped back.
      let shouldSnapBack = false;

      if (p.CanOnlyFallOffLedgeWhenFacingAwayFromIt()) {
        // This is the high-priority rule for specific attacks.
        const fellOffLeftLedge = p.Position.X < leftStagePoint.X;
        const fellOffRightLedge = p.Position.X > rightStagePoint.X;
        const isFacingRight = p.Flags.IsFacingRight;

        // Snap back ONLY if facing TOWARDS the stage after falling off.
        if (
          (fellOffLeftLedge && isFacingRight) ||
          (fellOffRightLedge && !isFacingRight)
        ) {
          shouldSnapBack = true;
        }
      } else if (CanStateWalkOffLedge(p.FSMInfo.CurrentStatetId) === false) {
        // This is the general rule for states like 'walk'.
        shouldSnapBack = true;
      }

      if (shouldSnapBack) {
        // Player was not allowed to fall. Snap them to the nearest ledge.
        const position = p.Position;
        if (
          Math.abs(position.X - leftStagePoint.X) <
          Math.abs(position.X - rightStagePoint.X)
        ) {
          // Snap to left ledge
          p.SetPlayerPosition(
            leftStagePoint.X + cornerJitterCorrection,
            leftStagePoint.Y
          );
        } else {
          // Snap to right ledge
          p.SetPlayerPosition(
            rightStagePoint.X - cornerJitterCorrection,
            rightStagePoint.Y
          );
        }
        sm.UpdateFromWorld(GAME_EVENT_IDS.LAND_GE);
        continue;
      }
    }

    // If not grounded and not grabbing ledge, set to falling
    if (grnd === false && p.FSMInfo.CurrentStatetId != STATE_IDS.LEDGE_GRAB_S) {
      sm.UpdateFromWorld(GAME_EVENT_IDS.FALL_GE);
      continue;
    }

    // If grounded and had a collision, set landing state (soft/hard)
    if (grnd === true && collisionResult.Collision) {
      sm.UpdateFromWorld(
        shouldSoftland(p.Velocity.Y)
          ? GAME_EVENT_IDS.SOFT_LAND_GE
          : GAME_EVENT_IDS.LAND_GE
      );
    }

    if (
      preResolutionStateId !== STATE_IDS.LAND_S &&
      preResolutionStateId !== STATE_IDS.SOFT_LAND_S &&
      (fsmIno.CurrentStatetId === STATE_IDS.LAND_S ||
        fsmIno.CurrentStatetId === STATE_IDS.SOFT_LAND_S)
    ) {
      p.AddToPlayerYPosition(preResolutionYOffset);
    }
  }
}

function shouldSoftland(yVelocity: number) {
  return yVelocity < hardLandVelocty;
}

function handlePlatformLanding(
  p: Player,
  sm: StateMachine,
  yCoord: number,
  xCoord: number
) {
  const landId = shouldSoftland(p.Velocity.Y)
    ? GAME_EVENT_IDS.SOFT_LAND_GE
    : GAME_EVENT_IDS.LAND_GE;
  sm.UpdateFromWorld(landId);
  const newYOffset = p.ECB.YOffset;
  p.SetPlayerPosition(xCoord, yCoord + correctionDepth - newYOffset);
}

export function PlatformDetection(
  playerData: PlayerData,
  stageData: StageData,
  currentFrame: number
): void {
  const plats = stageData.Stage.Platforms;

  if (plats === undefined) {
    return;
  }

  const playerCount = playerData.PlayerCount;
  const platCount = plats.length;

  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerData.Player(playerIndex);
    const flags = p.Flags;

    if (flags.IsPlatDetectDisabled) {
      continue;
    }

    const velocity = p.Velocity;

    if (velocity.Y < 0) {
      continue;
    }

    // If a jump was just initiated, skip all platform landing logic for this frame
    // to allow the jump to properly start.
    if (p.FSMInfo.CurrentStatetId === STATE_IDS.JUMP_S) {
      continue;
    }

    const ecb = p.ECB;

    const wasOnPlat = PlayerOnPlats(
      stageData.Stage,
      ecb.PrevBottom,
      ecb.SensorDepth
    );
    const isOnPlat = PlayerOnPlats(
      stageData.Stage,
      ecb.Bottom,
      ecb.SensorDepth
    );

    if (wasOnPlat && !isOnPlat) {
      // Player has just walked off a platform. Check if they were allowed to.
      if (p.CanOnlyFallOffLedgeWhenFacingAwayFromIt()) {
        const isFacingRight = p.Flags.IsFacingRight;
        const isMovingRight = p.Velocity.X > 0;
        const canFall = isFacingRight === isMovingRight;

        if (!canFall) {
          // Snap player back to the platform edge they fell from.
          // This is a simplified snap-back. A more robust solution might find the *actual* platform.
          p.SetPlayerPosition(ecb.PrevBottom.X, ecb.PrevBottom.Y);
          playerData
            .StateMachine(playerIndex)
            .UpdateFromWorld(GAME_EVENT_IDS.LAND_GE);
          continue;
        }
      } else {
        const canWalkOff = CanStateWalkOffLedge(p.FSMInfo.CurrentStatetId);
        if (!canWalkOff) {
          // Player was not allowed to walk off in this state at all. Snap them back.
          p.SetPlayerPosition(ecb.PrevBottom.X, ecb.PrevBottom.Y);
          playerData
            .StateMachine(playerIndex)
            .UpdateFromWorld(GAME_EVENT_IDS.LAND_GE);
          continue;
        }
      }
    }

    const landingYCoord = PlayerOnPlatsReturnsYCoord(
      stageData.Stage,
      ecb.Bottom,
      ecb.SensorDepth
    );

    const inputStore = playerData.InputStore(playerIndex);
    const ia = inputStore.GetInputForFrame(currentFrame);
    const prevIa = inputStore.GetInputForFrame(currentFrame - 1);

    if (landingYCoord != undefined) {
      const sm = playerData.StateMachine(playerIndex);
      // Check for a fast downward flick on the left stick to fall through the platform.
      const checkValue = -(prevIa.LYAxis - ia.LYAxis);

      const inLanding =
        p.FSMInfo.CurrentStatetId === STATE_IDS.LAND_S ||
        p.FSMInfo.CurrentStatetId === STATE_IDS.SOFT_LAND_S;

      if (checkValue <= -0.5 && !inLanding) {
        sm.UpdateFromWorld(GAME_EVENT_IDS.FALL_GE);
        flags.SetDisablePlatFrames(11);
        continue;
      }
      handlePlatformLanding(p, sm, landingYCoord, ecb.Bottom.X);
      continue;
    }

    const fsmInfo = p.FSMInfo;

    //if we are moving downward, and we are holding down, and we are NOT in the airdodge state,
    if (ia.LYAxis < -0.8 && fsmInfo.CurrentStatetId !== STATE_IDS.AIR_DODGE_S) {
      continue;
    }

    const previousBottom = ecb.PrevBottom;
    const currentBottom = ecb.Bottom;

    for (let platIndex = 0; platIndex < platCount; platIndex++) {
      const plat = plats[platIndex];

      const intersected = LineSegmentIntersectionFp(
        previousBottom.X,
        previousBottom.Y,
        currentBottom.X,
        currentBottom.Y,
        plat.X1,
        plat.Y1,
        plat.X2,
        plat.Y2
      );

      if (intersected === false) {
        continue;
      }

      const playerIsTooFarRight = currentBottom.X > plat.X2;
      const playerIsTooFarLeft = currentBottom.X < plat.X1;

      if (playerIsTooFarRight) {
        handlePlatformLanding(
          p,
          playerData.StateMachine(playerIndex),
          plat.Y1,
          plat.X2
        );
        break;
      }

      if (playerIsTooFarLeft) {
        handlePlatformLanding(
          p,
          playerData.StateMachine(playerIndex),
          plat.Y1,
          plat.X1
        );
        break;
      }

      handlePlatformLanding(
        p,
        playerData.StateMachine(playerIndex),
        plat.Y2,
        currentBottom.X
      );
    }
  }
}

export function LedgeGrabDetection(
  playerData: PlayerData,
  stageData: StageData,
  pools: Pools
): void {
  const stage = stageData.Stage;
  const ledges = stage.Ledges;
  const leftLedge = ledges.GetLeftLedge();
  const rightLedge = ledges.GetRightLedge();
  const playerCount = playerData.PlayerCount;

  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerData.Player(playerIndex);

    if (p.Flags.IsInHitPause) {
      continue;
    }

    const ledgeDetector = p.LedgeDetector;

    if (ledgeDetector.CanGrabLedge === false) {
      continue;
    }

    const sm = playerData.StateMachine(playerIndex);
    const flags = p.Flags;
    const ecb = p.ECB;

    if (p.Velocity.Y < 0 || p.FSMInfo.CurrentStatetId === STATE_IDS.JUMP_S) {
      continue;
    }

    if (PlayerOnStageOrPlats(stage, ecb.Bottom, ecb.SensorDepth)) {
      continue;
    }

    const isFacingRight = flags.IsFacingRight;

    const front =
      isFacingRight === true ? ledgeDetector.RightSide : ledgeDetector.LeftSide;

    if (isFacingRight) {
      const intersectsLeftLedge = IntersectsPolygons(
        leftLedge,
        front,
        pools.VecPool,
        pools.ColResPool,
        pools.ProjResPool
      );

      if (intersectsLeftLedge.Collision) {
        sm.UpdateFromWorld(GAME_EVENT_IDS.LEDGE_GRAB_GE);
        p.SetPlayerPosition(leftLedge[0].X - ecb.Width / 2, p.Position.Y);
      }

      continue;
    }

    const intersectsRightLedge = IntersectsPolygons(
      rightLedge,
      front,
      pools.VecPool,
      pools.ColResPool,
      pools.ProjResPool
    );

    if (intersectsRightLedge.Collision) {
      sm.UpdateFromWorld(GAME_EVENT_IDS.LEDGE_GRAB_GE);
      p.SetPlayerPosition(rightLedge[0].X + ecb.Width / 2, p.Position.Y);
    }
  }
}

export function PlayerCollisionDetection(
  playerData: PlayerData,
  pools: Pools
): void {
  const playerCount = playerData.PlayerCount;
  if (playerCount < 2) {
    return;
  }
  for (let pIOuter = 0; pIOuter < playerCount; pIOuter++) {
    const checkPlayer = playerData.Player(pIOuter);
    const checkPlayerStateId = checkPlayer.FSMInfo.CurrentState.StateId;

    if (
      checkPlayerStateId === STATE_IDS.LEDGE_GRAB_S ||
      checkPlayer.Flags.IsInHitPause
    ) {
      continue;
    }

    const checkPlayerEcb = checkPlayer.ECB.GetActiveVerts();

    for (let pIInner = pIOuter + 1; pIInner < playerCount; pIInner++) {
      const otherPlayer = playerData.Player(pIInner);
      const otherPlayerStateId = otherPlayer.FSMInfo.CurrentState.StateId;

      if (
        otherPlayerStateId === STATE_IDS.LEDGE_GRAB_S ||
        otherPlayer.Flags.IsInHitPause
      ) {
        continue;
      }

      const otherPlayerEcb = otherPlayer.ECB.GetActiveVerts();

      const collision = IntersectsPolygons(
        checkPlayerEcb,
        otherPlayerEcb,
        pools.VecPool,
        pools.ColResPool,
        pools.ProjResPool
      );

      if (collision.Collision) {
        const checkPlayerPos = checkPlayer.Position;
        const otherPlayerPos = otherPlayer.Position;
        const checkPlayerX = checkPlayerPos.X;
        const checkPlayerY = checkPlayerPos.Y;
        const otherPlayerX = otherPlayerPos.X;
        const otherPlayerY = otherPlayerPos.Y;

        const moveX = 1.5;

        if (checkPlayerX >= otherPlayerX) {
          checkPlayer.SetPlayerPosition(checkPlayerX + moveX / 2, checkPlayerY);
          otherPlayer.SetPlayerPosition(otherPlayerX - moveX / 2, otherPlayerY);
          continue;
        }

        checkPlayer.SetPlayerPosition(checkPlayerX - moveX / 2, checkPlayerY);
        otherPlayer.SetPlayerPosition(otherPlayerX + moveX / 2, otherPlayerY);
      }
    }
  }
}

export function Gravity(playerData: PlayerData, stageData: StageData): void {
  const playerCount = playerData.PlayerCount;
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerData.Player(playerIndex);
    const stage = stageData.Stage;

    if (playerHasGravity(p, stage) === false) {
      continue;
    }
    const speeds = p.Speeds;
    const grav = speeds.Gravity;
    const isFF = p.Flags.IsFastFalling;
    const fallSpeed = isFF ? speeds.FastFallSpeed : speeds.FallSpeed;
    const GravMutliplier = isFF ? 2 : 1;
    p.Velocity.AddClampedYImpulse(fallSpeed, grav * GravMutliplier);
  }
}

function playerHasGravity(p: Player, stage: Stage): boolean {
  switch (p.FSMInfo.CurrentStatetId) {
    case STATE_IDS.AIR_DODGE_S:
    case STATE_IDS.LEDGE_GRAB_S:
    case STATE_IDS.HIT_STOP_S:
      return false;
    default:
      break;
  }
  if (p.Flags.IsInHitPause) {
    return false;
  }
  const ecb = p.ECB;
  const attack = p.Attacks.GetAttack();
  if (attack === undefined) {
    return !PlayerOnStageOrPlats(stage, ecb.Bottom, ecb.SensorDepth);
  }
  // attack is defined, and has gravity set to active
  if (attack.GravityActive === false) {
    return false;
  }
  // just need to check if player is on stage
  // if player on stage, no gravity, if off stage, gravity
  return !PlayerOnStageOrPlats(stage, ecb.Bottom, ecb.SensorDepth);
}

export function PlayerInput(playerData: PlayerData, world: World): void {
  const playerCount = playerData.PlayerCount;
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerData.Player(playerIndex);
    if (p.Flags.IsInHitPause) {
      continue;
    }
    const input = world.PlayerData.InputStore(playerIndex).GetInputForFrame(
      world.localFrame
    );
    playerData.StateMachine(playerIndex).UpdateFromInput(input, world);
  }
}

export function PlayerShields(pd: PlayerData, localFrame: number) {
  const playerCount = pd.PlayerCount;
  for (let i = 0; i < playerCount; i++) {
    const p = pd.Player(i);
    const shield = p.Shield;

    if (shield.Active) {
      const inputStore = pd.InputStore(i);
      const input = inputStore.GetInputForFrame(localFrame);
      const triggerValue =
        input.LTVal >= input.RTVal ? input.LTVal : input.RTVal;
      shield.Shrink(triggerValue);
      return;
    }

    shield.Grow();
  }
}

export function PlayerSensors(
  world: World,
  playerData: PlayerData,
  pools: Pools
): void {
  const playerCount = playerData.PlayerCount;
  if (playerCount < 2) {
    return;
  }

  for (let outerIdx = 0; outerIdx < playerCount - 1; outerIdx++) {
    const pA = playerData.Player(outerIdx);

    for (let innerIdx = outerIdx + 1; innerIdx < playerCount; innerIdx++) {
      const pB = playerData.Player(innerIdx);

      const pAVspB = sesnsorDetect(
        pA,
        pB,
        pools.VecPool,
        pools.ColResPool,
        pools.ClstsPntsResPool
      );

      const pBVspA = sesnsorDetect(
        pB,
        pA,
        pools.VecPool,
        pools.ColResPool,
        pools.ClstsPntsResPool
      );

      if (pAVspB) {
        pA.Sensors.ReactAction(world, pA, pB);
      }

      if (pBVspA) {
        pB.Sensors.ReactAction(world, pB, pB);
      }
    }
  }
}

function sesnsorDetect(
  pA: Player,
  pB: Player,
  vecPool: Pool<PooledVector>,
  colResPool: Pool<CollisionResult>,
  closestPointsPool: Pool<ClosestPointsResult>
): boolean {
  const pASensors = pA.Sensors;
  const pAPos = pA.Position;
  const pBPos = pB.Position;
  const pBHurtCaps = pB.HurtBubbles.HurtCapsules;
  const pAFacingRight = pA.Flags.IsFacingRight;

  const pBCapsLenght = pBHurtCaps.length;
  const sesnsorLength = pASensors.NumberActive;
  for (let hurtCapIndex = 0; hurtCapIndex < pBCapsLenght; hurtCapIndex++) {
    const pBHurtCap = pBHurtCaps[hurtCapIndex];
    const hurtCapStart = pBHurtCap.GetStartPosition(pBPos.X, pBPos.Y, vecPool);
    const hurtCapEnd = pBHurtCap.GetEndPosition(pBPos.X, pBPos.Y, vecPool);
    for (let sensorIndex = 0; sensorIndex < sesnsorLength; sensorIndex++) {
      const sensor = pASensors.Sensors[sensorIndex];

      if (sensor.IsActive === false) {
        continue;
      }

      const sensorPostion = sensor.GetGlobalPosition(
        vecPool,
        pAPos.X,
        pAPos.Y,
        pAFacingRight
      );

      const closestPoints = ClosestPointsBetweenSegments(
        sensorPostion,
        sensorPostion,
        hurtCapStart,
        hurtCapEnd,
        vecPool,
        closestPointsPool
      );

      const testPoint1 = vecPool
        .Rent()
        .SetXY(closestPoints.C1X, closestPoints.C1Y);

      const testPoint2 = vecPool
        .Rent()
        .SetXY(closestPoints.C2X, closestPoints.C2Y);

      const collisionResult = IntersectsCircles(
        colResPool,
        testPoint1,
        testPoint2,
        sensor.Radius,
        pBHurtCap.Radius
      );

      if (collisionResult.Collision) {
        return true;
      }
    }
  }
  return false;
}

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
          Math.abs(p1HitsP2Result.Damage - p2HitsP1Result.Damage) < 3;
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
  const weight = pB.Weight.Weight;
  const scailing = pAHitsPbResult.KnockBackScaling;
  const baseKnockBack = pAHitsPbResult.BaseKnockBack;

  const kb = CalculateKnockback(
    playerDamage,
    atkDamage,
    weight,
    scailing,
    baseKnockBack
  );
  const hitStop = CalculateHitStop(atkDamage);
  const hitStunFrames = CalculateHitStun(kb);
  const launchVec = CalculateLaunchVector(
    vecPool,
    pAHitsPbResult.LaunchAngle,
    pA.Flags.IsFacingRight,
    kb
  );

  pA.Flags.SetHitPauseFrames(Math.floor(hitStop * 0.75));

  if (pA.Position.X > pB.Position.X) {
    pB.Flags.FaceRight();
  } else {
    pB.Flags.FaceLeft();
  }

  pB.HitStop.SetHitStop(hitStop);
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

  const hitStop = CalculateHitStop(atkDamage);

  pA.Flags.SetHitPauseFrames(Math.floor(hitStop * 0.75));
  pB.Flags.SetHitPauseFrames(Math.floor(hitStop * 0.75));

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
      .SetXY(pB.Position.X, pB.Position.Y + shieldYOffset);

    for (let hitIndex = 0; hitIndex < hitLength; hitIndex++) {
      const pAHitBubble = pAHitBubbles.AtIndex(hitIndex)!;
      const pAPositionHistory = componentHistories[pA.ID].PositionHistory;
      const previousWorldFrame = currentFrame - 1 < 0 ? 0 : currentFrame - 1;
      const pAPrevPositionDto = vecPool
        .Rent()
        .SetFromFlatVec(pAPositionHistory[previousWorldFrame]);
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

  const pBHurtBubbles = pB.HurtBubbles.HurtCapsules;

  const hurtLength = pBHurtBubbles.length;

  for (let hurtIndex = 0; hurtIndex < hurtLength; hurtIndex++) {
    const pBHurtBubble = pBHurtBubbles[hurtIndex];

    for (let hitIndex = 0; hitIndex < hitLength; hitIndex++) {
      const pAHitBubble = pAHitBubbles.AtIndex(hitIndex)!;
      const pAPositionHistory = componentHistories[pA.ID].PositionHistory;
      const previousWorldFrame = currentFrame - 1 < 0 ? 0 : currentFrame - 1;
      const pAPrevPositionDto = vecPool
        .Rent()
        .SetFromFlatVec(pAPositionHistory[previousWorldFrame]);
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

function CalculateHitStop(damage: number): number {
  return Math.floor(damage / 3 + 3);
}

function CalculateHitStun(knockBack: number): number {
  return Math.ceil(knockBack) * 0.4;
}

function CalculateLaunchVector(
  vecPool: Pool<PooledVector>,
  launchAngle: number,
  isFacingRight: boolean,
  knockBack: number
): PooledVector {
  let angleInRadians = launchAngle * (Math.PI / 180);

  if (isFacingRight === false) {
    angleInRadians = Math.PI - angleInRadians;
  }

  return vecPool
    .Rent()
    .SetXY(
      Math.cos(angleInRadians) * knockBack,
      -(Math.sin(angleInRadians) * knockBack) / 2
    );
}

function CalculateKnockback(
  p: number,
  d: number,
  w: number,
  s: number,
  b: number
): number {
  return ((p / 10 + (p * d) / 20) * (200 / (w + 100)) * 1.4 + b) * s * 0.013;
}

export function ApplyVelocty(playerData: PlayerData): void {
  const playerCount = playerData.PlayerCount;
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerData.Player(playerIndex);

    if (p.Flags.IsInHitPause) {
      continue;
    }

    const playerVelocity = p.Velocity;

    p.AddToPlayerPosition(playerVelocity.X, playerVelocity.Y);
  }
}

export function ApplyVeloctyDecay(
  playerData: PlayerData,
  stageData: StageData
): void {
  const playerCount = playerData.PlayerCount;
  const stage = stageData.Stage;
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerData.Player(playerIndex)!;
    const flags = p.Flags;

    if (flags.IsInHitPause || !flags.IsVelocityDecayActive) {
      continue;
    }

    const grounded = PlayerOnStageOrPlats(
      stage,
      p.ECB.Bottom,
      p.ECB.SensorDepth
    );
    const playerVelocity = p.Velocity;
    const pvx = playerVelocity.X;
    const pvy = playerVelocity.Y;
    const speeds = p.Speeds;
    const absPvx = Math.abs(pvx);

    if (grounded) {
      const groundedVelocityDecay = speeds.GroundedVelocityDecay;
      if (pvx > 0) {
        playerVelocity.X -= groundedVelocityDecay;
      } else if (pvx < 0) {
        playerVelocity.X += groundedVelocityDecay;
      }

      if (absPvx < groundedVelocityDecay) {
        playerVelocity.X = 0;
      }

      if (pvy > 0) {
        playerVelocity.Y = 0;
      }

      continue;
    }

    const aerialVelocityDecay = speeds.AerialVelocityDecay;
    const fallSpeed = p.Flags.IsFastFalling
      ? speeds.FastFallSpeed
      : speeds.FallSpeed;

    if (pvx > 0) {
      playerVelocity.X -= aerialVelocityDecay;
    } else if (pvx < 0) {
      playerVelocity.X += aerialVelocityDecay;
    }

    if (pvy > fallSpeed) {
      playerVelocity.Y -= aerialVelocityDecay;
    }

    if (pvy < 0) {
      playerVelocity.Y += aerialVelocityDecay;
    }

    if (absPvx < 0.2) {
      playerVelocity.X = 0;
    }
  }
}

export function TimedFlags(playerData: PlayerData): void {
  const playerCount = playerData.PlayerCount;
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerData.Player(playerIndex);
    const flags = p.Flags;
    if (flags.IsInHitPause) {
      flags.DecrementHitPause();
    }
    if (flags.IsIntangible) {
      flags.DecrementIntangabilityFrames();
    }
    if (flags.IsPlatDetectDisabled) {
      flags.DecrementDisablePlatDetection();
    }
  }
}

export function OutOfBoundsCheck(
  playerData: PlayerData,
  stageData: StageData
): void {
  const playerCount = playerData.PlayerCount;
  const stage = stageData.Stage;
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerData.Player(playerIndex);
    const sm = playerData.StateMachine(playerIndex);

    const pPos = p.Position;
    const pY = pPos.Y;
    const pX = pPos.X;
    const deathBoundry = stage.DeathBoundry!;

    if (pY < deathBoundry.topBoundry) {
      // kill player if in hit stun.
      KillPlayer(p, sm);
      return;
    }

    if (pY > deathBoundry.bottomBoundry) {
      // kill player?
      KillPlayer(p, sm);
      return;
    }

    if (pX < deathBoundry.leftBoundry) {
      // kill Player?
      KillPlayer(p, sm);
      return;
    }

    if (pX > deathBoundry.rightBoundry) {
      // kill player?
      KillPlayer(p, sm);
      return;
    }
  }
}

function KillPlayer(p: Player, sm: StateMachine): void {
  // reset player to spawn point
  p.SetPlayerInitialPosition(610, 300);
  // reset any stats
  p.Jump.ResetJumps();
  p.Jump.IncrementJumps();
  p.Velocity.X = 0;
  p.Velocity.Y = 0;
  p.Points.SubtractMatchPoints(1);
  p.Points.ResetDamagePoints();
  p.Flags.FastFallOff();
  p.Flags.ZeroIntangabilityFrames();
  p.Flags.ZeroHitPauseFrames();
  p.Shield.Reset();
  sm.ForceState(STATE_IDS.N_FALL_S);
  // reduce stock count
}

export function RecordHistory(
  w: World,
  playerData: PlayerData,
  historyData: HistoryData,
  frameNumber: number
): void {
  const playerCount = playerData.PlayerCount;
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerData.Player(playerIndex);
    const history = historyData.PlayerComponentHistories[playerIndex];
    history.ShieldHistory[frameNumber] = p.Shield.SnapShot();
    history.PositionHistory[frameNumber] = p.Position.SnapShot();
    history.FsmInfoHistory[frameNumber] = p.FSMInfo.SnapShot();
    history.PlayerPointsHistory[frameNumber] = p.Points.SnapShot();
    history.VelocityHistory[frameNumber] = p.Velocity.SnapShot();
    history.FlagsHistory[frameNumber] = p.Flags.SnapShot();
    history.PlayerHitStopHistory[frameNumber] = p.HitStop.SnapShot();
    history.PlayerHitStunHistory[frameNumber] = p.HitStun.SnapShot();
    history.LedgeDetectorHistory[frameNumber] = p.LedgeDetector.SnapShot();
    history.SensorsHistory[frameNumber] = p.Sensors.SnapShot();
    history.EcbHistory[frameNumber] = p.ECB.SnapShot();
    history.JumpHistroy[frameNumber] = p.Jump.SnapShot();
    history.AttackHistory[frameNumber] = p.Attacks.SnapShot();
  }
  w.SetPoolHistory();
}
