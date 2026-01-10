import { PlayerSnapShot } from '../entity/componentHistory';
import {
  AttackId,
  AttackIdToNameMap,
  GrabId,
  GrabIdToNameMap,
  StateId,
  StateIdToNameMap,
} from '../finite-state-machine/stateConfigurations/shared';
type node = sVal | aVal;

export type sVal = {
  kind: 1;
  label: string;
  data: string;
};

export type aVal = {
  kind: 2;
  label: string;
  data: node[];
};

export type deBugInfoTree = node;

const Player_State = 'Player State:';
const Position = 'Position:';
const Velocity = 'Velocity:';
const Frame = 'Frame:';
const State = 'State:';
const State_Id = 'State Id:';
const Name = 'Name:';
const Direction = 'Direction:';
const LeftLabel = 'Left:';
const RightLabel = 'Right:';
const Left = 'Left';
const Right = 'Right';
const ECB = 'ECB:';
const Top = 'Top:';
const Bottom = 'Bottom:';
const Damage = 'Damage:';
const HitStun = 'HitStun:';
const X = 'X:';
const Y = 'Y:';
const Vx = 'Vx:';
const Vy = 'Vy:';
const T = 'T';
const F = 'F';
const Flags = 'Flags:';
const FastFalling = 'FastFalling:';
const VelocityDecay = 'VelocityDecay:';
const HitPauseFrames = 'HitPauseFrames:';
const IntangabilityFrames = 'IntangabilityFrames:';
const PlatFormDetection = 'PlatFormDetection:';
const Jump = 'Jump:';
const Count = 'Count:';
const Grab = 'Grab:';
const GrabIdLabel = 'GrabId:';
const GrabIdName = 'GrabIdName:';
const GrabConfigName = 'GrabConfigName:';
const GrabMeter = 'GrabMeter:';
const Meter = 'Meter:';
const HoldingPlayerId = 'HoldingPlayerId:';
const AttackConfigName = 'AttackConfigName:';
const AttackIdName = 'AttackIdName:';
const PlayersHit = 'Player Ids Hit:';
const CurrentRadius = 'CurrentRadius:';
const Active = 'Active';
const Tilt = 'Tilt:';
const Middle = 'Middle:';
const ledgeGrabCount = 'LedgeGrabCount:';
const Radius = 'Radius:';
const Sensors = 'Sensors:';
const Shield = 'Shield:';
const LedgeDetector = 'LedgeDetector:';
const Attack = 'Attack:';

export function StructurePlayerSnapShotForPrinting(
  ps: PlayerSnapShot
): deBugInfoTree {
  const root: node = {
    kind: 2,
    label: Player_State,
    data: [
      stateNode(ps),
      positionNode(ps),
      velocityNode(ps),
      directionNode(ps),
      ecbNode(ps),
      damageNode(ps),
      hitStunNode(ps),
      flagsNode(ps),
      jumpNode(ps),
      ledgeDetectorNode(ps),
      shieldNode(ps),
      grabNode(ps),
      grabMeterNode(ps),
      attackNode(ps),
      sensorsNode(ps),
    ],
  };
  return root;
}

function positionNode(ps: PlayerSnapShot): node {
  return {
    kind: 2,
    label: Position,
    data: [
      {
        kind: 1,
        label: X,
        data: ps.Position.X.toString(),
      },
      {
        kind: 1,
        label: Y,
        data: ps.Position.Y.toString(),
      },
    ],
  };
}

function velocityNode(ps: PlayerSnapShot): node {
  return {
    kind: 2,
    label: Velocity,
    data: [
      {
        kind: 1,
        label: Vx,
        data: ps.Velocity.X.toString(),
      },
      {
        kind: 1,
        label: Vy,
        data: ps.Velocity.Y.toString(),
      },
    ],
  };
}

function stateNode(ps: PlayerSnapShot): node {
  return {
    kind: 2,
    label: State,
    data: [
      {
        kind: 1,
        label: State_Id,
        data: ps.FSMInfo.State.StateId.toString(),
      },
      {
        kind: 1,
        label: Name,
        data: GetStateName(ps.FSMInfo.State.StateId),
      },
      {
        kind: 1,
        label: Frame,
        data: ps.FSMInfo.StateFrame.toString(),
      },
    ],
  };
}

