import {
  ClosestPointsBetweenSegments,
  IntersectsCircles,
  IntersectsPolygons,
} from '../physics/collisions';
import {
  GAME_EVENT_IDS,
  STATE_IDS,
} from '../finite-state-machine/PlayerStates';
import { World } from '../world/world';
import { StateMachine } from '../finite-state-machine/PlayerStateMachine';
import { Player, PlayerOnStage } from '../player/playerOrchestrator';
import { AttackResult } from '../pools/AttackResult';
import { PooledVector } from '../pools/PooledVector';
import { Pool } from '../pools/Pool';
import { Stage } from '../stage/stageComponents';
import { CollisionResult } from '../pools/CollisionResult';
import { ProjectionResult } from '../pools/ProjectResult';
import { ComponentHistory } from '../player/playerComponents';
import { ClosestPointsResult } from '../pools/ClosestPointsResult';
import { ActiveHitBubblesDTO } from '../pools/ActiveAttackHitBubbles';

/**
 * TODO:
 * Add Platform Collision Detections
 * Add Projectile Systems
 * Add Grab Systems
 */

const correctionDepth: number = 0.1;
const cornerJitterCorrection = 2;
export function StageCollisionDetection(
  playerCount: number,
  players: Array<Player>,
  stateMachines: Array<StateMachine>,
  stage: Stage,
  vecPool: Pool<PooledVector>,
  colResPool: Pool<CollisionResult>,
  projResPool: Pool<ProjectionResult>
): void {
  const stageVerts = stage.StageVerticies.GetVerts();
  const stageGround = stage.StageVerticies.GetGround();
  const leftMostPeice = stageGround[0];
  const rightMostPeice = stageGround[stageGround.length - 1];
  const leftStagePoint = vecPool
    .Rent()
    .SetXY(leftMostPeice.X1, leftMostPeice.Y1);
  const rightStagePoint = vecPool
    .Rent()
    .SetXY(rightMostPeice.X2, rightMostPeice.Y2);

  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = players[playerIndex];
    const sm = stateMachines[playerIndex];
    const pFlags = p.Flags;
    const playerVerts = p.ECB.GetHull();
    const grnd = PlayerOnStage(stage, p.ECB.Bottom, p.ECB.SensorDepth);
    const prvGrnd = PlayerOnStage(stage, p.ECB.PrevBottom, p.ECB.SensorDepth);

    const standingOnLeftLedge =
      Math.abs(p.Position.X - leftStagePoint.X) <= cornerJitterCorrection;
    const standingOnRightLedge =
      Math.abs(p.Position.X - rightStagePoint.X) <= cornerJitterCorrection;

    if (grnd === true && standingOnLeftLedge) {
      p.SetPlayerPosition(
        leftStagePoint.X + cornerJitterCorrection,
        p.Position.Y
      ); // + 2 to avoid jitter on corner
    }

    if (grnd === true && standingOnRightLedge) {
      p.SetPlayerPosition(
        rightStagePoint.X - cornerJitterCorrection,
        p.Position.Y
      );
    }

    if (
      grnd === false &&
      prvGrnd === true &&
      pFlags.CanWalkOffStage === false
    ) {
      const position = p.Position;

      // Snap to nearest ledge regardless of facing
      if (
        Math.abs(position.X - leftStagePoint.X) <
        Math.abs(position.X - rightStagePoint.X)
      ) {
        p.SetPlayerPosition(
          leftStagePoint.X + cornerJitterCorrection,
          leftStagePoint.Y
        );
      } else {
        p.SetPlayerPosition(
          rightStagePoint.X - cornerJitterCorrection,
          rightStagePoint.Y
        );
      }
      sm.UpdateFromWorld(GAME_EVENT_IDS.LAND_GE);
      continue;
    }

    // detect the collision
    const collisionResult = IntersectsPolygons(
      playerVerts,
      stageVerts,
      vecPool,
      colResPool,
      projResPool
    );

    if (collisionResult.Collision) {
      const normalX = collisionResult.NormX;
      const normalY = collisionResult.NormY;
      const pPos = p.Position;
      const yOffset = p.ECB.YOffset;
      const playerPosDTO = vecPool.Rent().SetXY(pPos.X, pPos.Y);
      const move = vecPool
        .Rent()
        .SetXY(normalX, normalY)
        .Negate()
        .Multiply(collisionResult.Depth);

      //Ground correction
      if (normalX === 0 && normalY > 0) {
        move.AddToY(+yOffset);

        playerPosDTO.AddVec(move);
        p.SetPlayerPosition(playerPosDTO.X, playerPosDTO.Y + correctionDepth);
        sm.UpdateFromWorld(
          p.Velocity.Y < 8
            ? GAME_EVENT_IDS.SOFT_LAND_GE
            : GAME_EVENT_IDS.LAND_GE
        );

        continue;
      }

      //Right wall correction
      if (normalX > 0 && normalY === 0) {
        move.AddToX(correctionDepth);
        playerPosDTO.AddVec(move);
        p.SetPlayerPosition(playerPosDTO.X, playerPosDTO.Y);

        continue;
      }

      // Left Wall Correction
      if (normalX < 0 && normalY === 0) {
        move.AddToX(-correctionDepth);
        playerPosDTO.AddVec(move);
        p.SetPlayerPosition(playerPosDTO.X, playerPosDTO.Y);

        continue;
      }

      //ceiling
      if (normalX === 0 && normalY < 0) {
        move.AddToY(-correctionDepth);
        playerPosDTO.AddVec(move);
        p.SetPlayerPosition(playerPosDTO.X, playerPosDTO.Y);

        continue;
      }

      // corner case, literally
      if (Math.abs(normalX) > 0 && normalY > 0) {
        move.AddToX(move.X <= 0 ? move.Y : -move.Y); // add the y value into x
        playerPosDTO.AddVec(move);
        p.SetPlayerPosition(playerPosDTO.X, playerPosDTO.Y);

        continue;
      }

      if (Math.abs(normalX) > 0 && normalY < 0) {
        playerPosDTO.AddVec(move);
        p.SetPlayerPosition(playerPosDTO.X, playerPosDTO.Y);

        continue;
      }
    }

    // no collision

    if (grnd === false && p.FSMInfo.CurrentStatetId != STATE_IDS.LEDGE_GRAB_S) {
      sm.UpdateFromWorld(GAME_EVENT_IDS.FALL_GE);
      continue;
    }
  }
}

