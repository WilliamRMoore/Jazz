import { COMMAND_NAMES } from '../engine/command/command';
import { ActivateSensorCommand } from '../engine/command/commands/activateSensor';
import { DeactivateSensorCommand } from '../engine/command/commands/deactivateSensor';
import { SetJumpCountCommand } from '../engine/command/commands/setJumpCount';
import { SetPlayerSensorDetectCommand } from '../engine/command/commands/setPlayerSensorReactor';
import { SetVelocityCommand } from '../engine/command/commands/setPlayerVelocity';
import { SwitchPlayerStateCommand } from '../engine/command/commands/switchPlayerState';
import {
  StateId,
  AttackId,
  STATE_IDS,
  ATTACK_IDS,
  GAME_EVENT_IDS,
} from '../engine/finite-state-machine/stateConfigurations/shared';
import { frameNumber } from '../engine/entity/playerComponents';
import {
  AttackConfig,
  AttackConfigBuilder,
  CharacterConfig,
  ConfigVec,
  ECBShapesConfig,
  HurtCapsuleConfig,
} from './shared';

export class DefaultCharacterConfig implements CharacterConfig {
  public FrameLengths = new Map<StateId, number>();
  public ECBHeight = 0;
  public ECBWidth = 0;
  public ECBOffset = 0;
  public ECBShapes: ECBShapesConfig = new Map<
    StateId,
    { height: number; width: number; yOffset: number }
  >();
  public HurtCapsules: Array<HurtCapsuleConfig> = [];
  public JumpVelocity = 0;
  public NumberOfJumps: number;
  public LedgeBoxHeight = 0;
  public LedgeBoxWidth = 0;
  public ledgeBoxYOffset = 0;
  public attacks: Map<AttackId, AttackConfig> = new Map<
    AttackId,
    AttackConfig
  >();
  public Weight = 0;
  public ShieldRadius = 0;
  public ShieldYOffset = 0;
  public groundedVelocityDecay: number;
  public aerialVelocityDecay: number;
  public aerialSpeedInpulseLimit: number;
  public aerialSpeedMultiplier: number;
  public airDodgeSpeed: number;
  public dodgeRollSpeed: number;
  public maxWalkSpeed: number;
  public maxRunSpeed: number;
  public dashMutiplier: number;
  public maxDashSpeed: number;
  public walkSpeedMulitplier: number;
  public runSpeedMultiplier: number;
  public fastFallSpeed: number;
  public fallSpeed: number;
  public gravity: number;

