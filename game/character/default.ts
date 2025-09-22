import {
  AttackId,
  ATTACK_IDS,
  StateId,
  STATE_IDS,
  GAME_EVENT_IDS,
} from '../engine/finite-state-machine/PlayerStates';
import { FlatVec } from '../engine/physics/vector';
import {
  Attack,
  AttackBuilder,
  AttackOnEnter,
  AttackOnExit,
  AttackOnUpdate,
  ECBShapes,
  HurtCapsule,
  SensorReactor,
  SpeedsComponentBuilder,
} from '../engine/player/playerComponents';
import { Player } from '../engine/player/playerOrchestrator';
import { World } from '../engine/world/world';

type frameNumber = number;

export type CharacterConfig = {
  FrameLengths: Map<StateId, number>;
  SCB: SpeedsComponentBuilder;
  ECBHeight: number;
  ECBWidth: number;
  ECBOffset: number;
  ECBShapes: ECBShapes;
  HurtCapsules: Array<HurtCapsule>;
  JumpVelocity: number;
  NumberOfJumps: number;
  LedgeBoxHeight: number;
  LedgeBoxWidth: number;
  ledgeBoxYOffset: number;
  attacks: Map<AttackId, Attack>;
  Weight: number;
  ShieldRadius: number;
  ShieldYOffset: number;
};

export class DefaultCharacterConfig implements CharacterConfig {
  public FrameLengths = new Map<StateId, number>();
  public SCB: SpeedsComponentBuilder;
  public ECBHeight: number;
  public ECBWidth: number;
  public ECBOffset: number;
  public ECBShapes: ECBShapes = new Map<
    StateId,
    { height: number; width: number; yOffset: number }
  >();
  public HurtCapsules: Array<HurtCapsule> = [];
  public JumpVelocity: number;
  public NumberOfJumps: number;
  public LedgeBoxHeight: number;
  public LedgeBoxWidth: number;
  public ledgeBoxYOffset: number;
  public attacks: Map<AttackId, Attack> = new Map<AttackId, Attack>();
  public Weight: number;
  public ShieldRadius: number;
  public ShieldYOffset: number;

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
      .set(STATE_IDS.SPOT_DOGE_S, 43)
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

    this.ShieldRadius = 75;
    this.ShieldYOffset = -50;

    this.SCB = new SpeedsComponentBuilder();
    this.SCB.SetWalkSpeeds(6, 1.6);
    this.SCB.SetRunSpeeds(10, 2.2);
    this.SCB.SetFallSpeeds(16, 9, 0.6);
    this.SCB.SetAerialSpeeds(0.7, 9, 1.8);
    this.SCB.SetDashSpeeds(3, 13);
    this.SCB.SetAirDodgeSpeed(20);
    this.SCB.SetGroundedVelocityDecay(0.8);

    this.ECBOffset = 0;
    this.ECBHeight = 100;
    this.ECBWidth = 100;

    this.populateHurtCircles();

    this.Weight = 110;

    this.JumpVelocity = 17;
    this.NumberOfJumps = 2;

    this.LedgeBoxHeight = 35;
    this.LedgeBoxWidth = 80;
    this.ledgeBoxYOffset = -130;
    this.attacks
      .set(ATTACK_IDS.N_GRND_ATK, neutralAttack)
      .set(ATTACK_IDS.D_TILT_ATK, downTilt)
      .set(ATTACK_IDS.U_TILT_ATK, upTilt)
      .set(ATTACK_IDS.S_TILT_ATK, sideTilt)
      .set(ATTACK_IDS.S_TILT_U_ATK, sideTiltUp)
      .set(ATTACK_IDS.S_TITL_D_ATK, sideTiltDown)
      .set(ATTACK_IDS.S_CHARGE_ATK, sideCharge)
      .set(ATTACK_IDS.S_CHARGE_EX_ATK, sideChargeExtension)
      .set(ATTACK_IDS.U_CHARGE_ATK, upCharge)
      .set(ATTACK_IDS.U_CHARGE_EX_ATK, upChargeExtension)
      .set(ATTACK_IDS.D_CHARGE_ATK, downCharge)
      .set(ATTACK_IDS.D_CHARGE_EX_ATK, downChargeEx)
      .set(ATTACK_IDS.N_SPCL_ATK, nSpecial)
      .set(ATTACK_IDS.S_SPCL_ATK, sideSpecial)
      .set(ATTACK_IDS.S_SPCL_EX_ATK, sideSpecialEx)
      .set(ATTACK_IDS.D_SPCL_ATK, downSpecial)
      .set(ATTACK_IDS.D_SPCL_AIR_ATK, downSpecialAerial)
      .set(ATTACK_IDS.N_AIR_ATK, neutralAir)
      .set(ATTACK_IDS.F_AIR_ATK, fAir)
      .set(ATTACK_IDS.U_AIR_ATK, uAir)
      .set(ATTACK_IDS.B_AIR_ATK, bAir)
      .set(ATTACK_IDS.D_AIR_ATK, dAir)
      .set(ATTACK_IDS.S_SPCL_AIR_ATK, sideSpecialAir)
      .set(ATTACK_IDS.S_SPCL_EX_AIR_ATK, sideSpecialExAir)
      .set(ATTACK_IDS.DASH_ATK, dashAtk)
      .set(ATTACK_IDS.U_SPCL_ATK, upSpecial);
  }

  private populateHurtCircles() {
    const body = new HurtCapsule(0, -40, 0, -50, 40);
    const head = new HurtCapsule(0, -105, 0, -125, 14);
    this.HurtCapsules.push(head);
    this.HurtCapsules.push(body);
  }
}