function directionNode(ps: PlayerSnapShot): node {
  return {
    kind: 1,
    label: Direction,
    data: ps.Flags.FacingRight ? Right : Left,
  };
}

function ecbNode(ps: PlayerSnapShot): node {
  return {
    kind: 2,
    label: ECB,
    data: [
      {
        kind: 2,
        label: Top,
        data: [
          {
            kind: 1,
            label: X,
            data: ps.Ecb.posX.toString(),
          },
          {
            kind: 1,
            label: Y,
            data: (
              ps.Ecb.posY +
              ps.Ecb.ecbShape.yOffset.AsNumber +
              ps.Ecb.ecbShape.height.AsNumber
            ).toString(),
          },
        ],
      },
      {
        kind: 2,
        label: Bottom,
        data: [
          {
            kind: 1,
            label: X,
            data: ps.Ecb.posX.toString(),
          },
          {
            kind: 1,
            label: Y,
            data: (ps.Ecb.posY + ps.Ecb.ecbShape.yOffset.AsNumber).toString(),
          },
        ],
      },
      {
        kind: 2,
        label: LeftLabel,
        data: [
          {
            kind: 1,
            label: X,
            data: (ps.Ecb.posX - ps.Ecb.ecbShape.width.AsNumber / 2).toString(),
          },
          {
            kind: 1,
            label: Y,
            data: (
              ps.Ecb.posY +
              (ps.Ecb.ecbShape.yOffset.AsNumber +
                ps.Ecb.ecbShape.height.AsNumber) /
                2
            ).toString(),
          },
        ],
      },
      {
        kind: 2,
        label: RightLabel,
        data: [
          {
            kind: 1,
            label: X,
            data: (ps.Ecb.posX + ps.Ecb.ecbShape.width.AsNumber / 2).toString(),
          },
          {
            kind: 1,
            label: Y,
            data: (
              ps.Ecb.posY +
              (ps.Ecb.ecbShape.yOffset.AsNumber +
                ps.Ecb.ecbShape.height.AsNumber) /
                2
            ).toString(),
          },
        ],
      },
    ],
  };
}

function damageNode(ps: PlayerSnapShot): node {
  return {
    kind: 1,
    label: Damage,
    data: ps.Damage.damagePoints.toString(),
  };
}

function hitStunNode(ps: PlayerSnapShot): node {
  return {
    kind: 2,
    label: HitStun,
    data: [
      {
        kind: 1,
        label: Frame,
        data: ps.PlayerHitStun.hitStunFrames.toString(),
      },
      {
        kind: 1,
        label: Vx,
        data: ps.PlayerHitStun.vx.toString(),
      },
      {
        kind: 1,
        label: Vy,
        data: ps.PlayerHitStun.vy.toString(),
      },
    ],
  };
}

function flagsNode(ps: PlayerSnapShot): node {
  return {
    kind: 2,
    label: Flags,
    data: [
      {
        kind: 1,
        label: FastFalling,
        data: ps.Flags.FastFalling ? T : F,
      },
      {
        kind: 1,
        label: VelocityDecay,
        data: ps.Flags.VeloctyDecay ? T : F,
      },
      {
        kind: 1,
        label: HitPauseFrames,
        data: ps.Flags.HitPauseFrames.toString(),
      },
      {
        kind: 1,
        label: IntangabilityFrames,
        data: ps.Flags.IntangabilityFrames.toString(),
      },
      {
        kind: 1,
        label: PlatFormDetection,
        data: ps.Flags.DisablePlatDetection.toString(),
      },
    ],
  };
}

function jumpNode(ps: PlayerSnapShot): node {
  return {
    kind: 2,
    label: Jump,
    data: [
      {
        kind: 1,
        label: Count,
        data: ps.Jump.toString(),
      },
    ],
  };
}