export function LedgeGrabDetection(
  playerCount: number,
  players: Array<Player>,
  stateMachines: Array<StateMachine>,
  stage: Stage,
  vecPool: Pool<PooledVector>,
  colResPool: Pool<CollisionResult>,
  projResPool: Pool<ProjectionResult>
): void {
  const ledges = stage.Ledges;
  const leftLedge = ledges.GetLeftLedge();
  const rightLedge = ledges.GetRightLedge();

  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = players[playerIndex];

    if (p.Flags.IsInHitPause) {
      continue;
    }

    const ledgeDetector = p.LedgeDetector;

    if (ledgeDetector.CanGrabLedge === false) {
      continue;
    }

    const sm = stateMachines[playerIndex];
    const flags = p.Flags;
    const ecb = p.ECB;

    if (p.Velocity.Y < 0 || p.FSMInfo.CurrentStatetId === STATE_IDS.JUMP_S) {
      continue;
    }

    if (PlayerOnStage(stage, ecb.Bottom, ecb.SensorDepth)) {
      continue;
    }

    const isFacingRight = flags.IsFacingRight;

    const front =
      isFacingRight === true ? ledgeDetector.RightSide : ledgeDetector.LeftSide;

    if (isFacingRight) {
      const intersectsLeftLedge = IntersectsPolygons(
        leftLedge,
        front,
        vecPool,
        colResPool,
        projResPool
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
      vecPool,
      colResPool,
      projResPool
    );

    if (intersectsRightLedge.Collision) {
      sm.UpdateFromWorld(GAME_EVENT_IDS.LEDGE_GRAB_GE);
      p.SetPlayerPosition(rightLedge[0].X + ecb.Width / 2, p.Position.Y);
    }
  }
}

