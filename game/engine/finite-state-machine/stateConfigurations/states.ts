import { HandleCommand } from '../../command/command';
import {
  NumberToRaw,
  DivideRaw,
  MultiplyRaw,
  SqrtRaw,
} from '../../math/fixedPoint';
import { COS_LUT, SIN_LUT } from '../../math/LUTS';
import { FlatVec } from '../../physics/vector';
import {
  Player,
  AddWalkImpulseToPlayer,
  AddToPlayerYPositionRaw,
} from '../../entity/playerOrchestrator';
import { EaseInRaw, GetAtan2IndexRaw } from '../../utils';
import { World } from '../../world/world';
import { FSMState } from '../PlayerStateMachine';
import { STATE_IDS, GAME_EVENT_IDS, GameEventId, StateId } from './shared';
import { Attack } from '../../entity/components/attack';
import { Grab } from '../../entity/components/grab';

const POINT_THREE_THREE = NumberToRaw(0.33);
const POINT_ONE_FIVE = NumberToRaw(0.15);
const POINT_SIX = NumberToRaw(0.6);
const POINT_EIGHT = NumberToRaw(0.8);
const ONE = NumberToRaw(1);
const TWO = NumberToRaw(2);

export const Idle: FSMState = {
  StateName: 'IDLE',
  StateId: STATE_IDS.IDLE_S,
  OnEnter: (p: Player, w: World) => {},
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {},
};

export const Walk: FSMState = {
  StateName: 'WALK',
  StateId: STATE_IDS.WALK_S,
  OnEnter: (p: Player, w: World) => {},
  OnUpdate: (p: Player, w: World) => {
    const inputStore = w.PlayerData.InputStore(p.ID);
    const curFrame = w.LocalFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    if (ia !== undefined) {
      AddWalkImpulseToPlayer(p, ia.LXAxis);
    }
  },
  OnExit: (p: Player, w: World) => {},
};

export const Turn: FSMState = {
  StateName: 'TURN',
  StateId: STATE_IDS.TURN_S,
  OnEnter: (p: Player, W: World) => {},
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {
    p.Flags.ChangeDirections();
  },
};

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
  OnExit: (p: Player, w: World) => {},
};