function grabNode(ps: PlayerSnapShot): node {
  return {
    kind: 2,
    label: Grab,
    data: [
      {
        kind: 1,
        label: GrabIdLabel,
        data: ps.Grab?.GrabId.toString() ?? '',
      },
      {
        kind: 1,
        label: GrabIdName,
        data: ps.Grab === undefined ? '' : GetGrabName(ps.Grab.GrabId),
      },
      {
        kind: 1,
        label: GrabConfigName,
        data: ps.Grab === undefined ? '' : ps.Grab.Name,
      },
    ],
  };
}

function grabMeterNode(ps: PlayerSnapShot): node {
  return {
    kind: 2,
    label: GrabMeter,
    data: [
      {
        kind: 1,
        label: Meter,
        data: ps.GrabMeter.meter.toString(),
      },
      {
        kind: 1,
        label: HoldingPlayerId,
        data:
          ps.GrabMeter.holdingPlayerId === undefined
            ? ''
            : ps.GrabMeter.holdingPlayerId.toString(),
      },
    ],
  };
}

function attackNode(ps: PlayerSnapShot): node {
  return {
    kind: 2,
    label: Attack,
    data: [
      {
        kind: 1,
        label: AttackConfigName,
        data: ps.Attack.attack === undefined ? '' : ps.Attack.attack.Name,
      },
      {
        kind: 1,
        label: AttackIdName,
        data:
          ps.Attack.attack === undefined
            ? ''
            : GetAttackName(ps.Attack.attack.AttackId),
      },
      {
        kind: 1,
        label: PlayersHit,
        data:
          ps.Attack.playersHit === undefined
            ? ''
            : ps.Attack.playersHit.toString(),
      },
    ],
  };
}

function shieldNode(ps: PlayerSnapShot): node {
  return {
    kind: 2,
    label: Shield,
    data: [
      {
        kind: 1,
        label: CurrentRadius,
        data: ps.Shield.CurrentRadius.toString(),
      },
      {
        kind: 1,
        label: Active,
        data: ps.Shield.Active ? T : F,
      },
      {
        kind: 2,
        label: Tilt,
        data: [
          {
            kind: 1,
            label: X,
            data: ps.Shield.ShieldTiltX.toString(),
          },
          {
            kind: 1,
            label: Y,
            data: ps.Shield.ShieldTiltY.toString(),
          },
        ],
      },
    ],
  };
}

function ledgeDetectorNode(ps: PlayerSnapShot): node {
  return {
    kind: 2,
    label: LedgeDetector,
    data: [
      {
        kind: 2,
        label: Middle,
        data: [
          {
            kind: 1,
            label: X,
            data: ps.LedgeDetector.middleX.toString(),
          },
          {
            kind: 1,
            label: Y,
            data: ps.LedgeDetector.middleY.toString(),
          },
        ],
      },
      {
        kind: 1,
        label: ledgeGrabCount,
        data: ps.LedgeDetector.numberOfLedgeGrabs.toString(),
      },
    ],
  };
}

function sensorsNode(ps: PlayerSnapShot) {
  const r: node = {
    kind: 2,
    label: Sensors,
    data: [],
  };

  if (ps.Sensors.sensors === undefined || ps.Sensors.sensors.length === 0) {
    return r;
  }

  const sensorLength = ps.Sensors.sensors.length;

  for (let i = 0; i < sensorLength; i++) {
    const s = ps.Sensors.sensors[i];
    r.data.push({
      kind: 2,
      label: i.toString(),
      data: [
        {
          kind: 1,
          label: Radius,
          data: s.radius.toString(),
        },
        {
          kind: 1,
          label: X,
          data: (s.xOffset + ps.Position.X).toString(),
        },
        {
          kind: 1,
          label: Y,
          data: (s.yOffset + ps.Position.Y).toString(),
        },
      ],
    });
  }

  return r;
}

export function GetStateName(sId: StateId): string {
  return StateIdToNameMap.get(sId)!;
}
export function GetGrabName(gId: GrabId): string {
  return GrabIdToNameMap.get(gId)!;
}
export function GetAttackName(atkId: AttackId): string {
  return AttackIdToNameMap.get(atkId)!;
}
