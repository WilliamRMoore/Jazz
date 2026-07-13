import { RawToNumber } from '../math/fixedPoint';
import { PlayerStateHistory } from '../systems/history';
import {
  AttackId,
  AttackIdToNameMap,
  GameEventId,
  GameEventNameMap,
  GrabId,
  GrabIdToNameMap,
  StateId,
  StateIdToNameMap
} from '../finiteStateMachines/player/shared';
type node = sVal | aVal;

export type sVal = {
  kind: 1;
  label: string;
  data: string | number;
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
  ps: PlayerStateHistory
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
      sensorsNode(ps)
    ]
  };
  return root;
}

function positionNode(ps: PlayerStateHistory): node {
  return {
    kind: 2,
    label: Position,
    data: [
      {
        kind: 1,
        label: X,
        data: RawToNumber(ps.posXRaw)
      },
      {
        kind: 1,
        label: Y,
        data: RawToNumber(ps.posYRaw)
      }
    ]
  };
}

function velocityNode(ps: PlayerStateHistory): node {
  return {
    kind: 2,
    label: Velocity,
    data: [
      {
        kind: 1,
        label: Vx,
        data: RawToNumber(ps.velXRaw)
      },
      {
        kind: 1,
        label: Vy,
        data: RawToNumber(ps.velYRaw)
      }
    ]
  };
}

function stateNode(ps: PlayerStateHistory): node {
  return {
    kind: 2,
    label: State,
    data: [
      {
        kind: 1,
        label: State_Id,
        data: ps.stateId
      },
      {
        kind: 1,
        label: Name,
        data: GetStateName(ps.stateId)
      },
      {
        kind: 1,
        label: Frame,
        data: ps.stateFrame
      }
    ]
  };
}

function directionNode(ps: PlayerStateHistory): node {
  return {
    kind: 1,
    label: Direction,
    data: ps.facingRight ? Right : Left
  };
}

function ecbNode(ps: PlayerStateHistory): node {
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
            data: RawToNumber(ps.comp_ecbDiamond[2].xRaw)
          },
          {
            kind: 1,
            label: Y,
            data: RawToNumber(ps.comp_ecbDiamond[2].yRaw)
          }
        ]
      },
      {
        kind: 2,
        label: Bottom,
        data: [
          {
            kind: 1,
            label: X,
            data: RawToNumber(ps.comp_ecbDiamond[0].xRaw)
          },
          {
            kind: 1,
            label: Y,
            data: RawToNumber(ps.comp_ecbDiamond[0].yRaw)
          }
        ]
      },
      {
        kind: 2,
        label: LeftLabel,
        data: [
          {
            kind: 1,
            label: X,
            data: RawToNumber(ps.comp_ecbDiamond[1].xRaw)
          },
          {
            kind: 1,
            label: Y,
            data: RawToNumber(ps.comp_ecbDiamond[1].yRaw)
          }
        ]
      },
      {
        kind: 2,
        label: RightLabel,
        data: [
          {
            kind: 1,
            label: X,
            data: RawToNumber(ps.comp_ecbDiamond[3].xRaw)
          },
          {
            kind: 1,
            label: Y,
            data: RawToNumber(ps.comp_ecbDiamond[3].yRaw)
          }
        ]
      }
    ]
  };
}

function damageNode(ps: PlayerStateHistory): node {
  return {
    kind: 1,
    label: Damage,
    data: RawToNumber(ps.damageRaw)
  };
}

function hitStunNode(ps: PlayerStateHistory): node {
  return {
    kind: 2,
    label: HitStun,
    data: [
      {
        kind: 1,
        label: Frame,
        data: ps.hitStunFrames
      },
      {
        kind: 1,
        label: Vx,
        data: RawToNumber(ps.hitStunVxRaw)
      },
      {
        kind: 1,
        label: Vy,
        data: RawToNumber(ps.hitStunVyRaw)
      }
    ]
  };
}

