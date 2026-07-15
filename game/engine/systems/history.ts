import { Command } from '../command/command';
import { envConfig } from '../config/main-config';
import { ATKHist, frameNumber } from '../entity/components/attack';
import { DamageHist } from '../entity/components/damage';
import { ECBHist } from '../entity/components/ecb';
import { FlagsHist } from '../entity/components/flags';
import { FSMInfoHist } from '../entity/components/fsmInfo';
import { GrabHist } from '../entity/components/grab';
import { GrabMetereHist } from '../entity/components/grabMeter';
import { HitStopHist } from '../entity/components/hitStop';
import { HitStunHist } from '../entity/components/hitStun';
import { HoldHist } from '../entity/components/hold';
import { JumpHist } from '../entity/components/jump';
import { LedgeDetectorHist } from '../entity/components/ledgeDetector';
import { PositionHist } from '../entity/components/position';
import { SensorHist } from '../entity/components/sensor';
import { ShieldHist } from '../entity/components/shield';
import { VelocityHist } from '../entity/components/velocity';
import { Player } from '../entity/playerOrchestrator';
import {
  AttackId,
  GrabId,
  STATE_IDS
} from '../finiteStateMachines/player/states/shared';
import { FlatVec } from '../physics/vector';
import { PlayerHistoryTable } from '../world/stateModules';
import { World } from '../world/world';

export function InitPlayerHistory(p: Player, w: World) {
  const curFrame = w.LocalFrame;
  const frameHistLimit = envConfig.get('State.MaxFrameStorage') as number;
  const startFrame = curFrame > frameHistLimit ? curFrame - frameHistLimit : 0;
  for (let i = startFrame; i <= curFrame; i++) {
    record(p, w.HistoryData.PlayerHistoryDB[p.ID], i);
  }
}

export function RecordHistory(w: World) {
  const pd = w.PlayerData;
  const playerCount = pd.PlayerCount;
  const frameNumber = w.LocalFrame;
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = pd.Player(playerIndex);
    record(p, w.HistoryData.PlayerHistoryDB[playerIndex], frameNumber);
  }
  w.SetPoolHistory();
}

export function record(
  p: Player,
  pTable: PlayerHistoryTable,
  frameNumber: frameNumber
) {
  const r = pTable.get(frameNumber);
  RecordIntoHistory(p, r);
}

