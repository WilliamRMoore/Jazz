import { FSMState } from '../finite-state-machine/PlayerStateMachine';
import { FlatVec } from '../physics/vector';
import { FillArrayWithFlatVec, ToFV } from '../utils';
import { Player } from './playerOrchestrator';
import { Clamp } from '../utils';
import { Circle } from '../physics/circle';
import { PooledVector } from '../pools/PooledVector';
import { Pool } from '../pools/Pool';
import { ActiveHitBubblesDTO } from '../pools/ActiveAttackHitBubbles';
import { CreateConvexHull } from '../physics/collisions';
import { Command } from '../command/command';
import {
  AttackConfig,
  ECBShapesConfig,
  HitBubblesConifg,
  HurtCapsuleConfig,
} from '../../character/shared';
import { AttackGameEventMappings } from '../finite-state-machine/PlayerStates';
import {
  StateId,
  AttackId,
  GameEventId,
} from '../finite-state-machine/stateConfigurations/shared';
import { Idle } from '../finite-state-machine/stateConfigurations/states';
import { FixedPoint, NumberToRaw, MultiplyRaw } from '../math/fixedPoint';

/***
 * TODO:
 * Add shield component
 * Add projectile component
 */

/**
 * This file contains everything pertaining to player components.
 *
 * Player Componenets: Components are the building blocks for game features.
 * Entities (Player, in this case) are componesed of components like these.
 *
 * Guide Line:
 * 1. Components should not contain other components.
 * 2. Components should not reference state outside of themselves.
 * 3. Components should be atomic and behave similar to primitives.
 * 4. Components should try to make as much state private as possible.
 *
 * ComponentHistory:
 * ComponentHistory is used to get a snap shot of each components state once per frame.
 * Every component that is stateful and mutative needs to implement the IHistoryEnabled Interface.
 * This is necessary for rollback.
 */

export class StaticHistory {
  public ledgDetecorHeight: number = 0;
  public LedgeDetectorWidth: number = 0;
  public HurtCapsules: Array<HurtCapsule> = [];
  public ShieldOffset: number = 0;
}

export class ComponentHistory {
  public readonly StaticPlayerHistory = new StaticHistory();
  readonly ShieldHistory: Array<ShieldSnapShot> = [];
  readonly PositionHistory: Array<PositionSnapShot> = [];
  readonly FsmInfoHistory: Array<FSMInfoSnapShot> = [];
  readonly PlayerPointsHistory: Array<PlayerPointsSnapShot> = [];
  readonly PlayerHitStunHistory: Array<hitStunSnapShot> = [];
  readonly PlayerHitStopHistory: Array<hitStopSnapShot> = [];
  readonly VelocityHistory: Array<VelocitySnapShot> = [];
  readonly FlagsHistory: Array<FlagsSnapShot> = [];
  readonly EcbHistory: Array<ECBSnapShot> = [];
  readonly JumpHistroy: Array<number> = [];
  readonly LedgeDetectorHistory: Array<LedgeDetectorSnapShot> = [];
  readonly SensorsHistory: Array<SensorSnapShot> = [];
  readonly AttackHistory: Array<AttackSnapShot> = [];

  public SetPlayerToFrame(p: Player, frameNumber: number) {
    p.Shield.SetFromSnapShot(this.ShieldHistory[frameNumber]);
    p.Position.SetFromSnapShot(this.PositionHistory[frameNumber]);
    p.FSMInfo.SetFromSnapShot(this.FsmInfoHistory[frameNumber]);
    p.Velocity.SetFromSnapShot(this.VelocityHistory[frameNumber]);
    p.Points.SetFromSnapShot(this.PlayerPointsHistory[frameNumber]);
    p.HitStop.SetFromSnapShot(this.PlayerHitStopHistory[frameNumber]);
    p.HitStun.SetFromSnapShot(this.PlayerHitStunHistory[frameNumber]);
    p.Flags.SetFromSnapShot(this.FlagsHistory[frameNumber]);
    p.ECB.SetFromSnapShot(this.EcbHistory[frameNumber]);
    p.LedgeDetector.SetFromSnapShot(this.LedgeDetectorHistory[frameNumber]);
    p.Sensors.SetFromSnapShot(this.SensorsHistory[frameNumber]);
    p.Jump.SetFromSnapShot(this.JumpHistroy[frameNumber]);
    p.Attacks.SetFromSnapShot(this.AttackHistory[frameNumber]);
  }

  public static GetRightXFromEcbHistory(ecb: ECBSnapShot): number {
    return ecb.posX + ecb.Width / 2;
  }

  public static GetRightYFromEcbHistory(ecb: ECBSnapShot): number {
    return ecb.posY - ecb.Height / 2;
  }

  public static GetLeftXFromEcbHistory(ecb: ECBSnapShot): number {
    return ecb.posX - ecb.Width / 2;
  }

  public static GetLeftYFromEcbHistory(ecb: ECBSnapShot): number {
    return ecb.posY - ecb.Height / 2;
  }

  public static GetTopXFromEcbHistory(ecb: ECBSnapShot): number {
    return ecb.posX;
  }

  public static GetTopYFromEcbHistory(ecb: ECBSnapShot): number {
    return ecb.posY - ecb.Height;
  }

  public static GetBottomXFromEcbHistory(ecb: ECBSnapShot): number {
    return ecb.posX;
  }

  public static GetBottomYFromEcbHistory(ecb: ECBSnapShot): number {
    return ecb.posY;
  }

  public static GetPrevRightXFromEcbHistory(ecb: ECBSnapShot): number {
    return ecb.prevPosX + ecb.Width / 2;
  }

  public static GetPrevRightYFromEcbHistory(ecb: ECBSnapShot): number {
    return ecb.prevPosY - ecb.Height / 2;
  }

  public static GetPrevLeftXFromEcbHistory(ecb: ECBSnapShot): number {
    return ecb.prevPosX - ecb.Width / 2;
  }

  public static GetPrevLeftYFromEcbHistory(ecb: ECBSnapShot): number {
    return ecb.prevPosY - ecb.Height / 2;
  }

  public static GetPrevTopXFromEcbHistory(ecb: ECBSnapShot): number {
    return ecb.prevPosX;
  }

  public static GetPrevTopYFromEcbHistory(ecb: ECBSnapShot): number {
    return ecb.prevPosY - ecb.Height;
  }

  public static GetPrevBottomXFromEcbHistory(ecb: ECBSnapShot): number {
    return ecb.prevPosX;
  }

  public static GetPrevBottomYFromEcbHistory(ecb: ECBSnapShot): number {
    return ecb.prevPosY;
  }
}

interface IHistoryEnabled<T> {
  SnapShot(): T;
  SetFromSnapShot(snapShot: T): void;
}

export type PositionSnapShot = { readonly X: number; readonly Y: number };

// Player Components
export class PositionComponent implements IHistoryEnabled<PositionSnapShot> {
  private readonly x: FixedPoint = new FixedPoint();
  private readonly y: FixedPoint = new FixedPoint();

  public SnapShot(): PositionSnapShot {
    return {
      X: this.x.AsNumber,
      Y: this.y.AsNumber,
    };
  }

  public SetFromSnapShot(snapShot: PositionSnapShot): void {
    this.x.SetFromNumber(snapShot.X);
    this.y.SetFromNumber(snapShot.Y);
  }