  constructor() {
    const neutralAttack = GetNAtk();
    const sideTilt = GetSideTilt();
    const sideTiltUp = GetSideTiltUp();
    const sideTiltDown = GetSideTiltDown();
    const downTilt = GetDownTilt();
    const upTilt = GetUpTilt();
    const sideCharge = GetSideCharge();
    const sideChargeExtension = GetSideChargeExtension();
    const upCharge = GetUpcharge();
    const upChargeExtension = GetUpchargeExt();
    const downCharge = GetDownCharge();
    const downChargeEx = GetDownChargeExtension();
    const dashAtk = GetDashAttack();
    const nSpecial = GetNSpecial();
    // grab
    // runGrab
    // side throw
    // down throw
    // up throw
    const sideSpecial = GetSideSpecial();
    const sideSpecialEx = GetSideSpecialExtension();
    const sideSpecialAir = GetSideSpecialAir();
    const sideSpecialExAir = GetSideSpecialExtensionAir();
    const downSpecial = GetDownSpecial();
    const downSpecialAerial = GetDownSpecialAerial();
    const upSpecial = GetUpSpecial();
    // upSpecialExtension
    const neutralAir = GetNeutralAir();
    const fAir = GetFAir();
    const uAir = GetUAir();
    const bAir = GetBAir();
    const dAir = GetDAir();

    this.FrameLengths.set(STATE_IDS.SHIELD_RAISE_S, 6)
      .set(STATE_IDS.SHIELD_DROP_S, 6)
      .set(STATE_IDS.JUMP_SQUAT_S, 4)
      .set(STATE_IDS.TURN_S, 3)
      .set(STATE_IDS.DASH_S, 20)
      .set(STATE_IDS.DASH_TURN_S, 1)
      .set(STATE_IDS.RUN_TURN_S, 20)
      .set(STATE_IDS.STOP_RUN_S, 15)
      .set(STATE_IDS.JUMP_S, 1)
      .set(STATE_IDS.AIR_DODGE_S, 22)
      .set(STATE_IDS.LAND_S, 11)
      .set(STATE_IDS.SOFT_LAND_S, 2)
      .set(STATE_IDS.SPOT_DODGE_S, 43)
      .set(STATE_IDS.ROLL_DODGE_S, 40)
      .set(STATE_IDS.ATTACK_S, neutralAttack.TotalFrameLength)
      .set(STATE_IDS.DASH_ATTACK_S, dashAtk.TotalFrameLength)
      .set(STATE_IDS.DOWN_TILT_S, downTilt.TotalFrameLength)
      .set(STATE_IDS.UP_TILT_S, upTilt.TotalFrameLength)
      .set(STATE_IDS.SIDE_TILT_S, sideTilt.TotalFrameLength)
      .set(STATE_IDS.SIDE_CHARGE_S, sideCharge.TotalFrameLength)
      .set(STATE_IDS.SIDE_CHARGE_EX_S, sideChargeExtension.TotalFrameLength)
      .set(STATE_IDS.UP_CHARGE_S, upCharge.TotalFrameLength)
      .set(STATE_IDS.UP_CHARGE_EX_S, upChargeExtension.TotalFrameLength)
      .set(STATE_IDS.DOWN_CHARGE_S, downCharge.TotalFrameLength)
      .set(STATE_IDS.DOWN_CHARGE_EX_S, downChargeEx.TotalFrameLength)
      .set(STATE_IDS.N_AIR_S, neutralAir.TotalFrameLength)
      .set(STATE_IDS.F_AIR_S, fAir.TotalFrameLength)
      .set(STATE_IDS.U_AIR_S, uAir.TotalFrameLength)
      .set(STATE_IDS.B_AIR_S, bAir.TotalFrameLength)
      .set(STATE_IDS.D_AIR_S, dAir.TotalFrameLength)
      .set(STATE_IDS.SPCL_S, nSpecial.TotalFrameLength)
      .set(STATE_IDS.SIDE_SPCL_S, sideSpecial.TotalFrameLength)
      .set(STATE_IDS.SIDE_SPCL_EX_S, sideSpecialEx.TotalFrameLength)
      .set(STATE_IDS.SIDE_SPCL_AIR_S, sideSpecialAir.TotalFrameLength)
      .set(STATE_IDS.SIDE_SPCL_EX_AIR_S, sideSpecialExAir.TotalFrameLength)
      .set(STATE_IDS.DOWN_SPCL_S, downSpecial.TotalFrameLength)
      .set(STATE_IDS.DOWN_SPCL_AIR_S, downSpecialAerial.TotalFrameLength)
      .set(STATE_IDS.UP_SPCL_S, upSpecial.TotalFrameLength);

    this.ECBShapes.set(STATE_IDS.N_FALL_S, {
      height: 70,
      width: 70,
      yOffset: -25,
    })
      .set(STATE_IDS.JUMP_S, { height: 60, width: 70, yOffset: -15 })
      .set(STATE_IDS.N_AIR_S, { height: 60, width: 70, yOffset: -25 })
      .set(STATE_IDS.F_AIR_S, { height: 60, width: 70, yOffset: -25 })
      .set(STATE_IDS.U_AIR_S, { height: 60, width: 60, yOffset: -25 })
      .set(STATE_IDS.B_AIR_S, { height: 60, width: 60, yOffset: -25 })
      .set(STATE_IDS.D_AIR_S, { height: 90, width: 60, yOffset: -10 })
      .set(STATE_IDS.DOWN_CHARGE_S, { height: 110, width: 85, yOffset: 0 })
      .set(STATE_IDS.DOWN_CHARGE_EX_S, { height: 65, width: 100, yOffset: 0 })
      .set(STATE_IDS.AIR_DODGE_S, { height: 60, width: 70, yOffset: -15 })
      .set(STATE_IDS.DOWN_TILT_S, { height: 50, width: 100, yOffset: 0 })
      .set(STATE_IDS.DOWN_SPCL_S, { height: 65, width: 105, yOffset: 0 })
      .set(STATE_IDS.DOWN_SPCL_AIR_S, { height: 65, width: 65, yOffset: 0 })
      .set(STATE_IDS.JUMP_SQUAT_S, { height: 70, width: 80, yOffset: 0 })
      .set(STATE_IDS.LAND_S, { height: 65, width: 90, yOffset: 0 })
      .set(STATE_IDS.SOFT_LAND_S, { height: 85, width: 95, yOffset: 0 })
      .set(STATE_IDS.LEDGE_GRAB_S, { height: 110, width: 55, yOffset: 0 })
      .set(STATE_IDS.SIDE_SPCL_S, { height: 80, width: 100, yOffset: 0 })
      .set(STATE_IDS.UP_CHARGE_S, { height: 90, width: 100, yOffset: 0 })
      .set(STATE_IDS.UP_CHARGE_EX_S, { height: 110, width: 85, yOffset: 0 })
      .set(STATE_IDS.SIDE_CHARGE_S, { height: 100, width: 85, yOffset: 0 })
      .set(STATE_IDS.SIDE_CHARGE_EX_S, { height: 85, width: 100, yOffset: 0 })
      .set(STATE_IDS.CROUCH_S, { height: 50, width: 100, yOffset: 0 });

    this.ShieldRadius = 75; //new FixedPoint(75);
    this.ShieldYOffset = -50; //new FixedPoint(-50);

    this.maxWalkSpeed = 3.5;
    this.walkSpeedMulitplier = 1.2;
    this.maxRunSpeed = 6.6;
    this.runSpeedMultiplier = 2.2;
    this.fastFallSpeed = 15;
    this.fallSpeed = 7.5;
    this.gravity = 0.6;
    this.aerialVelocityDecay = 0.7;
    this.aerialSpeedInpulseLimit = 4.8;
    this.aerialSpeedMultiplier = 1.8;
    this.dashMutiplier = 3;
    this.maxDashSpeed = 7.5;
    this.airDodgeSpeed = 15;
    this.dodgeRollSpeed = 16;
    this.groundedVelocityDecay = 0.5;

    this.ECBOffset = 0;
    this.ECBHeight = 100;
    this.ECBWidth = 100;

    this.populateHurtCircles();

    this.Weight = 110;

    this.JumpVelocity = 20;
    this.NumberOfJumps = 2;

    this.LedgeBoxHeight = 35;
    this.LedgeBoxWidth = 80;
    this.ledgeBoxYOffset = -130;
    this.attacks
      .set(neutralAttack.AttackId, neutralAttack)
      .set(downTilt.AttackId, downTilt)
      .set(upTilt.AttackId, upTilt)
      .set(sideTilt.AttackId, sideTilt)
      .set(sideTiltUp.AttackId, sideTiltUp)
      .set(sideTiltDown.AttackId, sideTiltDown)
      .set(sideCharge.AttackId, sideCharge)
      .set(sideChargeExtension.AttackId, sideChargeExtension)
      .set(upCharge.AttackId, upCharge)
      .set(upChargeExtension.AttackId, upChargeExtension)
      .set(downCharge.AttackId, downCharge)
      .set(downChargeEx.AttackId, downChargeEx)
      .set(nSpecial.AttackId, nSpecial)
      .set(sideSpecial.AttackId, sideSpecial)
      .set(sideSpecialEx.AttackId, sideSpecialEx)
      .set(downSpecial.AttackId, downSpecial)
      .set(downSpecialAerial.AttackId, downSpecialAerial)
      .set(neutralAir.AttackId, neutralAir)
      .set(fAir.AttackId, fAir)
      .set(uAir.AttackId, uAir)
      .set(bAir.AttackId, bAir)
      .set(dAir.AttackId, dAir)
      .set(sideSpecialAir.AttackId, sideSpecialAir)
      .set(sideSpecialExAir.AttackId, sideSpecialExAir)
      .set(dashAtk.AttackId, dashAtk)
      .set(upSpecial.AttackId, upSpecial);
  }

  private populateHurtCircles() {
    const body: HurtCapsuleConfig = {
      x1: 0,
      y1: -40,
      x2: 0,
      y2: -50,
      radius: 40,
    }; //new HurtCapsule(0, -40, 0, -50, 40);
    const head: HurtCapsuleConfig = {
      x1: 0,
      y1: -105,
      x2: 0,
      y2: -125,
      radius: 14,
    }; //new HurtCapsule(0, -105, 0, -125, 14);
    this.HurtCapsules.push(head);
    this.HurtCapsules.push(body);
  }
}

//const toFv = (x: number, y: number) => new FlatVec(toFp(x), toFp(y));
const toCv = (x: number, y: number) => ({ x: x, y: y } as ConfigVec);

