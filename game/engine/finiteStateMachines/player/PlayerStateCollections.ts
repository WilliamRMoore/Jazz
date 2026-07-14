import { AirDodgeNode } from './states/airDodge';
import { BackThrowNode } from './states/backThrow';
import { BAirAttackNode } from './states/bAirAttack';
import { CrouchNode } from './states/crouch';
import { DAirAttackNode } from './states/dAirAttack';
import { DashNode } from './states/dash';
import { DashAttackNode } from './states/dashAttack';
import { DashTurnNode } from './states/dashTurn';
import { DirtNapNode } from './states/dirtNap';
import { DizzyNode } from './states/dizzy';
import { DownChargeNode } from './states/downCharge';
import { DownChargeExNode } from './states/downChargeEx';
import { DownSpecialNode } from './states/downSpecial';
import { DownSpecialAerialNode } from './states/downSpecialAerial';
import { DownThrowNode } from './states/downThrow';
import { DownTiltNode } from './states/downTilt';
import { FAerialAttackNode } from './states/fAerialAttack';
import { ForwardThrowNode } from './states/forwardThrow';
import { GetUpNode } from './states/getUp';
import { GetUpAttackNode } from './states/getUpAttack';
import { GetUpRollBackNode } from './states/getUpRollBack';
import { GetUpRollForwardNode } from './states/getUpRollForward';
import { GrabEscapeNode } from './states/grabEscape';
import { GrabReleaseNode } from './states/grabRelease';
import { GroundSlamNode } from './states/groundSlam';
import { HeldNode } from './states/held';
import { HelplessNode } from './states/helpless';
import { HitFlinchNode } from './states/hitFlinch';
import { HitSlideNode } from './states/hitSlide';
import { HitStopNode } from './states/hitStop';
import { HoldNode } from './states/hold';
import { IdleNode } from './states/idle';
import { JumpNode } from './states/jump';
import { JumpSquatNode } from './states/jumpSquat';
import { LandNode } from './states/land';
import { LaunchNode } from './states/launch';
import { LedgeAttackNode } from './states/ledgeAttack';
import { LedgeGetUpNode } from './states/ledgeGetUp';
import { LedgeGrabNode } from './states/ledgeGrab';
import { LedgeRollNode } from './states/ledgeRoll';
import { NAerialAttackNode } from './states/nAerialAttack';
import { NAttackNode } from './states/nAttack';
import { NeutralFallNode } from './states/neutralFall';
import { NeutralSpecialNode } from './states/neutralSpecial';
import { NuetralGrabNode } from './states/nuetralGrab';
import { PummelNode } from './states/pummel';
import { RollDodgeNode } from './states/rollDodge';
import { RollTechNode } from './states/rollTech';
import { RunNode } from './states/run';
import { RunStopNode } from './states/runStop';
import { RunTurnNode } from './states/runTurn';
import { ShieldNode } from './states/shield';
import { ShieldBreakNode } from './states/shieldBreak';
import { ShieldBreakLandNode } from './states/shieldBreakLand';
import { ShieldBreakTumbleNode } from './states/shieldBreakTumble';
import { ShieldDropNode } from './states/shieldDrop';
import { ShieldRaiseNode } from './states/shieldRaise';
import { SideChargeNode } from './states/sideCharge';
import { SideChargeExNode } from './states/sideChargeEx';
import { SideSpecialNode } from './states/sideSpecial';
import { SideSpecialAirNode } from './states/sideSpecialAir';
import { SideSpecialExtensionNode } from './states/sideSpecialExtension';
import { SideSpecialExtensionAirNode } from './states/sideSpecialExtensionAir';
import { SideTiltNode } from './states/sideTilt';
import { SoftLandNode } from './states/softLand';
import { SpotDodgeNode } from './states/spotDodge';
import { TechInPlaceNode } from './states/techInPlace';
import { TumbleNode } from './states/tumble';
import { TurnNode } from './states/turn';
import { UAirAttackNode } from './states/uAirAttack';
import { UpChargeNode } from './states/upCharge';
import { UpChargeExNode } from './states/upChargeEx';
import { UpSpecialNode } from './states/upSpecial';
import { UpThrowNode } from './states/upThrow';
import { UpTiltNode } from './states/upTilt';
import { WalkNode } from './states/walk';
import { WallKickNode } from './states/wallKick';
import { WallSlamNode } from './states/wallSlam';

