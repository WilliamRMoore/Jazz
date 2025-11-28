import { FSMState } from './PlayerStateMachine';
import {
  InitIdleRelations,
  InitShieldRaiseRelations,
  InitShieldRelations,
  InitShieldDropRelations,
  InitSpotDodgeRelations,
  InitRollDodgeRelations,
  InitTurnRelations,
  InitWalkRelations,
  InitDashRelations,
  InitDashTurnRelations,
  InitRunRelations,
  InitRunTurnRelations,
  InitStopRunRelations,
  InitJumpSquatRelations,
  InitJumpRelations,
  InitNeutralFallRelations,
  InitLandRelations,
  InitSoftLandRelations,
  InitLedgeGrabRelations,
  InitAirDodgeRelations,
  InitHelpessRelations,
  InitAttackRelations,
  InitSideChargeRelations,
  InitSideChargeExRelations,
  InitDownTiltRelations,
  InitUpTiltRelations,
  InitSideTiltRelations,
  InitDashAttackRelations,
  InitAirAttackRelations,
  InitFAirAttackRelations,
  InitUAirRelations,
  InitBAirRelations,
  InitDAirRelations,
  InitNSpecialRelations,
  InitSideSpecialRelations,
  InitSideSpecialExtensionRelations,
  InitSideSpecialAirRelations,
  InitSideSpecialExAirRelations,
  InitDownSpecialRelations,
  InitDownSpecialAirRelations,
  InitUpSpecialRelations,
  InitHitStopRelations,
  InitTumbleRelations,
  InitLaunchRelations,
  InitCrouchRelations,
  InitUpChargeRelations,
  InitiUpChargeExRelations,
  InitDownChargeRelations,
  InitDownChargeExRelations,
  ActionStateMappings,
} from './stateConfigurations/relationshipMappings';
import {
  StateId,
  GameEventId,
  AttackId,
  GAME_EVENT_IDS,
  ATTACK_IDS,
} from './stateConfigurations/shared';
import {
  Idle,
  SpotDodge,
  RollDodge,
  ShieldRaise,
  Shield,
  ShieldDrop,
  Turn,
  Walk,
  Run,
  RunTurn,
  RunStop,
  Dash,
  DashTurn,
  JumpSquat,
  Jump,
  NeutralFall,
  Land,
  SoftLand,
  LedgeGrab,
  AirDodge,
  Helpless,
  NAttack,
  SideCharge,
  SideChargeEx,
  SideTilt,
  UpCharge,
  UpChargeEx,
  DownCharge,
  DownChargeEx,
  DashAttack,
  NAerialAttack,
  FAerialAttack,
  UAirAttack,
  BAirAttack,
  DAirAttack,
  NeutralSpecial,
  SideSpecial,
  SideSpecialExtension,
  SideSpecialAir,
  SideSpecialExtensionAir,
  DownSpecial,
  DownSpecialAerial,
  UpSpecial,
  HitStop,
  Tumble,
  Launch,
  Crouch,
  DownTilt,
  UpTilt,
} from './stateConfigurations/states';

const IDLE_STATE_RELATIONS = InitIdleRelations();
const SHIELD_RAISE_RELATIONS = InitShieldRaiseRelations();
const SHIELD_RELATIONS = InitShieldRelations();
const SHIELD_DROP_RELATIONS = InitShieldDropRelations();
const SPOT_DODGE_RELATIONS = InitSpotDodgeRelations();
const ROLL_DODGE_RELATIONS = InitRollDodgeRelations();
const TURN_RELATIONS = InitTurnRelations();
const WALK_RELATIONS = InitWalkRelations();
const DASH_RELATIONS = InitDashRelations();
const DASH_TURN_RELATIONS = InitDashTurnRelations();
const RUN_RELATIONS = InitRunRelations();
const RUN_TURN_RELATIONS = InitRunTurnRelations();
const STOP_RUN_RELATIONS = InitStopRunRelations();
const JUMP_SQUAT_RELATIONS = InitJumpSquatRelations();
const JUMP_RELATIONS = InitJumpRelations();
const NFALL_RELATIONS = InitNeutralFallRelations();
const LAND_RELATIONS = InitLandRelations();
const SOFT_LAND_RELATIONS = InitSoftLandRelations();
const LEDGE_GRAB_RELATIONS = InitLedgeGrabRelations();
const AIR_DODGE_RELATIONS = InitAirDodgeRelations();
const HELPESS_RELATIONS = InitHelpessRelations();
const ATTACK_RELATIONS = InitAttackRelations();
const SIDE_CHARGE_RELATIONS = InitSideChargeRelations();
const SIDE_CHARGE_EX_RELATIONS = InitSideChargeExRelations();
const DOWN_TILT_RELATIONS = InitDownTiltRelations();
const UP_TILT_RELATIONS = InitUpTiltRelations();
const SIDE_TILT_RELATIONS = InitSideTiltRelations();
const DASH_ATK_RELATIONS = InitDashAttackRelations();
const AIR_ATK_RELATIONS = InitAirAttackRelations();
const F_AIR_ATK_RELATIONS = InitFAirAttackRelations();
const U_AIR_ATK_RELATIONS = InitUAirRelations();
const B_AIR_ATK_RELATIONS = InitBAirRelations();
const D_AIR_ATK_RELATIONS = InitDAirRelations();
const N_SPECIAL_ATK_RELATIONS = InitNSpecialRelations();
const SIDE_SPCL_RELATIONS = InitSideSpecialRelations();
const SIDE_SPCL_EX_RELATIONS = InitSideSpecialExtensionRelations();
const SIDE_SPCL_AIR_RELATIONS = InitSideSpecialAirRelations();
const SIDE_SPCL_AIR_EX_RELATIONS = InitSideSpecialExAirRelations();
const DOWN_SPECIAL_RELATIONS = InitDownSpecialRelations();
const DOWN_SPECIAL_AIR_RELATIONS = InitDownSpecialAirRelations();
const UP_SPECIAL_RELATIONS = InitUpSpecialRelations();
const HIT_STOP_RELATIONS = InitHitStopRelations();
const TUMBLE_RELATIONS = InitTumbleRelations();
const LAUNCH_RELATIONS = InitLaunchRelations();
const CROUCH_RELATIONS = InitCrouchRelations();
const UP_CHARGE_RELATIONS = InitUpChargeRelations();
const UP_CHARGE_EX_RELATIONS = InitiUpChargeExRelations();
const DOWN_CHARGE_RELATIONS = InitDownChargeRelations();
const DOWN_CHARGE_EX_RELATIONS = InitDownChargeExRelations();