function GetNAtk() {
  const hb1OffSets = new Map<frameNumber, ConfigVec>();
  const hb1Frame3Offset = toCv(30, -50);
  const hb1Frame4Offset = toCv(60, -50);
  const hb1Frame5Offset = toCv(80, -50);
  const hb1Frame6Offset = toCv(80, -50);
  const hb1Frame7Offset = toCv(80, -50);

  hb1OffSets
    .set(3, hb1Frame3Offset)
    .set(4, hb1Frame4Offset)
    .set(5, hb1Frame5Offset)
    .set(6, hb1Frame6Offset)
    .set(7, hb1Frame7Offset);

  const hb2OffSets = new Map<frameNumber, ConfigVec>();
  const hb2Frame3Offset = toCv(15, -50);
  const hb2Frame4Offset = toCv(25, -50);
  const hb2Frame5Offset = toCv(55, -50);
  const hb2Frame6Offset = toCv(65, -50);
  const hb2Frame7Offset = toCv(65, -50);

  hb2OffSets
    .set(3, hb2Frame3Offset)
    .set(4, hb2Frame4Offset)
    .set(5, hb2Frame5Offset)
    .set(6, hb2Frame6Offset)
    .set(7, hb2Frame7Offset);

  const bldr = new AttackConfigBuilder('NAttack');

  bldr
    .WithAttackId(ATTACK_IDS.N_GRND_ATK)
    .WithBaseKnockBack(15)
    .WithKnockBackScaling(54)
    .WithGravity(true)
    .WithTotalFrames(18)
    .WithInteruptableFrame(15)
    .WithHitBubble(7, 16, 0, 60, hb1OffSets)
    .WithHitBubble(6, 14, 1, 60, hb2OffSets);

  return bldr.Build();
}

function GetDashAttack() {
  const basKnowback = 15;
  const knockBackScaling = 45;
  const totalFrames = 37;
  const radius = 25;
  const damage = 12;
  const hb1Offsets = new Map<frameNumber, ConfigVec>();
  const impulses = new Map<frameNumber, ConfigVec>();

  for (let i = 0; i < 15; i++) {
    impulses.set(i, toCv(4, 0));
  }

  hb1Offsets
    .set(5, toCv(40, -60))
    .set(6, toCv(40, -60))
    .set(7, toCv(40, -60))
    .set(8, toCv(40, -60))
    .set(9, toCv(40, -60))
    .set(10, toCv(40, -60))
    .set(11, toCv(40, -60))
    .set(12, toCv(40, -60))
    .set(13, toCv(40, -60))
    .set(14, toCv(40, -60))
    .set(15, toCv(40, -60));

  const bldr = new AttackConfigBuilder('DashAttack');

  bldr
    .WithAttackId(ATTACK_IDS.DASH_ATK)
    .WithGravity(true)
    .WithBaseKnockBack(basKnowback)
    .WithKnockBackScaling(knockBackScaling)
    .WithTotalFrames(totalFrames)
    .WithImpulses(impulses, 18)
    .WithHitBubble(damage, radius, 0, 50, hb1Offsets);

  return bldr.Build();
}

function GetNeutralAir() {
  const activeFrames = 40;
  const hb1OffSets = new Map<frameNumber, ConfigVec>();
  hb1OffSets
    .set(6, toCv(80, -50))
    .set(7, toCv(85, -50))
    .set(8, toCv(90, -50))
    .set(9, toCv(90, -50));

  const hb2OffSets = new Map<frameNumber, ConfigVec>()
    .set(6, toCv(35, -50))
    .set(7, toCv(40, -50))
    .set(8, toCv(45, -50))
    .set(9, toCv(47, -50));

  const hb3offSets = new Map<frameNumber, ConfigVec>()
    .set(6, toCv(10, -50))
    .set(7, toCv(10, -50))
    .set(8, toCv(10, -50))
    .set(9, toCv(10, -50));

  const hb4offsets = new Map<frameNumber, ConfigVec>()
    .set(19, toCv(80, -50))
    .set(20, toCv(85, -50))
    .set(21, toCv(90, -50));

  const hb5Offsets = new Map<frameNumber, ConfigVec>()
    .set(19, toCv(35, -50))
    .set(20, toCv(40, -50))
    .set(21, toCv(45, -50));

  const hb6Offsets = new Map<frameNumber, ConfigVec>()
    .set(19, toCv(10, -50))
    .set(20, toCv(10, -50))
    .set(21, toCv(10, -50))
    .set(22, toCv(10, -50))
    .set(23, toCv(10, -50))
    .set(24, toCv(10, -50))
    .set(25, toCv(10, -50))
    .set(26, toCv(10, -50));

  const bldr = new AttackConfigBuilder('NAir')
    .WithAttackId(ATTACK_IDS.N_AIR_ATK)
    .WithBaseKnockBack(10)
    .WithKnockBackScaling(50)
    .WithGravity(true)
    .WithTotalFrames(activeFrames)
    .WithHitBubble(12, 20, 0, 25, hb1OffSets)
    .WithHitBubble(11, 19, 1, 25, hb2OffSets)
    .WithHitBubble(13, 23, 3, 35, hb3offSets)
    .WithHitBubble(15, 20, 4, 25, hb4offsets)
    .WithHitBubble(12, 20, 5, 25, hb5Offsets)
    .WithHitBubble(13, 23, 6, 35, hb6Offsets);

  return bldr.Build();
}

function GetUAir() {
  const uairTotalFrames = 31;
  const uairActiveStart = 6;
  const uairActiveEnd = 16;
  const uairFramesActive = uairActiveEnd - uairActiveStart + 1;
  const uairRadius = 22;
  const uairDamage = 12;
  const uairBaseKnockBack = 12;
  const uAirLaunchAngle = 20;
  const toeOfNoLaunchAngle = 340;

  const startAngle = 0; // 0 degrees, in front
  const endAngle = (200 * Math.PI) / 180; // 200 degrees, down and to the left

  const bubble1Offsets = generateArcBubbleOffsets(
    startAngle,
    endAngle,
    uairFramesActive,
    160,
    20
  );

  const bubble2Offsets = generateArcBubbleOffsets(
    startAngle,
    endAngle,
    uairFramesActive,
    140,
    20
  );

  const bubble3Offsets = generateArcBubbleOffsets(
    startAngle,
    endAngle,
    uairFramesActive,
    110,
    20
  );

  const uAirAttack = new AttackConfigBuilder('UAir')
    .WithAttackId(ATTACK_IDS.U_AIR_ATK)
    .WithTotalFrames(uairTotalFrames)
    .WithInteruptableFrame(uairTotalFrames)
    .WithBaseKnockBack(uairBaseKnockBack)
    .WithKnockBackScaling(50)
    .WithGravity(true)
    .WithHitBubble(uairDamage, uairRadius, 2, uAirLaunchAngle, bubble1Offsets)
    .WithHitBubble(uairDamage, uairRadius, 1, uAirLaunchAngle, bubble2Offsets)
    .WithHitBubble(
      uairDamage,
      uairRadius,
      0,
      toeOfNoLaunchAngle,
      bubble3Offsets
    )
    .Build();

  return uAirAttack;
}

