import {
  condition,
  DashDefaultRun,
  DashToTurn,
  defaultDash,
  defaultDownChargeEx,
  DefaultDownTiltToCrouch,
  defaultHelpess,
  defaultIdle,
  defaultJump,
  defaultNFall,
  defaultRun,
  defaultShield,
  defaultSideChargeEx,
  defaultUpChargeEx,
  DownChargeToEx,
  HitStopToLaunch,
  IdleToAttack,
  IdleToDash,
  IdleToDashTurn,
  IdleToTurn,
  IdleToUpTilt,
  LandToIdle,
  LandToTurn,
  LandToWalk,
  LaunchToTumble,
  RunStopToTurn,
  RunToDashAttack,
  RunToRunStopByGuard,
  RunToTurn,
  shieldToShieldDrop,
  SideChargeToEx,
  ToAirDodge,
  ToBAir,
  ToDAir,
  ToDownCharge,
  ToDownSpecial,
  ToDownSpecialAir,
  ToDownTilt,
  ToFAir,
  ToJump,
  ToNair,
  ToNSpecial,
  ToRollDodge,
  ToSideCharge,
  ToSideSpecial,
  ToSideSpecialAir,
  ToSideTilt,
  ToSpotDodge,
  ToUAir,
  ToUpCharge,
  ToUpSpecial,
  TurnDefaultWalk,
  TurnToDash,
  UpChargeToEx,
  WalkToDash,
  WalkToTurn,
} from './conditions';
import { StateId, GameEventId, GAME_EVENT_IDS, STATE_IDS } from './shared';

class StateRelation {
  public readonly stateId: StateId;
  public readonly mappings: ActionStateMappings;

  constructor(stateId: StateId, actionStateTranslations: ActionStateMappings) {
    this.stateId = stateId;
    this.mappings = actionStateTranslations;
  }
}

export class ActionStateMappings {
  private readonly mappings = new Map<GameEventId, StateId>();
  private condtions?: Array<condition>;
  private defaultConditions?: Array<condition>;

  public GetMapping(geId: GameEventId): StateId | undefined {
    return this.mappings.get(geId);
  }

  public GetConditions() {
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

export function InitIdleRelations(): StateRelation {
  const idleTranslations = new ActionStateMappings();

  idleTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.MOVE_GE, sId: STATE_IDS.WALK_S },
    { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
    { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.DOWN_GE, sId: STATE_IDS.CROUCH_S },
    { geId: GAME_EVENT_IDS.GUARD_GE, sId: STATE_IDS.SHIELD_RAISE_S },
    { geId: GAME_EVENT_IDS.GRAB_GE, sId: STATE_IDS.GRAB_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S },
  ]);

  const condtions: Array<condition> = [
    IdleToDash,
    IdleToDashTurn,
    IdleToTurn,
    IdleToAttack,
    ToSideCharge,
    ToUpCharge,
    IdleToUpTilt,
    ToDownCharge,
    ToNSpecial,
    ToSideSpecial,
    ToDownSpecial,
    ToUpSpecial,
  ];

  idleTranslations.SetConditions(condtions);

  const idle = new StateRelation(STATE_IDS.IDLE_S, idleTranslations);
  return idle;
}

export function InitShieldRaiseRelations(): StateRelation {
  const shieldRaiseTranslations = new ActionStateMappings();

  shieldRaiseTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S },
  ]);

  shieldRaiseTranslations.SetConditions([ToSpotDodge, ToRollDodge]);

  shieldRaiseTranslations.SetDefaults([defaultShield]);

  return new StateRelation(STATE_IDS.SHIELD_RAISE_S, shieldRaiseTranslations);
}

export function InitShieldRelations(): StateRelation {
  const translations = new ActionStateMappings();

  translations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S },
    { geId: GAME_EVENT_IDS.GRAB_GE, sId: STATE_IDS.GRAB_S },
  ]);

  translations.SetConditions([shieldToShieldDrop, ToSpotDodge, ToRollDodge]);

  return new StateRelation(STATE_IDS.SHIELD_S, translations);
}

export function InitShieldDropRelations(): StateRelation {
  const translations = new ActionStateMappings();

  translations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S },
  ]);

  translations.SetDefaults([defaultIdle]);

  return new StateRelation(STATE_IDS.SHIELD_DROP_S, translations);
}

