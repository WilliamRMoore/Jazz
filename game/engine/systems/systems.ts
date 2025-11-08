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
  AddToPlayerPositionFp,
  AddToPlayerPositionVec,
  AddToPlayerYPositionRaw,
  CanOnlyFallOffLedgeWhenFacingAwayFromIt,
  Player,
  PlayerOnPlats,
  PlayerOnPlatsReturnsYCoord,
  PlayerOnStage,
  PlayerOnStageOrPlats,
  SetPlayerInitialPositionRaw,
  SetPlayerPosition,
  SetPlayerPositionRaw,
} from '../player/playerOrchestrator';
import { AttackResult } from '../pools/AttackResult';
import { PooledVector } from '../pools/PooledVector';
import { Pool } from '../pools/Pool';
import { CollisionResult } from '../pools/CollisionResult';
import { ComponentHistory } from '../player/playerComponents';
import { ClosestPointsResult } from '../pools/ClosestPointsResult';
import { ActiveHitBubblesDTO } from '../pools/ActiveAttackHitBubbles';
import { Stage } from '../stage/stageMain';
import {
  DivideRaw,
  FixedPoint,
  MultiplyRaw,
  NumberToRaw,
  RawToNumber,
} from '../../math/fixedPoint';

/**
 * TODO:
 * Add Projectile Systems
 */

const CORRECTION_DEPTH_RAW = NumberToRaw(0.1); //= 0.1;
const CORNER_JITTER_CORRECTION_RAW = NumberToRaw(2);
const HARD_LAND_VELOCITY_RAW = NumberToRaw(5);
const CORRECTION_DEPTH_FP = new FixedPoint(0.1); //NumberToRaw(0.1); //= 0.1;
const CORNER_JITTER_CORRECTION_FP = new FixedPoint(2); //NumberToRaw(2);
const HARD_LAND_VELOCITY_FP = new FixedPoint(5); //NumberToRaw(5);

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
      const normalXRaw = collisionResult.NormX.Raw;
      const normalYRaw = collisionResult.NormY.Raw;
      const move = pools.VecPool.Rent()
        .SetXYRaw(normalXRaw, normalYRaw)
        .Negate()
        .Multiply(collisionResult.Depth);

      // Ground correction
      if (normalXRaw === 0 && normalYRaw > 0) {
        move.AddToYRaw(CORRECTION_DEPTH_RAW);
      }
      // Right wall correction
      else if (normalXRaw > 0 && normalYRaw === 0) {
        move.AddToXRaw(CORRECTION_DEPTH_RAW);
      }
      // Left wall correction
      else if (normalXRaw < 0 && normalYRaw === 0) {
        move.AddToXRaw(-CORRECTION_DEPTH_RAW);
      }
      // Ceiling
      else if (normalXRaw === 0 && normalYRaw < 0) {
        move.AddToYRaw(-CORRECTION_DEPTH_RAW);
      }
      // Corner case (top corners, normalY < 0)
      else if (Math.abs(normalXRaw) > 0 && normalYRaw > 0) {
        move.AddToXRaw(move.X.Raw <= 0 ? move.Y.Raw : -move.Y.Raw);
      }

      AddToPlayerPositionVec(p, move); //p.AddToPlayerPosition(move.X, move.Y);
    }

    // --- 2. Jitter correction after collision resolution ---
    const onStage = PlayerOnStage(stage, p.ECB.Bottom, p.ECB.SensorDepth);
    const standingOnLeftLedge =
      Math.abs(p.Position.X.Raw - leftStagePoint.X.Raw) <=
      CORNER_JITTER_CORRECTION_RAW;
    const standingOnRightLedge =
      Math.abs(p.Position.X.Raw - rightStagePoint.X.Raw) <=
      CORNER_JITTER_CORRECTION_RAW;

    if (standingOnLeftLedge && onStage) {
      // p.SetPlayerPosition(
      //   leftStagePoint.X + CORNER_JITTER_CORRECTION_RAW,
      //   p.Position.Y
      // );
      SetPlayerInitialPositionRaw(
        p,
        leftStagePoint.X.Raw + CORNER_JITTER_CORRECTION_RAW,
        p.Position.Y.Raw
      );
    } else if (standingOnRightLedge && onStage) {
      // p.SetPlayerPosition(
      //   rightStagePoint.X - CORNER_JITTER_CORRECTION_RAW,
      //   p.Position.Y
      // );
      SetPlayerInitialPositionRaw(
        p,
        rightStagePoint.X.Raw - CORNER_JITTER_CORRECTION_RAW,
        p.Position.Y.Raw
      );
    }

    // --- 3. Grounded check and state update ---
    const grnd = PlayerOnStage(stage, p.ECB.Bottom, p.ECB.SensorDepth);
    const prvGrnd = PlayerOnStage(stage, p.ECB.PrevBottom, p.ECB.SensorDepth);

    if (prvGrnd && !grnd) {
      // Player has just walked off the stage. Check if they should be snapped back.
      let shouldSnapBack = false;

      if (CanOnlyFallOffLedgeWhenFacingAwayFromIt(p)) {
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
          Math.abs(position.X.Raw - leftStagePoint.X.Raw) <
          Math.abs(position.X.Raw - rightStagePoint.X.Raw)
        ) {
          // Snap to left ledge
          // p.SetPlayerPosition(
          //   leftStagePoint.X + CORNER_JITTER_CORRECTION_RAW,
          //   leftStagePoint.Y
          // );
          SetPlayerPositionRaw(
            p,
            leftStagePoint.X.Raw + CORNER_JITTER_CORRECTION_RAW,
            leftStagePoint.Y.Raw
          );
        } else {
          // Snap to right ledge
          // p.SetPlayerPosition(
          //   rightStagePoint.X - CORNER_JITTER_CORRECTION_RAW,
          //   rightStagePoint.Y
          // );
          SetPlayerPositionRaw(
            p,
            rightStagePoint.X.Raw - CORNER_JITTER_CORRECTION_RAW,
            rightStagePoint.Y.Raw
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
        shouldSoftlandRaw(p.Velocity.Y.Raw)
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
      AddToPlayerYPositionRaw(p, preResolutionYOffset.Raw);
    }
  }
}

