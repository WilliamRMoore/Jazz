import { StateMachine } from '../finite-state-machine/PlayerStateMachine';
import {
  GAME_EVENT_IDS,
  STATE_IDS,
  CanStateWalkOffLedge,
} from '../finite-state-machine/stateConfigurations/shared';
import { NumberToRaw, FixedPoint } from '../math/fixedPoint';
import { LineSegmentIntersectionFp } from '../physics/collisions';
import {
  PlayerOnPlats,
  CanOnlyFallOffLedgeWhenFacingAwayFromIt,
  SetPlayerPosition,
  PlayerOnPlatsReturnsYCoord,
  SetPlayerPositionRaw,
  Player,
} from '../entity/playerOrchestrator';
import { PlayerData, StageData } from '../world/world';
import { CORRECTION_DEPTH_RAW, ShouldSoftlandRaw } from './shared';

const NEG_ZERO_POINT_EIGHT = NumberToRaw(-0.8);
const NEG_ZERO_POINT_FIVE = NumberToRaw(-0.5);

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
      const checkValueRaw = -(prevIa.LYAxis.Raw - ia.LYAxis.Raw);

      const inLanding =
        p.FSMInfo.CurrentStatetId === STATE_IDS.LAND_S ||
        p.FSMInfo.CurrentStatetId === STATE_IDS.SOFT_LAND_S;

      if (checkValueRaw <= NEG_ZERO_POINT_FIVE && !inLanding) {
        sm.UpdateFromWorld(GAME_EVENT_IDS.FALL_GE);
        flags.FastFallOff();
        flags.SetDisablePlatFrames(11);
        continue;
      }
      handlePlatformLanding(p, sm, landingYCoord, ecb.Bottom.X);
      continue;
    }

    const fsmInfo = p.FSMInfo;

    //if we are moving downward, and we are holding down, and we are NOT in the airdodge state,
    if (
      ia.LYAxis.Raw < NEG_ZERO_POINT_EIGHT &&
      fsmInfo.CurrentStatetId !== STATE_IDS.AIR_DODGE_S
    ) {
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

      const playerIsTooFarRight = currentBottom.X.Raw > plat.X2.Raw;
      const playerIsTooFarLeft = currentBottom.X.Raw < plat.X1.Raw;

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

function handlePlatformLanding(
  p: Player,
  sm: StateMachine,
  yCoord: FixedPoint,
  xCoord: FixedPoint
) {
  const landId = ShouldSoftlandRaw(p.Velocity.Y.Raw)
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
