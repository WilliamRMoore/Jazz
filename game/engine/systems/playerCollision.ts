import { SetPlayerPositionRaw } from '../entity/playerOrchestrator';
import { STATE_IDS } from '../finiteStateMachines/player/states/shared';
import { DivideRaw } from '../math/fixedPoint';
import { ONE_POINT_FIVE, TWO } from '../math/numberConstants';
import { AABBIntersect, IntersectsPolygons } from '../physics/collisions';
import { World } from '../world/world';

const MOVE_X = ONE_POINT_FIVE;

export function PlayerCollisionDetection(world: World): void {
  const playerData = world.PlayerData;
  const pools = world.Pools;
  const playerCount = playerData.PlayerCount;

  for (let pIOuter = 0; pIOuter < playerCount; pIOuter++) {
    const checkPlayer = playerData.Player(pIOuter);
    const checkPlayerStateId = checkPlayer.FSMInfo.CurrentState.StateId;

    if (
      checkPlayerStateId === STATE_IDS.LEDGE_GRAB_S ||
      checkPlayer.Flags.IsInHitPause
    ) {
      continue;
    }

    const checkPlayerEcb = checkPlayer.ECB;
    const checkPlayerEcbVerts = checkPlayer.ECB.GetActiveVerts();

    const cpMinx = checkPlayerEcb.Left.X.Raw;
    const cpMaxx = checkPlayerEcb.Right.X.Raw;
    const cpMiny = checkPlayerEcb.Top.Y.Raw;
    const cpMaxy = checkPlayerEcb.Bottom.Y.Raw;

    for (let pIInner = pIOuter + 1; pIInner < playerCount; pIInner++) {
      const otherPlayer = playerData.Player(pIInner);
      const otherPlayerStateId = otherPlayer.FSMInfo.CurrentState.StateId;

      if (
        otherPlayerStateId === STATE_IDS.LEDGE_GRAB_S ||
        otherPlayer.Flags.IsInHitPause
      ) {
        continue;
      }

      const opMinX = otherPlayer.ECB.Left.X.Raw;
      const opMaxX = otherPlayer.ECB.Right.X.Raw;
      const opMiny = otherPlayer.ECB.Top.Y.Raw;
      const opMaxy = otherPlayer.ECB.Bottom.Y.Raw;

      const AABBIntersects = AABBIntersect(
        cpMinx,
        cpMiny,
        cpMaxx - cpMinx,
        cpMaxy - cpMiny,
        opMinX,
        opMiny,
        opMaxX - opMinX,
        opMaxy - opMiny
      );

      if (!AABBIntersects) {
        continue;
      }

      const otherPlayerEcb = otherPlayer.ECB.GetActiveVerts();

      const collision = IntersectsPolygons(
        checkPlayerEcbVerts,
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

        if (checkPlayerXRaw >= otherPlayerXRaw) {
          SetPlayerPositionRaw(
            checkPlayer,
            checkPlayerXRaw + DivideRaw(MOVE_X, TWO),
            checkPlayerYRaw
          );

          SetPlayerPositionRaw(
            otherPlayer,
            otherPlayerXRaw - DivideRaw(MOVE_X, TWO),
            otherPlayerYRaw
          );
          continue;
        }

        SetPlayerPositionRaw(
          checkPlayer,
          checkPlayerXRaw - DivideRaw(MOVE_X, TWO),
          checkPlayerYRaw
        );

        SetPlayerPositionRaw(
          otherPlayer,
          otherPlayerXRaw + DivideRaw(MOVE_X, TWO),
          otherPlayerYRaw
        );
      }
    }
  }
}
