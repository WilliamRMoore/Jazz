import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';

export const atkRange = (p: Player, attackId: number, w: World) => {
  const atk = p.Attacks.AABBs.get(attackId);
  if (!atk)
    throw new Error(`Attack ${attackId} does not exist for player ${p.ID}`);

  const xRang = atk.widthRaw;
  const yRange = atk.heightRaw;
  const ret = w.Pools.VecPool.Rent();
  ret.X.SetFromRaw(xRang);
  ret.Y.SetFromRaw(yRange);

  return ret;
};
