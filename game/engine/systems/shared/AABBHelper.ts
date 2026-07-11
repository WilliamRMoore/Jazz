import { AABB } from '../../entity/components/shared/AABB';
import { Player } from '../../entity/playerOrchestrator';
import { AABBDTO } from '../../pools/AABBDTO';
import { Pool } from '../../pools/Pool';
import { PooledVector } from '../../pools/PooledVector';
import { World } from '../../world/world';

export function GetECBAABBHullCC(p: Player, w: World) {
  const prevState = w.HistoryData.PlayerHistoryDB[p.ID].get(w.PreviousFrame);
  const pEcb = p.ECB;
  const preCompECB = prevState.comp_ecbDiamond;

  const playerMinXRaw = Math.min(preCompECB[1].xRaw, pEcb.Left.X.Raw);
  const playerMaxXRaw = Math.max(preCompECB[3].xRaw, pEcb.Right.X.Raw);
  const playerMinYRaw = Math.min(preCompECB[2].yRaw, pEcb.Top.Y.Raw);
  const playerMaxYRaw = Math.max(preCompECB[0].yRaw, pEcb.Bottom.Y.Raw);
  const playerWidthRaw = playerMaxXRaw - playerMinXRaw;
  const playerHeightRaw = playerMaxYRaw - playerMinYRaw;

  const ret = w.Pools.AABBDTOPool.Rent();
  ret.minX.SetFromRaw(playerMinXRaw);
  ret.minY.SetFromRaw(playerMinYRaw);
  ret.width.SetFromRaw(playerWidthRaw);
  ret.height.SetFromRaw(playerHeightRaw);
  return ret;
}

export function GetAttackAABBHull(
  isFacingRight: boolean,
  wasFacingRight: boolean,
  prevPos: PooledVector,
  curPos: PooledVector,
  prevAABB: AABB,
  curAABB: AABB,
  pool: Pool<AABBDTO>
): AABBDTO {
  let minX: number;
  let minY: number;
  let maxX: number;
  let maxY: number;

  const prevXRaw = prevPos.X.Raw;
  const prevYRaw = prevPos.Y.Raw;
  const curXRaw = curPos.X.Raw;
  const curYRaw = curPos.Y.Raw;

  const curLocalMinX = curAABB.minXRaw;
  const curLocalMaxX = curAABB.minXRaw + curAABB.widthRaw;

  const curGlobalMinX = isFacingRight
    ? curXRaw + curLocalMinX
    : curXRaw - curLocalMaxX;

  const curGlobalMaxX = isFacingRight
    ? curXRaw + curLocalMaxX
    : curXRaw - curLocalMinX;

  const curGlobalMinY = curYRaw + curAABB.minYRaw;
  const curGlobalMaxY = curYRaw + curAABB.minYRaw + curAABB.heightRaw;

  const prevLocalMinX = prevAABB.minXRaw;
  const prevLocalMaxX = prevAABB.minXRaw + prevAABB.widthRaw;

  const prevGlobalMinX = wasFacingRight
    ? prevXRaw + prevLocalMinX
    : prevXRaw - prevLocalMaxX;

  const prevGlobalMaxX = wasFacingRight
    ? prevXRaw + prevLocalMaxX
    : prevXRaw - prevLocalMinX;

  const prevGlobalMinY = prevYRaw + prevAABB.minYRaw;
  const prevGlobalMaxY = prevYRaw + prevAABB.minYRaw + prevAABB.heightRaw;

  minX = Math.min(curGlobalMinX, prevGlobalMinX);
  minY = Math.min(curGlobalMinY, prevGlobalMinY);
  maxX = Math.max(curGlobalMaxX, prevGlobalMaxX);
  maxY = Math.max(curGlobalMaxY, prevGlobalMaxY);

  const ret = pool.Rent();

  ret.minX.SetFromRaw(minX);
  ret.minY.SetFromRaw(minY);
  ret.width.SetFromRaw(maxX - minX);
  ret.height.SetFromRaw(maxY - minY);

  return ret;
}

export function GetHurtCirclesAABBHull(p: Player, w: World) {
  const curPos = p.Position;
  const pdHist = w.HistoryData.PlayerHistoryDB[p.ID].get(w.PreviousFrame);
  const ifr = p.Flags.IsFacingRight;
  const wfr = pdHist.facingRight;

  const curAABBRaw = p.HurtCircles.AABB;
  const prevAABBRaw = p.HurtCircles.AABB;

  const curLocalMinX = curAABBRaw.minXRaw;
  const curLocalMaxX = curAABBRaw.minXRaw + curAABBRaw.widthRaw;

  const curGlobalMinX = ifr
    ? curPos.X.Raw + curLocalMinX
    : curPos.X.Raw - curLocalMaxX;

  const curGlobalMaxX = ifr
    ? curPos.X.Raw + curLocalMaxX
    : curPos.X.Raw - curLocalMinX;

  const curGlobalMinY = curPos.Y.Raw + curAABBRaw.minYRaw;
  const curGlobalMaxY =
    curPos.Y.Raw + curAABBRaw.minYRaw + curAABBRaw.heightRaw;

  const prevLocalMinX = prevAABBRaw.minXRaw;
  const prevLocalMaxX = prevAABBRaw.minXRaw + prevAABBRaw.widthRaw;

  const prevGlobalMinX = wfr
    ? pdHist.posXRaw + prevLocalMinX
    : pdHist.posXRaw - prevLocalMaxX;

  const prevGlobalMaxX = wfr
    ? pdHist.posXRaw + prevLocalMaxX
    : pdHist.posXRaw - prevLocalMinX;

  const prevGlobalMinY = pdHist.posYRaw + prevAABBRaw.minYRaw;
  const prevGlobalMaxY =
    pdHist.posYRaw + prevAABBRaw.minYRaw + prevAABBRaw.heightRaw;

  const minX = Math.min(curGlobalMinX, prevGlobalMinX);
  const minY = Math.min(curGlobalMinY, prevGlobalMinY);
  const maxX = Math.max(curGlobalMaxX, prevGlobalMaxX);
  const maxY = Math.max(curGlobalMaxY, prevGlobalMaxY);

  const ret = w.Pools.AABBDTOPool.Rent();

  ret.minX.SetFromRaw(minX);
  ret.minY.SetFromRaw(minY);
  ret.width.SetFromRaw(maxX - minX);
  ret.height.SetFromRaw(maxY - minY);

  return ret;
}