  public get X(): FixedPoint {
    return this.x;
  }

  public get Y(): FixedPoint {
    return this.y;
  }

  public set X(val: FixedPoint) {
    this.x.SetFromFp(val);
  }

  public set Y(val: FixedPoint) {
    this.y.SetFromFp(val);
  }
}

export class WeightComponent {
  public readonly Value: FixedPoint = new FixedPoint();

  constructor(weight: number) {
    this.Value.SetFromNumber(weight);
  }
}

export type VelocitySnapShot = { readonly X: number; readonly Y: number };

export class VelocityComponent implements IHistoryEnabled<VelocitySnapShot> {
  private readonly x: FixedPoint = new FixedPoint();
  private readonly y: FixedPoint = new FixedPoint();

  public AddClampedXImpulse(clamp: FixedPoint, impulse: FixedPoint): void {
    this.AddClampedXImpulseRaw(clamp.Raw, impulse.Raw);
  }

  public AddClampedXImpulseRaw(clampRaw: number, impulseRaw: number): void {
    const clampValueRaw = Math.abs(clampRaw);
    const currentVelocityRaw = this.x.Raw;

    // Don't add impulse if we are already at or beyond the clamp limit.
    if (Math.abs(currentVelocityRaw) >= clampValueRaw) {
      return;
    }

    this.x.SetFromRaw(currentVelocityRaw + impulseRaw);
  }

  public AddClampedYImpulse(clamp: FixedPoint, impulse: FixedPoint): void {
    const newVelocityRaw = this.y.Raw + impulse.Raw;
    const clampValueRaw = Math.abs(clamp.Raw);
    if (newVelocityRaw > 0) {
      this.y.SetFromRaw(Math.min(newVelocityRaw, clampValueRaw));
    } else {
      this.y.SetFromRaw(newVelocityRaw);
    }
  }

  public AddClampedYImpulseRaw(clampRaw: number, impulse: number): void {
    const newVelocityRaw = this.y.Raw + impulse;
    const clampValueRaw = Math.abs(clampRaw);
    if (newVelocityRaw > 0) {
      this.y.SetFromRaw(Math.min(newVelocityRaw, clampValueRaw));
    } else {
      this.y.SetFromRaw(newVelocityRaw);
    }
  }

  public SnapShot(): VelocitySnapShot {
    return { X: this.x.AsNumber, Y: this.y.AsNumber } as VelocitySnapShot;
  }

  public SetFromSnapShot(snapShot: VelocitySnapShot): void {
    this.x.SetFromNumber(snapShot.X);
    this.y.SetFromNumber(snapShot.Y);
  }

  public get X(): FixedPoint {
    return this.x;
  }

  public get Y(): FixedPoint {
    return this.y;
  }

  public set X(val: FixedPoint) {
    this.x.SetFromFp(val);
  }

  public set Y(val: FixedPoint) {
    this.y.SetFromFp(val);
  }
}

export type FSMInfoSnapShot = {
  State: FSMState;
  StateFrame: number;
  frameLengths: Map<StateId, number>;
};

export class FSMInfoComponent implements IHistoryEnabled<FSMInfoSnapShot> {
  private currentState: FSMState = Idle;
  private currentStateFrame: number = 0;
  private readonly frameLengths: Map<StateId, number>;

  public constructor(frameLengths: Map<StateId, number>) {
    this.frameLengths = frameLengths;
  }

  public get CurrentStateFrame(): number {
    return this.currentStateFrame;
  }

  public get CurrentState(): FSMState {
    return this.currentState;
  }

  public get CurrentStatetId(): StateId {
    return this.currentState.StateId;
  }

  public set _currentStaeFrame(frame: number) {
    this.currentStateFrame = frame;
  }

  public SetCurrentState(s: FSMState) {
    this.currentState = s;
  }

  public IncrementStateFrame(): void {
    this.currentStateFrame++;
  }

  public SetStateFrameToZero(): void {
    this.currentStateFrame = 0;
  }

  public GetFrameLengthForState(stateId: StateId): number | undefined {
    return this.frameLengths.get(stateId);
  }

  public GetCurrentStateFrameLength(): number | undefined {
    return this.frameLengths.get(this.CurrentState.StateId);
  }

  public SetFrameLength(stateId: StateId, frameLength: number): void {
    this.frameLengths.set(stateId, frameLength);
  }

  public SnapShot(): FSMInfoSnapShot {
    return {
      State: this.currentState,
      StateFrame: this.currentStateFrame,
      frameLengths: new Map(this.frameLengths),
    } as FSMInfoSnapShot;
  }

  public SetFromSnapShot(snapShot: FSMInfoSnapShot): void {
    this.currentState = snapShot.State;
    this.currentStateFrame = snapShot.StateFrame;
    for (const [key, value] of snapShot.frameLengths.entries()) {
      this.frameLengths.set(key, value);
    }
  }
}

type hitStopSnapShot = number;

export class HitStopComponent implements IHistoryEnabled<hitStopSnapShot> {
  private hitStopFrames: number = 0;

  public SetHitStop(frames: number): void {
    this.hitStopFrames = frames;
  }

  public Decrement(): void {
    this.hitStopFrames--;
  }

  public SetZero(): void {
    this.hitStopFrames = 0;
  }

  public get HitStopFrames(): number {
    return this.hitStopFrames;
  }

  public SnapShot(): hitStopSnapShot {
    return this.hitStopFrames as hitStopSnapShot;
  }

  public SetFromSnapShot(snapShot: hitStopSnapShot): void {
    this.hitStopFrames = snapShot;
  }
}

type hitStunSnapShot = {
  readonly hitStunFrames: number;
  readonly vx: number;
  readonly vy: number;
};

export class HitStunComponent implements IHistoryEnabled<hitStunSnapShot> {
  private framesOfHitStun: number = 0;
  private readonly xVelocity: FixedPoint = new FixedPoint(0);
  private readonly yVelocity: FixedPoint = new FixedPoint(0);

  public set FramesOfHitStun(hitStunFrames: number) {
    this.framesOfHitStun = hitStunFrames;
  }

  public get VX(): FixedPoint {
    return this.xVelocity;
  }

  public get VY(): FixedPoint {
    return this.yVelocity;
  }

  public SetHitStun(
    hitStunFrames: number,
    vx: FixedPoint,
    vy: FixedPoint
  ): void {
    this.framesOfHitStun = hitStunFrames;
    this.xVelocity.SetFromFp(vx);
    this.yVelocity.SetFromFp(vy);
  }

  public DecrementHitStun(): void {
    this.framesOfHitStun--;
  }

  public Zero(): void {
    this.framesOfHitStun = 0;
    this.xVelocity.SetFromNumber(0);
    this.yVelocity.SetFromNumber(0);
  }

  public SnapShot(): hitStunSnapShot {
    return {
      hitStunFrames: this.framesOfHitStun,
      vx: this.xVelocity.AsNumber,
      vy: this.yVelocity.AsNumber,
    } as hitStunSnapShot;
  }

  public SetFromSnapShot(snapShot: hitStunSnapShot): void {
    this.framesOfHitStun = snapShot.hitStunFrames;
    this.xVelocity.SetFromNumber(snapShot.vx);
    this.yVelocity.SetFromNumber(snapShot.vy);
  }
}