export function InitSpotDodgeRelations(): StateRelation {
  const translations = new ActionStateMappings();

  translations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  translations.SetDefaults([defaultIdle]);

  return new StateRelation(STATE_IDS.SPOT_DODGE_S, translations);
}

export function InitRollDodgeRelations(): StateRelation {
  const translations = new ActionStateMappings();
  translations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  translations.SetDefaults([defaultIdle]);

  return new StateRelation(STATE_IDS.ROLL_DODGE_S, translations);
}

export function InitTurnRelations(): StateRelation {
  const turnTranslations = new ActionStateMappings();

  turnTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  const defaultConditions: Array<condition> = [
    TurnDefaultWalk,
    defaultIdle,
    ToSideSpecial,
  ];

  turnTranslations.SetConditions([TurnToDash, ToSideSpecial, ToSideTilt]);

  turnTranslations.SetDefaults(defaultConditions);

  const turnWalk = new StateRelation(STATE_IDS.TURN_S, turnTranslations);

  return turnWalk;
}

export function InitWalkRelations(): StateRelation {
  const walkTranslations = new ActionStateMappings();

  walkTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.IDLE_GE, sId: STATE_IDS.IDLE_S },
    { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.DOWN_GE, sId: STATE_IDS.CROUCH_S },
    { geId: GAME_EVENT_IDS.GUARD_GE, sId: STATE_IDS.SHIELD_RAISE_S },
    { geId: GAME_EVENT_IDS.GRAB_GE, sId: STATE_IDS.GRAB_S },
  ]);

  const conditions: Array<condition> = [
    WalkToTurn,
    WalkToDash,
    ToSideSpecial,
    ToSideCharge,
    ToDownCharge,
    ToUpCharge,
    ToSideTilt,
  ];

  walkTranslations.SetConditions(conditions);

  const walkRelations = new StateRelation(STATE_IDS.WALK_S, walkTranslations);

  return walkRelations;
}

export function InitDashRelations(): StateRelation {
  const dashTranslations = new ActionStateMappings();

  dashTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
    { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  const conditions: Array<condition> = [
    DashToTurn,
    ToSideSpecial,
    ToUpSpecial,
    RunToDashAttack,
  ];

  dashTranslations.SetConditions(conditions);

  const defaultConditions: Array<condition> = [DashDefaultRun, defaultIdle];

  dashTranslations.SetDefaults(defaultConditions);

  const dashRelations = new StateRelation(STATE_IDS.DASH_S, dashTranslations);

  return dashRelations;
}

export function InitDashTurnRelations(): StateRelation {
  const dashTrunTranslations = new ActionStateMappings();

  dashTrunTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  dashTrunTranslations.SetConditions([ToSideSpecial]);

  dashTrunTranslations.SetDefaults([defaultDash]);

  const dashTurnRelations = new StateRelation(
    STATE_IDS.DASH_TURN_S,
    dashTrunTranslations
  );

  return dashTurnRelations;
}

export function InitRunRelations(): StateRelation {
  const runTranslations = new ActionStateMappings();

  runTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
    { geId: GAME_EVENT_IDS.IDLE_GE, sId: STATE_IDS.STOP_RUN_S },
    { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.DOWN_GE, sId: STATE_IDS.CROUCH_S },
  ]);

  const conditions: Array<condition> = [
    RunToTurn,
    ToSideSpecial,
    ToUpSpecial,
    RunToDashAttack,
    RunToRunStopByGuard,
  ];

  runTranslations.SetConditions(conditions);

  const runRelations = new StateRelation(STATE_IDS.RUN_S, runTranslations);

  return runRelations;
}