function GetNAtk() {
  const hb1OffSets = new Map<frameNumber, FlatVec>();
  const hb1Frame3Offset = new FlatVec(30, -50);
  const hb1Frame4Offset = new FlatVec(60, -50);
  const hb1Frame5Offset = new FlatVec(80, -50);
  const hb1Frame6Offset = new FlatVec(80, -50);
  const hb1Frame7Offset = new FlatVec(80, -50);

  hb1OffSets
    .set(3, hb1Frame3Offset)
    .set(4, hb1Frame4Offset)
    .set(5, hb1Frame5Offset)
    .set(6, hb1Frame6Offset)
    .set(7, hb1Frame7Offset);

  const hb2OffSets = new Map<frameNumber, FlatVec>();
  const hb2Frame3Offset = new FlatVec(15, -50);
  const hb2Frame4Offset = new FlatVec(25, -50);
  const hb2Frame5Offset = new FlatVec(55, -50);
  const hb2Frame6Offset = new FlatVec(65, -50);
  const hb2Frame7Offset = new FlatVec(65, -50);

  hb2OffSets
    .set(3, hb2Frame3Offset)
    .set(4, hb2Frame4Offset)
    .set(5, hb2Frame5Offset)
    .set(6, hb2Frame6Offset)
    .set(7, hb2Frame7Offset);

  const bldr = new AttackBuilder('NAttack');

  bldr
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
  const startFrame = 5;
  const endFrame = 15;
  const hb1Offsets = new Map<frameNumber, FlatVec>();
  const impulses = new Map<frameNumber, FlatVec>();

  for (let i = 0; i < 15; i++) {
    impulses.set(i, new FlatVec(4, 0));
  }

  hb1Offsets
    .set(5, new FlatVec(40, -60))
    .set(6, new FlatVec(40, -60))
    .set(7, new FlatVec(40, -60))
    .set(8, new FlatVec(40, -60))
    .set(9, new FlatVec(40, -60))
    .set(10, new FlatVec(40, -60))
    .set(11, new FlatVec(40, -60))
    .set(12, new FlatVec(40, -60))
    .set(13, new FlatVec(40, -60))
    .set(14, new FlatVec(40, -60))
    .set(15, new FlatVec(40, -60));

  const bldr = new AttackBuilder('DashAttack');

  bldr
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
  const hb1OffSets = new Map<frameNumber, FlatVec>();
  hb1OffSets
    .set(6, new FlatVec(80, -50))
    .set(7, new FlatVec(85, -50))
    .set(8, new FlatVec(90, -50))
    .set(9, new FlatVec(90, -50));

  const hb2OffSets = new Map<frameNumber, FlatVec>()
    .set(6, new FlatVec(35, -50))
    .set(7, new FlatVec(40, -50))
    .set(8, new FlatVec(45, -50))
    .set(9, new FlatVec(47, -50));

  const hb3offSets = new Map<frameNumber, FlatVec>()
    .set(6, new FlatVec(10, -50))
    .set(7, new FlatVec(10, -50))
    .set(8, new FlatVec(10, -50))
    .set(9, new FlatVec(10, -50));

  const hb4offsets = new Map<frameNumber, FlatVec>()
    .set(19, new FlatVec(80, -50))
    .set(20, new FlatVec(85, -50))
    .set(21, new FlatVec(90, -50));

  const hb5Offsets = new Map<frameNumber, FlatVec>()
    .set(19, new FlatVec(35, -50))
    .set(20, new FlatVec(40, -50))
    .set(21, new FlatVec(45, -50));

  const hb6Offsets = new Map<frameNumber, FlatVec>()
    .set(19, new FlatVec(10, -50))
    .set(20, new FlatVec(10, -50))
    .set(21, new FlatVec(10, -50))
    .set(22, new FlatVec(10, -50))
    .set(23, new FlatVec(10, -50))
    .set(24, new FlatVec(10, -50))
    .set(25, new FlatVec(10, -50))
    .set(26, new FlatVec(10, -50));

  const bldr = new AttackBuilder('NAir')
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

  const uAirAttack = new AttackBuilder('UAir')
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
  const FairAttack = new AttackBuilder('FAir')
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
  const activeStart = 9;
  const activeEnd = 15;
  const framesActive = activeEnd - activeStart + 1;
  const baseKnockBack = 17;
  const knockBackScaling = 50;
  const damage = 16;
  const radius = 27;
  const launchAngle = 150;

  const hb1OffSets = new Map<frameNumber, FlatVec>();
  const hb1Frame9Offset = new FlatVec(-40, -45);
  const hb1Frame10Offset = new FlatVec(-44, -45);
  const hb1Frame11Offset = new FlatVec(-46, -45);
  const hb1Frame12Offset = new FlatVec(-44, -45);
  const hb1Frame13Offset = new FlatVec(-44, -45);
  const hb1Frame14Offset = new FlatVec(-44, -45);
  const hb1Frame15Offset = new FlatVec(-44, -45);

  hb1OffSets
    .set(9, hb1Frame9Offset)
    .set(10, hb1Frame10Offset)
    .set(11, hb1Frame11Offset)
    .set(12, hb1Frame12Offset)
    .set(13, hb1Frame13Offset)
    .set(14, hb1Frame14Offset)
    .set(15, hb1Frame15Offset);

  const hb2OffSets = new Map<frameNumber, FlatVec>();
  const hb2Frame9Offset = new FlatVec(-70, -40);
  const hb2Frame10Offset = new FlatVec(-74, -39);
  const hb2Frame11Offset = new FlatVec(-77, -38);
  const hb2Frame12Offset = new FlatVec(-75, -38);
  const hb2Frame13Offset = new FlatVec(-75, -38);
  const hb2Frame14Offset = new FlatVec(-75, -38);
  const hb2Frame15Offset = new FlatVec(-75, -38);

  hb2OffSets
    .set(9, hb2Frame9Offset)
    .set(10, hb2Frame10Offset)
    .set(11, hb2Frame11Offset)
    .set(12, hb2Frame12Offset)
    .set(13, hb2Frame13Offset)
    .set(14, hb2Frame14Offset)
    .set(15, hb2Frame15Offset);

  const bldr = new AttackBuilder('BAir');

  bldr
    .WithBaseKnockBack(baseKnockBack)
    .WithKnockBackScaling(knockBackScaling)
    .WithGravity(true)
    .WithTotalFrames(totalFrames)
    .WithHitBubble(damage, radius, 1, launchAngle, hb1OffSets)
    .WithHitBubble(damage, radius, 0, launchAngle, hb2OffSets);

  return bldr.Build();
}