export class SpeedsComponent {
  public readonly GroundedVelocityDecayRaw: number;
  public readonly AerialVelocityDecayRaw: number;
  public readonly AirDogeSpeedRaw: number;
  public readonly DodeRollSpeedRaw: number;
  public readonly ArielVelocityMultiplierRaw: number;
  public readonly AerialSpeedInpulseLimitRaw: number;
  public readonly MaxWalkSpeedRaw: number;
  public readonly MaxRunSpeedRaw: number;
  public readonly WalkSpeedMulitplierRaw: number;
  public readonly RunSpeedMultiplierRaw: number;
  public readonly FastFallSpeedRaw: number;
  public readonly FallSpeedRaw: number;
  public readonly GravityRaw: number;
  public readonly DashMultiplierRaw: number;
  public readonly MaxDashSpeedRaw: number;
  // Might need a general Aerial speed limit for each character

  constructor(
    grndSpeedVelDecay: FixedPoint,
    aerialVelocityDecay: FixedPoint,
    aerialSpeedInpulseLimit: FixedPoint,
    aerialVelocityMultiplier: FixedPoint,
    airDodgeSpeed: FixedPoint,
    dodgeRollSpeed: FixedPoint,
    maxWalkSpeed: FixedPoint,
    maxRunSpeed: FixedPoint,
    walkSpeedMultiplier: FixedPoint,
    runSpeedMultiplier: FixedPoint,
    fastFallSpeed: FixedPoint,
    fallSpeed: FixedPoint,
    dashMultiplier: FixedPoint,
    maxDashSpeed: FixedPoint,
    gravity: FixedPoint
  ) {
    this.GroundedVelocityDecayRaw = grndSpeedVelDecay.Raw;
    this.AerialVelocityDecayRaw = aerialVelocityDecay.Raw;
    this.AerialSpeedInpulseLimitRaw = aerialSpeedInpulseLimit.Raw;
    this.ArielVelocityMultiplierRaw = aerialVelocityMultiplier.Raw;
    this.AirDogeSpeedRaw = airDodgeSpeed.Raw;
    this.DodeRollSpeedRaw = dodgeRollSpeed.Raw;
    this.MaxWalkSpeedRaw = maxWalkSpeed.Raw;
    this.MaxRunSpeedRaw = maxRunSpeed.Raw;
    this.WalkSpeedMulitplierRaw = walkSpeedMultiplier.Raw;
    this.RunSpeedMultiplierRaw = runSpeedMultiplier.Raw;
    this.FastFallSpeedRaw = fastFallSpeed.Raw;
    this.FallSpeedRaw = fallSpeed.Raw;
    this.DashMultiplierRaw = dashMultiplier.Raw;
    this.MaxDashSpeedRaw = maxDashSpeed.Raw;
    this.GravityRaw = gravity.Raw;
  }
}

type PlayerPointsSnapShot = {
  damagePoints: number;
  matchPoints: number;
};

export class PlayerPointsComponent
  implements IHistoryEnabled<PlayerPointsSnapShot>
{
  private readonly damagePoints: FixedPoint = new FixedPoint(0);
  private matchPoints: number = 0;
  private defaultMatchPoints: number;

  public constructor(defaultMatchPoints: number = 4) {
    this.defaultMatchPoints = defaultMatchPoints;
  }

  public AddDamage(number: FixedPoint): void {
    this.damagePoints.Add(number);
  }

  public SubtractDamage(number: FixedPoint): void {
    this.damagePoints.Subtract(number);
  }

  public AddMatchPoints(number: number): void {
    this.matchPoints += number;
  }

  public SubtractMatchPoints(number: number): void {
    this.matchPoints -= number;
  }

  public ResetMatchPoints(): void {
    this.matchPoints = this.defaultMatchPoints;
  }

  public ResetDamagePoints(): void {
    this.damagePoints.Zero();
  }

  public get Damage(): FixedPoint {
    return this.damagePoints;
  }

  public get MatchPoints(): number {
    return this.matchPoints;
  }

  public SnapShot(): PlayerPointsSnapShot {
    return {
      damagePoints: this.damagePoints.AsNumber,
      matchPoints: this.matchPoints,
    } as PlayerPointsSnapShot;
  }

  public SetFromSnapShot(snapShot: PlayerPointsSnapShot): void {
    this.damagePoints.SetFromNumber(snapShot.damagePoints);
    this.matchPoints = snapShot.matchPoints;
  }
}

export type FlagsSnapShot = {
  FacingRight: boolean;
  FastFalling: boolean;
  HitPauseFrames: number;
  IntangabilityFrames: number;
  DisablePlatDetection: number;
  VeloctyDecay: boolean;
};

export class PlayerFlagsComponent implements IHistoryEnabled<FlagsSnapShot> {
  private facingRight: boolean = false;
  private fastFalling: boolean = false;
  private hitPauseFrames: number = 0;
  private intangabilityFrames: number = 0;
  private disablePlatformDetection: number = 0;
  private velocityDecayActive: boolean = true;

  public FaceRight(): void {
    this.facingRight = true;
  }

  public FaceLeft(): void {
    this.facingRight = false;
  }

  public ChangeDirections(): void {
    this.facingRight = !this.facingRight;
  }

  public FastFallOn(): void {
    this.fastFalling = true;
  }

  public FastFallOff(): void {
    this.fastFalling = false;
  }

  public VelocityDecayOff(): void {
    this.velocityDecayActive = false;
  }

  public VelocityDecayOn(): void {
    this.velocityDecayActive = true;
  }

  public SetHitPauseFrames(frames: number): void {
    this.hitPauseFrames = frames;
  }

  public DecrementHitPause(): void {
    this.hitPauseFrames--;
  }

  public DecrementIntangabilityFrames(): void {
    this.intangabilityFrames--;
  }

  public SetIntangabilityFrames(frames: number): void {
    this.intangabilityFrames = frames;
  }

  public DecrementDisablePlatDetection(): void {
    this.disablePlatformDetection--;
  }

  public SetDisablePlatFrames(frameCount: number): void {
    this.disablePlatformDetection = frameCount;
  }

  public ZeroIntangabilityFrames(): void {
    this.intangabilityFrames = 0;
  }

  public ZeroHitPauseFrames(): void {
    this.hitPauseFrames = 0;
  }

  public ZeroDisablePlatDetection(): void {
    this.disablePlatformDetection = 0;
  }

  public get IsFastFalling(): boolean {
    return this.fastFalling;
  }

  public get IsFacingRight(): boolean {
    return this.facingRight;
  }

  public get IsFacingLeft(): boolean {
    return !this.facingRight;
  }

  public get IsVelocityDecayActive(): boolean {
    return this.velocityDecayActive;
  }

  public get IsInHitPause(): boolean {
    return this.hitPauseFrames > 0;
  }

  public get IsIntangible(): boolean {
    return this.intangabilityFrames > 0;
  }

  public get IsPlatDetectDisabled(): boolean {
    return this.disablePlatformDetection > 0;
  }

  public GetIntangabilityFrames(): number {
    return this.intangabilityFrames;
  }

  public HasNoVelocityDecay(): boolean {
    return !this.velocityDecayActive;
  }