function GetFAir() {
  // FAir attack parameters
  const fairTotalFrames = 40;
  const fairActiveStart = 11;
  const fairActiveEnd = 22;
  const fairFramesActive = fairActiveEnd - fairActiveStart + 1;
  const fairRadius = 25;
  const fairDamage = 17;
  const fairBaseKnockback = 15;
  const fairLaunchAngle = 30;

  // Bubble 1: closer to player, rotates from above to below, retracts inward
  const bubble1Offsets = generateArcBubbleOffsets(
    -Math.PI / 2, // start above (90deg)
    Math.PI / 2, // end below (270deg)
    fairFramesActive,
    155, // distance from player center
    130, // retract inwards by 10px at end
    12,
    false
  );

  // Bubble 2: further from player, stacked above, same rotation
  const bubble2Offsets = generateArcBubbleOffsets(
    -Math.PI / 2,
    Math.PI / 2,
    fairFramesActive,
    130,
    110,
    12,
    false
  );

  const bubble3Offsets = generateArcBubbleOffsets(
    -Math.PI / 2,
    Math.PI / 2,
    fairFramesActive,
    100,
    100,
    12,
    false
  );

  // Build the FAir attack using AttackBuilder
  const FairAttack = new AttackConfigBuilder('FAir')
    .WithAttackId(ATTACK_IDS.F_AIR_ATK)
    .WithTotalFrames(fairTotalFrames)
    .WithInteruptableFrame(fairTotalFrames)
    .WithBaseKnockBack(fairBaseKnockback)
    .WithKnockBackScaling(45)
    .WithGravity(true)
    .WithHitBubble(fairDamage, fairRadius, 2, fairLaunchAngle, bubble1Offsets)
    .WithHitBubble(fairDamage, fairRadius, 1, fairLaunchAngle, bubble2Offsets)
    .WithHitBubble(fairDamage, fairRadius, 0, fairLaunchAngle, bubble3Offsets)
    .Build();

  return FairAttack;
}
function GetBAir() {
  const totalFrames = 33;
  const baseKnockBack = 17;
  const knockBackScaling = 50;
  const damage = 16;
  const radius = 27;
  const launchAngle = 150;

  const hb1OffSets = new Map<frameNumber, ConfigVec>();
  const hb1Frame9Offset = toCv(-40, -45);
  const hb1Frame10Offset = toCv(-44, -45);
  const hb1Frame11Offset = toCv(-46, -45);
  const hb1Frame12Offset = toCv(-44, -45);
  const hb1Frame13Offset = toCv(-44, -45);
  const hb1Frame14Offset = toCv(-44, -45);
  const hb1Frame15Offset = toCv(-44, -45);

  hb1OffSets
    .set(9, hb1Frame9Offset)
    .set(10, hb1Frame10Offset)
    .set(11, hb1Frame11Offset)
    .set(12, hb1Frame12Offset)
    .set(13, hb1Frame13Offset)
    .set(14, hb1Frame14Offset)
    .set(15, hb1Frame15Offset);

  const hb2OffSets = new Map<frameNumber, ConfigVec>();
  const hb2Frame9Offset = toCv(-70, -40);
  const hb2Frame10Offset = toCv(-74, -39);
  const hb2Frame11Offset = toCv(-77, -38);
  const hb2Frame12Offset = toCv(-75, -38);
  const hb2Frame13Offset = toCv(-75, -38);
  const hb2Frame14Offset = toCv(-75, -38);
  const hb2Frame15Offset = toCv(-75, -38);

  hb2OffSets
    .set(9, hb2Frame9Offset)
    .set(10, hb2Frame10Offset)
    .set(11, hb2Frame11Offset)
    .set(12, hb2Frame12Offset)
    .set(13, hb2Frame13Offset)
    .set(14, hb2Frame14Offset)
    .set(15, hb2Frame15Offset);

  const bldr = new AttackConfigBuilder('BAir');

  bldr
    .WithAttackId(ATTACK_IDS.B_AIR_ATK)
    .WithBaseKnockBack(baseKnockBack)
    .WithKnockBackScaling(knockBackScaling)
    .WithGravity(true)
    .WithTotalFrames(totalFrames)
    .WithHitBubble(damage, radius, 1, launchAngle, hb1OffSets)
    .WithHitBubble(damage, radius, 0, launchAngle, hb2OffSets);

  return bldr.Build();
}

function GetDAir() {
  const activeFrames = 35;
  const radius = 30;
  const damage = 20;
  const baseKnockBack = 20;
  const knockBackScaling = 45;
  const launchAngle = 285;

  const hb1OffSets = new Map<frameNumber, ConfigVec>();
  hb1OffSets
    .set(13, toCv(0, -30))
    .set(14, toCv(0, -30))
    .set(15, toCv(0, -30))
    .set(16, toCv(0, -30))
    .set(17, toCv(0, -30))
    .set(18, toCv(0, -30));

  const hb2OffSets = new Map<frameNumber, ConfigVec>()
    .set(13, toCv(-5, -5))
    .set(14, toCv(-8, -6))
    .set(15, toCv(-10, -7))
    .set(16, toCv(-12, -10))
    .set(17, toCv(-9, -10))
    .set(18, toCv(-7, -9));

  const hb3offSets = new Map<frameNumber, ConfigVec>()
    .set(13, toCv(0, 15))
    .set(14, toCv(0, 17))
    .set(15, toCv(0, 20))
    .set(16, toCv(0, 23))
    .set(17, toCv(0, 21))
    .set(18, toCv(0, 19));

  const bldr = new AttackConfigBuilder('DAir')
    .WithAttackId(ATTACK_IDS.D_AIR_ATK)
    .WithBaseKnockBack(baseKnockBack)
    .WithKnockBackScaling(knockBackScaling)
    .WithGravity(true)
    .WithTotalFrames(activeFrames)
    .WithHitBubble(damage, radius, 0, launchAngle, hb1OffSets)
    .WithHitBubble(damage, radius, 1, launchAngle, hb2OffSets)
    .WithHitBubble(damage, radius, 2, launchAngle, hb3offSets);

  return bldr.Build();
}

