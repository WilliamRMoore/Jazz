import { Player } from '../../../entity/playerOrchestrator';
import { MultiplyRaw, NumberToRaw } from '../../../math/fixedPoint';
import { World } from '../../../world/world';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from './shared';

const POINT_SIX = NumberToRaw(0.6);

export const Helpless: FSMState = {
  StateName: 'Helpless',
  StateId: STATE_IDS.HELPLESS_S,
  OnEnter: (p: Player, w: World) => {},
  OnUpdate: (p: Player, w: World) => {
    const inputStore = w.PlayerData.InputStore(p.ID);
    const curFrame = w.LocalFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const speeds = p.Speeds;
    const airSpeedRaw = MultiplyRaw(
      speeds.AerialSpeedInpulseLimitRaw,
      POINT_SIX
    );
    const airMultRaw = MultiplyRaw(
      speeds.ArielVelocityMultiplierRaw,
      POINT_SIX
    );
    p.Velocity.AddClampedXImpulseRaw(
      airSpeedRaw,
      MultiplyRaw(ia!.LXAxis.Raw, airMultRaw)
    );
  },
  OnExit: (p: Player, w: World) => {}
};

export const HelplessNode: FSMNode = {
  State: Helpless,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
    { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.SOFT_LAND_S },
    { geId: GAME_EVENT_IDS.LEDGE_GRAB_GE, sId: STATE_IDS.LEDGE_GRAB_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S }
  ],
  Conditions: [],
  DefaultConditions: []
};