  public SnapShot(): FlagsSnapShot {
    return {
      FacingRight: this.facingRight,
      FastFalling: this.fastFalling,
      HitPauseFrames: this.hitPauseFrames,
      IntangabilityFrames: this.intangabilityFrames,
      DisablePlatDetection: this.disablePlatformDetection,
      VeloctyDecay: this.velocityDecayActive,
    } as FlagsSnapShot;
  }

  public SetFromSnapShot(snapShot: FlagsSnapShot): void {
    this.fastFalling = snapShot.FastFalling;
    this.facingRight = snapShot.FacingRight;
    this.hitPauseFrames = snapShot.HitPauseFrames;
    this.intangabilityFrames = snapShot.IntangabilityFrames;
    this.disablePlatformDetection = snapShot.DisablePlatDetection;
    this.velocityDecayActive = snapShot.VeloctyDecay;
  }
}

export type ECBSnapShot = {
  readonly posX: number;
  readonly posY: number;
  readonly prevPosX: number;
  readonly prevPosY: number;
  readonly YOffset: number;
  readonly Height: number;
  readonly Width: number;
};

export type ECBShape = {
  readonly height: FixedPoint;
  readonly width: FixedPoint;
  readonly yOffset: FixedPoint;
};

export type ECBShapes = Map<StateId, ECBShape>;

export class ECBComponent implements IHistoryEnabled<ECBSnapShot> {
  public readonly SensorDepth: FixedPoint = new FixedPoint(1);
  private readonly yOffset: FixedPoint = new FixedPoint(0);
  private readonly x: FixedPoint = new FixedPoint(0);
  private readonly y: FixedPoint = new FixedPoint(0);
  private readonly prevX: FixedPoint = new FixedPoint(0);
  private readonly prevY: FixedPoint = new FixedPoint(0);
  private readonly height: FixedPoint = new FixedPoint(0);
  private readonly width: FixedPoint = new FixedPoint(0);
  private readonly originalHeight: FixedPoint = new FixedPoint(0);
  private readonly originalWidth: FixedPoint = new FixedPoint(0);
  private readonly originalYOffset: FixedPoint = new FixedPoint(0);
  private readonly curVerts = new Array<FlatVec>(4);
  private readonly prevVerts = new Array<FlatVec>(4);
  private readonly allVerts = new Array<FlatVec>(8);
  private readonly ecbStateShapes: ECBShapes;

  constructor(shapes: ECBShapesConfig, height = 100, width = 100, yOffset = 0) {
    this.height.SetFromNumber(height);
    this.width.SetFromNumber(width);
    this.originalHeight.SetFromNumber(height);
    this.originalWidth.SetFromNumber(width);
    this.originalYOffset.SetFromNumber(yOffset);
    this.yOffset.SetFromNumber(yOffset);
    this.ecbStateShapes = new Map<StateId, ECBShape>();
    for (const [Key, val] of shapes) {
      this.ecbStateShapes.set(Key, {
        height: new FixedPoint(val.height),
        width: new FixedPoint(val.width),
        yOffset: new FixedPoint(val.yOffset),
      });
    }
    FillArrayWithFlatVec(this.curVerts);
    FillArrayWithFlatVec(this.prevVerts);
    this.loadAllVerts();
    this.update();
  }

  public GetHull(): FlatVec[] {
    return CreateConvexHull(this.allVerts);
  }

  public GetActiveVerts(): FlatVec[] {
    return this.curVerts;
  }

  public UpdatePreviousECB(): void {
    this.prevX.SetFromFp(this.x);
    this.prevY.SetFromFp(this.y);

    const prevVert: FlatVec[] = this.prevVerts;
    const curVert: FlatVec[] = this.curVerts;
    prevVert[0].X.SetFromFp(curVert[0].X);
    prevVert[0].Y.SetFromFp(curVert[0].Y);
    prevVert[1].X.SetFromFp(curVert[1].X);
    prevVert[1].Y.SetFromFp(curVert[1].Y);
    prevVert[2].X.SetFromFp(curVert[2].X);
    prevVert[2].Y.SetFromFp(curVert[2].Y);
    prevVert[3].X.SetFromFp(curVert[3].X);
    prevVert[3].Y.SetFromFp(curVert[3].Y);
  }

  public SetInitialPosition(x: FixedPoint, y: FixedPoint): void {
    this.MoveToPosition(x, y);
    this.UpdatePreviousECB();
  }

  public SetInitialPositionRaw(xRaw: number, yRaw: number): void {
    this.x.SetFromRaw(xRaw);
    this.y.SetFromRaw(yRaw);
    this.update();
    this.UpdatePreviousECB();
  }

  public MoveToPosition(x: FixedPoint, y: FixedPoint): void {
    this.x.SetFromFp(x);
    this.y.SetFromFp(y);
    this.update();
  }

  public MoveToPositionRaw(xRaw: number, yRaw: number): void {
    this.x.SetFromRaw(xRaw);
    this.y.SetFromRaw(yRaw);
    this.update();
  }

  public SetECBShape(stateId: StateId): void {
    const shape: ECBShape | undefined = this.ecbStateShapes.get(stateId);
    if (shape === undefined) {
      this.yOffset.SetFromFp(this.originalYOffset);
      this.height.SetFromFp(this.originalHeight);
      this.width.SetFromFp(this.originalWidth);
      this.update();
      return;
    }

    this.yOffset.SetFromFp(shape.yOffset);
    this.height.SetFromFp(shape.height);
    this.width.SetFromFp(shape.width);
    this.update();
  }

  private update(): void {
    const half = NumberToRaw(0.5);
    const px = this.x.Raw;
    const py = this.y.Raw;
    const height = this.height.Raw;
    const width = this.width.Raw;
    const yOffset = this.yOffset.Raw;

    const bottomX = px;
    const bottomY = py + yOffset;

    const topX = px;
    const topY = bottomY - height;

    const halfWidth = MultiplyRaw(width, half);
    const halfHeight = MultiplyRaw(height, half);

    const leftX = bottomX - halfWidth;
    const leftY = bottomY - halfHeight;

    const rightX = bottomX + halfWidth;
    const rightY = leftY;

    this.curVerts[0].X.SetFromRaw(bottomX);
    this.curVerts[0].Y.SetFromRaw(bottomY);

    this.curVerts[1].X.SetFromRaw(leftX);
    this.curVerts[1].Y.SetFromRaw(leftY);

    this.curVerts[2].X.SetFromRaw(topX);
    this.curVerts[2].Y.SetFromRaw(topY);

    this.curVerts[3].X.SetFromRaw(rightX);
    this.curVerts[3].Y.SetFromRaw(rightY);
  }

  public get Bottom(): FlatVec {
    return this.curVerts[0];
  }

  public get PrevBottom(): FlatVec {
    return this.prevVerts[0];
  }

  public get Left(): FlatVec {
    return this.curVerts[1];
  }

  public get PrevLeft(): FlatVec {
    return this.prevVerts[1];
  }

  public get Top(): FlatVec {
    return this.curVerts[2];
  }

  public get PrevTop(): FlatVec {
    return this.prevVerts[2];
  }

  public get Right(): FlatVec {
    return this.curVerts[3];
  }

  public get PrevRight(): FlatVec {
    return this.prevVerts[3];
  }

  public get Height(): FixedPoint {
    return this.height;
  }

  public get Width(): FixedPoint {
    return this.width;
  }