function GetDownTilt() {
  const totalFrames = 33;
  const damage = 11;
  const launchAngle = 70;
  const radius = 27;
  const baseKnockBack = 20;
  const knockBackScaling = 30;

  const hb1Offsets = new Map<frameNumber, ConfigVec>();
  const hb2Offsets = new Map<frameNumber, ConfigVec>();
  const hb3Offsets = new Map<frameNumber, ConfigVec>();

  hb1Offsets
    .set(9, toCv(110, -15))
    .set(10, toCv(110, -15))
    .set(11, toCv(110, -15))
    .set(12, toCv(110, -15))
    .set(13, toCv(110, -15))
    .set(14, toCv(110, -15));

  hb2Offsets
    .set(9, toCv(85, -10))
    .set(10, toCv(85, -10))
    .set(11, toCv(85, -10))
    .set(12, toCv(85, -10))
    .set(13, toCv(85, -10))
    .set(14, toCv(85, -10));

  hb3Offsets
    .set(9, toCv(50, -7))
    .set(10, toCv(50, -7))
    .set(11, toCv(50, -7))
    .set(12, toCv(50, -7))
    .set(13, toCv(50, -7))
    .set(14, toCv(50, -7));

  const bldr = new AttackConfigBuilder('DownTilt');

  bldr
    .WithAttackId(ATTACK_IDS.D_TILT_ATK)
    .WithBaseKnockBack(baseKnockBack)
    .WithKnockBackScaling(knockBackScaling)
    .WithTotalFrames(totalFrames)
    .WithGravity(true)
    .WithHitBubble(damage, radius, 0, launchAngle, hb1Offsets)
    .WithHitBubble(damage - 1, radius, 1, launchAngle, hb2Offsets)
    .WithHitBubble(damage - 2, radius, 2, launchAngle, hb3Offsets);

  return bldr.Build();
}

function GetSideTilt() {
  const totalFrames = 33;
  const damage = 12;
  const launchAngle = 40;
  const radius = 27;
  const baseKnockBack = 20;
  const knockBackScaling = 30;

  const hb1Offsets = new Map<frameNumber, ConfigVec>();
  const hb2Offsets = new Map<frameNumber, ConfigVec>();
  const hb3Offsets = new Map<frameNumber, ConfigVec>();

  hb1Offsets
    .set(9, toCv(100, -40))
    .set(10, toCv(100, -40))
    .set(11, toCv(100, -40))
    .set(12, toCv(100, -40))
    .set(13, toCv(100, -40))
    .set(14, toCv(100, -40));

  hb2Offsets
    .set(9, toCv(60, -40))
    .set(10, toCv(60, -40))
    .set(11, toCv(60, -40))
    .set(12, toCv(60, -40))
    .set(13, toCv(60, -40))
    .set(14, toCv(60, -40));

  hb3Offsets
    .set(9, toCv(10, -40))
    .set(10, toCv(10, -40))
    .set(11, toCv(10, -40))
    .set(12, toCv(10, -40))
    .set(13, toCv(10, -40))
    .set(14, toCv(10, -40));

  const bldr = new AttackConfigBuilder('SideTilt');

  bldr
    .WithAttackId(ATTACK_IDS.S_TILT_ATK)
    .WithBaseKnockBack(baseKnockBack)
    .WithKnockBackScaling(knockBackScaling)
    .WithTotalFrames(totalFrames)
    .WithGravity(true)
    .WithHitBubble(damage, radius, 0, launchAngle, hb1Offsets)
    .WithHitBubble(damage - 1, radius - 2, 1, launchAngle, hb2Offsets)
    .WithHitBubble(damage - 2, radius - 4, 2, launchAngle, hb3Offsets);

  return bldr.Build();
}

function GetSideTiltDown() {
  const totalFrames = 33;
  const damage = 12;
  const launchAngle = 40;
  const radius = 27;
  const baseKnockBack = 20;
  const knockBackScaling = 30;

  const hb1Offsets = new Map<frameNumber, ConfigVec>();
  const hb2Offsets = new Map<frameNumber, ConfigVec>();
  const hb3Offsets = new Map<frameNumber, ConfigVec>();

  hb1Offsets
    .set(9, toCv(100, -25))
    .set(10, toCv(100, -25))
    .set(11, toCv(100, -25))
    .set(12, toCv(100, -25))
    .set(13, toCv(100, -25))
    .set(14, toCv(100, -25));

  hb2Offsets
    .set(9, toCv(60, -32))
    .set(10, toCv(60, -32))
    .set(11, toCv(60, -32))
    .set(12, toCv(60, -32))
    .set(13, toCv(60, -32))
    .set(14, toCv(60, -32));

  hb3Offsets
    .set(9, toCv(10, -40))
    .set(10, toCv(10, -40))
    .set(11, toCv(10, -40))
    .set(12, toCv(10, -40))
    .set(13, toCv(10, -40))
    .set(14, toCv(10, -40));

  const bldr = new AttackConfigBuilder('SideTiltDown');

  bldr
    .WithAttackId(ATTACK_IDS.S_TITL_D_ATK)
    .WithBaseKnockBack(baseKnockBack)
    .WithKnockBackScaling(knockBackScaling)
    .WithTotalFrames(totalFrames)
    .WithGravity(true)
    .WithHitBubble(damage, radius, 0, launchAngle, hb1Offsets)
    .WithHitBubble(damage - 1, radius - 2, 1, launchAngle, hb2Offsets)
    .WithHitBubble(damage - 2, radius - 4, 2, launchAngle, hb3Offsets);

  return bldr.Build();
}

function GetSideTiltUp() {
  const totalFrames = 33;
  const damage = 12;
  const launchAngle = 40;
  const radius = 27;
  const baseKnockBack = 20;
  const knockBackScaling = 30;

  const hb1Offsets = new Map<frameNumber, ConfigVec>();
  const hb2Offsets = new Map<frameNumber, ConfigVec>();
  const hb3Offsets = new Map<frameNumber, ConfigVec>();

  hb1Offsets
    .set(9, toCv(100, -65))
    .set(10, toCv(100, -65))
    .set(11, toCv(100, -65))
    .set(12, toCv(100, -65))
    .set(13, toCv(100, -65))
    .set(14, toCv(100, -65));

  hb2Offsets
    .set(9, toCv(60, -53))
    .set(10, toCv(60, -53))
    .set(11, toCv(60, -53))
    .set(12, toCv(60, -53))
    .set(13, toCv(60, -53))
    .set(14, toCv(60, -53));

  hb3Offsets
    .set(9, toCv(10, -40))
    .set(10, toCv(10, -40))
    .set(11, toCv(10, -40))
    .set(12, toCv(10, -40))
    .set(13, toCv(10, -40))
    .set(14, toCv(10, -40));

  const bldr = new AttackConfigBuilder('SideTiltUp');

  bldr
    .WithAttackId(ATTACK_IDS.S_TILT_U_ATK)
    .WithBaseKnockBack(baseKnockBack)
    .WithKnockBackScaling(knockBackScaling)
    .WithTotalFrames(totalFrames)
    .WithGravity(true)
    .WithHitBubble(damage, radius, 0, launchAngle, hb1Offsets)
    .WithHitBubble(damage - 1, radius - 2, 1, launchAngle, hb2Offsets)
    .WithHitBubble(damage - 2, radius - 4, 2, launchAngle, hb3Offsets);

  return bldr.Build();
}