function GetDAir() {
  const activeFrames = 40;
  const radius = 30;
  const damage = 21;
  const baseKnockBack = 20;
  const knockBackScaling = 64;
  const launchAngle = 285;

  const hb1OffSets = new Map<frameNumber, FlatVec>();
  hb1OffSets
    .set(15, new FlatVec(0, -30))
    .set(16, new FlatVec(0, -30))
    .set(17, new FlatVec(0, -30))
    .set(18, new FlatVec(0, -30))
    .set(19, new FlatVec(0, -30))
    .set(20, new FlatVec(0, -30));

  const hb2OffSets = new Map<frameNumber, FlatVec>()
    .set(15, new FlatVec(-5, -5))
    .set(16, new FlatVec(-8, -6))
    .set(17, new FlatVec(-10, -7))
    .set(18, new FlatVec(-12, -10))
    .set(19, new FlatVec(-9, -10))
    .set(20, new FlatVec(-7, -9));

  const hb3offSets = new Map<frameNumber, FlatVec>()
    .set(15, new FlatVec(0, 15))
    .set(16, new FlatVec(0, 17))
    .set(17, new FlatVec(0, 20))
    .set(18, new FlatVec(0, 23))
    .set(19, new FlatVec(0, 21))
    .set(20, new FlatVec(0, 19));

  const bldr = new AttackBuilder('DAir')
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

  const hb1Offsets = new Map<frameNumber, FlatVec>();
  const hb2Offsets = new Map<frameNumber, FlatVec>();
  const hb3Offsets = new Map<frameNumber, FlatVec>();

  hb1Offsets
    .set(9, new FlatVec(110, -15))
    .set(10, new FlatVec(110, -15))
    .set(11, new FlatVec(110, -15))
    .set(12, new FlatVec(110, -15))
    .set(13, new FlatVec(110, -15))
    .set(14, new FlatVec(110, -15));

  hb2Offsets
    .set(9, new FlatVec(85, -10))
    .set(10, new FlatVec(85, -10))
    .set(11, new FlatVec(85, -10))
    .set(12, new FlatVec(85, -10))
    .set(13, new FlatVec(85, -10))
    .set(14, new FlatVec(85, -10));

  hb3Offsets
    .set(9, new FlatVec(50, -7))
    .set(10, new FlatVec(50, -7))
    .set(11, new FlatVec(50, -7))
    .set(12, new FlatVec(50, -7))
    .set(13, new FlatVec(50, -7))
    .set(14, new FlatVec(50, -7));

  const bldr = new AttackBuilder('DownTilt');

  bldr
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

  const hb1Offsets = new Map<frameNumber, FlatVec>();
  const hb2Offsets = new Map<frameNumber, FlatVec>();
  const hb3Offsets = new Map<frameNumber, FlatVec>();

  hb1Offsets
    .set(9, new FlatVec(100, -40))
    .set(10, new FlatVec(100, -40))
    .set(11, new FlatVec(100, -40))
    .set(12, new FlatVec(100, -40))
    .set(13, new FlatVec(100, -40))
    .set(14, new FlatVec(100, -40));

  hb2Offsets
    .set(9, new FlatVec(60, -40))
    .set(10, new FlatVec(60, -40))
    .set(11, new FlatVec(60, -40))
    .set(12, new FlatVec(60, -40))
    .set(13, new FlatVec(60, -40))
    .set(14, new FlatVec(60, -40));

  hb3Offsets
    .set(9, new FlatVec(10, -40))
    .set(10, new FlatVec(10, -40))
    .set(11, new FlatVec(10, -40))
    .set(12, new FlatVec(10, -40))
    .set(13, new FlatVec(10, -40))
    .set(14, new FlatVec(10, -40));

  const bldr = new AttackBuilder('SideTilt');

  bldr
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

  const hb1Offsets = new Map<frameNumber, FlatVec>();
  const hb2Offsets = new Map<frameNumber, FlatVec>();
  const hb3Offsets = new Map<frameNumber, FlatVec>();

  hb1Offsets
    .set(9, new FlatVec(100, -25))
    .set(10, new FlatVec(100, -25))
    .set(11, new FlatVec(100, -25))
    .set(12, new FlatVec(100, -25))
    .set(13, new FlatVec(100, -25))
    .set(14, new FlatVec(100, -25));

  hb2Offsets
    .set(9, new FlatVec(60, -32))
    .set(10, new FlatVec(60, -32))
    .set(11, new FlatVec(60, -32))
    .set(12, new FlatVec(60, -32))
    .set(13, new FlatVec(60, -32))
    .set(14, new FlatVec(60, -32));

  hb3Offsets
    .set(9, new FlatVec(10, -40))
    .set(10, new FlatVec(10, -40))
    .set(11, new FlatVec(10, -40))
    .set(12, new FlatVec(10, -40))
    .set(13, new FlatVec(10, -40))
    .set(14, new FlatVec(10, -40));

  const bldr = new AttackBuilder('SideTiltUp');

  bldr
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

  const hb1Offsets = new Map<frameNumber, FlatVec>();
  const hb2Offsets = new Map<frameNumber, FlatVec>();
  const hb3Offsets = new Map<frameNumber, FlatVec>();

  hb1Offsets
    .set(9, new FlatVec(100, -65))
    .set(10, new FlatVec(100, -65))
    .set(11, new FlatVec(100, -65))
    .set(12, new FlatVec(100, -65))
    .set(13, new FlatVec(100, -65))
    .set(14, new FlatVec(100, -65));

  hb2Offsets
    .set(9, new FlatVec(60, -53))
    .set(10, new FlatVec(60, -53))
    .set(11, new FlatVec(60, -53))
    .set(12, new FlatVec(60, -53))
    .set(13, new FlatVec(60, -53))
    .set(14, new FlatVec(60, -53));

  hb3Offsets
    .set(9, new FlatVec(10, -40))
    .set(10, new FlatVec(10, -40))
    .set(11, new FlatVec(10, -40))
    .set(12, new FlatVec(10, -40))
    .set(13, new FlatVec(10, -40))
    .set(14, new FlatVec(10, -40));

  const bldr = new AttackBuilder('SideTiltUp');

  bldr
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

  const hitBubbleOffsets2 = new Map<frameNumber, FlatVec>();

  hitBubbleOffsets2
    .set(59, new FlatVec(110, -40))
    .set(60, new FlatVec(110, -40));

  const bldr = new AttackBuilder('UpTilt');

  bldr
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

  const bldr = new AttackBuilder('UpCharge')
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
    v.Y -= 40;
  });

  const bldr = new AttackBuilder('UpChargeExtension');

  bldr
    .WithBaseKnockBack(baseKb)
    .WithKnockBackScaling(knockBackScaling)
    .WithGravity(true)
    .WithTotalFrames(totalFrames)
    .WithHitBubble(damage, radius, 0, launchAngle, h1offset);

  return bldr.Build();
}

