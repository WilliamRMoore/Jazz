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
  PlayerOnPlatsReturnsPlatform,
} from '../entity/playerOrchestrator';
import { World } from '../world/world';
import { ShouldSoftlandRaw } from './shared';
import { CreateDiamondFromHistory } from '../entity/components/ecb';
import {
  CORRECTION_DEPTH_RAW,
  POINT_EIGHT,
  POINT_FIVE,
  POINT_FOUR,
} from '../math/numberConstants';

const NEG_ZERO_POINT_EIGHT = -POINT_EIGHT;
const NEG_ZERO_POINT_FIVE = -POINT_FIVE;

export function PlatformDetection(world: World): void {
  const playerData = world.PlayerData;
  const stageData = world.StageData;
  const histories = world.HistoryData;
  const currentFrame = world.LocalFrame;
  const prevFrame = world.PreviousFrame;
  const stages = stageData.Stages;
  const stageLength = stages.length;

  for (let stageIndex = 0; stageIndex < stageLength; stageIndex++) {
    const stage = stages[stageIndex];
    const plats = stage.Platforms;

    if (plats === undefined) {
      continue;
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

      const dPool = world.Pools.DiamondPool;
      const compHist = histories.PlayerComponentHistories[playerIndex];
      const ecb = p.ECB;
      const prevEcbSnapShot = compHist.EcbHistory[prevFrame];
      const preEcb = CreateDiamondFromHistory(prevEcbSnapShot, dPool);

      const playerPlat = PlayerOnPlatsReturnsPlatform(
        stage,
        preEcb.Bottom,
        ecb.SensorDepth,
      );

      const wasOnPlat = playerPlat !== undefined;

      const isOnPlat = PlayerOnPlats(stage, ecb.Bottom, ecb.SensorDepth);

      if (wasOnPlat && !isOnPlat) {
        // Player has just walked off a platform. Check if they were allowed to.
        let shouldSnapBack = false;
        if (CanOnlyFallOffLedgeWhenFacingAwayFromIt(p)) {
          const fellOffLeft = p.Position.X.Raw < playerPlat.X1.Raw;
          const fellOffRight = p.Position.X.Raw > playerPlat.X2.Raw;
          const isFacingRight = p.Flags.IsFacingRight;

          // Snap back if facing TOWARDS the platform after falling off
          if (
            (fellOffLeft && isFacingRight) ||
            (fellOffRight && !isFacingRight)
          ) {
            shouldSnapBack = true;
          }
        } else if (CanStateWalkOffLedge(p.FSMInfo.CurrentStatetId) === false) {
          shouldSnapBack = true;
        }

        if (shouldSnapBack) {
          p.Velocity.X.Zero();
          p.Velocity.Y.Zero();
          const yPosRaw = p.ECB.YOffset.Raw - CORRECTION_DEPTH_RAW;

          if (p.Position.X.Raw < playerPlat.X1.Raw) {
            // Player fell off the left edge.
            SetPlayerPositionRaw(
              p,
              playerPlat.X1.Raw + CORRECTION_DEPTH_RAW,
              playerPlat.Y1.Raw - yPosRaw,
            );
          } else if (p.Position.X.Raw > playerPlat.X2.Raw) {
            // Player fell off the right edge.
            SetPlayerPositionRaw(
              p,
              playerPlat.X2.Raw - CORRECTION_DEPTH_RAW,
              playerPlat.Y2.Raw - yPosRaw,
            );
          }
          playerData
            .StateMachine(playerIndex)
            .UpdateFromWorld(GAME_EVENT_IDS.LAND_GE);
          continue;
        }
      }

      const landingYCoord = PlayerOnPlatsReturnsYCoord(
        stage,
        ecb.Bottom,
        ecb.SensorDepth,
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
        const isSpotDodge =
          p.FSMInfo.CurrentStatetId === STATE_IDS.SPOT_DODGE_S;

        if (
          checkValueRaw <= NEG_ZERO_POINT_FIVE &&
          !inLanding &&
          !isSpotDodge
        ) {
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

      const previousBottom = preEcb.Bottom;
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
          plat.Y2,
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
            plat.X2,
          );
          break;
        }

        if (playerIsTooFarLeft) {
          handlePlatformLanding(
            p,
            playerData.StateMachine(playerIndex),
            plat.Y1,
            plat.X1,
          );
          break;
        }

        handlePlatformLanding(
          p,
          playerData.StateMachine(playerIndex),
          plat.Y2,
          currentBottom.X,
        );
      }
    }
  }
}

function handlePlatformLanding(
  p: Player,
  sm: StateMachine,
  yCoord: FixedPoint,
  xCoord: FixedPoint,
) {
  const landId = ShouldSoftlandRaw(p.Velocity.Y.Raw)
    ? GAME_EVENT_IDS.SOFT_LAND_GE
    : GAME_EVENT_IDS.LAND_GE;
  sm.UpdateFromWorld(landId);
  const newYOffset = p.ECB.YOffset;
  SetPlayerPositionRaw(
    p,
    xCoord.Raw,
    yCoord.Raw + CORRECTION_DEPTH_RAW - newYOffset.Raw,
  );
}