export const DashTurn: FSMState = {
  StateName: 'DASH_TURN',
  StateId: STATE_IDS.DASH_TURN_S,
  OnEnter: (p: Player, w: World) => {
    p.Velocity.X.Zero();
    p.Flags.ChangeDirections();
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {},
};

export const Run: FSMState = {
  StateName: 'RUN',
  StateId: STATE_IDS.RUN_S,
  OnEnter: (p: Player, w: World) => {},
  OnUpdate: (p: Player, w: World) => {
    const inputStore = w.PlayerData.InputStore(p.ID);
    const curFrame = w.LocalFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    if (ia !== undefined) {
      const speeds = p.Speeds;
      p.Velocity.AddClampedXImpulseRaw(
        speeds.MaxRunSpeedRaw,
        MultiplyRaw(ia.LXAxis.Raw, speeds.RunSpeedMultiplierRaw)
      );
    }
  },
  OnExit: (p: Player, w: World) => {},
};

export const RunTurn: FSMState = {
  StateName: 'RUN_TURN',
  StateId: STATE_IDS.RUN_TURN_S,
  OnEnter: (p: Player, w: World) => {},
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {
    p.Flags.ChangeDirections();
  },
};

export const RunStop: FSMState = {
  StateName: 'RUN_STOP',
  StateId: STATE_IDS.STOP_RUN_S,
  OnEnter: (p: Player, w: World) => {},
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {},
};

export const JumpSquat: FSMState = {
  StateName: 'JUMPSQUAT',
  StateId: STATE_IDS.JUMP_SQUAT_S,
  OnEnter: (p: Player, w: World) => {
    p.ECB.SetECBShape(STATE_IDS.JUMP_SQUAT_S);
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {
    p.ECB.ResetECBShape();
  },
};

export const Jump: FSMState = {
  StateName: 'JUMP',
  StateId: STATE_IDS.JUMP_S,
  OnEnter: (p: Player, w: World) => {
    const jumpComp = p.Jump;
    p.Flags.FastFallOff();
    jumpComp.IncrementJumps();
    p.ECB.SetECBShape(STATE_IDS.JUMP_S);
    AddToPlayerYPositionRaw(p, -p.ECB.YOffset.Raw);
    p.Velocity.Y.SetFromRaw(-p.Jump.JumpVelocity.Raw);
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {
    p.ECB.ResetECBShape();
  },
};

export const NeutralFall: FSMState = {
  StateName: 'NFALL',
  StateId: STATE_IDS.N_FALL_S,
  OnEnter: (p: Player, w: World) => {
    if (p.Jump.JumpCountIsZero()) {
      p.Jump.IncrementJumps();
    }
    p.ECB.SetECBShape(STATE_IDS.N_FALL_S);
  },
  OnUpdate: (p: Player, w: World) => {
    aerialInputOnUpdate(p, w);
  },
  OnExit: (p: Player, w: World) => {
    p.ECB.ResetECBShape();
  },
};

export const Land: FSMState = {
  StateName: 'Land',
  StateId: STATE_IDS.LAND_S,
  OnEnter: (p: Player, w: World) => {
    p.Flags.FastFallOff();
    p.Jump.ResetJumps();
    p.Velocity.Y.Zero();
    p.LedgeDetector.ZeroLedgeGrabCount();
    p.ECB.SetECBShape(STATE_IDS.LAND_S);
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {
    p.ECB.ResetECBShape();
  },
};

export const SoftLand: FSMState = {
  StateName: 'SoftLand',
  StateId: STATE_IDS.SOFT_LAND_S,
  OnEnter: (p: Player, w: World) => {
    p.Flags.FastFallOff();
    p.Jump.ResetJumps();
    p.Velocity.Y.Zero();
    p.LedgeDetector.ZeroLedgeGrabCount();
    p.ECB.SetECBShape(STATE_IDS.SOFT_LAND_S);
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {
    p.ECB.ResetECBShape();
  },
};

export const LedgeGrab: FSMState = {
  StateName: 'LedgeGrab',
  StateId: STATE_IDS.LEDGE_GRAB_S,
  OnEnter: (p: Player, w: World) => {
    p.Flags.FastFallOff();
    p.Velocity.X.Zero();
    p.Velocity.Y.Zero();
    const ledgeDetectorComp = p.LedgeDetector;
    const jumpComp = p.Jump;
    jumpComp.ResetJumps();
    jumpComp.IncrementJumps();
    ledgeDetectorComp.IncrementLedgeGrabs();
    p.ECB.SetECBShape(STATE_IDS.LEDGE_GRAB_S);
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {
    p.ECB.ResetECBShape();
  },
};

export const AirDodge: FSMState = {
  StateName: 'AirDodge',
  StateId: STATE_IDS.AIR_DODGE_S,
  OnEnter: (p: Player, w: World) => {
    p.Flags.FastFallOff();
    p.Flags.ZeroDisablePlatDetection();
    const pVel = p.Velocity;
    const ecb = p.ECB;
    const inputStore = w.PlayerData.InputStore(p.ID);
    const curFrame = w.LocalFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const angleIndexRaw = GetAtan2IndexRaw(ia!.LYAxis.Raw, ia!.LXAxis.Raw);
    let speed = p.Speeds.AirDogeSpeedRaw;
    if (ia.LXAxis.Raw === 0 && ia.LYAxis.Raw === 0) {
      speed = 0;
    }
    pVel.X.SetFromRaw(MultiplyRaw(COS_LUT[angleIndexRaw], speed));
    pVel.Y.SetFromRaw(MultiplyRaw(-SIN_LUT[angleIndexRaw], speed));
    ecb.SetECBShape(STATE_IDS.AIR_DODGE_S);
    p.Flags.VelocityDecayOff();
  },
  OnUpdate: (p: Player, w: World) => {
    const frameLength = p.FSMInfo.GetFrameLengthForState(
      STATE_IDS.AIR_DODGE_S
    )!;
    const currentFrameForState = p.FSMInfo.CurrentStateFrame;
    const currentFrameFpRaw = NumberToRaw(currentFrameForState);
    const frameLengthFpRaw = NumberToRaw(frameLength);
    const normalizedTimeRaw = DivideRaw(currentFrameFpRaw, frameLengthFpRaw);
    const clampedNormalizedTimeRaw = Math.min(normalizedTimeRaw, ONE);
    const easeRaw = EaseInRaw(clampedNormalizedTimeRaw);
    const pVel = p.Velocity;
    const oneMinusEaseRaw = ONE - easeRaw;
    pVel.X.SetFromRaw(MultiplyRaw(pVel.X.Raw, oneMinusEaseRaw));
    pVel.Y.SetFromRaw(MultiplyRaw(pVel.Y.Raw, oneMinusEaseRaw));
    if (currentFrameForState === 2) {
      p.Flags.SetIntangabilityFrames(15);
    }
  },
  OnExit: (p: Player, w: World) => {
    p.ECB.ResetECBShape();
    p.Flags.VelocityDecayOn();
    p.Flags.ZeroIntangabilityFrames();
  },
};

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
  OnExit: (p: Player, w: World) => {},
};

export const HitStop: FSMState = {
  StateName: 'HitStop',
  StateId: STATE_IDS.HIT_STOP_S,
  OnEnter: (p: Player, world: World) => {
    p.Flags.FastFallOff();
    p.Velocity.X.Zero();
    p.Velocity.Y.Zero();
  },
  OnUpdate: (p: Player, world: World) => {
    p.HitStop.Decrement();
  },
  OnExit: (p: Player, world: World) => {
    p.HitStop.SetZero();
  },
};

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
  },
  OnUpdate: (p: Player, w: World) => {
    p.HitStun.DecrementHitStun();
  },
  OnExit: (p, w) => {
    p.HitStun.Zero();
  },
};

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
  OnExit: (p: Player, w: World) => {},
};

export const Crouch: FSMState = {
  StateName: 'Crouch',
  StateId: STATE_IDS.CROUCH_S,
  OnEnter: (p: Player, w: World) => {
    p.ECB.SetECBShape(STATE_IDS.CROUCH_S);
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {
    p.ECB.ResetECBShape();
  },
};

export const ShieldRaise: FSMState = {
  StateName: 'ShieldRaise',
  StateId: STATE_IDS.SHIELD_RAISE_S,
  OnEnter: (p: Player, w: World) => {},
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {},
};

export const Shield: FSMState = {
  StateName: 'Shield',
  StateId: STATE_IDS.SHIELD_S,
  OnEnter: (p: Player, w: World) => {
    p.Shield.Active = true;
  },
  OnUpdate: (p: Player, w: World) => {
    // shrink shield
    const inputStore = w.PlayerData.InputStore(p.ID);
    const input = inputStore.GetInputForFrame(w.LocalFrame);
    const s = p.Shield;
    const triggerValue =
      input.LTValRaw >= input.RTValRaw ? input.LTValRaw : input.RTValRaw;
    s.ShrinkRaw(triggerValue);
    // tilt shield
    const lxAxis = input.LXAxis;
    const lyAxis = input.LYAxis;
    if (lxAxis.Raw === 0 && lyAxis.Raw === 0) {
      s.ShieldTiltX.Zero();
      s.ShieldTiltY.Zero();
      return;
    }
    const magSqr =
      MultiplyRaw(lxAxis.Raw, lxAxis.Raw) + MultiplyRaw(lyAxis.Raw, lyAxis.Raw);
    if (magSqr > ONE) {
      const mag = SqrtRaw(magSqr);
      const clampedXRaw = DivideRaw(lxAxis.Raw, mag);
      const clampedYRaw = -DivideRaw(lyAxis.Raw, mag);
      const newoffsetXRaw = MultiplyRaw(
        clampedXRaw,
        s.maxShieldOffSetRadius.Raw
      );
      const newoffsetYRaw = MultiplyRaw(
        clampedYRaw,
        s.maxShieldOffSetRadius.Raw
      );
      s.ShieldTiltX.SetFromRaw(newoffsetXRaw);
      s.ShieldTiltY.SetFromRaw(newoffsetYRaw);
      return;
    }
    const newoffsetXRaw = MultiplyRaw(lxAxis.Raw, s.maxShieldOffSetRadius.Raw);
    const newoffsetYRaw = -MultiplyRaw(lyAxis.Raw, s.maxShieldOffSetRadius.Raw);
    s.ShieldTiltX.SetFromRaw(newoffsetXRaw);
    s.ShieldTiltY.SetFromRaw(newoffsetYRaw);
  },
  OnExit: (p, w) => {
    p.Shield.Active = false;
    p.Shield.ShieldTiltX.Zero();
    p.Shield.ShieldTiltY.Zero();
  },
};

export const SpotDodge: FSMState = {
  StateName: 'SpotDodge',
  StateId: STATE_IDS.SPOT_DODGE_S,
  OnEnter: (p: Player, w: World) => {
    p.Flags.SetIntangabilityFrames(20);
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p, w) => {},
};

export const RollDodge: FSMState = {
  StateName: 'RollDodge',
  StateId: STATE_IDS.ROLL_DODGE_S,
  OnEnter: (p: Player, w: World) => {
    const pd = w.PlayerData;
    const inputStore = pd.InputStore(p.ID);
    const curFrame = w.LocalFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    if (ia.LXAxis.Raw > 0) {
      p.Flags.FaceLeft();
    } else if (ia.LXAxis.Raw < 0) {
      p.Flags.FaceRight();
    }
    p.Flags.SetIntangabilityFrames(20);
    p.Flags.VelocityDecayOff();
    p.ECB.SetECBShape(STATE_IDS.ROLL_DODGE_S);
  },
  OnUpdate: (p: Player, w: World) => {
    const fsmInfo = p.FSMInfo;
    const totalFrames = fsmInfo.GetFrameLengthForState(STATE_IDS.ROLL_DODGE_S)!;
    const currentFrameRaw = NumberToRaw(fsmInfo.CurrentStateFrame);
    const normalizedTimeRaw = DivideRaw(
      currentFrameRaw,
      NumberToRaw(totalFrames)
    );
    const clampedNormalizedTimeRaw = Math.min(normalizedTimeRaw, ONE);
    const easeRaw = EaseInRaw(clampedNormalizedTimeRaw);
    const maxSpeedRaw = p.Speeds.DodeRollSpeedRaw;
    const oneMinusEaseRaw = ONE - easeRaw;
    const direction = p.Flags.IsFacingRight ? NumberToRaw(-1) : NumberToRaw(1);
    p.Velocity.X.SetFromRaw(
      MultiplyRaw(direction, MultiplyRaw(maxSpeedRaw, oneMinusEaseRaw))
    );
  },
  OnExit: (p, w) => {
    p.ECB.ResetECBShape();
    p.Flags.VelocityDecayOn();
    p.Flags.ZeroIntangabilityFrames();
    p.Velocity.X.Zero();
  },
};

export const ShieldDrop: FSMState = {
  StateName: 'ShieldDrop',
  StateId: STATE_IDS.SHIELD_DROP_S,
  OnEnter: (p: Player, w: World) => {},
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p, w) => {},
};

export const NAttack: FSMState = {
  StateName: 'Attack',
  StateId: STATE_IDS.ATTACK_S,
  OnEnter: (p: Player, w: World) => {
    const geId = GAME_EVENT_IDS.ATTACK_GE;
    const stateId = STATE_IDS.ATTACK_S;
    attackOnEnter(p, w, geId, stateId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit,
};

export const DashAttack: FSMState = {
  StateName: 'DashAttack',
  StateId: STATE_IDS.DASH_ATTACK_S,
  OnEnter: (p: Player, w: World) => {
    p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.DASH_ATTACK_GE);
    const geId = GAME_EVENT_IDS.DASH_ATTACK_GE;
    const stateId = STATE_IDS.DASH_ATTACK_S;
    attackOnEnter(p, w, geId, stateId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit,
};

export const DownTilt: FSMState = {
  StateName: 'DownTilt',
  StateId: STATE_IDS.DOWN_TILT_S,
  OnEnter: (p: Player, w: World) => {
    const geId = GAME_EVENT_IDS.D_TILT_GE;
    const stateId = STATE_IDS.DOWN_TILT_S;
    attackOnEnter(p, w, geId, stateId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit,
};

export const SideTilt: FSMState = {
  StateName: 'SideTilt',
  StateId: STATE_IDS.SIDE_TILT_S,
  OnEnter: (p: Player, w: World) => {
    const inputStore = w.PlayerData.InputStore(p.ID);
    const curFrame = w.LocalFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const stateId = STATE_IDS.SIDE_TILT_S;
    if (ia.LYAxis.Raw > POINT_ONE_FIVE) {
      attackOnEnter(p, w, GAME_EVENT_IDS.S_TILT_U_GE, stateId);
      return;
    }
    if (ia.LYAxis.Raw < -POINT_ONE_FIVE) {
      attackOnEnter(p, w, GAME_EVENT_IDS.S_TILT_D_GE, stateId);
      return;
    }
    attackOnEnter(p, w, GAME_EVENT_IDS.S_TILT_GE, stateId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit,
};

export const UpTilt: FSMState = {
  StateName: 'UpTilt',
  StateId: STATE_IDS.UP_TILT_S,
  OnEnter: (p: Player, w: World) => {
    const geId = GAME_EVENT_IDS.U_TILT_GE;
    const stateId = STATE_IDS.UP_TILT_S;
    attackOnEnter(p, w, geId, stateId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit,
};

export const SideCharge: FSMState = {
  StateName: 'SideChagrge',
  StateId: STATE_IDS.SIDE_CHARGE_S,
  OnEnter: (p: Player, w: World) => {
    const inputStore = w.PlayerData.InputStore(p.ID);
    const curFrame = w.LocalFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const rXAxis = ia.RXAxis;
    if (rXAxis.Raw > 0) {
      p.Flags.FaceRight();
    }
    if (rXAxis.Raw < 0) {
      p.Flags.FaceLeft();
    }
    const geId = GAME_EVENT_IDS.SIDE_CHARGE_GE;
    const stateId = STATE_IDS.SIDE_CHARGE_S;
    attackOnEnter(p, w, geId, stateId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit,
};

export const SideChargeEx: FSMState = {
  StateName: 'SideChagrgeEx',
  StateId: STATE_IDS.SIDE_CHARGE_EX_S,
  OnEnter: (p: Player, w: World) => {
    const geId = GAME_EVENT_IDS.SIDE_CHARGE_EX_GE;
    const stateId = STATE_IDS.SIDE_CHARGE_EX_S;
    attackOnEnter(p, w, geId, stateId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit,
};

export const UpCharge: FSMState = {
  StateName: 'UpCharge',
  StateId: STATE_IDS.UP_CHARGE_S,
  OnEnter: (p, w) => {
    const geId = GAME_EVENT_IDS.UP_CHARGE_GE;
    const stateId = STATE_IDS.UP_CHARGE_S;
    attackOnEnter(p, w, geId, stateId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit,
};

export const UpChargeEx: FSMState = {
  StateName: 'UpChargeExt',
  StateId: STATE_IDS.UP_CHARGE_EX_S,
  OnEnter: (p, w) => {
    const geId = GAME_EVENT_IDS.UP_CHARGE_EX_GE;
    const stateId = STATE_IDS.UP_CHARGE_EX_S;
    attackOnEnter(p, w, geId, stateId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit,
};

export const DownCharge: FSMState = {
  StateName: 'DownCharge',
  StateId: STATE_IDS.DOWN_CHARGE_S,
  OnEnter: (p, w) => {
    const geId = GAME_EVENT_IDS.DOWN_CHARGE_GE;
    const stateId = STATE_IDS.DOWN_CHARGE_S;
    attackOnEnter(p, w, geId, stateId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit,
};

export const DownChargeEx: FSMState = {
  StateName: 'DownChargeExt',
  StateId: STATE_IDS.DOWN_CHARGE_EX_S,
  OnEnter: (p, w) => {
    const geId = GAME_EVENT_IDS.DOWN_CHARGE_EX_GE;
    const stateId = STATE_IDS.DOWN_CHARGE_EX_S;
    attackOnEnter(p, w, geId, stateId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit,
};

export const NAerialAttack: FSMState = {
  StateName: 'AerialAttack',
  StateId: STATE_IDS.N_AIR_S,
  OnEnter: (p: Player, w: World) => {
    const geId = GAME_EVENT_IDS.N_AIR_GE;
    const stateId = STATE_IDS.N_AIR_S;
    attackOnEnter(p, w, geId, stateId);
  },
  OnUpdate: (p: Player, w: World) => {
    aerialInputOnUpdate(p, w);
    attackOnUpdate(p, w);
  },
  OnExit: attackOnExit,
};

export const FAerialAttack: FSMState = {
  StateName: 'FAir',
  StateId: STATE_IDS.F_AIR_S,
  OnEnter: (p: Player, w: World) => {
    const geId = GAME_EVENT_IDS.F_AIR_GE;
    const stateId = STATE_IDS.F_AIR_S;
    attackOnEnter(p, w, geId, stateId);
  },
  OnUpdate: (p: Player, w: World) => {
    aerialInputOnUpdate(p, w);
    attackOnUpdate(p, w);
  },
  OnExit: attackOnExit,
};

export const UAirAttack: FSMState = {
  StateName: 'UAir',
  StateId: STATE_IDS.U_AIR_S,
  OnEnter: (p: Player, w: World) => {
    const geId = GAME_EVENT_IDS.U_AIR_GE;
    const stateId = STATE_IDS.U_AIR_S;
    attackOnEnter(p, w, geId, stateId);
  },
  OnUpdate: (p: Player, w: World) => {
    aerialInputOnUpdate(p, w);
    attackOnUpdate(p, w);
  },
  OnExit: attackOnExit,
};

export const BAirAttack: FSMState = {
  StateName: 'BAir',
  StateId: STATE_IDS.B_AIR_S,
  OnEnter: (p: Player, w: World) => {
    const geId = GAME_EVENT_IDS.B_AIR_GE;
    const stateId = STATE_IDS.B_AIR_S;
    attackOnEnter(p, w, geId, stateId);
  },
  OnUpdate: (p: Player, w: World) => {
    aerialInputOnUpdate(p, w);
    attackOnUpdate(p, w);
  },
  OnExit: attackOnExit,
};

export const DAirAttack: FSMState = {
  StateName: 'DAir',
  StateId: STATE_IDS.D_AIR_S,
  OnEnter: (p: Player, w: World) => {
    const geId = GAME_EVENT_IDS.D_AIR_GE;
    const stateId = STATE_IDS.D_AIR_S;
    attackOnEnter(p, w, geId, stateId);
  },
  OnUpdate: (p: Player, w: World) => {
    aerialInputOnUpdate(p, w);
    attackOnUpdate(p, w);
  },
  OnExit: attackOnExit,
};

export const NeutralSpecial: FSMState = {
  StateName: 'NSpecial',
  StateId: STATE_IDS.SPCL_S,
  OnEnter: (p: Player, w: World) => {
    const geId = GAME_EVENT_IDS.SPCL_GE;
    const stateId = STATE_IDS.SPCL_S;
    attackOnEnter(p, w, geId, stateId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit,
};

export const SideSpecial: FSMState = {
  StateName: 'SideSpecial',
  StateId: STATE_IDS.SIDE_SPCL_S,
  OnEnter: (p: Player, w: World) => {
    const curFrame = w.LocalFrame;
    const ia = w.PlayerData.InputStore(p.ID).GetInputForFrame(curFrame);
    const lxAxis = ia.LXAxis;
    if (lxAxis.Raw < 0) {
      p.Flags.FaceLeft();
    }
    if (lxAxis.Raw >= 0) {
      p.Flags.FaceRight();
    }
    const geId = GAME_EVENT_IDS.SIDE_SPCL_GE;
    const stateId = STATE_IDS.SIDE_SPCL_S;
    attackOnEnter(p, w, geId, stateId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit,
};

export const SideSpecialExtension: FSMState = {
  StateName: 'SideSpecialExtension',
  StateId: STATE_IDS.SIDE_SPCL_EX_S,
  OnEnter: (p: Player, w: World) => {
    const geId = GAME_EVENT_IDS.SIDE_SPCL_EX_GE;
    const stateId = STATE_IDS.SIDE_SPCL_EX_S;
    attackOnEnter(p, w, geId, stateId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit,
};

export const SideSpecialAir: FSMState = {
  StateName: 'SideSpecialAir',
  StateId: STATE_IDS.SIDE_SPCL_AIR_S,
  OnEnter: (p: Player, w: World) => {
    const curFrame = w.LocalFrame;
    const ia = w.PlayerData.InputStore(p.ID).GetInputForFrame(curFrame);
    const lxAxis = ia.LXAxis;
    if (lxAxis.Raw < 0) {
      p.Flags.FaceLeft();
    }
    if (lxAxis.Raw >= 0) {
      p.Flags.FaceRight();
    }
    const geId = GAME_EVENT_IDS.S_SPCL_AIR_GE;
    const stateId = STATE_IDS.SIDE_SPCL_AIR_S;
    attackOnEnter(p, w, geId, stateId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit,
};

export const SideSpecialExtensionAir: FSMState = {
  StateName: 'SideSpecialExtensionAir',
  StateId: STATE_IDS.SIDE_SPCL_EX_AIR_S,
  OnEnter: (p: Player, w: World) => {
    const geId = GAME_EVENT_IDS.S_SPCL_EX_AIR_GE;
    const stateId = STATE_IDS.SIDE_SPCL_EX_AIR_S;
    attackOnEnter(p, w, geId, stateId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit,
};

export const DownSpecial: FSMState = {
  StateName: 'DownSpecial',
  StateId: STATE_IDS.DOWN_SPCL_S,
  OnEnter: (p: Player, w: World) => {
    const geId = GAME_EVENT_IDS.DOWN_SPCL_GE;
    const stateId = STATE_IDS.DOWN_SPCL_S;
    attackOnEnter(p, w, geId, stateId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit,
};

export const DownSpecialAerial: FSMState = {
  StateName: 'DownSpecialAerial',
  StateId: STATE_IDS.DOWN_SPCL_AIR_S,
  OnEnter: (p: Player, w: World) => {
    const geId = GAME_EVENT_IDS.D_SPCL_AIR_GE;
    const stateId = STATE_IDS.DOWN_SPCL_AIR_S;
    attackOnEnter(p, w, geId, stateId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit,
};

export const UpSpecial: FSMState = {
  StateName: 'UpSpecial',
  StateId: STATE_IDS.UP_SPCL_S,
  OnEnter: (p: Player, w: World) => {
    const ia = w.PlayerData.InputStore(p.ID).GetInputForFrame(w.LocalFrame);
    if (ia.LXAxis.Raw > 0) {
      p.Flags.FaceRight();
    }
    if (ia.LXAxis.Raw < 0) {
      p.Flags.FaceLeft();
    }
    const geId = GAME_EVENT_IDS.UP_SPCL_GE;
    const stateId = STATE_IDS.UP_SPCL_S;
    attackOnEnter(p, w, geId, stateId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit,
};

export const NuetralGrab: FSMState = {
  StateName: 'Grab',
  StateId: STATE_IDS.GRAB_S,
  OnEnter: (p: Player, w: World) => {
    const geId = GAME_EVENT_IDS.GRAB_GE;
    const stateId = STATE_IDS.GRAB_S;
    grabOnEnter(p, geId, stateId);
  },
  OnUpdate: grabOnUpdate,
  OnExit: grabOnExit,
};

export const Hold: FSMState = {
  StateName: 'hold',
  StateId: STATE_IDS.GRAB_HOLD_S,
  OnEnter: (p: Player, w: World) => {},
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {},
};

export const Held: FSMState = {
  StateName: 'Held',
  StateId: STATE_IDS.GRAB_HELD_S,
  OnEnter: (p: Player, w: World) => {},
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {
    const grabMeter = p.GrabMeter;
    grabMeter.Meter.Zero();
    grabMeter.ZeroHoldingPlayerId();
  },
};

export const GrabRelease: FSMState = {
  StateName: 'GrabRelease',
  StateId: STATE_IDS.GRAB_RELEASE_S,
  OnEnter: (p: Player, w: World) => {
    const velocity = p.Velocity;
    const flags = p.Flags;
    const releaseVelocity = flags.IsFacingRight ? -6 : 6;
    velocity.X.SetFromNumber(releaseVelocity);
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {},
};

export const GrabEscape: FSMState = {
  StateName: 'GrabEscape',
  StateId: STATE_IDS.GRAB_ESCAPE_S,
  OnEnter: (p: Player, w: World) => {
    const velocity = p.Velocity;
    const flags = p.Flags;
    const releaseVelocity = flags.IsFacingRight ? -10 : 10;
    velocity.X.SetFromNumber(releaseVelocity);
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {},
};

export const ShieldBreak: FSMState = {
  StateName: 'ShieldBreak',
  StateId: STATE_IDS.SHIELD_BREAK_S,
  OnEnter: (p: Player, w: World) => {
    p.Velocity.X.Zero();
    p.Velocity.Y.SetFromNumber(-30);
    p.ECB.SetECBShape(STATE_IDS.SHIELD_BREAK_S);
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {
    p.ECB.ResetECBShape();
  },
};

export const ShieldBreakTumble: FSMState = {
  StateName: 'ShieldBreakTumble',
  StateId: STATE_IDS.SHIELD_BREAK_TUMBLE_S,
  OnEnter: (p: Player, w: World) => {
    p.ECB.SetECBShape(STATE_IDS.SHIELD_BREAK_TUMBLE_S);
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {
    p.ECB.ResetECBShape();
  },
};

export const ShieldBreakLand: FSMState = {
  StateName: 'ShieldBreakLand',
  StateId: STATE_IDS.SHIELD_BREAK_LAND_S,
  OnEnter: (p: Player, w: World) => {
    p.ECB.SetECBShape(STATE_IDS.SHIELD_BREAK_LAND_S);
    p.Velocity.Y.Zero();
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {
    p.ECB.ResetECBShape();
  },
};

export const dizzy: FSMState = {
  StateName: 'Dizzy',
  StateId: STATE_IDS.DIZZY_S,
  OnEnter: (p: Player, w: World) => {
    p.ECB.SetECBShape(STATE_IDS.DIZZY_S);
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {
    p.ECB.ResetECBShape();
  },
};

/**
 * Attack Grabs:
 * pummel
 * forward throw
 * up throw
 * back throw
 * down throw
 */

/**
 * TODO
 * neutralSpecial EX
 * upSpecial EX
 * tech
 * wallSlide
 * wallKick
 * dirtNap
 * groundRecover
 * ledgeRecover
 * getUpAttack
 * ledgeGetupAttack
 * flinch
 * clang
 */

// ~72ish states

//==================== Utils =====================

function fastFallCheck(p: Player, w: World) {
  const inputStore = w.PlayerData.InputStore(p.ID);
  const curFrame = w.LocalFrame;
  const prevFrame = w.PreviousFrame;
  const ia = inputStore.GetInputForFrame(curFrame);
  const prevIa = inputStore.GetInputForFrame(prevFrame);
  if (
    p.Velocity.Y.Raw >= 0 &&
    prevIa !== undefined &&
    ShouldFastFall(ia.LYAxis.Raw, prevIa.LYAxis.Raw)
  ) {
    p.Flags.FastFallOn();
  }
}

function attackOnEnter(
  p: Player,
  w: World,
  gameEventId: GameEventId,
  stateId: StateId
) {
  const attackComp = p.Attacks;
  attackComp.SetCurrentAttack(gameEventId);
  const atk = attackComp.GetAttack();
  if (atk === undefined) {
    return;
  }
  p.ECB.SetECBShape(stateId);
  const onEnterCommands = atk.onEnterCommands;
  const onEnterEventCount = onEnterCommands.length;
  for (let i = 0; i < onEnterEventCount; i++) {
    const onEnterCommand = onEnterCommands[i];
    HandleCommand(w, p, onEnterCommand);
  }
}

function attackOnUpdate(p: Player, w: World) {
  const attack = p.Attacks.GetAttack();

  if (attack === undefined) {
    return;
  }

  const currentStateFrame = p.FSMInfo.CurrentStateFrame;
  const impulse = attack.GetImpulseForFrame(currentStateFrame);

  if (impulse !== undefined) {
    addAttackImpulseToPlayer(p, impulse, attack);
  }

  const updateCommands = attack.onUpdateCommands.get(currentStateFrame);

  if (updateCommands !== undefined) {
    const updateCommandCount = updateCommands.length;
    for (let i = 0; i < updateCommandCount; i++) {
      const updateCommand = updateCommands[i];
      HandleCommand(w, p, updateCommand);
    }
  }
}

function aerialInputOnUpdate(p: Player, w: World) {
  const inputStore = w.PlayerData.InputStore(p.ID);
  const curFrame = w.LocalFrame;
  const ia = inputStore.GetInputForFrame(curFrame);
  const speedsComp = p.Speeds;

  if (!p.Flags.IsPlatDetectDisabled) {
    fastFallCheck(p, w);
  }

  p.Velocity.AddClampedXImpulseRaw(
    speedsComp.AerialSpeedInpulseLimitRaw,
    MultiplyRaw(ia.LXAxis.Raw, speedsComp.ArielVelocityMultiplierRaw)
  );
}

function attackOnExit(p: Player, w: World) {
  const attackComp = p.Attacks;
  const atk = attackComp.GetAttack();
  if (atk === undefined) {
    return;
  }
  const onExitCommands = atk.onExitCommands;
  const onExitCommandCount = onExitCommands.length;
  for (let i = 0; i < onExitCommandCount; i++) {
    const onExitCommand = onExitCommands[i];
    HandleCommand(w, p, onExitCommand);
  }
  attackComp.ZeroCurrentAttack();
  p.ECB.ResetECBShape();
}

function ShouldFastFall(
  curLYAxsisRaw: number,
  prevLYAxsisRaw: number
): boolean {
  return curLYAxsisRaw < -POINT_EIGHT && prevLYAxsisRaw > -POINT_EIGHT;
}

function addAttackImpulseToPlayer(p: Player, impulse: FlatVec, attack: Attack) {
  const xRaw = p.Flags.IsFacingRight ? impulse.X.Raw : -impulse.X.Raw;
  const yRaw = impulse.Y.Raw;
  const clampRaw = attack?.ImpulseClamp?.Raw;
  const pVel = p.Velocity;
  if (clampRaw !== undefined) {
    pVel.AddClampedXImpulseRaw(clampRaw, xRaw);
    pVel.AddClampedYImpulseRaw(clampRaw, yRaw);
  }
}

function grabOnEnter(p: Player, gameEventId: GameEventId, stateId: StateId) {
  const grabComp = p.Grabs;
  grabComp.SetGrab(gameEventId);
  const grab = grabComp.GetGrab();
  if (grab === undefined) {
    return;
  }
  p.ECB.SetECBShape(stateId);
}

function grabOnUpdate(p: Player, w: World) {
  const grabs = p.Grabs;
  const grab = grabs.GetGrab();
  if (grab === undefined) {
    return;
  }

  const currentStateFrame = p.FSMInfo.CurrentStateFrame;
  const impulse = grab.GetImpulseForFrame(currentStateFrame);

  if (impulse !== undefined) {
    addGrabImpulseToPlayer(p, impulse, grab);
  }
}

function grabOnExit(p: Player, w: World) {
  const grabComp = p.Grabs;
  const grab = grabComp.GetGrab();
  if (grab === undefined) {
    return;
  }
  grabComp.ZeroCurrentGrab();
  p.ECB.ResetECBShape();
}

function addGrabImpulseToPlayer(p: Player, impulse: FlatVec, grab: Grab) {
  const xRaw = p.Flags.IsFacingRight ? impulse.X.Raw : -impulse.X.Raw;
  const yRaw = impulse.Y.Raw;
  const clampRaw = grab?.ImpulseClamp?.Raw;
  const pVel = p.Velocity;
  if (clampRaw !== undefined) {
    pVel.AddClampedXImpulseRaw(clampRaw, xRaw);
    pVel.AddClampedYImpulseRaw(clampRaw, yRaw);
  }
}
