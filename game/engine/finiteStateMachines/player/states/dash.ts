import { Player } from '../../../entity/playerOrchestrator';
import { MultiplyRaw } from '../../../math/fixedPoint';
import { World } from '../../../world/world';
import * as Conditions from './conditions/conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { STATE_IDS, GAME_EVENT_IDS } from './shared';

export const Dash: FSMState = {
  StateName: 'DASH',
  StateId: STATE_IDS.DASH_S,
  OnEnter: (p: Player, w: World) => {
    const flags = p.Flags;
    const MaxDashSpeedRaw = p.Speeds.MaxDashSpeedRaw;
    const absMaxDashRaw = Math.abs(MaxDashSpeedRaw);
    const impulse = flags.IsFacingRight
      ? absMaxDashRaw //Math.floor(MaxDashSpeedRaw / 0.33)
      : -absMaxDashRaw; //-Math.floor(MaxDashSpeedRaw / 0.33);
    // if we want to moon walk, we probably want to let the play have unlimited speed backwards, would need to re-works this.
    p.Velocity.AddClampedXImpulseRaw(MaxDashSpeedRaw, impulse);
  },
  OnUpdate: (p: Player, w: World) => {
    const inputStore = w.PlayerData.InputStore(p.ID);
    const curFrame = w.LocalFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const speedsComp = p.Speeds;
    const dashSpeedMultiplierRaw = speedsComp.DashMultiplierRaw;
    const impulse = MultiplyRaw(ia?.LXAxis.Raw ?? 0, dashSpeedMultiplierRaw);
    p.Velocity.AddClampedXImpulseRaw(speedsComp.MaxDashSpeedRaw, impulse);
  },
  OnExit: (p: Player, w: World) => {}
};

export const DashNode: FSMNode = {
  State: Dash,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
    { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S }
  ],
  Conditions: [
    Conditions.DashToTurn,
    Conditions.ToSideSpecial,
    Conditions.ToUpSpecial,
    Conditions.RunToDashAttack,
    Conditions.ToStickJumpSquat
  ],
  DefaultConditions: [Conditions.DashDefaultRun, Conditions.defaultIdle]
};