export function RecordIntoHistory(p: Player, r: PlayerStateHistory) {
  const position = p.Position;
  const velocity = p.Velocity;
  const damage = p.Damage;
  const flags = p.Flags;
  const jump = p.Jump;
  const fsmInfo = p.FSMInfo;
  const hitStop = p.HitStop;
  const hitStun = p.HitStun;
  const grabs = p.Grabs;
  const grabMeter = p.GrabMeter;
  const shield = p.Shield;
  const sensorsComp = p.Sensors;
  const ecb = p.ECB;
  const hurtCapsules = p.HurtCircles;
  const ledgeDetector = p.LedgeDetector;
  const attackComp = p.Attacks;

  r.Zero();

  r.posXRaw = position.X.Raw;
  r.posYRaw = position.Y.Raw;
  r.velXRaw = velocity.X.Raw;
  r.velYRaw = velocity.Y.Raw;
  r.damageRaw = damage.Damage.Raw;
  r.facingRight = flags.IsFacingRight;
  r.fasFalling = flags.IsFastFalling;
  r.hitPauseFrames = flags.HitPauseFrames;
  r.intangabilityFrames = flags.IntangabilityFrames;
  r.disablePlatformDetectionFrames = flags.DisablePlatDetectionFrames;
  r.lastTechFrame = flags.LastTechFrame;
  r.velocityDecayActive = flags.IsVelocityDecayActive;
  r.shieldJump = flags.JumpedFromShield;
  r.jumpCount = jump.JumpCount;
  r.stateId = fsmInfo.CurrentStateId;
  r.stateFrame = fsmInfo.CurrentStateFrame;
  r.hitStopFrames = hitStop.Frames;
  r.hitStunFrames = hitStun.Frames;
  r.hitStunVxRaw = hitStun.VX.Raw;
  r.hitStunVyRaw = hitStun.VY.Raw;
  r.hitStunNextStateId = hitStun.NextStateId;
  r.grabId = grabs.GetGrab()?.GrabId ?? undefined;
  r.grabMeterRaw = grabMeter.Meter.Raw;
  r.holdingPlayerId = grabMeter.HoldingPlayerId;
  r.shieldActive = shield.Active;
  r.shieldRadiusRaw = shield.PreModCurrentRadius.Raw;
  r.shieldTiltXRaw = shield.ShieldTiltX.Raw;
  r.shieldTiltYRaw = shield.ShieldTiltY.Raw;
  const sLength = sensorsComp.Sensors.length;
  const sensors = sensorsComp.Sensors;
  for (let i = 0; i < sLength; i++) {
    const s = sensors[i];
    const rS = r.sensors[i];
    rS.xOffsetRaw = s.XOffset.Raw;
    rS.yOffsetRaw = s.YOffset.Raw;
    rS.radiusRaw = s.Radius.Raw;
    rS.active = s.IsActive;
  }
  r.sensorReactor = sensorsComp.ReactCommand;
  r.ldGrabCount = ledgeDetector.LedgeGrabCount;
  r.ldgGrbdLdg = ledgeDetector.GrabbedLedge;
  const aComp = attackComp;
  const atk = aComp.GetAttack();
  if (atk) {
    r.atkId = atk.AttackId;
    const playerIdsHit = aComp.PlayerIdsHit;
    if (playerIdsHit.size > 0) {
      for (const values of aComp.PlayerIdsHit) {
        r.playersHit.add(values);
      }
    }
  }
  // computed values for easier use later
  const posXRaw = r.posXRaw;
  const posYRaw = r.posYRaw;
  if (shield.Active) {
    const shGPosX = posXRaw + shield.ShieldTiltX.Raw;
    const shGPosY =
      posYRaw + shield.ShieldTiltY.Raw + shield.YOffsetConstant.Raw;
    r.calcRadiusRaw = shield.CalculatedRadiusRaw;
    r.comp_shield.calcXRaw = shGPosX;
    r.comp_shield.calcYRaw = shGPosY;
  }
  for (let i = 0; i < sLength; i++) {
    const s = sensors[i];
    const rS = r.comp_sensors[i];
    if (!s.IsActive) {
      rS.active = false;
      continue;
    }
    rS.globalXRaw = r.facingRight
      ? posXRaw + s.XOffset.Raw
      : posXRaw - s.XOffset.Raw;
    rS.globalYRaw = posYRaw + s.YOffset.Raw;
    rS.radiusRaw = s.Radius.Raw;
    rS.active = s.IsActive;
  }
  const ecbPoints = ecb.GetActiveVerts();
  for (let i = 0; i < ecbPoints.length; i++) {
    const p = ecbPoints[i];
    const rP = r.comp_ecbDiamond[i];
    rP.xRaw = p.X.Raw;
    rP.yRaw = p.Y.Raw;
  }
  const hsLength = hurtCapsules.HurtCapsules.length;
  for (let i = 0; i < hsLength; i++) {
    const h = hurtCapsules.HurtCapsules[i];
    const rH = r.comp_hurtCapsules[i];
    rH.x1Raw = posXRaw + h.StartOffsetX.Raw;
    rH.y1Raw = posYRaw + h.StartOffsetY.Raw;
    rH.x2Raw = posXRaw + h.EndOffsetX.Raw;
    rH.y2Raw = posYRaw + h.EndOffsetY.Raw;
    rH.radiusRaw = h.Radius.Raw;
    rH.active = true;
  }
  const grabCircles = grabs.GetGrab();
  const stateFrame = p.FSMInfo.CurrentStateFrame;
  if (grabCircles) {
    const gbs = grabCircles.GrabBubbles;
    const gLength = gbs.length;
    for (let i = 0; i < gLength; i++) {
      const g = gbs[i];
      const rG = r.comp_grabCircles[i];
      const isActive = g.IsActive(stateFrame);
      if (!isActive) {
        rG.active = false;
        continue;
      }
      const gos = g.GetLocalPositionOffsetForFrame(stateFrame);
      rG.iD = g.BubbleId;
      rG.xRaw = r.facingRight
        ? posXRaw + (gos?.X?.Raw ?? 0)
        : posXRaw - (gos?.X?.Raw ?? 0);
      rG.yRaw = posYRaw + (gos?.Y?.Raw ?? 0);
      rG.radiusRaw = g.Radius.Raw;
      rG.active = true;
    }
  }
  if (atk) {
    const atkCircles = atk.HitBubbles;
    const aLength = atkCircles.length;
    for (let i = 0; i < aLength; i++) {
      const a = atkCircles[i];
      const aos = a.frameOffsets.get(stateFrame);
      const rA = r.comp_attackCircles[i];
      const isActive = a.IsActive(stateFrame);
      if (!isActive) {
        rA.active = false;
        continue;
      }
      rA.xRaw = r.facingRight
        ? posXRaw + (aos?.X?.Raw ?? 0)
        : posXRaw - (aos?.X?.Raw ?? 0);
      rA.yRaw = posYRaw + (aos?.Y?.Raw ?? 0);
      rA.radiusRaw = a.Radius.Raw;
      rA.active = true;
    }
  }
  const leftLd = ledgeDetector.LeftSide;
  const rightLd = ledgeDetector.RightSide;
  const ldLength = 4;
  for (let i = 0; i < ldLength; i++) {
    const lp = leftLd[i];
    const rp = rightLd[i];
    const rlp = r.comp_ledgeDetectorLeft[i];
    const rrp = r.comp_ledgeDetectorRight[i];
    rlp.xRaw = lp.X.Raw;
    rlp.yRaw = lp.Y.Raw;
    rrp.xRaw = rp.X.Raw;
    rrp.yRaw = rp.Y.Raw;
  }
}