export function InitRunTurnRelations(): StateRelation {
  const runTurnMapping = new ActionStateMappings();

  runTurnMapping.SetMappings([
    { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  runTurnMapping.SetConditions([ToSideSpecial, ToUpSpecial]);

  runTurnMapping.SetDefaults([defaultRun]);

  const runTurnRelations = new StateRelation(
    STATE_IDS.RUN_TURN_S,
    runTurnMapping
  );

  return runTurnRelations;
}

export function InitStopRunRelations(): StateRelation {
  const stopRunTranslations = new ActionStateMappings();

  stopRunTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.MOVE_FAST_GE, sId: STATE_IDS.DASH_S },
    { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
    { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.DOWN_GE, sId: STATE_IDS.CROUCH_S },
    { geId: GAME_EVENT_IDS.SIDE_SPCL_GE, sId: STATE_IDS.SIDE_SPCL_S },
  ]);

  const conditions: Array<condition> = [RunStopToTurn, ToUpSpecial];

  stopRunTranslations.SetConditions(conditions);

  stopRunTranslations.SetDefaults([defaultIdle]);

  const stopRunRelations = new StateRelation(
    STATE_IDS.STOP_RUN_S,
    stopRunTranslations
  );

  return stopRunRelations;
}

export function InitJumpSquatRelations(): StateRelation {
  const jumpSquatTranslations = new ActionStateMappings();

  jumpSquatTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.GRAB_GE, sId: STATE_IDS.GRAB_S },
  ]);

  jumpSquatTranslations.SetDefaults([defaultJump]);

  const jumpSquatRelations = new StateRelation(
    STATE_IDS.JUMP_SQUAT_S,
    jumpSquatTranslations
  );

  return jumpSquatRelations;
}

export function InitJumpRelations(): StateRelation {
  const jumpTranslations = new ActionStateMappings();

  jumpTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  jumpTranslations.SetConditions([ToJump, ToAirDodge]);

  jumpTranslations.SetDefaults([defaultNFall]);

  const jumpRelations = new StateRelation(STATE_IDS.JUMP_S, jumpTranslations);

  return jumpRelations;
}

export function InitNeutralFallRelations(): StateRelation {
  const nFallTranslations = new ActionStateMappings();

  nFallTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
    { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.SOFT_LAND_S },
    { geId: GAME_EVENT_IDS.LEDGE_GRAB_GE, sId: STATE_IDS.LEDGE_GRAB_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  nFallTranslations.SetConditions([
    ToJump,
    ToAirDodge,
    ToNair,
    ToUAir,
    ToDAir,
    ToFAir,
    ToBAir,
    ToSideSpecialAir,
    ToUpSpecial,
    ToDownSpecialAir,
  ]);

  const nFallRelations = new StateRelation(
    STATE_IDS.N_FALL_S,
    nFallTranslations
  );

  return nFallRelations;
}

export function InitLandRelations(): StateRelation {
  const landTranslations = new ActionStateMappings();

  landTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S },
  ]);

  landTranslations.SetDefaults([LandToIdle, LandToWalk, LandToTurn]);

  const landRelations = new StateRelation(STATE_IDS.LAND_S, landTranslations);

  return landRelations;
}

export function InitSoftLandRelations(): StateRelation {
  const softLandTranslations = new ActionStateMappings();

  softLandTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S },
  ]);

  softLandTranslations.SetDefaults([LandToIdle, LandToWalk, LandToTurn]);

  const softLandRelations = new StateRelation(
    STATE_IDS.SOFT_LAND_S,
    softLandTranslations
  );

  return softLandRelations;
}

export function InitLedgeGrabRelations(): StateRelation {
  const LedgeGrabTranslations = new ActionStateMappings();

  LedgeGrabTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_S },
  ]);

  const LedgeGrabRelations = new StateRelation(
    STATE_IDS.LEDGE_GRAB_S,
    LedgeGrabTranslations
  );

  return LedgeGrabRelations;
}

export function InitAirDodgeRelations(): StateRelation {
  const airDodgeTranslations = new ActionStateMappings();

  airDodgeTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
    { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.LAND_S },
  ]);

  airDodgeTranslations.SetDefaults([defaultHelpess]);

  const AirDodgeRelations = new StateRelation(
    STATE_IDS.AIR_DODGE_S,
    airDodgeTranslations
  );

  return AirDodgeRelations;
}

export function InitHelpessRelations(): StateRelation {
  const helpessTranslations = new ActionStateMappings();

  helpessTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
    { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.SOFT_LAND_S },
    { geId: GAME_EVENT_IDS.LEDGE_GRAB_GE, sId: STATE_IDS.LEDGE_GRAB_S },
  ]);

  const HelplessRelations = new StateRelation(
    STATE_IDS.HELPLESS_S,
    helpessTranslations
  );

  return HelplessRelations;
}

export function InitAttackRelations(): StateRelation {
  const attackTranslations = new ActionStateMappings();

  attackTranslations.SetDefaults([defaultIdle]);

  const attackRelations = new StateRelation(
    STATE_IDS.ATTACK_S,
    attackTranslations
  );

  return attackRelations;
}