  public get YOffset(): FixedPoint {
    return this.yOffset;
  }

  public get _ecbShapes(): ECBShapes {
    return this.ecbStateShapes;
  }

  public ResetECBShape(): void {
    this.height.SetFromFp(this.originalHeight);
    this.width.SetFromFp(this.originalWidth);
    this.yOffset.SetFromFp(this.originalYOffset);
    this.update();
  }

  public SnapShot(): ECBSnapShot {
    return {
      posX: this.x.AsNumber,
      posY: this.y.AsNumber,
      prevPosX: this.prevX.AsNumber,
      prevPosY: this.prevY.AsNumber,
      YOffset: this.yOffset.AsNumber,
      Height: this.height.AsNumber,
      Width: this.width.AsNumber,
    } as ECBSnapShot;
  }

  public SetFromSnapShot(snapShot: ECBSnapShot): void {
    this.x.SetFromNumber(snapShot.posX);
    this.y.SetFromNumber(snapShot.posY);
    this.prevX.SetFromNumber(snapShot.prevPosX);
    this.prevY.SetFromNumber(snapShot.prevPosY);
    this.yOffset.SetFromNumber(snapShot.YOffset);
    this.height.SetFromNumber(snapShot.Height);
    this.width.SetFromNumber(snapShot.Width);

    this.update();

    // Update prevVerts
    const half = NumberToRaw(0.5);
    const px = this.prevX.Raw;
    const py = this.prevY.Raw;
    const height = this.height.Raw;
    const width = this.width.Raw;
    const yOffset = this.yOffset.Raw;

    const bottomX = px;
    const bottomY = py + yOffset;

    const topX = px;
    const topY = bottomY - height;

    const halfWidth = MultiplyRaw(width, half);
    const halfHeight = MultiplyRaw(height, half);

    const leftX = bottomX - halfWidth;
    const leftY = bottomY - halfHeight;

    const rightX = bottomX + halfWidth;
    const rightY = leftY;

    this.prevVerts[0].X.SetFromRaw(bottomX);
    this.prevVerts[0].Y.SetFromRaw(bottomY);

    this.prevVerts[1].X.SetFromRaw(leftX);
    this.prevVerts[1].Y.SetFromRaw(leftY);

    this.prevVerts[2].X.SetFromRaw(topX);
    this.prevVerts[2].Y.SetFromRaw(topY);

    this.prevVerts[3].X.SetFromRaw(rightX);
    this.prevVerts[3].Y.SetFromRaw(rightY);
  }

  private loadAllVerts(): void {
    this.allVerts.length = 0;

    for (let i = 0; i < 4; i++) {
      this.allVerts.push(this.prevVerts[i]);
    }

    for (let i = 0; i < 4; i++) {
      this.allVerts.push(this.curVerts[i]);
    }
  }
}

export type HurtCirclesSnapShot = {
  position: FlatVec;
  circls: Array<Circle>;
};

export class HurtCapsule {
  public readonly StartOffsetX: FixedPoint = new FixedPoint();
  public readonly StartOffsetY: FixedPoint = new FixedPoint();
  public readonly EndOffsetX: FixedPoint = new FixedPoint();
  public readonly EndOffsetY: FixedPoint = new FixedPoint();
  public readonly Radius: FixedPoint = new FixedPoint();

  constructor(
    startOffsetX: number,
    startOffsetY: number,
    endOffsetX: number,
    endOffsetY: number,
    radius: number
  ) {
    this.StartOffsetX.SetFromNumber(startOffsetX);
    this.StartOffsetY.SetFromNumber(startOffsetY);
    this.EndOffsetX.SetFromNumber(endOffsetX);
    this.EndOffsetY.SetFromNumber(endOffsetY);
    this.Radius.SetFromNumber(radius);
  }

  public GetStartPosition(
    x: FixedPoint,
    y: FixedPoint,
    vecPool: Pool<PooledVector>
  ): PooledVector {
    const xsRaw = this.StartOffsetX.Raw + x.Raw;
    const ysRaw = this.StartOffsetY.Raw + y.Raw;
    return vecPool.Rent().SetXYRaw(xsRaw, ysRaw);
  }

  public GetEndPosition(
    x: FixedPoint,
    y: FixedPoint,
    vecPool: Pool<PooledVector>
  ): PooledVector {
    const xeRaw = this.EndOffsetX.Raw + x.Raw;
    const yeRaw = this.EndOffsetY.Raw + y.Raw;
    return vecPool.Rent().SetXYRaw(xeRaw, yeRaw);
  }
}

export class HurtCapsulesComponent {
  public readonly HurtCapsules: Array<HurtCapsule>;

  constructor(hurtCapsules: Array<HurtCapsuleConfig>) {
    this.HurtCapsules = [];
    hurtCapsules.forEach((hc) => {
      this.HurtCapsules.push(
        new HurtCapsule(hc.x1, hc.y1, hc.x2, hc.y2, hc.radius)
      );
    });
  }
}

export type ShieldSnapShot = {
  readonly CurrentRadius: number;
  readonly Active: boolean;
};

export class ShieldComponent implements IHistoryEnabled<ShieldSnapShot> {
  public readonly InitialRadius = new FixedPoint(0);
  public readonly YOffset = new FixedPoint(0);
  public Active: boolean = false;
  public readonly CurrentRadius = new FixedPoint(0);
  private readonly step = new FixedPoint(0);
  private readonly framesToFulll = new FixedPoint(300);
  private readonly damageMult = new FixedPoint(1.5);

  constructor(radius: number, yOffset: number) {
    this.CurrentRadius.SetFromNumber(radius);
    this.InitialRadius.SetFromNumber(radius);
    this.YOffset.SetFromNumber(yOffset);
    this.step.SetDivide(this.CurrentRadius, this.framesToFulll);
  }

  public SnapShot(): ShieldSnapShot {
    return {
      CurrentRadius: this.CurrentRadius.AsNumber,
      Active: this.Active,
    } as ShieldSnapShot;
  }

  public SetFromSnapShot(snapShot: ShieldSnapShot): void {
    this.Active = snapShot.Active;
    this.CurrentRadius.SetFromNumber(snapShot.CurrentRadius);
  }

  public Grow(): void {
    if (this.CurrentRadius.LessThan(this.InitialRadius)) {
      this.CurrentRadius.Add(this.step);
    }

    if (this.CurrentRadius.GreaterThan(this.InitialRadius)) {
      this.CurrentRadius.SetFromFp(this.InitialRadius);
    }
  }

  public ShrinkRaw(intensityRaw: number): void {
    if (this.CurrentRadius.Raw > 0) {
      this.CurrentRadius.SetFromRaw(
        this.CurrentRadius.Raw - MultiplyRaw(this.step.Raw, intensityRaw)
      );
    }

    if (this.CurrentRadius.Raw < 0) {
      this.CurrentRadius.SetFromRaw(0);
    }
  }

  public Damage(d: FixedPoint) {
    const damageMod = MultiplyRaw(d.Raw, this.damageMult.Raw);
    const curRadius = this.CurrentRadius;
    this.CurrentRadius.SetFromRaw(curRadius.Raw - damageMod);
    if (curRadius.Raw < 0) {
      this.CurrentRadius.SetFromRaw(0);
    }
  }