function GetDownCharge() {
  const totalFrames = 180;

  const bldr = new AttackBuilder('DownCharge')
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

  const of1 = new Map<frameNumber, FlatVec>();
  const of2 = new Map<frameNumber, FlatVec>();
  const of3 = new Map<frameNumber, FlatVec>();
  const of4 = new Map<frameNumber, FlatVec>();
  const of5 = new Map<frameNumber, FlatVec>();
  const of6 = new Map<frameNumber, FlatVec>();

  const activeFrames = 9;
  const attackStart = 21;

  for (let i = 0; i < activeFrames; i++) {
    const frame = i + attackStart;
    if (i < 3) {
      of1.set(frame, new FlatVec(50, 0));
      of2.set(frame, new FlatVec(-50, 0));
    } else if (i < 6) {
      of3.set(frame, new FlatVec(70, 0));
      of4.set(frame, new FlatVec(-70, 0));
    } else if (i < 9) {
      of5.set(frame, new FlatVec(90, 0));
      of6.set(frame, new FlatVec(-90, 0));
    }
  }

  const bldr = new AttackBuilder('DownChargeExtension');

  bldr
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

  const bldr = new AttackBuilder('SideCharge')
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

  const hitBubbleOffsets1 = new Map<frameNumber, FlatVec>();
  const hitBubbleOffsets2 = new Map<frameNumber, FlatVec>();

  hitBubbleOffsets1
    .set(18, new FlatVec(-10, -40))
    .set(19, new FlatVec(10, -40))
    .set(20, new FlatVec(40, -40))
    .set(21, new FlatVec(65, -40))
    .set(22, new FlatVec(70, -40))
    .set(23, new FlatVec(70, -40));

  hitBubbleOffsets2
    .set(19, new FlatVec(0, -40))
    .set(20, new FlatVec(30, -40))
    .set(21, new FlatVec(55, -40))
    .set(22, new FlatVec(60, -40));

  const impulses = new Map<frameNumber, FlatVec>();

  impulses.set(20, new FlatVec(8, 0));

  const bldr = new AttackBuilder('SideChargeExtension')
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
  const h1Offset = new Map<frameNumber, FlatVec>();

  for (let i = 80; i < 100; i++) {
    h1Offset.set(i, new FlatVec(90, -40));
  }

  const bldr = new AttackBuilder('NSpecial');

  bldr
    .WithTotalFrames(activeFrames)
    .WithGravity(true)
    .WithHitBubble(h1Damage, radius, 0, 65, h1Offset)
    .WithBaseKnockBack(baseKb)
    .WithKnockBackScaling(knockBackScaling);

  return bldr.Build();
}