export function InitDashAttackRelations(): StateRelation {
  const dashAtkTranslations = new ActionStateMappings();

  dashAtkTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  dashAtkTranslations.SetDefaults([defaultIdle]);

  const dashAtkRelations = new StateRelation(
    STATE_IDS.DASH_ATTACK_S,
    dashAtkTranslations
  );

  return dashAtkRelations;
}

export function InitSideChargeRelations(): StateRelation {
  const sideChargeTranslations = new ActionStateMappings();

  sideChargeTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  sideChargeTranslations.SetConditions([SideChargeToEx]);

  sideChargeTranslations.SetDefaults([defaultSideChargeEx]);

  const sideChargeRelations = new StateRelation(
    STATE_IDS.SIDE_CHARGE_S,
    sideChargeTranslations
  );

  return sideChargeRelations;
}

export function InitSideChargeExRelations(): StateRelation {
  const sideChargeExTranslations = new ActionStateMappings();

  sideChargeExTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  sideChargeExTranslations.SetDefaults([defaultIdle]);

  const relation = new StateRelation(
    STATE_IDS.SIDE_CHARGE_EX_S,
    sideChargeExTranslations
  );

  return relation;
}

export function InitUpChargeRelations(): StateRelation {
  const upChargeRelations = new ActionStateMappings();

  upChargeRelations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  upChargeRelations.SetConditions([UpChargeToEx]);

  upChargeRelations.SetDefaults([defaultUpChargeEx]);

  const relation = new StateRelation(STATE_IDS.UP_CHARGE_S, upChargeRelations);

  return relation;
}

export function InitiUpChargeExRelations(): StateRelation {
  const translations = new ActionStateMappings();

  translations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  translations.SetDefaults([defaultIdle]);

  const relation = new StateRelation(STATE_IDS.UP_CHARGE_EX_S, translations);

  return relation;
}

export function InitDownChargeRelations(): StateRelation {
  const downChargeRelations = new ActionStateMappings();

  downChargeRelations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  downChargeRelations.SetConditions([DownChargeToEx]);

  downChargeRelations.SetDefaults([defaultDownChargeEx]);

  const relation = new StateRelation(
    STATE_IDS.DOWN_CHARGE_S,
    downChargeRelations
  );

  return relation;
}

export function InitDownChargeExRelations(): StateRelation {
  const translations = new ActionStateMappings();

  translations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  translations.SetDefaults([defaultIdle]);

  const relation = new StateRelation(STATE_IDS.DOWN_CHARGE_EX_S, translations);

  return relation;
}

export function InitAirAttackRelations(): StateRelation {
  const airAttackTranslations = new ActionStateMappings();

  airAttackTranslations.SetDefaults([defaultNFall]);

  airAttackTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
    { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.SOFT_LAND_S },
    { geId: GAME_EVENT_IDS.LEDGE_GRAB_GE, sId: STATE_IDS.LEDGE_GRAB_S },
  ]);

  const airAttackRelations = new StateRelation(
    STATE_IDS.N_AIR_S,
    airAttackTranslations
  );

  return airAttackRelations;
}

export function InitFAirAttackRelations(): StateRelation {
  const fAirAttackTranslations = new ActionStateMappings();

  fAirAttackTranslations.SetDefaults([defaultNFall]);

  fAirAttackTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.SOFT_LAND_S },
    { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
    { geId: GAME_EVENT_IDS.LEDGE_GRAB_GE, sId: STATE_IDS.LEDGE_GRAB_S },
  ]);

  const fAirTranslations = new StateRelation(
    STATE_IDS.F_AIR_S,
    fAirAttackTranslations
  );

  return fAirTranslations;
}

export function InitUAirRelations(): StateRelation {
  const uAirTranslations = new ActionStateMappings();

  uAirTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
    { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.SOFT_LAND_S },
    { geId: GAME_EVENT_IDS.LEDGE_GRAB_GE, sId: STATE_IDS.LEDGE_GRAB_S },
  ]);

  uAirTranslations.SetDefaults([defaultNFall]);

  const uAirRelations = new StateRelation(STATE_IDS.U_AIR_S, uAirTranslations);

  return uAirRelations;
}

export function InitBAirRelations(): StateRelation {
  const bAirTranslations = new ActionStateMappings();

  bAirTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
    { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.SOFT_LAND_S },
    { geId: GAME_EVENT_IDS.LEDGE_GRAB_GE, sId: STATE_IDS.LEDGE_GRAB_S },
  ]);

  bAirTranslations.SetDefaults([defaultNFall]);

  const bAirRelations = new StateRelation(STATE_IDS.B_AIR_S, bAirTranslations);

  return bAirRelations;
}