  public Reset() {
    this.CurrentRadius.SetFromFp(this.InitialRadius);
  }
}

export type LedgeDetectorSnapShot = {
  readonly middleX: number;
  readonly middleY: number;
  readonly numberOfLedgeGrabs: number;
};

export class LedgeDetectorComponent
  implements IHistoryEnabled<LedgeDetectorSnapShot>
{
  private maxGrabs: number = 15;
  private numberOfLedgeGrabs: number = 0;
  private readonly yOffset: FixedPoint = new FixedPoint(0);
  private readonly x: FixedPoint = new FixedPoint(0);
  private readonly y: FixedPoint = new FixedPoint(0);
  private readonly width: FixedPoint = new FixedPoint(0);
  private readonly height: FixedPoint = new FixedPoint(0);
  private readonly rightSide: Array<FlatVec> = new Array<FlatVec>(4);
  private readonly leftSide: Array<FlatVec> = new Array<FlatVec>(4);

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    yOffset = -130
  ) {
    this.height.SetFromNumber(height);
    this.width.SetFromNumber(width);
    this.yOffset.SetFromNumber(yOffset);
    FillArrayWithFlatVec(this.rightSide);
    FillArrayWithFlatVec(this.leftSide);
    this.MoveToRaw(NumberToRaw(x), NumberToRaw(y));
  }

  public MoveTo(x: FixedPoint, y: FixedPoint): void {
    this.x.SetFromFp(x);
    this.y.SetAdd(y, this.yOffset);
    this.update();
  }

  public MoveToRaw(xRaw: number, yRaw: number): void {
    this.x.SetFromRaw(xRaw);
    this.y.SetFromRaw(this.yOffset.Raw + yRaw);
    this.update();
  }

  public get LeftSide(): Array<FlatVec> {
    return this.leftSide;
  }

  public get RightSide(): Array<FlatVec> {
    return this.rightSide;
  }

  public get Width(): FixedPoint {
    return this.width;
  }

  public get Height(): FixedPoint {
    return this.height;
  }

  private update(): void {
    const rightBottomLeft = this.rightSide[0];
    const rightTopLeft = this.rightSide[1];
    const rightTopRight = this.rightSide[2];
    const rightBottomRight = this.rightSide[3];

    const leftBottomLeft = this.leftSide[0];
    const leftTopLeft = this.leftSide[1];
    const leftTopRight = this.leftSide[2];
    const leftBottomRight = this.leftSide[3];

    const widthRaw = this.width.Raw;
    const heightRaw = this.height.Raw;
    const xRaw = this.x.Raw;
    const yRaw = this.y.Raw;

    const widthRightRaw = xRaw + widthRaw;
    const widthLeftRaw = xRaw - widthRaw;
    const bottomHeightRaw = yRaw + heightRaw;

    //bottom left
    rightBottomLeft.X.SetFromRaw(xRaw);
    rightBottomLeft.Y.SetFromRaw(bottomHeightRaw);
    //top left
    rightTopLeft.X.SetFromRaw(xRaw);
    rightTopLeft.Y.SetFromRaw(yRaw);
    // top right
    rightTopRight.X.SetFromRaw(widthRightRaw);
    rightTopRight.Y.SetFromRaw(yRaw);
    // bottom right
    rightBottomRight.X.SetFromRaw(widthRightRaw);
    rightBottomRight.Y.SetFromRaw(bottomHeightRaw);

    //bottom left
    leftBottomLeft.X.SetFromRaw(widthLeftRaw);
    leftBottomLeft.Y.SetFromRaw(bottomHeightRaw);
    // top left
    leftTopLeft.X.SetFromRaw(widthLeftRaw);
    leftTopLeft.Y.SetFromRaw(yRaw);
    // top right
    leftTopRight.X.SetFromRaw(xRaw);
    leftTopRight.Y.SetFromRaw(yRaw);
    // bottom right
    leftBottomRight.X.SetFromRaw(xRaw);
    leftBottomRight.Y.SetFromRaw(bottomHeightRaw);
  }

  public SnapShot(): LedgeDetectorSnapShot {
    return {
      middleX: this.x.AsNumber,
      middleY: this.y.AsNumber,
      numberOfLedgeGrabs: this.numberOfLedgeGrabs,
    } as LedgeDetectorSnapShot;
  }

  public get CanGrabLedge(): boolean {
    return this.numberOfLedgeGrabs < this.maxGrabs;
  }

  public IncrementLedgeGrabs(): void {
    this.numberOfLedgeGrabs++;
  }

  public ZeroLedgeGrabCount(): void {
    this.numberOfLedgeGrabs = 0;
  }

  public SetFromSnapShot(snapShot: LedgeDetectorSnapShot): void {
    const middleXRaw = NumberToRaw(snapShot.middleX);
    const middleYRaw = NumberToRaw(snapShot.middleY);
    this.MoveToRaw(middleXRaw, middleYRaw);
    this.numberOfLedgeGrabs = snapShot.numberOfLedgeGrabs;
  }
}

export class JumpComponent implements IHistoryEnabled<number> {
  private readonly numberOfJumps: number = 2;
  private jumpCount: number = 0;
  public readonly JumpVelocity: FixedPoint = new FixedPoint(0);

  constructor(jumpVelocity: number, numberOfJumps: number = 2) {
    this.JumpVelocity.SetFromNumber(jumpVelocity);
    this.numberOfJumps = numberOfJumps;
  }

  public HasJumps(): boolean {
    return this.jumpCount < this.numberOfJumps;
  }

  public OnFirstJump(): boolean {
    return this.jumpCount === 1;
  }

  public JumpCountIsZero(): boolean {
    return this.jumpCount === 0;
  }

  public IncrementJumps(): void {
    this.jumpCount++;
  }

  public ResetJumps(): void {
    this.jumpCount = 0;
  }

  public SnapShot(): number {
    return this.jumpCount;
  }

  public Set(jumps: number) {
    this.jumpCount = jumps;
  }

  public SetFromSnapShot(snapShot: number): void {
    this.jumpCount = snapShot;
  }

  public get JumpCount(): number {
    return this.jumpCount;
  }
}

type bubbleId = number;
export type frameNumber = number;

export class HitBubble {
  public readonly BubbleId: bubbleId;
  public readonly Damage: FixedPoint = new FixedPoint(0);
  public readonly Priority: number;
  public readonly Radius: FixedPoint = new FixedPoint(0);
  public readonly launchAngle: FixedPoint = new FixedPoint(0);
  public readonly activeStartFrame: frameNumber;
  public readonly activeEndFrame: frameNumber;
  public readonly frameOffsets: Map<frameNumber, FlatVec>;

  constructor(hbc: HitBubblesConifg) {
    this.BubbleId = hbc.BubbleId;
    this.Damage.SetFromNumber(hbc.Damage);
    this.Priority = hbc.Priority;
    this.Radius.SetFromNumber(hbc.Radius);
    this.launchAngle.SetFromNumber(hbc.LaunchAngle);
    const activeframes = Array.from(hbc.frameOffsets.keys()).sort(
      (a, b) => a - b
    );
    this.activeStartFrame = activeframes[0];
    this.activeEndFrame = activeframes[activeframes.length - 1];
    this.frameOffsets = new Map<frameNumber, FlatVec>();
    for (const [k, v] of hbc.frameOffsets) {
      this.frameOffsets.set(k, ToFV(v.x, v.y));
    }
  }