export const ActionMappings = new Map<StateId, ActionStateMappings>()
  .set(IDLE_STATE_RELATIONS.stateId, IDLE_STATE_RELATIONS.mappings)
  .set(SPOT_DODGE_RELATIONS.stateId, SPOT_DODGE_RELATIONS.mappings)
  .set(ROLL_DODGE_RELATIONS.stateId, ROLL_DODGE_RELATIONS.mappings)
  .set(SHIELD_RAISE_RELATIONS.stateId, SHIELD_RAISE_RELATIONS.mappings)
  .set(SHIELD_RELATIONS.stateId, SHIELD_RELATIONS.mappings)
  .set(SHIELD_DROP_RELATIONS.stateId, SHIELD_DROP_RELATIONS.mappings)
  .set(TURN_RELATIONS.stateId, TURN_RELATIONS.mappings)
  .set(WALK_RELATIONS.stateId, WALK_RELATIONS.mappings)
  .set(DASH_RELATIONS.stateId, DASH_RELATIONS.mappings)
  .set(DASH_TURN_RELATIONS.stateId, DASH_TURN_RELATIONS.mappings)
  .set(RUN_RELATIONS.stateId, RUN_RELATIONS.mappings)
  .set(RUN_TURN_RELATIONS.stateId, RUN_TURN_RELATIONS.mappings)
  .set(STOP_RUN_RELATIONS.stateId, STOP_RUN_RELATIONS.mappings)
  .set(JUMP_SQUAT_RELATIONS.stateId, JUMP_SQUAT_RELATIONS.mappings)
  .set(JUMP_RELATIONS.stateId, JUMP_RELATIONS.mappings)
  .set(NFALL_RELATIONS.stateId, NFALL_RELATIONS.mappings)
  .set(LAND_RELATIONS.stateId, LAND_RELATIONS.mappings)
  .set(SOFT_LAND_RELATIONS.stateId, SOFT_LAND_RELATIONS.mappings)
  .set(LEDGE_GRAB_RELATIONS.stateId, LEDGE_GRAB_RELATIONS.mappings)
  .set(AIR_DODGE_RELATIONS.stateId, AIR_DODGE_RELATIONS.mappings)
  .set(HELPESS_RELATIONS.stateId, HELPESS_RELATIONS.mappings)
  .set(ATTACK_RELATIONS.stateId, ATTACK_RELATIONS.mappings)
  .set(SIDE_CHARGE_RELATIONS.stateId, SIDE_CHARGE_RELATIONS.mappings)
  .set(SIDE_CHARGE_EX_RELATIONS.stateId, SIDE_CHARGE_EX_RELATIONS.mappings)
  .set(UP_CHARGE_RELATIONS.stateId, UP_CHARGE_RELATIONS.mappings)
  .set(UP_CHARGE_EX_RELATIONS.stateId, UP_CHARGE_EX_RELATIONS.mappings)
  .set(DOWN_CHARGE_RELATIONS.stateId, DOWN_CHARGE_RELATIONS.mappings)
  .set(DOWN_CHARGE_EX_RELATIONS.stateId, DOWN_CHARGE_EX_RELATIONS.mappings)
  .set(DOWN_TILT_RELATIONS.stateId, DOWN_TILT_RELATIONS.mappings)
  .set(UP_TILT_RELATIONS.stateId, UP_TILT_RELATIONS.mappings)
  .set(SIDE_TILT_RELATIONS.stateId, SIDE_TILT_RELATIONS.mappings)
  .set(DASH_ATK_RELATIONS.stateId, DASH_ATK_RELATIONS.mappings)
  .set(AIR_ATK_RELATIONS.stateId, AIR_ATK_RELATIONS.mappings)
  .set(F_AIR_ATK_RELATIONS.stateId, F_AIR_ATK_RELATIONS.mappings)
  .set(U_AIR_ATK_RELATIONS.stateId, U_AIR_ATK_RELATIONS.mappings)
  .set(B_AIR_ATK_RELATIONS.stateId, B_AIR_ATK_RELATIONS.mappings)
  .set(D_AIR_ATK_RELATIONS.stateId, D_AIR_ATK_RELATIONS.mappings)
  .set(DOWN_SPECIAL_RELATIONS.stateId, DOWN_SPECIAL_RELATIONS.mappings)
  .set(DOWN_SPECIAL_AIR_RELATIONS.stateId, DOWN_SPECIAL_AIR_RELATIONS.mappings)
  .set(N_SPECIAL_ATK_RELATIONS.stateId, N_SPECIAL_ATK_RELATIONS.mappings)
  .set(SIDE_SPCL_RELATIONS.stateId, SIDE_SPCL_RELATIONS.mappings)
  .set(SIDE_SPCL_EX_RELATIONS.stateId, SIDE_SPCL_EX_RELATIONS.mappings)
  .set(SIDE_SPCL_AIR_RELATIONS.stateId, SIDE_SPCL_AIR_RELATIONS.mappings)
  .set(SIDE_SPCL_AIR_EX_RELATIONS.stateId, SIDE_SPCL_AIR_EX_RELATIONS.mappings)
  .set(UP_SPECIAL_RELATIONS.stateId, UP_SPECIAL_RELATIONS.mappings)
  .set(HIT_STOP_RELATIONS.stateId, HIT_STOP_RELATIONS.mappings)
  .set(TUMBLE_RELATIONS.stateId, TUMBLE_RELATIONS.mappings)
  .set(LAUNCH_RELATIONS.stateId, LAUNCH_RELATIONS.mappings)
  .set(CROUCH_RELATIONS.stateId, CROUCH_RELATIONS.mappings);

