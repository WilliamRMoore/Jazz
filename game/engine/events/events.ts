import { FixedPoint } from '../../math/fixedPoint';
import { StateMachine } from '../finite-state-machine/PlayerStateMachine';
import { StateId } from '../finite-state-machine/PlayerStates';
import { Sequencer } from '../utils';
import { World } from '../world/world';

const seq = new Sequencer();

class EventIds {
  public readonly PLAYER_SWITCH_STATE = seq.Next;
  public readonly SENSOR_ACTIVATE = seq.Next;
  public readonly SENSOR_DEACTIVATE = seq.Next;
  public readonly SENSOR_REACT = seq.Next;
  public readonly SENSOR_REACT_SET = seq.Next;
  public readonly VELOCITY_SET = seq.Next;
  public readonly SET_REACT_EVENT = seq.Next;
  public readonly SET_JUMP_COUNT = seq.Next;
}

export const EVENT_IDS = new EventIds();

type JEvent<T> = { eventId: number; payLoad: T };
export type PlayerJEvent<T> = JEvent<T> & {
  PlayerId: number | undefined;
  handler: (w: World, event: PlayerJEvent<T>) => void;
};
type SetVelocityPayLoad = {
  vx: FixedPoint;
  vy: FixedPoint;
};
type ChangeStateEvent = PlayerJEvent<stateChangePayload>;
type SensorActivateEventPayload = {
  yOffset: FixedPoint;
  xOffset: FixedPoint;
  radius: FixedPoint;
};
type SensorActivateEvent = PlayerJEvent<SensorActivateEventPayload>;
type SensorDeactivateEvent = PlayerJEvent<undefined>;
type SensorChangeReactionEventPayload = {
  event: PlayerJEvent<unknown>;
};
type SensorChangeReactionEvent = PlayerJEvent<SensorChangeReactionEventPayload>;
type stateChangePayload = {
  stateId: StateId;
};
type SetJumpCountPayLoad = {
  count: number;
};

type SetJumpCountEvent = PlayerJEvent<SetJumpCountPayLoad>;

export function SetJumpCountEventFactory(count: number): SetJumpCountEvent {
  return {
    eventId: EVENT_IDS.SET_JUMP_COUNT,
    PlayerId: undefined,
    handler: SetJumpCount,
    payLoad: {
      count: count,
    },
  };
}

export function SetVelocityEventFactory(
  vx: number,
  vy: number
): PlayerJEvent<SetVelocityPayLoad> {
  return {
    eventId: EVENT_IDS.VELOCITY_SET,
    PlayerId: undefined,
    handler: SetVelocityEvent,
    payLoad: {
      vx: new FixedPoint(vx),
      vy: new FixedPoint(vy),
    },
  };
}

export function SensorChangeReactionEventFactory(
  reactionEvent: PlayerJEvent<any>
): SensorChangeReactionEvent {
  return {
    eventId: EVENT_IDS.SENSOR_REACT_SET,
    PlayerId: undefined,
    handler: ChangeSensorReactor,
    payLoad: {
      event: reactionEvent,
    },
  };
}

export function ChangeStateEventFactory(stateId: StateId): ChangeStateEvent {
  return {
    eventId: EVENT_IDS.PLAYER_SWITCH_STATE,
    PlayerId: undefined,
    handler: SwitchPlayerState,
    payLoad: { stateId: stateId },
  };
}

export function ActivateSensorEventFactory(
  yOffset: number,
  xOffset: number,
  radius: number
): SensorActivateEvent {
  return {
    eventId: EVENT_IDS.SENSOR_ACTIVATE,
    PlayerId: undefined,
    handler: ActivateSensor,
    payLoad: {
      yOffset: new FixedPoint(yOffset),
      xOffset: new FixedPoint(xOffset),
      radius: new FixedPoint(radius),
    },
  };
}

export function DeactivateSensorEventFactory(): SensorDeactivateEvent {
  return {
    eventId: EVENT_IDS.SENSOR_DEACTIVATE,
    PlayerId: undefined,
    payLoad: undefined,
    handler: DeactivateSensor,
  };
}

function SwitchPlayerState(world: World, event: ChangeStateEvent) {
  const sm = world.PlayerData.StateMachine(event.PlayerId!);
  sm.UpdateFromWorld(event.payLoad.stateId);
  //event.payLoad.stateMachine!.UpdateFromWorld(event.payLoad.stateId);
}

function SetVelocityEvent(
  world: World,
  event: PlayerJEvent<SetVelocityPayLoad>
) {
  const p = world.PlayerData.Player(event.PlayerId!);
  p.Velocity.X.SetFromFp(event.payLoad.vx);
  p.Velocity.Y.SetFromFp(event.payLoad.vy);
}

function ActivateSensor(world: World, event: SensorActivateEvent) {
  const p = world.PlayerData.Player(event.PlayerId!); //event.payLoad.p!;
  const yOffset = event.payLoad.yOffset;
  const xOffset = event.payLoad.xOffset;
  const radius = event.payLoad.radius;
  p.Sensors.ActivateSensor(yOffset, xOffset, radius);
}

function DeactivateSensor(world: World, event: SensorDeactivateEvent) {
  const p = world.PlayerData.Player(event.PlayerId!);
  p.Sensors.DeactivateSensors();
}

function ChangeSensorReactor(world: World, event: SensorChangeReactionEvent) {
  const p = world.PlayerData.Player(event.PlayerId!);
  p.Sensors.SwitchReactor(event.payLoad.event);
}

function SetJumpCount(world: World, event: SetJumpCountEvent) {
  const p = world.PlayerData.Player(event.PlayerId!);
  p.Jump.Set(event.payLoad.count);
}

// export function HandleJEvent(world: World, je: JEvent<unknown>) {
//   switch (je.eventId) {
//     case EVENT_IDS.PLAYER_SWITCH_STATE:
//       SwitchPlayerState(world, je as ChangeStateEvent);
//       break;
//     case EVENT_IDS.SENSOR_ACTIVATE:
//       ActivateSensor(world, je as SensorActivateEvent);
//       break;
//     case EVENT_IDS.SENSOR_DEACTIVATE:
//       DeactivateSensor(world, je as SensorDeactivateEvent);
//       break;
//     case EVENT_IDS.SENSOR_REACT_SET:

//     default:
//       break;
//   }
//}