  public IsActive(attackFrameNumber: frameNumber): boolean {
    return (
      attackFrameNumber >= this.activeStartFrame &&
      attackFrameNumber <= this.activeEndFrame
    );
  }

  public GetLocalPosiitionOffsetForFrame(
    frameNumber: frameNumber
  ): FlatVec | undefined {
    return this.frameOffsets.get(frameNumber);
  }

  public GetGlobalPosition(
    vecPool: Pool<PooledVector>,
    playerX: FixedPoint,
    playerY: FixedPoint,
    facinRight: boolean,
    attackFrameNumber: frameNumber
  ): PooledVector | undefined {
    const offset = this.frameOffsets.get(attackFrameNumber);

    if (offset === undefined) {
      return undefined;
    }

    const xRaw = playerX.Raw;
    const yRaw = playerY.Raw;

    const globalXRaw = facinRight ? xRaw + offset.X.Raw : xRaw - offset.X.Raw;
    const globalYRaw = yRaw + offset.Y.Raw;

    return vecPool.Rent().SetXYRaw(globalXRaw, globalYRaw);
  }
}

export class Attack {
  public readonly Name: string;
  public readonly TotalFrameLength: number;
  public readonly InteruptableFrame: number;
  public readonly GravityActive: boolean;
  public readonly BaseKnockBack = new FixedPoint(0);
  public readonly KnockBackScaling = new FixedPoint(0);
  public readonly ImpulseClamp: FixedPoint | undefined;
  public readonly PlayerIdsHit = new Set<number>();
  public readonly Impulses: Map<frameNumber, FlatVec> = new Map();
  public readonly CanOnlyFallOffLedgeIfFacingAwayFromIt: boolean = false;
  public readonly HitBubbles: Array<HitBubble>;
  public readonly onEnterCommands: Array<Command> = [];
  public readonly onUpdateCommands: Map<number, Command> = new Map();
  public readonly onExitCommands: Array<Command> = [];

  constructor(conf: AttackConfig) {
    this.Name = conf.Name;
    this.TotalFrameLength = conf.TotalFrameLength;
    this.InteruptableFrame = conf.InteruptableFrame;
    this.GravityActive = conf.GravityActive;
    this.CanOnlyFallOffLedgeIfFacingAwayFromIt =
      conf.CanOnlyFallOffLedgeIfFacingAwayFromIt;
    this.BaseKnockBack.SetFromNumber(conf.BaseKnockBack);
    this.KnockBackScaling.SetFromNumber(conf.KnockBackScaling);

    if (conf.ImpulseClamp != undefined) {
      this.ImpulseClamp = new FixedPoint().SetFromNumber(conf.ImpulseClamp);
    }

    const hbs = conf.HitBubbles.map((hbc) => new HitBubble(hbc));
    this.HitBubbles = hbs.sort((a, b) => a.Priority - b.Priority);

    if (conf.Impulses !== undefined) {
      this.Impulses = new Map<frameNumber, FlatVec>();
      for (const [k, v] of conf.Impulses) {
        this.Impulses.set(k, ToFV(v.x, v.y));
      }
    }

    if (conf.onEnterCommands !== undefined) {
      this.onEnterCommands = conf.onEnterCommands;
    }
    if (conf.onUpdateCommands !== undefined) {
      this.onUpdateCommands = conf.onUpdateCommands;
    }
    if (conf.onExitCommands !== undefined) {
      this.onExitCommands = conf.onExitCommands;
    }
  }

  public GetActiveImpulseForFrame(frameNumber: number): FlatVec | undefined {
    return this.Impulses.get(frameNumber);
  }

  public GetActiveHitBubblesForFrame(
    frameNumber: frameNumber,
    activeHBs: ActiveHitBubblesDTO
  ): ActiveHitBubblesDTO {
    const hitBubbleslength = this.HitBubbles.length;

    if (hitBubbleslength === 0) {
      return activeHBs;
    }

    for (let i = 0; i < hitBubbleslength; i++) {
      const hb = this.HitBubbles[i];
      if (hb.IsActive(frameNumber)) {
        activeHBs.AddBubble(hb);
      }
    }
    return activeHBs;
  }

  public HitPlayer(playerID: number): void {
    this.PlayerIdsHit.add(playerID);
  }

  public HasHitPlayer(playerID: number): boolean {
    return this.PlayerIdsHit.has(playerID);
  }

  public ResetPlayerIdsHit(): void {
    this.PlayerIdsHit.clear();
  }
}

export type AttackSnapShot = Attack | undefined;

export class AttackComponment implements IHistoryEnabled<AttackSnapShot> {
  private attacks: Map<AttackId, Attack>;
  private currentAttack: Attack | undefined = undefined;

  public constructor(attacksConfigs: Map<AttackId, AttackConfig>) {
    const attacks = new Map<AttackId, Attack>();
    attacksConfigs.forEach((ac) => {
      const atk = new Attack(ac);
      attacks.set(ac.AttackId, atk);
    });
    this.attacks = attacks;
  }

  public GetAttack(): Attack | undefined {
    return this.currentAttack;
  }

  public SetCurrentAttack(gameEventId: GameEventId): void {
    const attackId = AttackGameEventMappings.get(gameEventId);
    if (attackId === undefined) {
      return;
    }
    const attack = this.attacks.get(attackId);

    if (attack === undefined) {
      return;
    }

    this.currentAttack = attack;
  }

  public ZeroCurrentAttack(): void {
    if (this.currentAttack === undefined) {
      return;
    }
    this.currentAttack.ResetPlayerIdsHit();
    this.currentAttack = undefined;
  }

  public SnapShot(): Attack | undefined {
    return this.currentAttack;
  }

  public SetFromSnapShot(snapShot: Attack | undefined): void {
    this.currentAttack = snapShot;
  }

  public get _attacks(): Map<AttackId, Attack> {
    return this.attacks;
  }
}

class Sensor {
  private readonly xOffset: FixedPoint = new FixedPoint();
  private readonly yOffset: FixedPoint = new FixedPoint();
  private readonly radius: FixedPoint = new FixedPoint();
  private active: boolean = false;

  public GetGlobalPosition(
    vecPool: Pool<PooledVector>,
    globalX: FixedPoint,
    globalY: FixedPoint,
    facingRight: boolean
  ): PooledVector {
    const xOffsetRaw = this.XOffset.Raw;
    const yOffsetRaw = this.YOffset.Raw;
    const globalXRaw = globalX.Raw;
    const globalYRaw = globalY.Raw;

    const xRaw = facingRight
      ? globalXRaw + xOffsetRaw
      : MultiplyRaw(globalXRaw, xOffsetRaw);
    const yRaw = globalYRaw + yOffsetRaw;
    return vecPool.Rent().SetXYRaw(xRaw, yRaw);
  }

  public get Radius(): FixedPoint {
    return this.radius;
  }

  public get XOffset(): FixedPoint {
    return this.xOffset;
  }

  public get YOffset(): FixedPoint {
    return this.yOffset;
  }

  public get IsActive(): boolean {
    return this.active;
  }

  public Activate(): void {
    this.active = true;
  }

