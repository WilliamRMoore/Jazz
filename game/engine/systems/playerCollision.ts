import { NumberToRaw, DivideRaw } from '../../math/fixedPoint';
import { STATE_IDS } from '../finite-state-machine/playerStates/shared';
import { IntersectsPolygons } from '../physics/collisions';
import { SetPlayerPositionRaw } from '../player/playerOrchestrator';
import { PlayerData, Pools } from '../world/world';

const moveX = NumberToRaw(1.5);
const twoRaw = NumberToRaw(2);

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
          DivideRaw(otherPlayerXRaw + moveX, twoRaw),
          otherPlayerYRaw
        );
      }
    }
  }
}