export function InitDAirRelations(): StateRelation {
  const dAirTranslations = new ActionStateMappings();

  dAirTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
    { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.SOFT_LAND_S },
    { geId: GAME_EVENT_IDS.LEDGE_GRAB_GE, sId: STATE_IDS.LEDGE_GRAB_S },
  ]);

  dAirTranslations.SetDefaults([defaultNFall]);

  const bAirRelations = new StateRelation(STATE_IDS.D_AIR_S, dAirTranslations);

  return bAirRelations;
}

export function InitNSpecialRelations(): StateRelation {
  const nSpecialTranslations = new ActionStateMappings();

  nSpecialTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  nSpecialTranslations.SetDefaults([defaultIdle]);

  const nSpecialRelations = new StateRelation(
    STATE_IDS.SPCL_S,
    nSpecialTranslations
  );

  return nSpecialRelations;
}

export function InitSideSpecialRelations(): StateRelation {
  const sideSpclTranslations = new ActionStateMappings();

  sideSpclTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.HELPLESS_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    {
      geId: GAME_EVENT_IDS.SIDE_SPCL_EX_GE,
      sId: STATE_IDS.SIDE_SPCL_EX_S,
    },
  ]);

  sideSpclTranslations.SetDefaults([defaultIdle]);

  const sideSpecialRelations = new StateRelation(
    STATE_IDS.SIDE_SPCL_S,
    sideSpclTranslations
  );

  return sideSpecialRelations;
}

export function InitSideSpecialExtensionRelations(): StateRelation {
  const sideSpclExTranslations = new ActionStateMappings();

  sideSpclExTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  sideSpclExTranslations.SetDefaults([defaultIdle]);

  const sideSpclExRelations = new StateRelation(
    STATE_IDS.SIDE_SPCL_EX_S,
    sideSpclExTranslations
  );

  return sideSpclExRelations;
}

export function InitSideSpecialAirRelations(): StateRelation {
  const translation = new ActionStateMappings();

  translation.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    {
      geId: GAME_EVENT_IDS.S_SPCL_EX_AIR_GE,
      sId: STATE_IDS.SIDE_SPCL_EX_AIR_S,
    },
  ]);

  translation.SetDefaults([defaultHelpess]);

  const relation = new StateRelation(STATE_IDS.SIDE_SPCL_AIR_S, translation);

  return relation;
}

export function InitSideSpecialExAirRelations(): StateRelation {
  const translations = new ActionStateMappings();

  translations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  translations.SetDefaults([defaultHelpess]);

  const relations = new StateRelation(
    STATE_IDS.SIDE_SPCL_EX_AIR_S,
    translations
  );

  return relations;
}

export function InitUpSpecialRelations(): StateRelation {
  const translation = new ActionStateMappings();

  translation.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  translation.SetDefaults([defaultHelpess]);

  const relation = new StateRelation(STATE_IDS.UP_SPCL_S, translation);

  return relation;
}

export function InitDownSpecialRelations(): StateRelation {
  const downSpecialTranslations = new ActionStateMappings();
  downSpecialTranslations.SetDefaults([defaultIdle]);

  const downSpecRelations = new StateRelation(
    STATE_IDS.DOWN_SPCL_S,
    downSpecialTranslations
  );

  return downSpecRelations;
}

export function InitDownSpecialAirRelations(): StateRelation {
  const translation = new ActionStateMappings();

  translation.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
  ]);

  translation.SetDefaults([defaultNFall]);

  const relation = new StateRelation(STATE_IDS.DOWN_SPCL_AIR_S, translation);

  return relation;
}

export function InitHitStopRelations(): StateRelation {
  const hitStopTranslations = new ActionStateMappings();

  const hitStopConditions = [HitStopToLaunch];

  hitStopTranslations.SetConditions(hitStopConditions);

  const hitStunRelations = new StateRelation(
    STATE_IDS.HIT_STOP_S,
    hitStopTranslations
  );

  return hitStunRelations;
}