  public Deactivate(): void {
    this.xOffset.Zero();
    this.yOffset.Zero();
    this.radius.Zero();
    this.active = false;
  }
}

export type SensorSnapShot = {
  sensors:
    | Array<{
        xOffset: number;
        yOffset: number;
        radius: number;
      }>
    | undefined;
  reactor: Command | undefined;
};

export class SensorComponent implements IHistoryEnabled<SensorSnapShot> {
  private currentSensorIdx: number = 0;
  private readonly sensors: Array<Sensor> = new Array<Sensor>(10);
  public ReactCommand: Command | undefined;

  constructor() {
    for (let i = 0; i < this.sensors.length; i++) {
      this.sensors[i] = new Sensor();
    }
  }

  public ActivateSensor(
    xOffset: FixedPoint,
    yOffset: FixedPoint,
    radius: FixedPoint
  ): SensorComponent {
    if (this.currentSensorIdx >= this.sensors.length) {
      throw new Error('No more sensors available to activate.');
    }
    this.ActivateSensorRaw(yOffset.Raw, xOffset.Raw, radius.Raw);
    return this;
  }

  public ActivateSensorRaw(
    xOffsetRaw: number,
    yOffsetRaw: number,
    radiusRaw: number
  ): void {
    const sensor = this.sensors[this.currentSensorIdx];
    sensor.XOffset.SetFromRaw(xOffsetRaw);
    sensor.YOffset.SetFromRaw(yOffsetRaw);
    sensor.Radius.SetFromRaw(radiusRaw);
    sensor.Activate();
    this.currentSensorIdx++;
  }

  public DeactivateSensors(): void {
    const length = this.sensors.length;
    for (let i = 0; i < length; i++) {
      const sensor = this.sensors[i];
      if (sensor.IsActive) {
        sensor.Deactivate();
      }
    }
    this.currentSensorIdx = 0;
    this.ReactCommand = undefined;
  }

  public get Sensors(): Array<Sensor> {
    return this.sensors;
  }

  public get NumberActive(): number {
    return this.currentSensorIdx;
  }

  public SnapShot(): SensorSnapShot {
    const snapShot: SensorSnapShot = {
      sensors: undefined,
      reactor: undefined,
    };

    const length = this.sensors.length;
    if (length > 0) {
      snapShot.sensors = [];
    }
    for (let i = 0; i < length; i++) {
      const sensor = this.sensors[i];
      if (sensor.IsActive) {
        snapShot.sensors!.push({
          yOffset: sensor.YOffset.AsNumber,
          xOffset: sensor.XOffset.AsNumber,
          radius: sensor.Radius.AsNumber,
        });
      }
    }

    if (this.ReactCommand !== undefined) {
      snapShot.reactor = this.ReactCommand;
    }
    return snapShot;
  }

  public SetFromSnapShot(snapShot: SensorSnapShot): void {
    this.DeactivateSensors();
    const snapShotSensorLength = snapShot.sensors?.length ?? 0;
    for (let i = 0; i < snapShotSensorLength; i++) {
      const snapShotSensor = snapShot.sensors![i];
      this.ActivateSensorRaw(
        NumberToRaw(snapShotSensor.yOffset),
        NumberToRaw(snapShotSensor.xOffset),
        NumberToRaw(snapShotSensor.radius)
      );
    }
    if (snapShot.reactor !== undefined) {
      this.ReactCommand = snapShot.reactor;
    } else {
      this.ReactCommand = undefined;
    }
    this.currentSensorIdx = snapShot.sensors?.length ?? 0;
  }
}

// builder ================================================

export class SpeedsComponentConfigBuilder {
  private readonly groundedVelocityDecay: FixedPoint = new FixedPoint();
  private readonly aerialVelocityDecay: FixedPoint = new FixedPoint();
  private readonly aerialSpeedInpulseLimit: FixedPoint = new FixedPoint();
  private readonly aerialSpeedMultiplier: FixedPoint = new FixedPoint();
  private readonly airDodgeSpeed: FixedPoint = new FixedPoint();
  private readonly dodgeRollSpeed: FixedPoint = new FixedPoint();
  private readonly maxWalkSpeed: FixedPoint = new FixedPoint();
  private readonly maxRunSpeed: FixedPoint = new FixedPoint();
  private readonly dashMutiplier: FixedPoint = new FixedPoint();
  private readonly maxDashSpeed: FixedPoint = new FixedPoint();
  private readonly walkSpeedMulitplier: FixedPoint = new FixedPoint();
  private readonly runSpeedMultiplier: FixedPoint = new FixedPoint();
  private readonly fastFallSpeed: FixedPoint = new FixedPoint();
  private readonly fallSpeed: FixedPoint = new FixedPoint();
  private readonly gravity: FixedPoint = new FixedPoint();

  SetAerialSpeeds(
    aerialVelocityDecay: number,
    aerialSpeedImpulseLimit: number,
    aerialSpeedMultiplier: number
  ) {
    this.aerialVelocityDecay.SetFromNumber(aerialVelocityDecay);
    this.aerialSpeedInpulseLimit.SetFromNumber(aerialSpeedImpulseLimit);
    this.aerialSpeedMultiplier.SetFromNumber(aerialSpeedMultiplier);
  }

  SetDodgeSpeeds(airDodgeSpeed: number, dodgeRollSpeed: number): void {
    this.airDodgeSpeed.SetFromNumber(airDodgeSpeed);
    this.dodgeRollSpeed.SetFromNumber(dodgeRollSpeed);
  }

  SetFallSpeeds(
    fastFallSpeed: number,
    fallSpeed: number,
    gravity: number = 1
  ): void {
    this.fallSpeed.SetFromNumber(fallSpeed);
    this.fastFallSpeed.SetFromNumber(fastFallSpeed);
    this.gravity.SetFromNumber(gravity);
  }

  SetWalkSpeeds(maxWalkSpeed: number, walkSpeedMultiplier: number): void {
    this.maxWalkSpeed.SetFromNumber(maxWalkSpeed);
    this.walkSpeedMulitplier.SetFromNumber(walkSpeedMultiplier);
  }

  SetRunSpeeds(maxRunSpeed: number, runSpeedMultiplier: number): void {
    this.runSpeedMultiplier.SetFromNumber(runSpeedMultiplier);
    this.maxRunSpeed.SetFromNumber(maxRunSpeed);
  }

  SetDashSpeeds(dashMultiplier: number, maxDashSpeed: number): void {
    this.dashMutiplier.SetFromNumber(dashMultiplier);
    this.maxDashSpeed.SetFromNumber(maxDashSpeed);
  }

  SetGroundedVelocityDecay(groundedVelocityDecay: number): void {
    this.groundedVelocityDecay.SetFromNumber(groundedVelocityDecay);
  }

  Build(): SpeedsComponent {
    return new SpeedsComponent(
      this.groundedVelocityDecay,
      this.aerialVelocityDecay,
      this.aerialSpeedInpulseLimit,
      this.aerialSpeedMultiplier,
      this.airDodgeSpeed,
      this.dodgeRollSpeed,
      this.maxWalkSpeed,
      this.maxRunSpeed,
      this.walkSpeedMulitplier,
      this.runSpeedMultiplier,
      this.fastFallSpeed,
      this.fallSpeed,
      this.dashMutiplier,
      this.maxDashSpeed,
      this.gravity
    );
  }
}
