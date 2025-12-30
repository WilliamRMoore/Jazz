import { ComponentHistory } from '../entity/componentHistory';
import { Player, SetPlayerPositionRaw } from '../entity/playerOrchestrator';
import { StateMachine } from '../finite-state-machine/PlayerStateMachine';
import { GAME_EVENT_IDS } from '../finite-state-machine/stateConfigurations/shared';
import { NumberToRaw } from '../math/fixedPoint';
import {
  ClosestPointsBetweenSegments,
  IntersectsCirclesRawBool,
} from '../physics/collisions';
import { ActiveGrabBubblesDTO } from '../pools/ActiveGrabBubbles';
import { ClosestPointsResult } from '../pools/ClosestPointsResult';
import { Pool } from '../pools/Pool';
import { PooledVector } from '../pools/PooledVector';
import { World } from '../world/world';

export function PlayerGrabs(w: World) {
  const pd = w.PlayerData;
  const pools = w.Pools;
  const componenetHistories = w.HistoryData.PlayerComponentHistories;
  const playerCount = pd.PlayerCount;
  for (
    let outerPlayerIndex = 0;
    outerPlayerIndex < playerCount;
    outerPlayerIndex++
  ) {
    const p1 = pd.Player(outerPlayerIndex);
    const p1Sm = pd.StateMachine(p1.ID);
    for (
      let innerPlayerIndex = outerPlayerIndex + 1;
      innerPlayerIndex < playerCount;
      innerPlayerIndex++
    ) {
      const p2 = pd.Player(innerPlayerIndex);
      const p2Sm = pd.StateMachine(p2.ID);

      const p1VsP2 = PAvsPB(
        p1,
        p2,
        componenetHistories,
        pools.VecPool,
        pools.ClstsPntsResPool,
        w.localFrame
      );

      const p2VsP1 = PAvsPB(
        p2,
        p1,
        componenetHistories,
        pools.VecPool,
        pools.ClstsPntsResPool,
        w.localFrame
      );

      if (p1VsP2 && !p2VsP1) {
        resolveGrab(p1, p2, p1Sm, p2Sm);
        continue;
      }

      if (!p1VsP2 && p2VsP1) {
        resolveGrab(p2, p1, p2Sm, p1Sm);
        continue;
      }

      if (p1VsP2 && p2VsP1) {
        resolveDoubleGrab(p1, p2, p1Sm, p2Sm);
        continue;
      }
    }
  }
}

const HOLD_DISTANCE = NumberToRaw(50);

// we will add some very subtle rubber banding for losing players, they get priority
function resolveDoubleGrab(
  grabberA: Player,
  grabberB: Player,
  grabberASm: StateMachine,
  grabberBSm: StateMachine
) {
  if (grabberA.Damage.Damage > grabberB.Damage.Damage) {
    resolveGrab(grabberA, grabberB, grabberASm, grabberBSm);
    return;
  }
  if (grabberB.Damage.Damage > grabberA.Damage.Damage) {
    resolveGrab(grabberB, grabberA, grabberBSm, grabberASm);
    return;
  }
  if (grabberA.Weight.Value >= grabberB.Weight.Value) {
    resolveGrab(grabberA, grabberB, grabberASm, grabberBSm);
    return;
  }
  resolveGrab(grabberB, grabberA, grabberBSm, grabberASm);
}

function resolveGrab(
  grabber: Player,
  grabee: Player,
  grabberSm: StateMachine,
  grabeeSm: StateMachine
) {
  grabberSm.UpdateFromWorld(GAME_EVENT_IDS.GRAB_HOLD_GE);
  grabeeSm.UpdateFromWorld(GAME_EVENT_IDS.GRAB_HELD_GE);

  const grabberPos = grabber.Position;
  const grabberDirection = grabber.Flags.IsFacingRight;
  const grabbeeDirection = grabee.Flags.IsFacingRight;

  if (grabberDirection === grabbeeDirection) {
    grabee.Flags.ChangeDirections();
  }

  const grabeeNewPosY = grabberPos.Y.Raw;
  const grabeeNewPosX = grabberDirection
    ? grabberPos.X.Raw + HOLD_DISTANCE
    : grabberPos.X.Raw - HOLD_DISTANCE;

  SetPlayerPositionRaw(grabee, grabeeNewPosX, grabeeNewPosY);
  grabee.GrabMeter.SetHoldingPlayerId(grabber.ID);
}