function flagsNode(ps: PlayerStateHistory): node {
  return {
    kind: 2,
    label: Flags,
    data: [
      {
        kind: 1,
        label: FastFalling,
        data: ps.fasFalling ? T : F
      },
      {
        kind: 1,
        label: VelocityDecay,
        data: ps.velocityDecayActive ? T : F
      },
      {
        kind: 1,
        label: HitPauseFrames,
        data: ps.hitPauseFrames
      },
      {
        kind: 1,
        label: IntangabilityFrames,
        data: ps.intangabilityFrames
      },
      {
        kind: 1,
        label: PlatFormDetection,
        data: ps.disablePlatformDetectionFrames
      }
    ]
  };
}

function jumpNode(ps: PlayerStateHistory): node {
  return {
    kind: 2,
    label: Jump,
    data: [
      {
        kind: 1,
        label: Count,
        data: ps.jumpCount
      }
    ]
  };
}

function grabNode(ps: PlayerStateHistory): node {
  return {
    kind: 2,
    label: Grab,
    data: [
      {
        kind: 1,
        label: GrabIdLabel,
        data: ps.grabId ?? ''
      },
      {
        kind: 1,
        label: GrabIdName,
        data: ps.grabId === undefined ? '' : GetGrabName(ps.grabId)
      },
      {
        kind: 1,
        label: GrabConfigName,
        data: ps.grabId === undefined ? '' : GetGrabName(ps.grabId)
      }
    ]
  };
}

function grabMeterNode(ps: PlayerStateHistory): node {
  return {
    kind: 2,
    label: GrabMeter,
    data: [
      {
        kind: 1,
        label: Meter,
        data: RawToNumber(ps.grabMeterRaw)
      },
      {
        kind: 1,
        label: HoldingPlayerId,
        data: ps.holdingPlayerId ?? ''
      }
    ]
  };
}

function attackNode(ps: PlayerStateHistory): node {
  return {
    kind: 2,
    label: Attack,
    data: [
      {
        kind: 1,
        label: AttackConfigName,
        data: ps.atkId === undefined ? '' : GetAttackName(ps.atkId)
      },
      {
        kind: 1,
        label: AttackIdName,
        data: ps.atkId === undefined ? '' : GetAttackName(ps.atkId)
      },
      {
        kind: 1,
        label: PlayersHit,
        data: Array.from(ps.playersHit).toString()
      }
    ]
  };
}

function shieldNode(ps: PlayerStateHistory): node {
  return {
    kind: 2,
    label: Shield,
    data: [
      {
        kind: 1,
        label: CurrentRadius,
        data: RawToNumber(ps.shieldRadiusRaw)
      },
      {
        kind: 1,
        label: Active,
        data: ps.shieldActive ? T : F
      },
      {
        kind: 2,
        label: Tilt,
        data: [
          {
            kind: 1,
            label: X,
            data: RawToNumber(ps.shieldTiltXRaw)
          },
          {
            kind: 1,
            label: Y,
            data: RawToNumber(ps.shieldTiltYRaw)
          }
        ]
      }
    ]
  };
}

function ledgeDetectorNode(ps: PlayerStateHistory): node {
  return {
    kind: 2,
    label: LedgeDetector,
    data: [
      {
        kind: 1,
        label: ledgeGrabCount,
        data: ps.ldGrabCount
      }
    ]
  };
}

function sensorsNode(ps: PlayerStateHistory) {
  const r: node = {
    kind: 2,
    label: Sensors,
    data: []
  };

  const sensors = ps.comp_sensors;
  const sensorLength = sensors.length;

  for (let i = 0; i < sensorLength; i++) {
    const s = sensors[i];
    if (!s.active) {
      continue;
    }
    r.data.push({
      kind: 2,
      label: i.toString(),
      data: [
        {
          kind: 1,
          label: Radius,
          data: RawToNumber(s.radiusRaw)
        },
        {
          kind: 1,
          label: X,
          data: RawToNumber(s.globalXRaw)
        },
        {
          kind: 1,
          label: Y,
          data: RawToNumber(s.globalYRaw)
        }
      ]
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
export function GetGameEventName(geId: GameEventId): string {
  return GameEventNameMap.get(geId)!;
}
