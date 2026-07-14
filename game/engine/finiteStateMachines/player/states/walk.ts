import { Player } from '../../../entity/playerOrchestrator';
import { MultiplyRaw } from '../../../math/fixedPoint';
import { World } from '../../../world/world';
import * as Conditions from '../conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from '../shared';

export const Walk: FSMState = {
  StateName: 'WALK',
  StateId: STATE_IDS.WALK_S,
  OnEnter: (p: Player, w: World) => {},
  OnUpdate: (p: Player, w: World) => {
    const speeds = p.Speeds;
    const vel = p.Velocity;
    const absWalkMaxSpeed = Math.abs(speeds.MaxWalkSpeedRaw);
    const absXVel = Math.abs(vel.X.Raw);
    if (absXVel >= absWalkMaxSpeed) {
      return;
    }
    const isFacingRight = p.Flags.IsFacingRight;
    const inputStore = w.PlayerData.InputStore(p.ID);
    const curFrame = w.LocalFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const impulse = MultiplyRaw(ia.LXAxisRaw, speeds.WalkSpeedMulitplierRaw);
    if (isFacingRight) {
      const diff = absWalkMaxSpeed - vel.X.Raw;
      if (diff >= impulse) {
        vel.X.SetFromRaw(vel.X.Raw + impulse);
      } else if (diff > 0) {
        vel.X.SetFromRaw(vel.X.Raw + diff);
      }
    } else {
      const diff = absWalkMaxSpeed + vel.X.Raw;
      if (diff >= -impulse) {
        vel.X.SetFromRaw(vel.X.Raw + impulse);
      } else if (diff > 0) {
        vel.X.SetFromRaw(vel.X.Raw - diff);
      }
    }
  },
  OnExit: (p: Player, w: World) => {}
};

export const WalkNode: FSMNode = {
  State: Walk,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.IDLE_GE, sId: STATE_IDS.IDLE_S },
    { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.DOWN_GE, sId: STATE_IDS.CROUCH_S },
    { geId: GAME_EVENT_IDS.GUARD_GE, sId: STATE_IDS.SHIELD_RAISE_S },
    { geId: GAME_EVENT_IDS.GRAB_GE, sId: STATE_IDS.GRAB_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S }
  ],
  Conditions: [
    Conditions.WalkToTurn,
    Conditions.WalkToDash,
    Conditions.ToSideSpecial,
    Conditions.ToSideCharge,
    Conditions.ToDownCharge,
    Conditions.ToUpCharge,
    Conditions.ToSideTilt,
    Conditions.ToStickJumpSquat
  ],
  DefaultConditions: []
};
