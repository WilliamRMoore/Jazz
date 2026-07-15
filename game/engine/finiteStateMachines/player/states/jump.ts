import {
  AddToPlayerYPositionRaw,
  Player
} from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from './conditions/conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { STATE_IDS, GAME_EVENT_IDS } from './shared';

export const Jump: FSMState = {
  StateName: 'JUMP',
  StateId: STATE_IDS.JUMP_S,
  OnEnter: (p: Player, w: World) => {
    const jumpComp = p.Jump;
    p.Flags.FastFallOff();
    jumpComp.IncrementJumps();
    AddToPlayerYPositionRaw(p, -p.ECB.YOffset.Raw);
    p.Velocity.Y.SetFromRaw(-p.Jump.JumpVelocity.Raw);
    p.Flags.ZeroDisableLedgeDetection();
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {}
};

export const JumpNode: FSMNode = {
  State: Jump,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S }
  ],
  Conditions: [
    Conditions.ToJump,
    Conditions.ToAirDodge,
    Conditions.ToStickJump
  ],
  DefaultConditions: [Conditions.defaultNFall]
};