function GetSideSpecial() {
  const activeFrames = 80;
  const impulses = new Map<frameNumber, FlatVec>();

  const reactor: SensorReactor = (w, sensorOwner, detectedPlayer) => {
    const sm = w.PlayerData.StateMachine(sensorOwner.ID)!;
    sm.UpdateFromWorld(GAME_EVENT_IDS.SIDE_SPCL_EX_GE);
    // change the state here
  };

  const onEnter: AttackOnEnter = (w, p) => {
    const vel = p.Velocity;
    vel.X = 0;
    p.Sensors.SetSensorReactor(reactor);
  };

  const onUpdate: AttackOnUpdate = (w, p, fN) => {
    if (fN === 15) {
      p.Sensors.ActivateSensor(-15, 45, 30)
        .ActivateSensor(-50, 45, 30)
        .ActivateSensor(-85, 45, 30);
    }

    if (fN === 40) {
      p.Sensors.DeactivateSensors();
    }
  };

  const onExit: AttackOnExit = (w, p) => {
    p.Sensors.DeactivateSensors();
  };

  impulses.set(5, new FlatVec(-6, 0)).set(6, new FlatVec(-3, 0));
  for (let i = 14; i < 35; i++) {
    impulses.set(i, new FlatVec(4, 0));
  }

  const bldr = new AttackBuilder('SideSpecial');

  bldr
    .WithUpdateAction(onUpdate)
    .WithExitAction(onExit)
    .WithEnterAction(onEnter)
    .WithImpulses(impulses, 13)
    .WithTotalFrames(activeFrames)
    .CanOnlyFallOffLedgeIfFacingIt()
    .WithGravity(false);

  return bldr.Build();
}