const agbDto = new ActiveGrabBubblesDTO();
function PAvsPB(
  pA: Player,
  pB: Player,
  componentHistories: Array<ComponentHistory>,
  vecPool: Pool<PooledVector>,
  clstsPntsResPool: Pool<ClosestPointsResult>,
  currentFrame: number
): boolean {
  const pAStateFrame = pA.FSMInfo.CurrentStateFrame;
  const pAGrab = pA.Grabs.GetGrab();
  if (pAGrab === undefined) {
    return false;
  }
  if (pB.Flags.IsIntangible) {
    return false;
  }

  agbDto.Zero();

  const grabBubbles = pAGrab.GetActiveBubblesForFrame(pAStateFrame, agbDto);
  const grabBubblesLength = grabBubbles.Length;

  if (grabBubblesLength === 0) {
    return false;
  }

  const hurtBubbles = pB.HurtCircles.HurtCapsules;
  const hurtBubblesLength = hurtBubbles.length;
  const pAPosition = pA.Position;
  const pBPosition = pB.Position;
  const pAFacingRight = pA.Flags.IsFacingRight;
  const pAPosHistory = componentHistories[pA.ID].PositionHistory;
  const previousWorldFrame = currentFrame > 0 ? currentFrame - 1 : 0;
  const prevPostion = pAPosHistory[previousWorldFrame];
  const prevXRaw = NumberToRaw(prevPostion.X);
  const prevYRaw = NumberToRaw(prevPostion.Y);

  for (let hurtIndex = 0; hurtIndex < hurtBubblesLength; hurtIndex++) {
    const hurtBubble = hurtBubbles[hurtIndex];
    const hurtBubStart = hurtBubble.GetStartPosition(
      pBPosition.X,
      pBPosition.Y,
      vecPool
    );
    const hurtBubEnd = hurtBubble.GetEndPosition(
      pBPosition.X,
      pBPosition.Y,
      vecPool
    );

    for (let grabIndex = 0; grabIndex < grabBubblesLength; grabIndex++) {
      const grabBubble = grabBubbles.AtIndex(grabIndex)!;

      const grabBubCurPos = grabBubble.GetGlobalPosition(
        vecPool,
        pAPosition.X,
        pAPosition.Y,
        pAFacingRight,
        pAStateFrame
      );

      if (grabBubCurPos === undefined) {
        continue;
      }

      const grabPrevPos =
        grabBubble.GetGlobalPositionRaw(
          vecPool,
          prevXRaw,
          prevYRaw,
          pAFacingRight,
          pAStateFrame > 0 ? pAStateFrame - 1 : 0
        ) ?? vecPool.Rent().SetXY(grabBubCurPos.X, grabBubCurPos.Y);

      const closestPoint = ClosestPointsBetweenSegments(
        grabPrevPos,
        grabBubCurPos,
        hurtBubStart,
        hurtBubEnd,
        vecPool,
        clstsPntsResPool
      );

      const grabRadius = grabBubble.Radius;
      const hurtRadius = hurtBubble.Radius;

      const collision = IntersectsCirclesRawBool(
        closestPoint.C1X.Raw,
        closestPoint.C1Y.Raw,
        closestPoint.C2X.Raw,
        closestPoint.C2Y.Raw,
        grabRadius.Raw,
        hurtRadius.Raw
      );

      if (collision) {
        return true;
      }
    }
  }
  return false;
}