function shouldSoftlandRaw(yVelocityRaw: number) {
  return yVelocityRaw < HARD_LAND_VELOCITY_RAW;
}

function handlePlatformLanding(
  p: Player,
  sm: StateMachine,
  yCoord: FixedPoint,
  xCoord: FixedPoint
) {
  const landId = shouldSoftlandRaw(p.Velocity.Y.Raw)
    ? GAME_EVENT_IDS.SOFT_LAND_GE
    : GAME_EVENT_IDS.LAND_GE;
  sm.UpdateFromWorld(landId);
  const newYOffset = p.ECB.YOffset;
  SetPlayerPositionRaw(
    p,
    xCoord.Raw,
    yCoord.Raw + CORRECTION_DEPTH_RAW - newYOffset.Raw
  );
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

    if (velocity.Y.Raw < 0) {
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
      if (CanOnlyFallOffLedgeWhenFacingAwayFromIt(p)) {
        const isFacingRight = p.Flags.IsFacingRight;
        const isMovingRight = p.Velocity.X.Raw > 0;
        const canFall = isFacingRight === isMovingRight;

        if (!canFall) {
          // Snap player back to the platform edge they fell from.
          // This is a simplified snap-back. A more robust solution might find the *actual* platform.
          SetPlayerPosition(p, ecb.PrevBottom.X, ecb.PrevBottom.Y);
          playerData
            .StateMachine(playerIndex)
            .UpdateFromWorld(GAME_EVENT_IDS.LAND_GE);
          continue;
        }
      } else {
        const canWalkOff = CanStateWalkOffLedge(p.FSMInfo.CurrentStatetId);
        if (!canWalkOff) {
          // Player was not allowed to walk off in this state at all. Snap them back.
          SetPlayerPosition(p, ecb.PrevBottom.X, ecb.PrevBottom.Y);
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

    if (
      p.Velocity.Y.Raw < 0 ||
      p.FSMInfo.CurrentStatetId === STATE_IDS.JUMP_S
    ) {
      continue;
    }

    if (PlayerOnStageOrPlats(stage, ecb.Bottom, ecb.SensorDepth)) {
      continue;
    }

    const isFacingRight = flags.IsFacingRight;

    const front =
      isFacingRight === true ? ledgeDetector.RightSide : ledgeDetector.LeftSide;

    const twoRaw = NumberToRaw(2);

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
        SetPlayerPositionRaw(
          p,
          DivideRaw(leftLedge[0].X.Raw - ecb.Width.Raw, twoRaw),
          p.Position.Y.Raw
        );
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
      SetPlayerPositionRaw(
        p,
        DivideRaw(rightLedge[0].X.Raw + ecb.Width.Raw, twoRaw),
        p.Position.Y.Raw
      );
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
        const checkPlayerXRaw = checkPlayerPos.X.Raw;
        const checkPlayerYRaw = checkPlayerPos.Y.Raw;
        const otherPlayerXRaw = otherPlayerPos.X.Raw;
        const otherPlayerYRaw = otherPlayerPos.Y.Raw;

        const moveX = NumberToRaw(1.5);
        const twoRaw = NumberToRaw(2);

        if (checkPlayerXRaw >= otherPlayerXRaw) {
          //checkPlayer.SetPlayerPosition(checkPlayerXRaw + moveX / 2, checkPlayerYRaw);
          SetPlayerPositionRaw(
            checkPlayer,
            DivideRaw(checkPlayerXRaw + moveX, twoRaw),
            checkPlayerYRaw
          );
          // otherPlayer.SetPlayerPosition(
          //   otherPlayerXRaw - moveX / 2,
          //   otherPlayerYRaw
          // );
          SetPlayerPositionRaw(
            otherPlayer,
            DivideRaw(otherPlayerXRaw - moveX, twoRaw),
            otherPlayerYRaw
          );
          continue;
        }

        // checkPlayer.SetPlayerPosition(
        //   checkPlayerXRaw - moveX / 2,
        //   checkPlayerYRaw
        // );

        // otherPlayer.SetPlayerPosition(
        //   otherPlayerXRaw + moveX / 2,
        //   otherPlayerYRaw
        // );

        SetPlayerPositionRaw(
          checkPlayer,
          DivideRaw(checkPlayerXRaw - moveX, twoRaw),
          checkPlayerYRaw
        );

        SetPlayerPositionRaw(
          otherPlayer,
          DivideRaw(otherPlayerXRaw - moveX, twoRaw),
          otherPlayerYRaw
        );
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
    const grav = speeds.Gravity.Raw;
    const isFF = p.Flags.IsFastFalling;
    const fallSpeed = isFF ? speeds.FastFallSpeed.Raw : speeds.FallSpeed.Raw;
    const gravMutliplier = NumberToRaw(isFF ? 2 : 1);
    p.Velocity.AddClampedYImpulseRaw(
      fallSpeed,
      MultiplyRaw(grav, gravMutliplier)
    ); //.AddClampedYImpulse(fallSpeed, grav * GravMutliplier);
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
      shield.ShrinkRaw(NumberToRaw(triggerValue));
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
        const re = pA.Sensors.ReactEvent; //.ReactAction(world, pA, pB);
        if (re !== undefined) {
          re.handler(world, re); //HandleJEvent(world, re);
        }
      }

      if (pBVspA) {
        const re = pA.Sensors.ReactEvent;
        if(re !== undefined) {
          re.handler(world, re);//pB.Sensors.ReactAction(world, pB, pB);
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
          Math.abs(p1HitsP2Result.Damage.Raw - p2HitsP1Result.Damage.Raw) <
          NumberToRaw(3);
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

  const kbRaw = CalculateKnockback(
    playerDamage,
    atkDamage,
    weight,
    scailing,
    baseKnockBack
  );

  const hitStop = CalculateHitStop(atkDamage);
  const hitStunFrames = CalculateHitStun(kbRaw);
  const launchVec = CalculateLaunchVector(
    vecPool,
    pAHitsPbResult.LaunchAngle,
    pA.Flags.IsFacingRight,
    kbRaw
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

  const pBHurtBubbles = pB.HurtBubbles.HurtCapsules;

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
  const three = NumberToRaw(3);
  return RawToNumber(Math.floor(DivideRaw(damage.Raw, three) + three));
}

function CalculateHitStun(knockBack: number): number {
  return Math.ceil(knockBack) * 0.4;
}

import { SIN_LUT, COS_LUT, LUT_SIZE } from './LUTS';
//import { HandleJEvent } from '../events/events';

function CalculateLaunchVector(
  vecPool: Pool<PooledVector>,
  launchAngle: FixedPoint,
  isFacingRight: boolean,
  knockBackRaw: number
): PooledVector {
  // Represent 360 and 180 degrees as fixed-point numbers
  const fullCircleRaw = NumberToRaw(360);
  const halfCircleRaw = NumberToRaw(180);

  let angleRaw = launchAngle.Raw;

  if (!isFacingRight) {
    angleRaw = halfCircleRaw - angleRaw;
  }

  // Normalize angle to be within [0, 360) using fixed-point arithmetic
  angleRaw = angleRaw % fullCircleRaw;
  if (angleRaw < 0) {
    angleRaw += fullCircleRaw;
  }

  // Calculate LUT index using deterministic fixed-point math
  const lutIndex = DivideRaw(MultiplyRaw(angleRaw, LUT_SIZE), fullCircleRaw);

  const cosValue = COS_LUT[lutIndex];
  const sinValue = SIN_LUT[lutIndex];

  const x = MultiplyRaw(cosValue, knockBackRaw);
  const y = -DivideRaw(MultiplyRaw(sinValue, knockBackRaw), NumberToRaw(2));

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
  const TEN_RAW = NumberToRaw(10);
  const TWENTY_RAW = NumberToRaw(20);
  const TWO_HUNDRED_RAW = NumberToRaw(200);
  const ONE_HUNDRED_RAW = NumberToRaw(100);
  const ONE_POINT_FOUR_RAW = NumberToRaw(1.4);
  const ZERO_POINT_ZERO_ONE_THREE_RAW = NumberToRaw(0.013);

  // term1 = pRaw / 10
  const term1 = DivideRaw(pRaw, TEN_RAW);

  // term2 = (pRaw * dRaw) / 20
  const p_x_d = MultiplyRaw(pRaw, dRaw);
  const term2 = DivideRaw(p_x_d, TWENTY_RAW);

  // term3 = term1 + term2
  const term3 = term1 + term2;

  // term4 = 200 / (wRaw + 100)
  const w_plus_100 = wRaw + ONE_HUNDRED_RAW;
  const term4 = DivideRaw(TWO_HUNDRED_RAW, w_plus_100);

  // ((...)*term4 * 1.4 + bkb) * s
  const temp_kb =
    MultiplyRaw(MultiplyRaw(term3, term4), ONE_POINT_FOUR_RAW) + brAW;

  return MultiplyRaw(MultiplyRaw(temp_kb, sRaw), ZERO_POINT_ZERO_ONE_THREE_RAW);
}

export function ApplyVelocty(playerData: PlayerData): void {
  const playerCount = playerData.PlayerCount;
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerData.Player(playerIndex);

    if (p.Flags.IsInHitPause) {
      continue;
    }

    const playerVelocity = p.Velocity;

    AddToPlayerPositionFp(p, playerVelocity.X, playerVelocity.Y);
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
    const pvxRaw = playerVelocity.X.Raw;
    const pvyRaw = playerVelocity.Y.Raw;
    const speeds = p.Speeds;
    const absPvxRaw = Math.abs(pvxRaw);

    if (grounded) {
      const groundedVelocityDecay = speeds.GroundedVelocityDecay;
      if (pvxRaw > 0) {
        playerVelocity.X.Subtract(groundedVelocityDecay);
      } else if (pvxRaw < 0) {
        playerVelocity.X.Add(groundedVelocityDecay);
      }

      if (absPvxRaw < groundedVelocityDecay.Raw) {
        playerVelocity.X.Zero();
      }

      if (pvyRaw > 0) {
        playerVelocity.Y.Zero;
      }

      continue;
    }

    const aerialVelocityDecay = speeds.AerialVelocityDecay;
    const fallSpeed = p.Flags.IsFastFalling
      ? speeds.FastFallSpeed
      : speeds.FallSpeed;

    if (pvxRaw > 0) {
      playerVelocity.X.Subtract(aerialVelocityDecay); //-= aerialVelocityDecay;
    } else if (pvxRaw < 0) {
      playerVelocity.X.Add(aerialVelocityDecay); //+= aerialVelocityDecay;
    }

    if (pvyRaw > fallSpeed.Raw) {
      playerVelocity.Y.Subtract(aerialVelocityDecay); //-= aerialVelocityDecay;
    }

    if (pvyRaw < 0) {
      playerVelocity.Y.Add(aerialVelocityDecay);
    }

    if (absPvxRaw < NumberToRaw(0.2)) {
      playerVelocity.X.Zero(); //= 0;
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
  SetPlayerInitialPositionRaw(p, NumberToRaw(610), NumberToRaw(300)); //(610, 300);
  // reset any stats
  p.Jump.ResetJumps();
  p.Jump.IncrementJumps();
  p.Velocity.X.Zero();
  p.Velocity.Y.Zero();
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
