import { Player } from '../../../entity/playerOrchestrator';
import { POINT_FIVE, POINT_TWO_FIVE, TEN } from '../../../math/numberConstants';
import { World } from '../../../world/world';
import * as Conditions from '../conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from '../shared';

export const Launch: FSMState = {
  StateName: 'Launch',
  StateId: STATE_IDS.LAUNCH_S,
  OnEnter: (p: Player, w: World) => {
    const pVel = p.Velocity;
    const hitStun = p.HitStun;
    pVel.X = hitStun.VX;
    pVel.Y = hitStun.VY;
    if (p.Jump.OnFirstJump()) {
      p.Jump.IncrementJumps();
    }
    const pos = p.Position;
    pos.Y.AddRaw(-TEN);
  },
  OnUpdate: (p: Player, w: World) => {
    const lastTechFrame = p.Flags.LastTechFrame;
    const currentFrame = w.LocalFrame;
    if (currentFrame - lastTechFrame >= 40) {
      const is = w.PlayerData.InputStore(p.ID);
      const ia = is.GetInputForFrame(currentFrame);
      const lastIa = is.GetInputForFrame(w.PreviousFrame);
      if (
        (ia.LTValRaw >= POINT_FIVE || ia.RTValRaw >= POINT_FIVE) &&
        lastIa.LTValRaw < POINT_TWO_FIVE &&
        lastIa.RTValRaw < POINT_TWO_FIVE
      ) {
        p.Flags.SetLastTechFrame(currentFrame);
      }
    }
    if (p) p.HitStun.DecrementHitStun();
  },
  OnExit: (p, w) => {
    p.HitStun.Zero();
  }
};

export const LaunchNode: FSMNode = {
  State: Launch,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.TECH_IN_PLACE_GE, sId: STATE_IDS.TECH_IN_PLACE_S },
    { geId: GAME_EVENT_IDS.ROLL_TECH_GE, sId: STATE_IDS.ROLL_TECH_S },
    { geId: GAME_EVENT_IDS.WALL_SLAM_GE, sId: STATE_IDS.WALL_SLAM_S },
    { geId: GAME_EVENT_IDS.GRND_SLAM_GE, sId: STATE_IDS.GRND_SLAM_S }
  ],
  Conditions: [Conditions.LaunchToTumble],
  DefaultConditions: []
};
