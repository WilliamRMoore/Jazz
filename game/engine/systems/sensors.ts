import { HandleCommand } from '../command/command';
import {
  AABBIntersect,
  ClosestPointsBetweenSegments,
  IntersectsCircles,
} from '../physics/collisions';
import { MAX_RAW_VALUE, MIN_RAW_VALUE } from '../math/fixedPoint';
import { Player } from '../entity/playerOrchestrator';
import { ClosestPointsResult } from '../pools/ClosestPointsResult';
import { CollisionResult } from '../pools/CollisionResult';
import { Pool } from '../pools/Pool';
import { PooledVector } from '../pools/PooledVector';
import { World } from '../world/world';

export function PlayerSensors(world: World): void {
  const playerData = world.PlayerData;
  const playerCount = playerData.PlayerCount;
  const pools = world.Pools;
  for (let outerIdx = 0; outerIdx < playerCount - 1; outerIdx++) {
    const pA = playerData.Player(outerIdx);

    // Compute pA Sensor AABB
    let pASensorMinX = MAX_RAW_VALUE;
    let pASensorMinY = MAX_RAW_VALUE;
    let pASensorMaxX = MIN_RAW_VALUE;
    let pASensorMaxY = MIN_RAW_VALUE;
    let pAHasSensors = false;
    
    const pASensorsLen = pA.Sensors.NumberActive;
    if (pASensorsLen > 0) {
      pAHasSensors = true;
      const pAPos = pA.Position;
      const pAIfr = pA.Flags.IsFacingRight;
      for (let i = 0; i < pASensorsLen; i++) {
        const s = pA.Sensors.Sensors[i];
        if (!s.IsActive) continue;
        const sXRaw = pAIfr ? pAPos.X.Raw + s.XOffset.Raw : pAPos.X.Raw - s.XOffset.Raw;
        const sYRaw = pAPos.Y.Raw + s.YOffset.Raw;
        const rRaw = s.Radius.Raw;
        pASensorMinX = Math.min(pASensorMinX, sXRaw - rRaw);
        pASensorMinY = Math.min(pASensorMinY, sYRaw - rRaw);
        pASensorMaxX = Math.max(pASensorMaxX, sXRaw + rRaw);
        pASensorMaxY = Math.max(pASensorMaxY, sYRaw + rRaw);
      }
    }

    // Compute pA Hurt AABB
    const pAHurtAABB = pA.HurtCircles.AABB;
    const pAHurtLocalMinX = pAHurtAABB.minXRaw;
    const pAHurtLocalMaxX = pAHurtAABB.minXRaw + pAHurtAABB.widthRaw;
    const pAIfrHurt = pA.Flags.IsFacingRight;
    const pAHurtGlobalMinX = pAIfrHurt ? pA.Position.X.Raw + pAHurtLocalMinX : pA.Position.X.Raw - pAHurtLocalMaxX;
    const pAHurtGlobalMaxX = pAIfrHurt ? pA.Position.X.Raw + pAHurtLocalMaxX : pA.Position.X.Raw - pAHurtLocalMinX;
    const pAHurtGlobalMinY = pA.Position.Y.Raw + pAHurtAABB.minYRaw;
    const pAHurtGlobalMaxY = pA.Position.Y.Raw + pAHurtAABB.minYRaw + pAHurtAABB.heightRaw;

    for (let innerIdx = outerIdx + 1; innerIdx < playerCount; innerIdx++) {
      const pB = playerData.Player(innerIdx);

      // Compute pB Sensor AABB
      let pBSensorMinX = MAX_RAW_VALUE;
      let pBSensorMinY = MAX_RAW_VALUE;
      let pBSensorMaxX = MIN_RAW_VALUE;
      let pBSensorMaxY = MIN_RAW_VALUE;
      let pBHasSensors = false;
      
      const pBSensorsLen = pB.Sensors.NumberActive;
      if (pBSensorsLen > 0) {
        pBHasSensors = true;
        const pBPos = pB.Position;
        const pBIfr = pB.Flags.IsFacingRight;
        for (let i = 0; i < pBSensorsLen; i++) {
          const s = pB.Sensors.Sensors[i];
          if (!s.IsActive) continue;
          const sXRaw = pBIfr ? pBPos.X.Raw + s.XOffset.Raw : pBPos.X.Raw - s.XOffset.Raw;
          const sYRaw = pBPos.Y.Raw + s.YOffset.Raw;
          const rRaw = s.Radius.Raw;
          pBSensorMinX = Math.min(pBSensorMinX, sXRaw - rRaw);
          pBSensorMinY = Math.min(pBSensorMinY, sYRaw - rRaw);
          pBSensorMaxX = Math.max(pBSensorMaxX, sXRaw + rRaw);
          pBSensorMaxY = Math.max(pBSensorMaxY, sYRaw + rRaw);
        }
      }

      // Compute pB Hurt AABB
      const pBHurtAABB = pB.HurtCircles.AABB;
      const pBHurtLocalMinX = pBHurtAABB.minXRaw;
      const pBHurtLocalMaxX = pBHurtAABB.minXRaw + pBHurtAABB.widthRaw;
      const pBIfrHurt = pB.Flags.IsFacingRight;
      const pBHurtGlobalMinX = pBIfrHurt ? pB.Position.X.Raw + pBHurtLocalMinX : pB.Position.X.Raw - pBHurtLocalMaxX;
      const pBHurtGlobalMaxX = pBIfrHurt ? pB.Position.X.Raw + pBHurtLocalMaxX : pB.Position.X.Raw - pBHurtLocalMinX;
      const pBHurtGlobalMinY = pB.Position.Y.Raw + pBHurtAABB.minYRaw;
      const pBHurtGlobalMaxY = pB.Position.Y.Raw + pBHurtAABB.minYRaw + pBHurtAABB.heightRaw;

      let pAVspB = false;
      if (pAHasSensors) {
        const intersects = AABBIntersect(
          pASensorMinX, pASensorMinY, pASensorMaxX - pASensorMinX, pASensorMaxY - pASensorMinY,
          pBHurtGlobalMinX, pBHurtGlobalMinY, pBHurtGlobalMaxX - pBHurtGlobalMinX, pBHurtGlobalMaxY - pBHurtGlobalMinY
        );
        if (intersects) {
          pAVspB = sesnsorDetect(
            pA,
            pB,
            pools.VecPool,
            pools.ColResPool,
            pools.ClstsPntsResPool,
          );
        }
      }

      let pBVspA = false;
      if (pBHasSensors) {
        const intersects = AABBIntersect(
          pBSensorMinX, pBSensorMinY, pBSensorMaxX - pBSensorMinX, pBSensorMaxY - pBSensorMinY,
          pAHurtGlobalMinX, pAHurtGlobalMinY, pAHurtGlobalMaxX - pAHurtGlobalMinX, pAHurtGlobalMaxY - pAHurtGlobalMinY
        );
        if (intersects) {
          pBVspA = sesnsorDetect(
            pB,
            pA,
            pools.VecPool,
            pools.ColResPool,
            pools.ClstsPntsResPool,
          );
        }
      }

      if (pAVspB) {
        const rc = pA.Sensors.ReactCommand;
        if (rc !== undefined) {
          HandleCommand(world, pA, rc);
        }
      }
      if (pBVspA) {
        const rc = pB.Sensors.ReactCommand;
        if (rc !== undefined) {
          HandleCommand(world, pB, rc);
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
  closestPointsPool: Pool<ClosestPointsResult>,
): boolean {
  const pASensors = pA.Sensors;
  const sesnsorLength = pASensors.NumberActive;

  if (sesnsorLength === 0) {
    return false;
  }

  const pAPos = pA.Position;
  const pBPos = pB.Position;
  const pAFacingRight = pA.Flags.IsFacingRight;

  const pBHurtCaps = pB.HurtCircles.HurtCapsules;
  const pBCapsLenght = pBHurtCaps.length;
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
        pAFacingRight,
      );

      const closestPoints = ClosestPointsBetweenSegments(
        sensorPostion,
        sensorPostion,
        hurtCapStart,
        hurtCapEnd,
        vecPool,
        closestPointsPool,
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
        pBHurtCap.Radius,
      );

      if (collisionResult.Collision) {
        return true;
      }
    }
  }
  return false;
}
