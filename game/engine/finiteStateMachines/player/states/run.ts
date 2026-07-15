import { Player } from '../../../entity/playerOrchestrator';
import { MultiplyRaw } from '../../../math/fixedPoint';
import { World } from '../../../world/world';
import * as Conditions from './conditions/conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from './shared';

export const Run: FSMState = {
  StateName: 'RUN',
  StateId: STATE_IDS.RUN_S,
  OnEnter: (p: Player, w: World) => {},
  OnUpdate: (p: Player, w: World) => {
    const speeds = p.Speeds;
    const vel = p.Velocity;
    const absRunMaxSpeed = Math.abs(speeds.MaxRunSpeedRaw);
    const absXVel = Math.abs(vel.X.Raw);
    if (absXVel >= absRunMaxSpeed) {
      return;
    }
    const isFacingRight = p.Flags.IsFacingRight;
    const inputStore = w.PlayerData.InputStore(p.ID);
    const curFrame = w.LocalFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const impulse = MultiplyRaw(ia.LXAxis.Raw, speeds.RunSpeedMultiplierRaw);
    if (isFacingRight) {
      const diff = absRunMaxSpeed - vel.X.Raw;
      if (diff >= impulse) {
        vel.X.SetFromRaw(vel.X.Raw + impulse);
      } else if (diff > 0) {
        vel.X.SetFromRaw(vel.X.Raw + diff);
      }
    } else {
      const diff = absRunMaxSpeed + vel.X.Raw;
      if (diff >= -impulse) {
        vel.X.SetFromRaw(vel.X.Raw + impulse);
      } else if (diff > 0) {
        vel.X.SetFromRaw(vel.X.Raw - diff);
      }
    }
  },
  OnExit: (p: Player, w: World) => {}
};

export const RunNode: FSMNode = {
  State: Run,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
    { geId: GAME_EVENT_IDS.IDLE_GE, sId: STATE_IDS.STOP_RUN_S },
    { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.DOWN_GE, sId: STATE_IDS.CROUCH_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S }
  ],
  Conditions: [
    Conditions.RunToTurn,
    Conditions.ToSideSpecial,
    Conditions.ToUpSpecial,
    Conditions.RunToDashAttack,
    Conditions.RunToRunStopByGuard,
    Conditions.ToStickJumpSquat
  ],
  DefaultConditions: []
};