export const FSMStates = new Map<StateId, FSMState>()
  .set(Idle.StateId, Idle)
  .set(SpotDodge.StateId, SpotDodge)
  .set(RollDodge.StateId, RollDodge)
  .set(ShieldRaise.StateId, ShieldRaise)
  .set(Shield.StateId, Shield)
  .set(ShieldDrop.StateId, ShieldDrop)
  .set(Turn.StateId, Turn)
  .set(Walk.StateId, Walk)
  .set(Run.StateId, Run)
  .set(RunTurn.StateId, RunTurn)
  .set(RunStop.StateId, RunStop)
  .set(Dash.StateId, Dash)
  .set(DashTurn.StateId, DashTurn)
  .set(JumpSquat.StateId, JumpSquat)
  .set(Jump.StateId, Jump)
  .set(NeutralFall.StateId, NeutralFall)
  .set(Land.StateId, Land)
  .set(SoftLand.StateId, SoftLand)
  .set(LedgeGrab.StateId, LedgeGrab)
  .set(AirDodge.StateId, AirDodge)
  .set(Helpless.StateId, Helpless)
  .set(NAttack.StateId, NAttack)
  .set(SideCharge.StateId, SideCharge)
  .set(SideChargeEx.StateId, SideChargeEx)
  .set(SideTilt.StateId, SideTilt)
  .set(UpCharge.StateId, UpCharge)
  .set(UpChargeEx.StateId, UpChargeEx)
  .set(DownCharge.StateId, DownCharge)
  .set(DownChargeEx.StateId, DownChargeEx)
  .set(DashAttack.StateId, DashAttack)
  .set(NAerialAttack.StateId, NAerialAttack)
  .set(FAerialAttack.StateId, FAerialAttack)
  .set(UAirAttack.StateId, UAirAttack)
  .set(BAirAttack.StateId, BAirAttack)
  .set(DAirAttack.StateId, DAirAttack)
  .set(NeutralSpecial.StateId, NeutralSpecial)
  .set(SideSpecial.StateId, SideSpecial)
  .set(SideSpecialExtension.StateId, SideSpecialExtension)
  .set(SideSpecialAir.StateId, SideSpecialAir)
  .set(SideSpecialExtensionAir.StateId, SideSpecialExtensionAir)
  .set(DownSpecial.StateId, DownSpecial)
  .set(DownSpecialAerial.StateId, DownSpecialAerial)
  .set(UpSpecial.StateId, UpSpecial)
  .set(HitStop.StateId, HitStop)
  .set(Tumble.StateId, Tumble)
  .set(Launch.StateId, Launch)
  .set(Crouch.StateId, Crouch)
  .set(DownTilt.StateId, DownTilt)
  .set(UpTilt.StateId, UpTilt);

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
  .set(GAME_EVENT_IDS.UP_SPCL_GE, ATTACK_IDS.U_SPCL_ATK);