import { condition } from './conditions';
import { FSMState } from './PlayerStateMachine';
import { ATTACK_IDS, AttackId, GAME_EVENT_IDS, GameEventId, GRAB_IDS, GrabId, StateId } from './shared';

export class ActionStateMappings {
  private readonly mappings = new Map<GameEventId, StateId>();
  private condtions?: Array<condition>;
  private defaultConditions?: Array<condition>;

  public GetMapping(geId: GameEventId): StateId | undefined {
    return this.mappings.get(geId);
  }

  public GetConditions(): Array<condition> | undefined {
    return this.condtions;
  }

  public GetDefaults(): Array<condition> | undefined {
    return this.defaultConditions;
  }

  public SetMappings(mappingsArray: { geId: GameEventId; sId: StateId }[]) {
    mappingsArray.forEach((actSt) => {
      this.mappings.set(actSt.geId, actSt.sId);
    });
  }

  public SetConditions(conditions: Array<condition>) {
    this.condtions = conditions;
  }

  public SetDefaults(conditions: Array<condition>) {
    this.defaultConditions = conditions;
  }
}

export type FSMNode = {
  State: FSMState;
  DirectTransitions: { geId: GameEventId; sId: StateId }[];
  Conditions: Array<condition>;
  DefaultConditions: Array<condition>;
};

const AllNodes = [
  IdleNode,
  WalkNode,
  TurnNode,
  DashNode,
  DashTurnNode,
  RunNode,
  RunTurnNode,
  RunStopNode,
  JumpSquatNode,
  JumpNode,
  NeutralFallNode,
  LandNode,
  SoftLandNode,
  LedgeGrabNode,
  LedgeGetUpNode,
  LedgeAttackNode,
  LedgeRollNode,
  AirDodgeNode,
  HelplessNode,
  HitStopNode,
  LaunchNode,
  TumbleNode,
  CrouchNode,
  ShieldRaiseNode,
  ShieldNode,
  SpotDodgeNode,
  RollDodgeNode,
  ShieldDropNode,
  NAttackNode,
  DashAttackNode,
  DownTiltNode,
  SideTiltNode,
  UpTiltNode,
  SideChargeNode,
  SideChargeExNode,
  UpChargeNode,
  UpChargeExNode,
  DownChargeNode,
  DownChargeExNode,
  PummelNode,
  GetUpAttackNode,
  NAerialAttackNode,
  FAerialAttackNode,
  UAirAttackNode,
  BAirAttackNode,
  DAirAttackNode,
  NeutralSpecialNode,
  SideSpecialNode,
  SideSpecialExtensionNode,
  SideSpecialAirNode,
  SideSpecialExtensionAirNode,
  DownSpecialNode,
  DownSpecialAerialNode,
  UpSpecialNode,
  NuetralGrabNode,
  HoldNode,
  HeldNode,
  GrabReleaseNode,
  GrabEscapeNode,
  ShieldBreakNode,
  ShieldBreakTumbleNode,
  ShieldBreakLandNode,
  DizzyNode,
  WallKickNode,
  HitSlideNode,
  HitFlinchNode,
  ForwardThrowNode,
  BackThrowNode,
  UpThrowNode,
  DownThrowNode,
  GroundSlamNode,
  WallSlamNode,
  DirtNapNode,
  GetUpNode,
  GetUpRollForwardNode,
  GetUpRollBackNode,
  TechInPlaceNode,
  RollTechNode,
];

export const ActionMappings = new Map<StateId, ActionStateMappings>();
export const FSMStates = new Map<StateId, FSMState>();

for (const node of AllNodes) {
  FSMStates.set(node.State.StateId, node.State);
  
  const mappings = new ActionStateMappings();
  mappings.SetMappings(node.DirectTransitions);
  if (node.Conditions && node.Conditions.length > 0) {
    mappings.SetConditions(node.Conditions);
  }
  if (node.DefaultConditions && node.DefaultConditions.length > 0) {
    mappings.SetDefaults(node.DefaultConditions);
  }
  ActionMappings.set(node.State.StateId, mappings);
}