export function PlayerCollisionDetection(
  playerCount: number,
  playerArr: Array<Player>,
  vecPool: Pool<PooledVector>,
  colResPool: Pool<CollisionResult>,
  projResPool: Pool<ProjectionResult>
): void {
  if (playerCount < 2) {
    return;
  }
  for (let pIOuter = 0; pIOuter < playerCount; pIOuter++) {
    const checkPlayer = playerArr[pIOuter];
    const checkPlayerStateId = checkPlayer.FSMInfo.CurrentState.StateId;

    if (
      checkPlayerStateId === STATE_IDS.LEDGE_GRAB_S ||
      checkPlayer.Flags.IsInHitPause
    ) {
      continue;
    }

    const checkPlayerEcb = checkPlayer.ECB.GetActiveVerts();

    for (let pIInner = pIOuter + 1; pIInner < playerCount; pIInner++) {
      const otherPlayer = playerArr[pIInner];
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
        vecPool,
        colResPool,
        projResPool
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

export function Gravity(
  playerCount: number,
  playersArr: Array<Player>,
  stage: Stage
): void {
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playersArr[playerIndex]!;

    if (p.Flags.IsInHitPause === true || p.Flags.HasGravity === false) {
      continue;
    }

    if (PlayerOnStage(stage, p.ECB.Bottom, p.ECB.SensorDepth) === false) {
      const speeds = p.Speeds;
      const grav = speeds.Gravity;
      const isFF = p.Flags.IsFastFalling;
      const fallSpeed = isFF ? speeds.FastFallSpeed : speeds.FallSpeed;
      const GravMutliplier = isFF ? 2 : 1;
      p.Velocity.AddClampedYImpulse(fallSpeed, grav * GravMutliplier);
    }
  }
}

export function PlayerInput(
  playerCount: number,
  playerArr: Array<Player>,
  stateMachines: Array<StateMachine>,
  world: World
): void {
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerArr[playerIndex];
    if (p.Flags.IsInHitPause) {
      continue;
    }
    const input = world.GetPlayerCurrentInput(playerIndex)!;
    stateMachines[playerIndex]!.UpdateFromInput(input, world);
  }
}

export function PlayerSensors(
  world: World,
  playerCount: number,
  players: Array<Player>,
  vecPool: Pool<PooledVector>,
  closestPointsPool: Pool<ClosestPointsResult>,
  collisionResultPool: Pool<CollisionResult>
): void {
  if (playerCount < 2) {
    return;
  }

  for (let outerIdx = 0; outerIdx < playerCount - 1; outerIdx++) {
    const pA = players[outerIdx];

    for (let innerIdx = outerIdx + 1; innerIdx < playerCount; innerIdx++) {
      const pB = players[innerIdx];

      const pAVspB = sesnsorDetect(
        pA,
        pB,
        vecPool,
        collisionResultPool,
        closestPointsPool
      );

      const pBVspA = sesnsorDetect(
        pB,
        pA,
        vecPool,
        collisionResultPool,
        closestPointsPool
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
  playerCount: number,
  players: Array<Player>,
  stateMachines: Array<StateMachine>,
  currentFrame: number,
  activeHitBuubleDtoPool: Pool<ActiveHitBubblesDTO>,
  atkResPool: Pool<AttackResult>,
  vecPool: Pool<PooledVector>,
  colResPool: Pool<CollisionResult>,
  clstsPntsResPool: Pool<ClosestPointsResult>,
  componentHistories: Array<ComponentHistory>
): void {
  if (playerCount === 1) {
    return;
  }

  for (let i = 0; i < playerCount - 1; i++) {
    for (let j = i + 1; j < playerCount; j++) {
      const p1 = players[i];
      const p2 = players[j];

      const p1HitsP2Result = PAvsPB(
        currentFrame,
        activeHitBuubleDtoPool,
        atkResPool,
        vecPool,
        colResPool,
        clstsPntsResPool,
        componentHistories,
        p1,
        p2
      );
      const p2HitsP1Result = PAvsPB(
        currentFrame,
        activeHitBuubleDtoPool,
        atkResPool,
        vecPool,
        colResPool,
        clstsPntsResPool,
        componentHistories,
        p2,
        p1
      );

      if (p1HitsP2Result.Hit && p2HitsP1Result.Hit) {
        //check for clang
        const clang =
          Math.abs(p1HitsP2Result.Damage - p2HitsP1Result.Damage) < 3;
      }

      if (p1HitsP2Result.Hit) {
        resolveHitResult(p1, p2, stateMachines, p1HitsP2Result, vecPool);
      }

      if (p2HitsP1Result.Hit) {
        resolveHitResult(p2, p1, stateMachines, p2HitsP1Result, vecPool);
      }
    }
  }
}

function resolveHitResult(
  pA: Player,
  pB: Player,
  stateMachines: Array<StateMachine>,
  pAHitsPbResult: AttackResult,
  vecPool: Pool<PooledVector>
): void {
  const damage = pAHitsPbResult.Damage;
  pB.Points.AddDamage(damage);

  const kb = CalculateKnockback(pB, pAHitsPbResult);
  const hitStop = CalculateHitStop(damage);
  const hitStunFrames = CalculateHitStun(kb);
  const launchVec = CalculateLaunchVector(
    vecPool,
    pAHitsPbResult,
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

  const pBSm = stateMachines[pB.ID];

  pBSm.UpdateFromWorld(GAME_EVENT_IDS.HIT_STOP_GE);
}

/**
 * Checks for and resolves attack collisions between two players for the current frame.
 *
 * @param {number} currentFrame - The current world frame number.
 * @param {Pool<ActiveHitBubblesDTO>} activeHbPool - Pool for renting active hit bubble DTOs.
 * @param {Pool<AttackResult>} atkResPool - Pool for renting attack result objects.
 * @param {Pool<PooledVector>} vecPool - Pool for renting vector objects.
 * @param {Pool<CollisionResult>} colResPool - Pool for renting collision result objects.
 * @param {Pool<ClosestPointsResult>} clstsPntsResPool - Pool for renting closest points result objects.
 * @param {Array<ComponentHistory>} componentHistories - Array of component histories for all players.
 * @param {Player} pA - The attacking player.
 * @param {Player} pB - The defending player.
 * @returns {AttackResult} The result of the attack collision for this frame.
 * */
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

  const pBHurtBubbles = pB.HurtBubbles.HurtCapsules;

  const hurtLength = pBHurtBubbles.length;
  const hitLength = pAHitBubbles.Length;

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
        attackResult.SetTrue(
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
  attackRes: AttackResult,
  isFacingRight: boolean,
  knockBack: number
): PooledVector {
  const vec = vecPool.Rent();
  let angleInRadians = attackRes.LaunchAngle * (Math.PI / 180);

  if (isFacingRight === false) {
    angleInRadians = Math.PI - angleInRadians;
  }

  return vec.SetXY(
    Math.cos(angleInRadians) * knockBack,
    -(Math.sin(angleInRadians) * knockBack) / 2
  );
}

function CalculateKnockback(player: Player, attackRes: AttackResult): number {
  const p = player.Points.Damage;
  const d = attackRes.Damage;
  const w = player.Weight.Weight;
  const s = attackRes.KnockBackScaling;
  const b = attackRes.BaseKnockBack;

  return ((p / 10 + (p * d) / 20) * (200 / (w + 100)) * 1.4 + b) * s * 0.013;
}

export function ApplyVelocty(
  playerCount: number,
  players: Array<Player>
): void {
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = players[playerIndex]!;

    if (p.Flags.IsInHitPause) {
      continue;
    }

    const playerVelocity = p.Velocity;

    p.AddToPlayerPosition(playerVelocity.X, playerVelocity.Y);
  }
}

export function ApplyVeloctyDecay(
  playerCount: number,
  players: Array<Player>,
  stage: Stage
) {
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = players[playerIndex]!;
    const flags = p.Flags;

    if (flags.IsInHitPause) {
      continue;
    }

    const grounded = PlayerOnStage(stage, p.ECB.Bottom, p.ECB.SensorDepth);
    const playerVelocity = p.Velocity;
    const pvx = playerVelocity.X;
    const pvy = playerVelocity.Y;
    const speeds = p.Speeds;

    if (grounded) {
      const groundedVelocityDecay = speeds.GroundedVelocityDecay;
      if (pvx > 0) {
        playerVelocity.X -= groundedVelocityDecay;
      }

      if (pvx < 0) {
        playerVelocity.X += groundedVelocityDecay;
      }

      if (Math.abs(pvx) < 1) {
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
    }

    if (pvx < 0) {
      playerVelocity.X += aerialVelocityDecay;
    }

    if (pvy > fallSpeed) {
      playerVelocity.Y -= aerialVelocityDecay;
    }

    if (pvy < 0) {
      playerVelocity.Y += aerialVelocityDecay;
    }

    if (Math.abs(pvx) < 1.5) {
      playerVelocity.X = 0;
    }
  }
}

export function TimedFlags(
  playerCount: number,
  playerArr: Array<Player>
): void {
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerArr[playerIndex]!;
    const flags = p.Flags;
    if (flags.IsInHitPause === true) {
      flags.DecrementHitPause();
    }
    if (flags.IsIntangible === true) {
      flags.DecrementIntangabilityFrames();
    }
  }
}

export function OutOfBoundsCheck(
  playerCount: number,
  playerArr: Array<Player>,
  playerStateMachineArr: Array<StateMachine>,
  stage: Stage
): void {
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerArr[playerIndex];
    const sm = playerStateMachineArr[playerIndex];

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
    }

    if (pX < deathBoundry.leftBoundry) {
      // kill Player?
      KillPlayer(p, sm);
    }

    if (pX > deathBoundry.rightBoundry) {
      // kill player?
      KillPlayer(p, sm);
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
  sm.ForceState(STATE_IDS.N_FALL_S);
  // reduce stock count
}

export function RecordHistory(
  frameNumber: number,
  playerCount: number,
  playerArr: Array<Player>,
  playerHistories: Array<ComponentHistory>,
  w: World
): void {
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerArr[playerIndex]!;
    const history = playerHistories[playerIndex];
    history.PositionHistory[frameNumber] = p.Position.SnapShot();
    history.FsmInfoHistory[frameNumber] = p.FSMInfo.SnapShot();
    history.PlayerPointsHistory[frameNumber] = p.Points.SnapShot();
    history.VelocityHistory[frameNumber] = p.Velocity.SnapShot();
    history.FlagsHistory[frameNumber] = p.Flags.SnapShot();
    history.LedgeDetectorHistory[frameNumber] = p.LedgeDetector.SnapShot();
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
