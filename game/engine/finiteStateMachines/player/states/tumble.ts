import { Player } from '../../../entity/playerOrchestrator';
import { DivideRaw, MultiplyRaw } from '../../../math/fixedPoint';
import { TWO } from '../../../math/numberConstants';
import { World } from '../../../world/world';
import * as Conditions from '../conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from '../shared';

export const Tumble: FSMState = {
  StateName: 'Tumble',
  StateId: STATE_IDS.TUMBLE_S,
  OnEnter: (p: Player, w: World) => {
    p.Jump.ResetJumps();
    p.Jump.IncrementJumps();
  },
  OnUpdate: (p: Player, w: World) => {
    const curFrame = w.LocalFrame;
    const ia = w.PlayerData.InputStore(p.ID).GetInputForFrame(curFrame);
    const speeds = p.Speeds;
    const airSpeedRaw = speeds.AerialSpeedInpulseLimitRaw;
    const airMultRaw = speeds.ArielVelocityMultiplierRaw;
    const inputXMult = MultiplyRaw(ia.LXAxis.Raw, airMultRaw);
    const inputHalf = DivideRaw(inputXMult, TWO);
    p.Velocity.AddClampedXImpulseRaw(airSpeedRaw, inputHalf);
  },
  OnExit: (p: Player, w: World) => {}
};

export const TumbleNode: FSMNode = {
  State: Tumble,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
    { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.LAND_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S }
  ],
  Conditions: [Conditions.ToJump],
  DefaultConditions: []
};