function GetSideSpecialExtension() {
  const totalFrameLength = 25;
  const hb1Offsets = new Map<frameNumber, FlatVec>();
  const damage = 16;
  const radius = 40;
  const baseKnockBack = 30;
  const knockBackScaling = 45;

  hb1Offsets
    .set(3, new FlatVec(80, -50))
    .set(4, new FlatVec(90, -65))
    .set(5, new FlatVec(100, -85))
    .set(6, new FlatVec(65, -105))
    .set(7, new FlatVec(25, -125));

  const bldr = new AttackBuilder('SideSpecialExtension');

  bldr
    .WithTotalFrames(totalFrameLength)
    .WithBaseKnockBack(baseKnockBack)
    .WithKnockBackScaling(knockBackScaling)
    .WithEnterAction((w: World, p: Player) => {
      p.Velocity.X = 0;
      p.Velocity.Y = 0;
    })
    .WithHitBubble(damage, radius, 0, 89, hb1Offsets);

  return bldr.Build();
}

function GetSideSpecialAir() {
  const activeFrames = 70;
  const impulses = new Map<frameNumber, FlatVec>();

  const reactor: SensorReactor = (w, sensorOwner, detectedPlayer) => {
    const sm = w.PlayerData.StateMachine(sensorOwner.ID)!;
    sm.UpdateFromWorld(GAME_EVENT_IDS.S_SPCL_EX_AIR_GE);
  };

  const onEnter: AttackOnEnter = (w, p) => {
    const vel = p.Velocity;
    vel.X = 0;
    vel.Y = 0;
    p.Sensors.SetSensorReactor(reactor);
  };

  const onUpdate: AttackOnUpdate = (w, p, fN) => {
    if (fN === 15) {
      p.Sensors.ActivateSensor(-15, 45, 30)
        .ActivateSensor(-50, 45, 30)
        .ActivateSensor(-85, 45, 30);
    }

    if (fN === 40) {
      p.Sensors.DeactivateSensors();
    }
  };

  const onExit: AttackOnExit = (w, p) => {
    p.Sensors.DeactivateSensors();
  };

  //impulses.set(5, new FlatVec(-6, 0)).set(6, new FlatVec(-3, 0));
  for (let i = 14; i < 35; i++) {
    impulses.set(i, new FlatVec(4, 0));
  }

  const bldr = new AttackBuilder('SideSpecialAir');

  bldr
    .WithUpdateAction(onUpdate)
    .WithExitAction(onExit)
    .WithEnterAction(onEnter)
    .WithImpulses(impulses, 12)
    .WithTotalFrames(activeFrames)
    .WithGravity(false);

  return bldr.Build();
}

