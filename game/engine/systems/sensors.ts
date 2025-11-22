import { HandleCommand } from '../command/command';
import {
  ClosestPointsBetweenSegments,
  IntersectsCircles,
} from '../physics/collisions';
import { Player } from '../player/playerOrchestrator';
import { ClosestPointsResult } from '../pools/ClosestPointsResult';
import { CollisionResult } from '../pools/CollisionResult';
import { Pool } from '../pools/Pool';
import { PooledVector } from '../pools/PooledVector';
import { World, PlayerData, Pools } from '../world/world';

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
        const rc = pA.Sensors.ReactCommand; //.ReactAction(world, pA, pB);
        if (rc !== undefined) {
          HandleCommand(world, pA, rc); //rc.handler(world, rc); //HandleJEvent(world, re);
        }
      }

      if (pBVspA) {
        const rc = pB.Sensors.ReactCommand;
        if (rc !== undefined) {
          HandleCommand(world, pB, rc); //re.handler(world, re);//pB.Sensors.ReactAction(world, pB, pB);
        }
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
  const pBHurtCaps = pB.HurtCircles.HurtCapsules;
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
