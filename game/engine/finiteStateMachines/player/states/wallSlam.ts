import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from './conditions/conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from './shared';

export const WallSlam: FSMState = {
  StateName: 'WallSlam',
  StateId: STATE_IDS.WALL_SLAM_S,
  OnEnter: (p: Player, w: World) => {},
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {}
};

export const WallSlamNode: FSMNode = {
  State: WallSlam,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.GRND_SLAM_S },
    { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.GRND_SLAM_S }
  ],
  Conditions: [],
  DefaultConditions: [Conditions.defaultTumble]
};