function GetUpTilt() {
  const totalFrames = 60;
  const damage = 16;
  const launchAngle = 65;
  const nonExplsoiveRadius = 30;
  const explosiveRadius = 50;
  const BaseKnockBack = 30;
  const knockBackScaling = 45;

  const startAngle = (90 * Math.PI) / 180;
  const endAngle = (-315 * Math.PI) / 180;

  const hitBubbleOffsets = generateArcBubbleOffsets(
    startAngle,
    endAngle,
    58,
    120,
    0,
    50,
    true
  );

  const hitBubbleOffsets2 = new Map<frameNumber, ConfigVec>();

  hitBubbleOffsets2.set(59, toCv(110, -40)).set(60, toCv(110, -40));

  const bldr = new AttackConfigBuilder('UpTilt');

  bldr
    .WithAttackId(ATTACK_IDS.U_TILT_ATK)
    .WithBaseKnockBack(BaseKnockBack)
    .WithKnockBackScaling(knockBackScaling)
    .WithGravity(true)
    .WithTotalFrames(totalFrames)
    .WithHitBubble(damage, nonExplsoiveRadius, 0, launchAngle, hitBubbleOffsets)
    .WithHitBubble(
      damage * 2,
      explosiveRadius,
      1,
      launchAngle,
      hitBubbleOffsets2
    );

  return bldr.Build();
}

function GetUpcharge() {
  const totalFrames = 180;

  const bldr = new AttackConfigBuilder('UpCharge')
    .WithAttackId(ATTACK_IDS.U_CHARGE_ATK)
    .WithTotalFrames(totalFrames)
    .WithGravity(true);

  return bldr.Build();
}

function GetUpchargeExt() {
  const totalFrames = 45;
  const damage = 20;
  const launchAngle = 75;
  const radius = 30;
  const baseKb = 25;
  const knockBackScaling = 35;

  const startAngle = (1 * Math.PI) / 100;
  const endAngle = (50 * Math.PI) / 100;

  const h1offset = generateArcBubbleOffsets(
    startAngle,
    endAngle,
    6,
    105,
    0,
    21
  );

  h1offset.forEach((v, k) => {
    v.y -= 40;
  });

  const bldr = new AttackConfigBuilder('UpChargeExtension');

  bldr
    .WithAttackId(ATTACK_IDS.U_CHARGE_EX_ATK)
    .WithBaseKnockBack(baseKb)
    .WithKnockBackScaling(knockBackScaling)
    .WithGravity(true)
    .WithTotalFrames(totalFrames)
    .WithHitBubble(damage, radius, 0, launchAngle, h1offset);

  return bldr.Build();
}

function GetDownCharge() {
  const totalFrames = 180;

  const bldr = new AttackConfigBuilder('DownCharge')
    .WithAttackId(ATTACK_IDS.D_CHARGE_ATK)
    .WithTotalFrames(totalFrames)
    .WithGravity(true);

  return bldr.Build();
}

function GetDownChargeExtension() {
  const totalFrames = 55;
  const damage = 15;
  const launchAngle = 90;
  const radius = 30;
  const baseKb = 35;
  const knockBackScaling = 15;

  const of1 = new Map<frameNumber, ConfigVec>();
  const of2 = new Map<frameNumber, ConfigVec>();
  const of3 = new Map<frameNumber, ConfigVec>();
  const of4 = new Map<frameNumber, ConfigVec>();
  const of5 = new Map<frameNumber, ConfigVec>();
  const of6 = new Map<frameNumber, ConfigVec>();

  const activeFrames = 9;
  const attackStart = 21;

  for (let i = 0; i < activeFrames; i++) {
    const frame = i + attackStart;
    if (i < 3) {
      of1.set(frame, toCv(50, 0));
      of2.set(frame, toCv(-50, 0));
    } else if (i < 6) {
      of3.set(frame, toCv(70, 0));
      of4.set(frame, toCv(-70, 0));
    } else if (i < 9) {
      of5.set(frame, toCv(90, 0));
      of6.set(frame, toCv(-90, 0));
    }
  }

  const bldr = new AttackConfigBuilder('DownChargeExtension');

  bldr
    .WithAttackId(ATTACK_IDS.D_CHARGE_EX_ATK)
    .WithBaseKnockBack(baseKb)
    .WithKnockBackScaling(knockBackScaling)
    .WithGravity(true)
    .WithTotalFrames(totalFrames)
    .WithHitBubble(damage, radius, 0, launchAngle, of1)
    .WithHitBubble(damage, radius, 1, launchAngle, of2)
    .WithHitBubble(damage, radius, 2, launchAngle, of3)
    .WithHitBubble(damage, radius, 3, launchAngle, of4)
    .WithHitBubble(damage, radius, 4, launchAngle, of5)
    .WithHitBubble(damage, radius, 5, launchAngle, of6);

  return bldr.Build();
}

function GetSideCharge() {
  const totalFrames = 180;

  const bldr = new AttackConfigBuilder('SideCharge')
    .WithAttackId(ATTACK_IDS.S_CHARGE_ATK)
    .WithTotalFrames(totalFrames)
    .WithGravity(true);

  return bldr.Build();
}

function GetSideChargeExtension() {
  const totalFrames = 60;
  const hb1Damage = 22;
  const hb2Damage = 20;
  const baseKnockBack = 30;
  const knockBackScaling = 45;
  const radius = 18;

  const hitBubbleOffsets1 = new Map<frameNumber, ConfigVec>();
  const hitBubbleOffsets2 = new Map<frameNumber, ConfigVec>();

  hitBubbleOffsets1
    .set(18, toCv(-10, -40))
    .set(19, toCv(10, -40))
    .set(20, toCv(40, -40))
    .set(21, toCv(65, -40))
    .set(22, toCv(70, -40))
    .set(23, toCv(70, -40));

  hitBubbleOffsets2
    .set(19, toCv(0, -40))
    .set(20, toCv(30, -40))
    .set(21, toCv(55, -40))
    .set(22, toCv(60, -40));

  const impulses = new Map<frameNumber, ConfigVec>();

  impulses.set(20, toCv(8, 0));

  const bldr = new AttackConfigBuilder('SideChargeExtension')
    .WithAttackId(ATTACK_IDS.S_CHARGE_EX_ATK)
    .WithTotalFrames(totalFrames)
    .WithImpulses(impulses, 10)
    .WithGravity(true)
    .WithHitBubble(hb1Damage, radius, 0, 50, hitBubbleOffsets1)
    .WithHitBubble(hb2Damage, radius, 1, 50, hitBubbleOffsets2)
    .WithBaseKnockBack(baseKnockBack)
    .WithKnockBackScaling(knockBackScaling);

  return bldr.Build();
}