export function InitTumbleRelations(): StateRelation {
  const TumbleTranslations = new ActionStateMappings();

  TumbleTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
    { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.LAND_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  TumbleTranslations.SetConditions([ToJump]);

  const TumbleRelations = new StateRelation(
    STATE_IDS.TUMBLE_S,
    TumbleTranslations
  );

  return TumbleRelations;
}

export function InitLaunchRelations(): StateRelation {
  const launchTranslations = new ActionStateMappings();

  launchTranslations.SetConditions([LaunchToTumble]);

  const launchRelations = new StateRelation(
    STATE_IDS.LAUNCH_S,
    launchTranslations
  );

  return launchRelations;
}

export function InitCrouchRelations(): StateRelation {
  const crouchTranslations = new ActionStateMappings();

  crouchTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.IDLE_GE, sId: STATE_IDS.IDLE_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.MOVE_GE, sId: STATE_IDS.WALK_S },
    { geId: GAME_EVENT_IDS.MOVE_FAST_GE, sId: STATE_IDS.DASH_S },
    { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
    { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S },
  ]);

  crouchTranslations.SetConditions([ToDownSpecial, ToDownTilt]);

  const crouchRelations = new StateRelation(
    STATE_IDS.CROUCH_S,
    crouchTranslations
  );

  return crouchRelations;
}

export function InitDownTiltRelations(): StateRelation {
  const dTiltTranslations = new ActionStateMappings();

  dTiltTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  dTiltTranslations.SetDefaults([DefaultDownTiltToCrouch, defaultIdle]);

  const dTiltRelations = new StateRelation(
    STATE_IDS.DOWN_TILT_S,
    dTiltTranslations
  );

  return dTiltRelations;
}

export function InitSideTiltRelations(): StateRelation {
  const sideTiltTrnalsations = new ActionStateMappings();

  sideTiltTrnalsations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  sideTiltTrnalsations.SetDefaults([defaultIdle]);

  const sideTiltRelations = new StateRelation(
    STATE_IDS.SIDE_TILT_S,
    sideTiltTrnalsations
  );

  return sideTiltRelations;
}

export function InitUpTiltRelations(): StateRelation {
  const upTiltTranslations = new ActionStateMappings();

  upTiltTranslations.SetMappings([
    {
      geId: GAME_EVENT_IDS.HIT_STOP_GE,
      sId: STATE_IDS.HIT_STOP_S,
    },
  ]);

  upTiltTranslations.SetDefaults([defaultIdle]);

  const upTiltRelations = new StateRelation(
    STATE_IDS.UP_TILT_S,
    upTiltTranslations
  );

  return upTiltRelations;
}

export function InitGrabRelations(): StateRelation {
  const grabmaps = new ActionStateMappings();

  grabmaps.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.GRAB_HOLD_GE, sId: STATE_IDS.GRAB_HOLD_S },
  ]);

  grabmaps.SetDefaults([defaultIdle]);

  const grabRelations = new StateRelation(STATE_IDS.GRAB_S, grabmaps);

  return grabRelations;
}

export function InitHoldRelations(): StateRelation {
  const holdMaps = new ActionStateMappings();
  holdMaps.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.GRAB_RELEASE_GE, sId: STATE_IDS.GRAB_RELEASE_S },
  ]);

  const holdRelations = new StateRelation(STATE_IDS.GRAB_HOLD_S, holdMaps);

  return holdRelations;
}

export function InitHeldRelations(): StateRelation {
  const heldMaps = new ActionStateMappings();
  heldMaps.SetMappings([
    { geId: GAME_EVENT_IDS.GRAB_ESCAPE_GE, sId: STATE_IDS.GRAB_ESCAPE_S },
  ]);
  const heldRelations = new StateRelation(STATE_IDS.GRAB_HELD_S, heldMaps);

  return heldRelations;
}

export function InitGrabReleaseRelations(): StateRelation {
  const grabReleaseMaps = new ActionStateMappings();
  grabReleaseMaps.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);
  grabReleaseMaps.SetDefaults([defaultIdle]);

  const grabReleaseRelations = new StateRelation(
    STATE_IDS.GRAB_RELEASE_S,
    grabReleaseMaps
  );

  return grabReleaseRelations;
}

export function InitGrabEscapeRelations(): StateRelation {
  const grabEscapeMaps = new ActionStateMappings();
  grabEscapeMaps.SetDefaults([defaultIdle]);

  const grabEscapeRelations = new StateRelation(
    STATE_IDS.GRAB_ESCAPE_S,
    grabEscapeMaps
  );

  return grabEscapeRelations;
}
