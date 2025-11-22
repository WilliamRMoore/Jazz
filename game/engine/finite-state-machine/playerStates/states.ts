import {
  NumberToRaw,
  DivideRaw,
  MultiplyRaw,
  RawToNumber,
} from '../../../math/fixedPoint';
import { COS_LUT, SIN_LUT } from '../../../math/LUTS';
import { HandleCommand } from '../../command/command';
import { FlatVec } from '../../physics/vector';
import { Attack } from '../../player/playerComponents';
import {
  Player,
  AddWalkImpulseToPlayer,
  AddToPlayerYPositionRaw,
} from '../../player/playerOrchestrator';
import { EaseInRaw, EaseInOutRaw } from '../../utils';
import { World } from '../../world/world';
import { FSMState } from '../PlayerStateMachine';
import { STATE_IDS, GAME_EVENT_IDS, GameEventId, StateId } from './shared';

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
    const curFrame = w.localFrame;
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
    const MaxDashSpeedRaw = p.Speeds.MaxDashSpeed.Raw;
    const zeroPointThreeThree = NumberToRaw(0.33);
    const absMaxDashRaw = Math.abs(
      DivideRaw(MaxDashSpeedRaw, zeroPointThreeThree)
    );
    const impulse = flags.IsFacingRight
      ? absMaxDashRaw //Math.floor(MaxDashSpeedRaw / 0.33)
      : -absMaxDashRaw; //-Math.floor(MaxDashSpeedRaw / 0.33);

    p.Velocity.AddClampedXImpulseRaw(MaxDashSpeedRaw, impulse);
  },
  OnUpdate: (p: Player, w: World) => {
    const inputStore = w.PlayerData.InputStore(p.ID);
    const curFrame = w.localFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const speedsComp = p.Speeds;
    const dashSpeedMultiplierRaw = speedsComp.DashMultiplier.Raw;
    const impulse = MultiplyRaw(ia?.LXAxis.Raw ?? 0, dashSpeedMultiplierRaw);
    p.Velocity.AddClampedXImpulseRaw(speedsComp.MaxDashSpeed.Raw, impulse);
  },
  OnExit: (p: Player, w: World) => {},
};