function GetNSpecial() {
  const activeFrames = 120;
  const h1Damage = 24;
  const baseKb = 35;
  const knockBackScaling = 45;
  const radius = 25;
  const h1Offset = new Map<frameNumber, ConfigVec>();

  for (let i = 80; i < 100; i++) {
    h1Offset.set(i, toCv(90, -40));
  }

  const bldr = new AttackConfigBuilder('NSpecial');

  bldr
    .WithAttackId(ATTACK_IDS.N_SPCL_ATK)
    .WithTotalFrames(activeFrames)
    .WithGravity(true)
    .WithHitBubble(h1Damage, radius, 0, 65, h1Offset)
    .WithBaseKnockBack(baseKb)
    .WithKnockBackScaling(knockBackScaling);

  return bldr.Build();
}

function GetSideSpecial() {
  const activeFrames = 80;
  const impulses = new Map<frameNumber, ConfigVec>();

  const switchStateCommand: SwitchPlayerStateCommand = {
    commandName: COMMAND_NAMES.PLAYER_SWITCH_STATE,
    payload: GAME_EVENT_IDS.SIDE_SPCL_EX_GE,
  };

  const sensorReactorChangeStateOnDetection: SetPlayerSensorDetectCommand = {
    commandName: COMMAND_NAMES.SET_SENSOR_REACT_COMMAND,
    payload: switchStateCommand,
  };

  const setPlayerVelocityToZero: SetVelocityCommand = {
    commandName: COMMAND_NAMES.VELOCITY_SET,
    payload: {
      x: 0,
      y: 0,
    },
  };

  const sensor1: ActivateSensorCommand = {
    commandName: COMMAND_NAMES.SENSOR_ACTIVATE,
    payload: {
      x: 45,
      y: -15,
      radius: 30,
    },
  };
  const sensor2: ActivateSensorCommand = {
    commandName: COMMAND_NAMES.SENSOR_ACTIVATE,
    payload: {
      x: 45,
      y: -50,
      radius: 30,
    },
  };
  const sensor3: ActivateSensorCommand = {
    commandName: COMMAND_NAMES.SENSOR_ACTIVATE,
    payload: {
      x: 45,
      y: -85,
      radius: 30,
    },
  };

  const frameActivate = 15;

  const deactivateSensor: DeactivateSensorCommand = {
    commandName: COMMAND_NAMES.SENSOR_DEACTIVATE,
    payload: undefined,
  };

  const frameDeactivate = 40;

  impulses.set(5, toCv(-6, 0)).set(6, toCv(-3, 0));
  for (let i = 14; i < 35; i++) {
    impulses.set(i, toCv(4, 0));
  }

  const bldr = new AttackConfigBuilder('SideSpecial');

  bldr
    .WithAttackId(ATTACK_IDS.S_SPCL_ATK)
    .WithOnEnterCommand(setPlayerVelocityToZero)
    .WithOnEnterCommand(sensorReactorChangeStateOnDetection)
    .WithOnUpdateEvent(frameActivate, sensor1)
    .WithOnUpdateEvent(frameActivate, sensor2)
    .WithOnUpdateEvent(frameActivate, sensor3)
    .WithOnUpdateEvent(frameDeactivate, deactivateSensor)
    .WithOnExitEvent(deactivateSensor)
    .WithImpulses(impulses, 13)
    .WithTotalFrames(activeFrames)
    .CanOnlyFallOffLedgeIfFacingIt()
    .WithGravity(false);

  return bldr.Build();
}

function GetSideSpecialExtension() {
  const totalFrameLength = 25;
  const hb1Offsets = new Map<frameNumber, ConfigVec>();
  const damage = 16;
  const radius = 40;
  const baseKnockBack = 30;
  const knockBackScaling = 45;

  hb1Offsets
    .set(3, toCv(80, -50))
    .set(4, toCv(90, -65))
    .set(5, toCv(100, -85))
    .set(6, toCv(65, -105))
    .set(7, toCv(25, -125));

  const setVelocityToZero: SetVelocityCommand = {
    commandName: COMMAND_NAMES.VELOCITY_SET,
    payload: {
      x: 0,
      y: 0,
    },
  };

  const bldr = new AttackConfigBuilder('SideSpecialExtension');

  bldr
    .WithAttackId(ATTACK_IDS.S_SPCL_EX_ATK)
    .WithTotalFrames(totalFrameLength)
    .WithBaseKnockBack(baseKnockBack)
    .WithKnockBackScaling(knockBackScaling)
    .WithOnEnterCommand(setVelocityToZero)
    .WithHitBubble(damage, radius, 0, 89, hb1Offsets);

  return bldr.Build();
}

function GetSideSpecialAir() {
  const activeFrames = 70;
  const impulses = new Map<frameNumber, ConfigVec>();
  const frameToActivate = 15;
  const frameToDeactivate = 40;

  const setPlayerVelocityToZero: SetVelocityCommand = {
    commandName: COMMAND_NAMES.VELOCITY_SET,
    payload: {
      x: 0,
      y: 0,
    },
  };

  const setPlayerStateToSideSpclAirEx: SwitchPlayerStateCommand = {
    commandName: COMMAND_NAMES.PLAYER_SWITCH_STATE,
    payload: GAME_EVENT_IDS.S_SPCL_EX_AIR_GE,
  };

  const setSensorReactorToSwicthStateOnDetection: SetPlayerSensorDetectCommand =
    {
      commandName: COMMAND_NAMES.SET_SENSOR_REACT_COMMAND,
      payload: setPlayerStateToSideSpclAirEx,
    };

  const activateSensor1: ActivateSensorCommand = {
    commandName: COMMAND_NAMES.SENSOR_ACTIVATE,
    payload: {
      x: 45,
      y: -15,
      radius: 30,
    },
  };
  const activateSensor2: ActivateSensorCommand = {
    commandName: COMMAND_NAMES.SENSOR_ACTIVATE,
    payload: {
      x: 45,
      y: -50,
      radius: 30,
    },
  };
  const activateSensor3: ActivateSensorCommand = {
    commandName: COMMAND_NAMES.SENSOR_ACTIVATE,
    payload: {
      x: 45,
      y: -85,
      radius: 30,
    },
  };

  const deactivateSensor: DeactivateSensorCommand = {
    commandName: COMMAND_NAMES.SENSOR_DEACTIVATE,
    payload: undefined,
  };

  for (let i = 14; i < 35; i++) {
    impulses.set(i, toCv(4, 0));
  }

  const bldr = new AttackConfigBuilder('SideSpecialAir');

  bldr
    .WithAttackId(ATTACK_IDS.S_SPCL_AIR_ATK)
    .WithOnEnterCommand(setPlayerVelocityToZero)
    .WithOnEnterCommand(setSensorReactorToSwicthStateOnDetection)
    .WithOnUpdateEvent(frameToActivate, activateSensor1)
    .WithOnUpdateEvent(frameToActivate, activateSensor2)
    .WithOnUpdateEvent(frameToActivate, activateSensor3)
    .WithOnUpdateEvent(frameToDeactivate, deactivateSensor)
    .WithOnExitEvent(deactivateSensor)
    .WithImpulses(impulses, 12)
    .WithTotalFrames(activeFrames)
    .WithGravity(false);

  return bldr.Build();
}