type ledgeRef = FlatVec[];

export class PlayerStateHistory
  implements
    ATKHist,
    DamageHist,
    ECBHist,
    FlagsHist,
    FSMInfoHist,
    GrabHist,
    HoldHist,
    GrabMetereHist,
    HitStopHist,
    HitStunHist,
    JumpHist,
    LedgeDetectorHist,
    PositionHist,
    SensorHist,
    ShieldHist,
    VelocityHist
{
  // pos
  posXRaw = 0;
  posYRaw = 0;
  // vel
  velXRaw = 0;
  velYRaw = 0;
  // damage
  damageRaw = 0;
  // flags
  facingRight = false;
  fasFalling = false;
  hitPauseFrames = 0;
  intangabilityFrames = 0;
  invincibilityFrames = 0;
  superArmorFrames = 0;
  disablePlatformDetectionFrames = 0;
  disableLedgeDetectionFrames = 0;
  velocityDecayActive = true;
  shieldJump = false;
  lastTechFrame = 0;
  // jump
  jumpCount = 0;
  // FSM
  stateId = STATE_IDS.IDLE_S;
  stateFrame = 0;
  // hitStop
  hitStopFrames = 0;
  // hitStun
  hitStunFrames = 0;
  hitStunVxRaw = 0;
  hitStunVyRaw = 0;
  hitStunNextStateId = STATE_IDS.IDLE_S;
  // grab
  grabId: GrabId | undefined = undefined;
  // grabMeter
  grabMeterRaw = 0;
  holdingPlayerId: number | undefined = undefined;
  heldPlayerId: number | undefined = undefined;
  // shield
  shieldActive = false;
  shieldRadiusRaw = 0;
  calcRadiusRaw = 0;
  shieldTiltXRaw = 0;
  shieldTiltYRaw = 0;
  // sensors
  sensors: Array<{
    xOffsetRaw: number;
    yOffsetRaw: number;
    radiusRaw: number;
    active: boolean;
  }> = new Array<{
    xOffsetRaw: number;
    yOffsetRaw: number;
    radiusRaw: number;
    active: boolean;
  }>(envConfig.get('MaxSensorsPerPlayer') as number);

  sensorReactor: Command | undefined = undefined;
  // hold *** NOTE: not implemented yet
  // heldPlayerId: number | undefined = undefined;
  // ledge detector
  ldGrabCount = 0;
  ldgGrbdLdg: ledgeRef | undefined = undefined;
  // attack
  atkId: AttackId | undefined = undefined;
  playersHit: Set<number> = new Set<number>();
  // computed values
  readonly comp_shield = {
    calcXRaw: 0,
    calcYRaw: 0
  };
  readonly comp_sensors = new Array<{
    globalXRaw: number;
    globalYRaw: number;
    radiusRaw: number;
    active: boolean;
  }>(envConfig.get('MaxSensorsPerPlayer') as number);
  readonly comp_ecbDiamond = Array<{ xRaw: number; yRaw: number }>(4);
  readonly comp_hurtCapsules = new Array<{
    x1Raw: number;
    y1Raw: number;
    x2Raw: number;
    y2Raw: number;
    radiusRaw: number;
    active: boolean;
  }>(envConfig.get('MaxHurtBubblesPerPlayer') as number);
  readonly comp_grabCircles = new Array<{
    iD: number;
    xRaw: number;
    yRaw: number;
    radiusRaw: number;
    active: boolean;
  }>(envConfig.get('MaxGrabBubblesPerPlayer') as number);
  readonly comp_attackCircles = new Array<{
    id: number;
    xRaw: number;
    yRaw: number;
    radiusRaw: number;
    active: boolean;
  }>(envConfig.get('MaxAtkBubblesPerPlayer') as number);
  readonly comp_ledgeDetectorLeft = new Array<{ xRaw: number; yRaw: number }>(
    4
  );
  readonly comp_ledgeDetectorRight = new Array<{ xRaw: number; yRaw: number }>(
    4
  );

  constructor() {
    const sLength = this.sensors.length;
    for (let i = 0; i < sLength; i++) {
      this.sensors[i] = {
        xOffsetRaw: 0,
        yOffsetRaw: 0,
        radiusRaw: 0,
        active: false
      };
    }
    const csLength = this.comp_sensors.length;
    for (let i = 0; i < csLength; i++) {
      this.comp_sensors[i] = {
        globalXRaw: 0,
        globalYRaw: 0,
        radiusRaw: 0,
        active: false
      };
    }
    const eLength = this.comp_ecbDiamond.length;
    for (let i = 0; i < eLength; i++) {
      this.comp_ecbDiamond[i] = { xRaw: 0, yRaw: 0 };
    }
    const hLength = this.comp_hurtCapsules.length;
    for (let i = 0; i < hLength; i++) {
      this.comp_hurtCapsules[i] = {
        x1Raw: 0,
        y1Raw: 0,
        x2Raw: 0,
        y2Raw: 0,
        radiusRaw: 0,
        active: false
      };
    }
    const gLength = this.comp_grabCircles.length;
    for (let i = 0; i < gLength; i++) {
      this.comp_grabCircles[i] = {
        iD: 0,
        xRaw: 0,
        yRaw: 0,
        radiusRaw: 0,
        active: false
      };
    }
    const aLength = this.comp_attackCircles.length;
    for (let i = 0; i < aLength; i++) {
      this.comp_attackCircles[i] = {
        id: 0,
        xRaw: 0,
        yRaw: 0,
        radiusRaw: 0,
        active: false
      };
    }
    const ldlLength = 4;
    for (let i = 0; i < ldlLength; i++) {
      this.comp_ledgeDetectorLeft[i] = { xRaw: 0, yRaw: 0 };
      this.comp_ledgeDetectorRight[i] = { xRaw: 0, yRaw: 0 };
    }
  }

  Zero() {
    this.posXRaw = 0;
    this.posYRaw = 0;
    this.velXRaw = 0;
    this.velYRaw = 0;
    this.damageRaw = 0;
    this.facingRight = false;
    this.fasFalling = false;
    this.hitPauseFrames = 0;
    this.intangabilityFrames = 0;
    this.invincibilityFrames = 0;
    this.superArmorFrames = 0;
    this.disablePlatformDetectionFrames = 0;
    this.disableLedgeDetectionFrames = 0;
    this.velocityDecayActive = true;
    this.shieldJump = false;
    this.lastTechFrame = 0;
    this.jumpCount = 0;
    this.stateId = STATE_IDS.IDLE_S;
    this.stateFrame = 0;
    this.hitStopFrames = 0;
    this.hitStunFrames = 0;
    this.hitStunVxRaw = 0;
    this.hitStunVyRaw = 0;
    this.hitStunNextStateId = STATE_IDS.IDLE_S;
    this.grabId = undefined;
    this.grabMeterRaw = 0;
    this.holdingPlayerId = undefined;
    this.heldPlayerId = undefined;
    this.shieldActive = false;
    this.shieldRadiusRaw = 0;
    this.calcRadiusRaw = 0;
    this.shieldTiltXRaw = 0;
    this.shieldTiltYRaw = 0;
    const sLength = this.sensors.length;
    for (let i = 0; i < sLength; i++) {
      const s = this.sensors[i];
      s.xOffsetRaw = 0;
      s.yOffsetRaw = 0;
      s.radiusRaw = 0;
      s.active = false;
    }
    this.sensorReactor = undefined;
    //this.heldPlayerId = undefined;
    this.ldGrabCount = 0;
    this.ldgGrbdLdg = undefined;
    this.atkId = undefined;
    this.playersHit.clear();
    this.comp_shield.calcXRaw = 0;
    this.comp_shield.calcYRaw = 0;
    const csLength = this.comp_sensors.length;
    for (let i = 0; i < csLength; i++) {
      const s = this.comp_sensors[i];
      s.globalXRaw = 0;
      s.globalYRaw = 0;
      s.radiusRaw = 0;
      s.active = false;
    }
    const eLength = this.comp_ecbDiamond.length;
    for (let i = 0; i < eLength; i++) {
      const p = this.comp_ecbDiamond[i];
      p.xRaw = 0;
      p.yRaw = 0;
    }
    const hLength = this.comp_hurtCapsules.length;
    for (let i = 0; i < hLength; i++) {
      const hc = this.comp_hurtCapsules[i];
      hc.x1Raw = 0;
      hc.y1Raw = 0;
      hc.x2Raw = 0;
      hc.y2Raw = 0;
      hc.radiusRaw = 0;
      hc.active = false;
    }
    const gLength = this.comp_grabCircles.length;
    for (let i = 0; i < gLength; i++) {
      const gc = this.comp_grabCircles[i];
      gc.xRaw = 0;
      gc.yRaw = 0;
      gc.radiusRaw = 0;
      gc.active = false;
    }
    const aLength = this.comp_attackCircles.length;
    for (let i = 0; i < aLength; i++) {
      const ac = this.comp_attackCircles[i];
      ac.id = 0;
      ac.xRaw = 0;
      ac.yRaw = 0;
      ac.radiusRaw = 0;
      ac.active = false;
    }
    const ldlLength = this.comp_ledgeDetectorLeft.length;
    for (let i = 0; i < ldlLength; i++) {
      const p = this.comp_ledgeDetectorLeft[i];
      p.xRaw = 0;
      p.yRaw = 0;
    }
    const ldrLength = this.comp_ledgeDetectorRight.length;
    for (let i = 0; i < ldrLength; i++) {
      const p = this.comp_ledgeDetectorRight[i];
      p.xRaw = 0;
      p.yRaw = 0;
    }
  }

  private write(buffer: Int32Array, val: number, prt: number) {
    Atomics.store(buffer, prt, val);
  }

  public Serialize(
    buffer: Int32Array,
    offset: number,
    frameNumber: number
  ): number {
    let ptr = offset;
    // This method's logic MUST be kept in sync with the static BufferSize() method.
    Atomics.add(buffer, ptr++, 1);
    //1
    const write = this.write;
    // 1. Core Numerics
    write(buffer, frameNumber, ptr++);
    write(buffer, this.posXRaw, ptr++);
    write(buffer, this.posYRaw, ptr++);
    write(buffer, this.velXRaw, ptr++);
    write(buffer, this.velYRaw, ptr++);
    write(buffer, this.damageRaw, ptr++);
    write(buffer, this.stateId, ptr++);
    write(buffer, this.stateFrame, ptr++);
    write(buffer, this.hitStopFrames, ptr++);
    write(buffer, this.hitStunFrames, ptr++);
    write(buffer, this.jumpCount, ptr++);
    write(buffer, this.hitPauseFrames, ptr++);
    write(buffer, this.intangabilityFrames, ptr++);
    write(buffer, this.invincibilityFrames, ptr++);
    write(buffer, this.superArmorFrames, ptr++);
    write(buffer, this.disablePlatformDetectionFrames, ptr++);
    write(buffer, this.disableLedgeDetectionFrames, ptr++);
    write(buffer, this.lastTechFrame, ptr++);
    write(buffer, this.hitStunVxRaw, ptr++);
    write(buffer, this.hitStunVyRaw, ptr++);
    write(buffer, this.hitStunNextStateId, ptr++);
    write(buffer, this.grabMeterRaw, ptr++);
    write(buffer, this.shieldRadiusRaw, ptr++);
    write(buffer, this.calcRadiusRaw, ptr++);
    write(buffer, this.shieldTiltXRaw, ptr++);
    write(buffer, this.shieldTiltYRaw, ptr++);
    write(buffer, this.ldGrabCount, ptr++);
    write(buffer, this.grabId ?? -1, ptr++);
    write(buffer, this.holdingPlayerId ?? -1, ptr++);
    write(buffer, this.heldPlayerId ?? -1, ptr++);
    write(buffer, this.atkId ?? -1, ptr++);
    // 1 + 28
    //29

    // 2. Booleans (Packed into 1 Integer)
    let flags = 0;
    if (this.facingRight) flags |= 1 << 0;
    if (this.fasFalling) flags |= 1 << 1;
    if (this.velocityDecayActive) flags |= 1 << 2;
    if (this.shieldJump) flags |= 1 << 3;
    if (this.shieldActive) flags |= 1 << 4;
    write(buffer, flags, ptr++);
    //30

    write(buffer, this.comp_shield.calcXRaw, ptr++);
    write(buffer, this.comp_shield.calcYRaw, ptr++);

    // 3. Nested Arrays (Sensors, Bubbles, Diamonds)
    const sLength = this.sensors.length;
    for (let i = 0; i < sLength; i++) {
      const s = this.sensors[i];
      write(buffer, s.xOffsetRaw, ptr++);
      write(buffer, s.yOffsetRaw, ptr++);
      write(buffer, s.radiusRaw, ptr++);
      write(buffer, s.active ? 1 : 0, ptr++);
    }
    // 4 X 25 = 100
    // 130
    const csLength = this.comp_sensors.length;
    for (let i = 0; i < csLength; i++) {
      const s = this.comp_sensors[i];
      write(buffer, s.globalXRaw, ptr++);
      write(buffer, s.globalYRaw, ptr++);
      write(buffer, s.radiusRaw, ptr++);
      write(buffer, s.active ? 1 : 0, ptr++);
    }
    // 4 x 25 = 100
    // 230
    const eLength = this.comp_ecbDiamond.length;
    for (let i = 0; i < eLength; i++) {
      const p = this.comp_ecbDiamond[i];
      write(buffer, p.xRaw, ptr++);
      write(buffer, p.yRaw, ptr++);
    }
    // 2 X 4 = 8
    // 238
    const hcLength = this.comp_hurtCapsules.length;
    for (let i = 0; i < hcLength; i++) {
      const hc = this.comp_hurtCapsules[i];
      write(buffer, hc.x1Raw, ptr++);
      write(buffer, hc.y1Raw, ptr++);
      write(buffer, hc.x2Raw, ptr++);
      write(buffer, hc.y2Raw, ptr++);
      write(buffer, hc.radiusRaw, ptr++);
      write(buffer, hc.active ? 1 : 0, ptr++);
    }
    // 6 X 25 = 150
    // 388
    const aLength = this.comp_attackCircles.length;
    for (let i = 0; i < aLength; i++) {
      const ac = this.comp_attackCircles[i];
      write(buffer, ac.id, ptr++);
      write(buffer, ac.xRaw, ptr++);
      write(buffer, ac.yRaw, ptr++);
      write(buffer, ac.radiusRaw, ptr++);
      write(buffer, ac.active ? 1 : 0, ptr++);
    }
    // 4 X 25 = 100
    // 488
    const gLength = this.comp_grabCircles.length;
    for (let i = 0; i < gLength; i++) {
      const gc = this.comp_grabCircles[i];
      write(buffer, gc.iD, ptr++);
      write(buffer, gc.xRaw, ptr++);
      write(buffer, gc.yRaw, ptr++);
      write(buffer, gc.radiusRaw, ptr++);
      write(buffer, gc.active ? 1 : 0, ptr++);
    }
    // 5 X 25 = 125
    // 613
    const ldlLength = this.comp_ledgeDetectorLeft.length;
    for (let i = 0; i < ldlLength; i++) {
      const p = this.comp_ledgeDetectorLeft[i];
      write(buffer, p.xRaw, ptr++);
      write(buffer, p.yRaw, ptr++);
    }
    // 2 X 4 = 8
    // 621
    const ldrLength = this.comp_ledgeDetectorRight.length;
    for (let i = 0; i < ldrLength; i++) {
      const p = this.comp_ledgeDetectorRight[i];
      write(buffer, p.xRaw, ptr++);
      write(buffer, p.yRaw, ptr++);
    }
    // 2 X 4 = 8
    // 629
    Atomics.add(buffer, offset, 1);
    return ptr - offset; // Stride size
  }

  private load(buffer: Int32Array, prtr: number): number {
    return Atomics.load(buffer, prtr);
  }

  public Deserialize(buffer: Int32Array, offset: number): boolean | number {
    let start = offset;
    const load = this.load;
    let frameNumber = 0;

    let retries = 0;
    while (retries < 1000) {
      retries++;
      let seqStart = Atomics.load(buffer, start);

      // Write in progress, spin
      if (seqStart % 2 !== 0) {
        continue;
      }

      let ptr = offset + 1;
      frameNumber = load(buffer, ptr++);
      this.posXRaw = load(buffer, ptr++);
      this.posYRaw = load(buffer, ptr++);
      this.velXRaw = load(buffer, ptr++);
      this.velYRaw = load(buffer, ptr++);
      this.damageRaw = load(buffer, ptr++);
      this.stateId = load(buffer, ptr++);
      this.stateFrame = load(buffer, ptr++);
      this.hitStopFrames = load(buffer, ptr++);
      this.hitStunFrames = load(buffer, ptr++);
      this.jumpCount = load(buffer, ptr++);
      this.hitPauseFrames = load(buffer, ptr++);
      this.intangabilityFrames = load(buffer, ptr++);
      this.invincibilityFrames = load(buffer, ptr++);
      this.superArmorFrames = load(buffer, ptr++);
      this.disablePlatformDetectionFrames = load(buffer, ptr++);
      this.disableLedgeDetectionFrames = load(buffer, ptr++);
      this.lastTechFrame = load(buffer, ptr++);
      this.hitStunVxRaw = load(buffer, ptr++);
      this.hitStunVyRaw = load(buffer, ptr++);
      this.hitStunNextStateId = load(buffer, ptr++);
      this.grabMeterRaw = load(buffer, ptr++);
      this.shieldRadiusRaw = load(buffer, ptr++);
      this.calcRadiusRaw = load(buffer, ptr++);
      this.shieldTiltXRaw = load(buffer, ptr++);
      this.shieldTiltYRaw = load(buffer, ptr++);
      this.ldGrabCount = load(buffer, ptr++);
      const grabId = load(buffer, ptr++);
      this.grabId = grabId === -1 ? undefined : grabId;
      const holdingPlayerId = load(buffer, ptr++);
      this.holdingPlayerId =
        holdingPlayerId === -1 ? undefined : holdingPlayerId;
      const helpdPlayerId = load(buffer, ptr++);
      this.heldPlayerId = helpdPlayerId === -1 ? undefined : helpdPlayerId;
      const atkId = load(buffer, ptr++);
      this.atkId = atkId === -1 ? undefined : atkId;

      const flags = load(buffer, ptr++);
      this.facingRight = (flags & (1 << 0)) !== 0;
      this.fasFalling = (flags & (1 << 1)) !== 0;
      this.velocityDecayActive = (flags & (1 << 2)) !== 0;
      this.shieldJump = (flags & (1 << 3)) !== 0;
      this.shieldActive = (flags & (1 << 4)) !== 0;

      this.comp_shield.calcXRaw = load(buffer, ptr++);
      this.comp_shield.calcYRaw = load(buffer, ptr++);

      const sLength = this.sensors.length;
      for (let i = 0; i < sLength; i++) {
        const s = this.sensors[i];
        s.xOffsetRaw = load(buffer, ptr++);
        s.yOffsetRaw = load(buffer, ptr++);
        s.radiusRaw = load(buffer, ptr++);
        s.active = load(buffer, ptr++) === 1;
      }

      const csLength = this.comp_sensors.length;
      for (let i = 0; i < csLength; i++) {
        const cs = this.comp_sensors[i];
        cs.globalXRaw = load(buffer, ptr++);
        cs.globalYRaw = load(buffer, ptr++);
        cs.radiusRaw = load(buffer, ptr++);
        cs.active = load(buffer, ptr++) === 1;
      }

      const eLength = this.comp_ecbDiamond.length;
      for (let i = 0; i < eLength; i++) {
        const p = this.comp_ecbDiamond[i];
        p.xRaw = load(buffer, ptr++);
        p.yRaw = load(buffer, ptr++);
      }

      const hcLength = this.comp_hurtCapsules.length;
      for (let i = 0; i < hcLength; i++) {
        const hc = this.comp_hurtCapsules[i];
        hc.x1Raw = load(buffer, ptr++);
        hc.y1Raw = load(buffer, ptr++);
        hc.x2Raw = load(buffer, ptr++);
        hc.y2Raw = load(buffer, ptr++);
        hc.radiusRaw = load(buffer, ptr++);
        hc.active = load(buffer, ptr++) === 1;
      }

      const aLength = this.comp_attackCircles.length;
      for (let i = 0; i < aLength; i++) {
        const ac = this.comp_attackCircles[i];
        ac.id = load(buffer, ptr++);
        ac.xRaw = load(buffer, ptr++);
        ac.yRaw = load(buffer, ptr++);
        ac.radiusRaw = load(buffer, ptr++);
        ac.active = load(buffer, ptr++) === 1;
      }

      const gLength = this.comp_grabCircles.length;
      for (let i = 0; i < gLength; i++) {
        const gc = this.comp_grabCircles[i];
        gc.iD = load(buffer, ptr++);
        gc.xRaw = load(buffer, ptr++);
        gc.yRaw = load(buffer, ptr++);
        gc.radiusRaw = load(buffer, ptr++);
        gc.active = load(buffer, ptr++) === 1;
      }

      const ldlLength = this.comp_ledgeDetectorLeft.length;
      for (let i = 0; i < ldlLength; i++) {
        const p = this.comp_ledgeDetectorLeft[i];
        p.xRaw = load(buffer, ptr++);
        p.yRaw = load(buffer, ptr++);
      }

      const ldrLength = this.comp_ledgeDetectorRight.length;
      for (let i = 0; i < ldrLength; i++) {
        const p = this.comp_ledgeDetectorRight[i];
        p.xRaw = load(buffer, ptr++);
        p.yRaw = load(buffer, ptr++);
      }

      const seqEnd = Atomics.load(buffer, start);
      // Check if data tore mid-read, else break loop and return successfully
      if (seqStart === seqEnd) {
        return frameNumber;
      }
    }

    return false; // Retries exhausted
  }

  static BufferSize() {
    // This calculation MUST be kept in sync with the Serialize/Deserialize methods.
    // Verify with test 'should calculate the exact BufferSize needed for serialization'.
    // It calculates the total number of Int32s needed for one state history entry.
    let stride = 0;

    // Sequence and Frame numbers
    stride += 2; // seq, frameNumber

    // 1. Core Numerics (30 properties)
    stride += 30;

    // 2. Booleans (Packed into 1 Integer)
    stride += 1;

    stride += 2; // comp_shield (calcXRaw, calcYRaw)

    // 3. Nested Arrays (Sensors, Bubbles, Diamonds)
    const maxSensors = envConfig.get('MaxSensorsPerPlayer') as number;
    const maxHurt = envConfig.get('MaxHurtBubblesPerPlayer') as number;
    const maxAtk = envConfig.get('MaxAtkBubblesPerPlayer') as number;
    const maxGrab = envConfig.get('MaxGrabBubblesPerPlayer') as number;

    stride += maxSensors * 4; // sensors array (x, y, r, active)
    stride += maxSensors * 4; // comp_sensors array (x, y, r, active)
    stride += 4 * 2; // comp_ecbDiamond (4 points * 2 coords)
    stride += maxHurt * 6; // comp_hurtCapsules (x1, y1, x2, y2, r, active)
    stride += maxAtk * 5; // comp_attackCircles (id, x, y, r, active)
    stride += maxGrab * 5; // comp_grabCircles (id, x, y, r, active)
    stride += 4 * 2; // comp_ledgeDetectorLeft (4 points * 2 coords)
    stride += 4 * 2; // comp_ledgeDetectorRight (4 points * 2 coords)

    return stride * Int32Array.BYTES_PER_ELEMENT;
  }
}