export const DashTurn: FSMState = {
  StateName: 'DASH_TURN',
  StateId: STATE_IDS.DASH_TURN_S,
  OnEnter: (p: Player, w: World) => {
    p.Velocity.X.Zero(); // = 0;
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
    const curFrame = w.localFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    if (ia !== undefined) {
      const speeds = p.Speeds;
      p.Velocity.AddClampedXImpulseRaw(
        speeds.MaxRunSpeed.Raw,
        MultiplyRaw(ia.LXAxis.Raw, speeds.RunSpeedMultiplier.Raw)
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
    const inputStore = w.PlayerData.InputStore(p.ID);
    const curFrame = w.localFrame;
    const prevFrame = w.PreviousFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const prevIa = inputStore.GetInputForFrame(prevFrame);
    const speedsComp = p.Speeds;
    const negZeroPointEight = NumberToRaw(-0.8);

    if (
      p.Velocity.Y.Raw > 0 &&
      ia.LYAxis.Raw < negZeroPointEight &&
      prevIa.LYAxis.Raw > negZeroPointEight
    ) {
      p.Flags.FastFallOn();
    }

    p.Velocity.AddClampedXImpulseRaw(
      speedsComp.AerialSpeedInpulseLimit.Raw,
      MultiplyRaw(ia.LXAxis.Raw, speedsComp.ArielVelocityMultiplier.Raw)
    );
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
    p.Velocity.Y.Zero(); //= 0;
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
    p.Velocity.Y.Zero(); //= 0;
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
    p.Velocity.X.Zero(); //= 0;
    p.Velocity.Y.Zero(); // = 0;
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
    const curFrame = w.localFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const angleIndexRaw = GetAtan2IndexRaw(ia!.LYAxis.Raw, ia!.LXAxis.Raw);
    let speed = p.Speeds.AirDogeSpeed;
    if (ia.LXAxis.Raw === 0 && ia.LYAxis.Raw === 0) {
      speed.Zero();
    }

    pVel.X.SetFromRaw(MultiplyRaw(COS_LUT[angleIndexRaw], speed.Raw));
    pVel.Y.SetFromRaw(MultiplyRaw(-SIN_LUT[angleIndexRaw], speed.Raw));
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
    const oneRaw = NumberToRaw(1);
    const clampedNormalizedTimeRaw = Math.min(normalizedTimeRaw, oneRaw);

    const easeRaw = EaseInRaw(clampedNormalizedTimeRaw);

    const pVel = p.Velocity;
    const oneMinusEaseRaw = oneRaw - easeRaw;
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

export function GetAtan2IndexRaw(yRaw: number, xRaw: number): number {
  if (xRaw === 0 && yRaw === 0) {
    return 0;
  }

  const absX = Math.abs(xRaw);
  const absY = Math.abs(yRaw);

  const ratio = absX > absY ? DivideRaw(absY, absX) : DivideRaw(absX, absY);

  const angleIndex = Math.floor(RawToNumber(MultiplyRaw(ratio, 45)));

  if (absX > absY) {
    if (xRaw > 0) {
      return yRaw > 0 ? angleIndex : 360 - angleIndex;
    } else {
      return yRaw > 0 ? 180 - angleIndex : 180 + angleIndex;
    }
  } else {
    if (yRaw > 0) {
      return xRaw > 0 ? 90 - angleIndex : 90 + angleIndex;
    } else {
      return xRaw > 0 ? 270 + angleIndex : 270 - angleIndex;
    }
  }
}

export const Helpless: FSMState = {
  StateName: 'Helpless',
  StateId: STATE_IDS.HELPLESS_S,
  OnEnter: (p: Player, w: World) => {
    if (p.Jump.OnFirstJump()) {
      p.Jump.IncrementJumps();
    }
  },
  OnUpdate: (p: Player, w: World) => {
    const inputStore = w.PlayerData.InputStore(p.ID);
    const curFrame = w.localFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const speeds = p.Speeds;
    const point6Raw = NumberToRaw(0.6);
    const airSpeedRaw = MultiplyRaw(
      speeds.AerialSpeedInpulseLimit.Raw,
      point6Raw
    );
    const airMultRaw = MultiplyRaw(
      speeds.ArielVelocityMultiplier.Raw,
      point6Raw
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
    p.Velocity.X.Zero(); //= 0;
    p.Velocity.Y.Zero(); //= 0;
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
    const curFrame = w.localFrame;
    const ia = w.PlayerData.InputStore(p.ID).GetInputForFrame(curFrame);
    const speeds = p.Speeds;
    const airSpeed = speeds.AerialSpeedInpulseLimit;
    const airMult = speeds.ArielVelocityMultiplier;
    const inputXMult = MultiplyRaw(ia.LXAxis.Raw, airMult.Raw);
    const inputHalf = DivideRaw(inputXMult, NumberToRaw(2));
    p.Velocity.AddClampedXImpulseRaw(airSpeed.Raw, inputHalf);
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
  OnExit: (p, w) => {},
};

export const Shield: FSMState = {
  StateName: 'Shield',
  StateId: STATE_IDS.SHIELD_S,
  OnEnter: (p: Player, w: World) => {
    p.Shield.Active = true;
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p, w) => {
    p.Shield.Active = false;
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
    const curFrame = w.localFrame;
    const ia = inputStore.GetInputForFrame(curFrame);

    // The roll direction is determined by the player's facing direction,
    // which should be set by the input that triggered the roll.
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
    const easedValueRaw = EaseInOutRaw(normalizedTimeRaw);
    const maxSpeedRaw = p.Speeds.DodeRollSpeed.Raw;
    const direction = p.Flags.IsFacingRight ? NumberToRaw(-1) : NumberToRaw(1);
    p.Velocity.X.SetFromRaw(
      MultiplyRaw(direction, MultiplyRaw(maxSpeedRaw, easedValueRaw))
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
    const curFrame = w.localFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const stateId = STATE_IDS.SIDE_TILT_S;
    const pointOneFive = NumberToRaw(0.15);
    if (ia.LYAxis.Raw > pointOneFive) {
      attackOnEnter(p, w, GAME_EVENT_IDS.S_TILT_U_GE, stateId);
      return;
    }
    if (ia.LYAxis.Raw < -pointOneFive) {
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
    const curFrame = w.localFrame;
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
    fastFallCheck(p, w);
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
    fastFallCheck(p, w);
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
    fastFallCheck(p, w);
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
    fastFallCheck(p, w);
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
    fastFallCheck(p, w);
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
    const curFrame = w.localFrame;
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
    const curFrame = w.localFrame;
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
    const ia = w.PlayerData.InputStore(p.ID).GetInputForFrame(w.localFrame);
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

/**
 * TODO
 * neutralSpecial EX
 * upSpecial EX
 * grab
 * runGrab
 * shieldBreak
 * dodgeRoll
 * tech
 * wallSlide
 * wallKick
 * held (when grabbed)
 * pummel
 * dirtNap
 * groundRecover
 * ledgeRecover
 * getUpAttack
 * ledgeGetupAttack
 * flinch
 * clang
 */

//==================== Utils =====================

function fastFallCheck(p: Player, w: World) {
  const inputStore = w.PlayerData.InputStore(p.ID);
  const curFrame = w.localFrame;
  const prevFrame = w.PreviousFrame;
  const ia = inputStore.GetInputForFrame(curFrame);
  const prevIa = inputStore.GetInputForFrame(prevFrame);
  const speedsComp = p.Speeds;
  const asilRaw = speedsComp.AerialSpeedInpulseLimit.Raw;
  const vel = MultiplyRaw(ia.LXAxis.Raw, asilRaw);
  p.Velocity.AddClampedXImpulseRaw(asilRaw, vel);
  if (
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
  //atk.OnEnter(w, p);
  const onEnterCommands = atk.onEnterCommands;
  const onEnterEventCount = onEnterCommands.length;
  for (let i = 0; i < onEnterEventCount; i++) {
    const onEnterCommand = onEnterCommands[i];
    HandleCommand(w, p, onEnterCommand); //onEnterCommand.handler(w, onEnterCommand);
  }
}

function attackOnUpdate(p: Player, w: World) {
  const attack = p.Attacks.GetAttack();

  if (attack === undefined) {
    return;
  }

  const currentStateFrame = p.FSMInfo.CurrentStateFrame;
  const impulse = attack.GetActiveImpulseForFrame(currentStateFrame);

  if (impulse !== undefined) {
    addAttackImpulseToPlayer(p, impulse, attack);
  }

  const updateCommand = attack.onUpdateCommands.get(currentStateFrame);
  if (updateCommand !== undefined) {
    HandleCommand(w, p, updateCommand); //updateCommand.handler(w, updateCommand);
  }
  //attack.OnUpdate(w, p, currentStateFrame);
}

function attackOnExit(p: Player, w: World) {
  const attackComp = p.Attacks;
  const atk = attackComp.GetAttack();
  if (atk === undefined) {
    return;
  }
  //atk.OnExit(w, p);
  const onExitCommands = atk.onEnterCommands;
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
  const pointEight = NumberToRaw(0.8);

  return curLYAxsisRaw < -pointEight && prevLYAxsisRaw > -pointEight;
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