// Keeping original Attack and Grab mappings
export const AttackGameEventMappings = new Map<GameEventId, AttackId>()
  .set(GAME_EVENT_IDS.ATTACK_GE, ATTACK_IDS.N_GRND_ATK)
  .set(GAME_EVENT_IDS.SIDE_CHARGE_GE, ATTACK_IDS.S_CHARGE_ATK)
  .set(GAME_EVENT_IDS.SIDE_CHARGE_EX_GE, ATTACK_IDS.S_CHARGE_EX_ATK)
  .set(GAME_EVENT_IDS.UP_CHARGE_GE, ATTACK_IDS.U_CHARGE_ATK)
  .set(GAME_EVENT_IDS.UP_CHARGE_EX_GE, ATTACK_IDS.U_CHARGE_EX_ATK)
  .set(GAME_EVENT_IDS.DOWN_CHARGE_GE, ATTACK_IDS.D_CHARGE_ATK)
  .set(GAME_EVENT_IDS.DOWN_CHARGE_EX_GE, ATTACK_IDS.D_CHARGE_EX_ATK)
  .set(GAME_EVENT_IDS.DASH_ATTACK_GE, ATTACK_IDS.DASH_ATK)
  .set(GAME_EVENT_IDS.D_TILT_GE, ATTACK_IDS.D_TILT_ATK)
  .set(GAME_EVENT_IDS.S_TILT_GE, ATTACK_IDS.S_TILT_ATK)
  .set(GAME_EVENT_IDS.S_TILT_U_GE, ATTACK_IDS.S_TILT_U_ATK)
  .set(GAME_EVENT_IDS.S_TILT_D_GE, ATTACK_IDS.S_TITL_D_ATK)
  .set(GAME_EVENT_IDS.U_TILT_GE, ATTACK_IDS.U_TILT_ATK)
  .set(GAME_EVENT_IDS.N_AIR_GE, ATTACK_IDS.N_AIR_ATK)
  .set(GAME_EVENT_IDS.F_AIR_GE, ATTACK_IDS.F_AIR_ATK)
  .set(GAME_EVENT_IDS.U_AIR_GE, ATTACK_IDS.U_AIR_ATK)
  .set(GAME_EVENT_IDS.B_AIR_GE, ATTACK_IDS.B_AIR_ATK)
  .set(GAME_EVENT_IDS.D_AIR_GE, ATTACK_IDS.D_AIR_ATK)
  .set(GAME_EVENT_IDS.SPCL_GE, ATTACK_IDS.N_SPCL_ATK)
  .set(GAME_EVENT_IDS.SIDE_SPCL_GE, ATTACK_IDS.S_SPCL_ATK)
  .set(GAME_EVENT_IDS.SIDE_SPCL_EX_GE, ATTACK_IDS.S_SPCL_EX_ATK)
  .set(GAME_EVENT_IDS.S_SPCL_AIR_GE, ATTACK_IDS.S_SPCL_AIR_ATK)
  .set(GAME_EVENT_IDS.S_SPCL_EX_AIR_GE, ATTACK_IDS.S_SPCL_EX_AIR_ATK)
  .set(GAME_EVENT_IDS.DOWN_SPCL_GE, ATTACK_IDS.D_SPCL_ATK)
  .set(GAME_EVENT_IDS.D_SPCL_AIR_GE, ATTACK_IDS.D_SPCL_AIR_ATK)
  .set(GAME_EVENT_IDS.UP_SPCL_GE, ATTACK_IDS.U_SPCL_ATK)
  .set(GAME_EVENT_IDS.PUMMEL_GE, ATTACK_IDS.PUMMEL_ATK)
  .set(GAME_EVENT_IDS.GETUP_ATTACK_GE, ATTACK_IDS.GETUP_ATTACK_ATK)
  .set(GAME_EVENT_IDS.LEDGE_ATTACK_GE, ATTACK_IDS.LEDGE_ATTACK_ATK);

export const GrabGameEventMappings = new Map<GameEventId, GrabId>()
  .set(GAME_EVENT_IDS.GRAB_GE, GRAB_IDS.GRAB_G)
  .set(GAME_EVENT_IDS.RUN_GRAB_GE, GRAB_IDS.RUN_GRAB_G)
  .set(GAME_EVENT_IDS.SPCL_GRAB_GE, GRAB_IDS.SPCL_GRAB_G);