function GetSideSpecialExtensionAir() {
  const totalFrameLength = 25;
  const hb1Offsets = new Map<frameNumber, ConfigVec>();
  const damage = 16;
  const radius = 40;
  const baseKnockBack = 30;
  const knockBackScaling = 45;
  const launchAngle = 270;

  hb1Offsets
    .set(3, toCv(25, -125))
    .set(4, toCv(65, -100))
    .set(5, toCv(100, -75))
    .set(6, toCv(90, -50))
    .set(7, toCv(80, -35));

  const setPlayerVelocityToZero: SetVelocityCommand = {
    commandName: COMMAND_NAMES.VELOCITY_SET,
    payload: {
      x: 0,
      y: 0,
    },
  };

  const bldr = new AttackConfigBuilder('SideSpecialExtensionAir');

  bldr
    .WithAttackId(ATTACK_IDS.S_SPCL_EX_AIR_ATK)
    .WithTotalFrames(totalFrameLength)
    .WithBaseKnockBack(baseKnockBack)
    .WithKnockBackScaling(knockBackScaling)
    .WithOnEnterCommand(setPlayerVelocityToZero)
    .WithHitBubble(damage, radius, 0, launchAngle, hb1Offsets);

  return bldr.Build();
}

function GetDownSpecial() {
  const activeFrames = 77;
  const impulses = new Map<frameNumber, ConfigVec>();
  const hb1OffSets = new Map<frameNumber, ConfigVec>();
  const hb2OffSets = new Map<frameNumber, ConfigVec>();
  const hb3offSets = new Map<frameNumber, ConfigVec>();
  const hb4OffSets = new Map<frameNumber, ConfigVec>();

  for (let i = 23; i < activeFrames; i++) {
    impulses.set(i, toCv(2, 0));
    hb1OffSets.set(i, toCv(100, -25));
    hb2OffSets.set(i, toCv(70, -25));
    hb3offSets.set(i, toCv(40, -25));
    if (i > 50) {
      hb4OffSets.set(i, toCv(120, -25));
    }
  }

  const blrd = new AttackConfigBuilder('DSpecial');

  blrd
    .WithAttackId(ATTACK_IDS.D_SPCL_ATK)
    .WithBaseKnockBack(15)
    .WithKnockBackScaling(66)
    .WithGravity(false)
    .WithTotalFrames(activeFrames)
    .WithHitBubble(15, 20, 0, 45, hb1OffSets)
    .WithHitBubble(13, 19, 1, 45, hb2OffSets)
    .WithHitBubble(12, 18, 3, 45, hb3offSets)
    .WithHitBubble(16, 25, 4, 45, hb4OffSets)
    .WithImpulses(impulses, 12);

  return blrd.Build();
}

function GetDownSpecialAerial() {
  const activeFrames = 60;
  const launchAngle = 280;
  const impulses = new Map<frameNumber, ConfigVec>();
  const hb1OffSets = new Map<frameNumber, ConfigVec>();
  const hb2OffSets = new Map<frameNumber, ConfigVec>();
  const hb3offSets = new Map<frameNumber, ConfigVec>();
  const hb4OffSets = new Map<frameNumber, ConfigVec>();

  for (let i = 13; i < activeFrames - 10; i++) {
    impulses.set(i, toCv(1.5, 1.5));
    hb1OffSets.set(i, toCv(60, 50));
    hb2OffSets.set(i, toCv(40, 25));
    hb3offSets.set(i, toCv(20, 0));
  }

  const setPlayerVelocityToZero: SetVelocityCommand = {
    commandName: COMMAND_NAMES.VELOCITY_SET,
    payload: {
      x: 0,
      y: 0,
    },
  };

  const setJumpToOne: SetJumpCountCommand = {
    commandName: COMMAND_NAMES.SET_JUMP_COUNT,
    payload: 1,
  };

  const blrd = new AttackConfigBuilder('DSpecialAir');

  blrd
    .WithAttackId(ATTACK_IDS.D_SPCL_AIR_ATK)
    .WithBaseKnockBack(15)
    .WithKnockBackScaling(66)
    .WithGravity(false)
    .WithTotalFrames(activeFrames)
    .WithHitBubble(15, 20, 0, launchAngle, hb1OffSets)
    .WithHitBubble(13, 19, 1, launchAngle, hb2OffSets)
    .WithHitBubble(12, 18, 3, launchAngle, hb3offSets)
    .WithHitBubble(16, 25, 4, launchAngle, hb4OffSets)
    .WithImpulses(impulses, 8)
    .WithOnEnterCommand(setPlayerVelocityToZero)
    .WithOnExitEvent(setJumpToOne);

  return blrd.Build();
}

function GetUpSpecial() {
  const totalFrameLength = 62;
  const impulses = new Map<frameNumber, ConfigVec>();
  for (let i = 13; i < 29; i++) {
    impulses.set(i, toCv(1.2, -2));
  }

  const bldr = new AttackConfigBuilder('UpSpecial');

  const setPlayerVelocityToZero: SetVelocityCommand = {
    commandName: COMMAND_NAMES.VELOCITY_SET,
    payload: {
      x: 0,
      y: 0,
    },
  };

  bldr
    .WithAttackId(ATTACK_IDS.U_SPCL_ATK)
    .WithTotalFrames(totalFrameLength)
    .WithImpulses(impulses, 12)
    .WithGravity(false)
    .WithOnEnterCommand(setPlayerVelocityToZero);
  // .WithEnterAction((w: World, p: Player) => {
  //   p.Velocity.X = 0;
  //   p.Velocity.Y = 0;
  // });

  return bldr.Build();
}

function generateArcBubbleOffsets(
  startAngle: number,
  endAngle: number,
  frames: number,
  distance: number,
  inwardRetract: number,
  frameStart: number = 12,
  invertY: boolean = true
): Map<number, ConfigVec> {
  const offsets = new Map<number, ConfigVec>();

  for (let i = 0; i < frames; i++) {
    const t = i / (frames - 1);
    const angle = startAngle + (endAngle - startAngle) * t;
    const retract = inwardRetract * t;
    const r = distance - retract;
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    offsets.set(frameStart + i, toCv(x, invertY ? -y : y));
  }
  return offsets;
}