function GetSideSpecialExtensionAir() {
  const totalFrameLength = 25;
  const hb1Offsets = new Map<frameNumber, FlatVec>();
  const damage = 16;
  const radius = 40;
  const baseKnockBack = 30;
  const knockBackScaling = 45;
  const launchAngle = 270;

  hb1Offsets
    .set(3, new FlatVec(25, -125))
    .set(4, new FlatVec(65, -100))
    .set(5, new FlatVec(100, -75))
    .set(6, new FlatVec(90, -50))
    .set(7, new FlatVec(80, -35));

  const bldr = new AttackBuilder('SideSpecialExtensionAir');

  bldr
    .WithTotalFrames(totalFrameLength)
    .WithBaseKnockBack(baseKnockBack)
    .WithKnockBackScaling(knockBackScaling)
    .WithEnterAction((w: World, p: Player) => {
      p.Velocity.X = 0;
      p.Velocity.Y = 0;
    })
    .WithHitBubble(damage, radius, 0, launchAngle, hb1Offsets);

  return bldr.Build();
}

function GetDownSpecial() {
  const activeFrames = 77;
  const impulses = new Map<frameNumber, FlatVec>();
  const hb1OffSets = new Map<frameNumber, FlatVec>();
  const hb2OffSets = new Map<frameNumber, FlatVec>();
  const hb3offSets = new Map<frameNumber, FlatVec>();
  const hb4OffSets = new Map<frameNumber, FlatVec>();

  for (let i = 23; i < activeFrames; i++) {
    impulses.set(i, new FlatVec(2, 0));
    hb1OffSets.set(i, new FlatVec(100, -25));
    hb2OffSets.set(i, new FlatVec(70, -25));
    hb3offSets.set(i, new FlatVec(40, -25));
    if (i > 50) {
      hb4OffSets.set(i, new FlatVec(120, -25));
    }
  }

  const blrd = new AttackBuilder('DSpecial');

  blrd
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
  const impulses = new Map<frameNumber, FlatVec>();
  const hb1OffSets = new Map<frameNumber, FlatVec>();
  const hb2OffSets = new Map<frameNumber, FlatVec>();
  const hb3offSets = new Map<frameNumber, FlatVec>();
  const hb4OffSets = new Map<frameNumber, FlatVec>();

  for (let i = 13; i < activeFrames - 10; i++) {
    impulses.set(i, new FlatVec(1.5, 1.5));
    hb1OffSets.set(i, new FlatVec(60, 50));
    hb2OffSets.set(i, new FlatVec(40, 25));
    hb3offSets.set(i, new FlatVec(20, 0));
  }

  const blrd = new AttackBuilder('DSpecialAir');

  blrd
    .WithBaseKnockBack(15)
    .WithKnockBackScaling(66)
    .WithGravity(false)
    .WithTotalFrames(activeFrames)
    .WithHitBubble(15, 20, 0, launchAngle, hb1OffSets)
    .WithHitBubble(13, 19, 1, launchAngle, hb2OffSets)
    .WithHitBubble(12, 18, 3, launchAngle, hb3offSets)
    .WithHitBubble(16, 25, 4, launchAngle, hb4OffSets)
    .WithImpulses(impulses, 8)
    .WithEnterAction((w: World, p: Player) => {
      p.Velocity.X = 0;
      p.Velocity.Y = 0;
    })
    .WithExitAction((w: World, p: Player) => {
      p.Jump.ResetJumps();
      p.Jump.IncrementJumps();
    });

  return blrd.Build();
}

function GetUpSpecial() {
  const totalFrameLength = 62;
  const impulses = new Map<frameNumber, FlatVec>();
  for (let i = 13; i < 29; i++) {
    impulses.set(i, new FlatVec(1.2, -2));
  }

  const bldr = new AttackBuilder('UpSpecial');

  bldr
    .WithTotalFrames(totalFrameLength)
    .WithImpulses(impulses, 12)
    .WithGravity(false)
    .WithEnterAction((w: World, p: Player) => {
      p.Velocity.X = 0;
      p.Velocity.Y = 0;
    });

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
): Map<number, FlatVec> {
  const offsets = new Map<number, FlatVec>();

  for (let i = 0; i < frames; i++) {
    const t = i / (frames - 1);
    const angle = startAngle + (endAngle - startAngle) * t;
    const retract = inwardRetract * t;
    const r = distance - retract;
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    offsets.set(frameStart + i, new FlatVec(x, invertY ? -y : y));
  }
  return offsets;
}
