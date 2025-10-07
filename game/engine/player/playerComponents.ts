import {
  AttackGameEventMappings,
  AttackId,
  GameEventId,
  Idle,
  StateId,
} from '../finite-state-machine/PlayerStates';
import { FSMState } from '../finite-state-machine/PlayerStateMachine';
import { FlatVec } from '../physics/vector';
import { FillArrayWithFlatVec } from '../utils';
import { Player } from './playerOrchestrator';
import { Clamp } from '../utils';
import { Circle } from '../physics/circle';
import { PooledVector } from '../pools/PooledVector';
import { Pool } from '../pools/Pool';
import { ActiveHitBubblesDTO } from '../pools/ActiveAttackHitBubbles';
import { World } from '../world/world';
import { CreateConvexHull } from '../physics/collisions';
import { FixedPoint } from '../../math/fixedPoint';

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
    this.x.setFromNumber(snapShot.X);
    this.y.setFromNumber(snapShot.Y);
  }

  public get X(): FixedPoint {
    return this.x;
  }

  public get Y(): FixedPoint {
    return this.y;
  }

  public set X(val: FixedPoint) {
    this.x.setFromFp(val);
  }

  public set Y(val: FixedPoint) {
    this.y.setFromFp(val);
  }
}

export class WeightComponent {
  public readonly Weight: FixedPoint = new FixedPoint();

  constructor(weight: FixedPoint) {
    this.Weight.setFromFp(weight);
  }
}

export type VelocitySnapShot = { readonly X: number; readonly Y: number };

export class VelocityComponent implements IHistoryEnabled<VelocitySnapShot> {
  private readonly x: FixedPoint = new FixedPoint();
  private readonly y: FixedPoint = new FixedPoint();

  public AddClampedXImpulse(clamp: FixedPoint, impulse: FixedPoint): void {
    const clampValue = Math.abs(clamp.AsNumber);
    const currentVelocity = this.x.AsNumber;

    // Don't add impulse if we are already at or beyond the clamp limit.
    if (Math.abs(currentVelocity) >= clampValue) {
      return;
    }

    const newVelocity = currentVelocity + impulse.AsNumber;
    this.x.setFromNumber(Clamp(newVelocity, clampValue));
  }

  public AddClampedYImpulse(clamp: FixedPoint, impulse: FixedPoint): void {
    const clampValue = Math.abs(clamp.AsNumber);
    const newVelocity = this.y.AsNumber + impulse.AsNumber;
    this.y.setFromNumber(Clamp(newVelocity, clampValue));
  }

  public SnapShot(): VelocitySnapShot {
    return { X: this.x.AsNumber, Y: this.y.AsNumber } as VelocitySnapShot;
  }

  public SetFromSnapShot(snapShot: VelocitySnapShot): void {
    this.x.setFromNumber(snapShot.X);
    this.y.setFromNumber(snapShot.Y);
  }

  public get X(): FixedPoint {
    return this.x;
  }

  public get Y(): FixedPoint {
    return this.y;
  }

  public set X(val: FixedPoint) {
    this.x.setFromFp(val);
  }

  public set Y(val: FixedPoint) {
    this.y.setFromFp(val);
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
    this.xVelocity.setFromFp(vx);
    this.yVelocity.setFromFp(vy);
  }

  public DecrementHitStun(): void {
    this.framesOfHitStun--;
  }

  public Zero(): void {
    this.framesOfHitStun = 0;
    this.xVelocity.setFromNumber(0);
    this.yVelocity.setFromNumber(0);
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
    this.xVelocity.setFromNumber(snapShot.vx);
    this.yVelocity.setFromNumber(snapShot.vy);
  }
}

export class SpeedsComponent {
  public readonly GroundedVelocityDecay: FixedPoint = new FixedPoint(0);
  public readonly AerialVelocityDecay: FixedPoint = new FixedPoint(0);
  public readonly AirDogeSpeed: FixedPoint = new FixedPoint(0);
  public readonly DodeRollSpeed: FixedPoint = new FixedPoint(0);
  public readonly ArielVelocityMultiplier: FixedPoint = new FixedPoint(0);
  public readonly AerialSpeedInpulseLimit: FixedPoint = new FixedPoint(0);
  public readonly MaxWalkSpeed: FixedPoint = new FixedPoint(0);
  public readonly MaxRunSpeed: FixedPoint = new FixedPoint(0);
  public readonly WalkSpeedMulitplier: FixedPoint = new FixedPoint(0);
  public readonly RunSpeedMultiplier: FixedPoint = new FixedPoint(0);
  public readonly FastFallSpeed: FixedPoint = new FixedPoint(0);
  public readonly FallSpeed: FixedPoint = new FixedPoint(0);
  public readonly Gravity: FixedPoint = new FixedPoint(0);
  public readonly DashMultiplier: FixedPoint = new FixedPoint(0);
  public readonly MaxDashSpeed: FixedPoint = new FixedPoint(0);
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
    this.GroundedVelocityDecay.setFromFp(grndSpeedVelDecay);
    this.AerialVelocityDecay.setFromFp(aerialVelocityDecay);
    this.AerialSpeedInpulseLimit.setFromFp(aerialSpeedInpulseLimit);
    this.ArielVelocityMultiplier.setFromFp(aerialVelocityMultiplier);
    this.AirDogeSpeed.setFromFp(airDodgeSpeed);
    this.DodeRollSpeed.setFromFp(dodgeRollSpeed);
    this.MaxWalkSpeed.setFromFp(maxWalkSpeed);
    this.MaxRunSpeed.setFromFp(maxRunSpeed);
    this.WalkSpeedMulitplier.setFromFp(walkSpeedMultiplier);
    this.RunSpeedMultiplier.setFromFp(runSpeedMultiplier);
    this.FastFallSpeed.setFromFp(fastFallSpeed);
    this.FallSpeed.setFromFp(fallSpeed);
    this.DashMultiplier.setFromFp(dashMultiplier);
    this.MaxDashSpeed.setFromFp(maxDashSpeed);
    this.Gravity.setFromFp(gravity);
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
    this.damagePoints.add(number);
  }

  public SubtractDamage(number: FixedPoint): void {
    this.damagePoints.subtract(number);
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

  public SnapShot(): PlayerPointsSnapShot {
    return {
      damagePoints: this.damagePoints.AsNumber,
      matchPoints: this.matchPoints,
    } as PlayerPointsSnapShot;
  }

  public SetFromSnapShot(snapShot: PlayerPointsSnapShot): void {
    this.damagePoints.setFromNumber(snapShot.damagePoints);
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
  private readonly fpp: Pool<FixedPoint>;

  constructor(
    fpp: Pool<FixedPoint>,
    shapes: ECBShapes,
    height: FixedPoint = new FixedPoint(100),
    width: FixedPoint = new FixedPoint(100),
    yOffset: FixedPoint = new FixedPoint(0)
  ) {
    // The constructor was missing the fpp pool parameter, which is needed for the initial update.
    this.height.setFromFp(height);
    this.width.setFromFp(width);
    this.originalHeight.setFromFp(height);
    this.originalWidth.setFromFp(width);
    this.originalYOffset.setFromFp(yOffset);
    this.yOffset.setFromFp(yOffset);
    this.ecbStateShapes = shapes;
    FillArrayWithFlatVec(this.curVerts);
    FillArrayWithFlatVec(this.prevVerts);
    this.fpp = fpp;
    this.loadAllVerts();
    this.update();
  }

  public GetHull(): FlatVec[] {
    return CreateConvexHull(this.allVerts, this.fpp);
  }

  public GetActiveVerts(): FlatVec[] {
    return this.curVerts;
  }

  public UpdatePreviousECB(): void {
    this.prevX.setFromFp(this.x);
    this.prevY.setFromFp(this.y);

    const prevVert: FlatVec[] = this.prevVerts;
    const curVert: FlatVec[] = this.curVerts;
    prevVert[0].X.setFromFp(curVert[0].X);
    prevVert[0].Y.setFromFp(curVert[0].Y);
    prevVert[1].X.setFromFp(curVert[1].X);
    prevVert[1].Y.setFromFp(curVert[1].Y);
    prevVert[2].X.setFromFp(curVert[2].X);
    prevVert[2].Y.setFromFp(curVert[2].Y);
    prevVert[3].X.setFromFp(curVert[3].X);
    prevVert[3].Y.setFromFp(curVert[3].Y);
  }

  public SetInitialPosition(x: FixedPoint, y: FixedPoint): void {
    this.MoveToPosition(x, y);
    this.UpdatePreviousECB();
  }

  public MoveToPosition(x: FixedPoint, y: FixedPoint): void {
    this.x.setFromFp(x);
    this.y.setFromFp(y);
    this.update();
  }

  public SetECBShape(stateId: StateId): void {
    const shape: ECBShape | undefined = this.ecbStateShapes.get(stateId);
    if (shape === undefined) {
      this.yOffset.setFromFp(this.originalYOffset);
      this.height.setFromFp(this.originalHeight);
      this.width.setFromFp(this.originalWidth);
      this.update();
      return;
    }

    this.yOffset.setFromFp(shape.yOffset);
    this.height.setFromFp(shape.height);
    this.width.setFromFp(shape.width);
    this.update();
  }

  private update(): void {
    // Rent temporary FixedPoint objects from the pool for calculations
    const fpp = this.fpp;
    const half = fpp.Rent().setFromNumber(0.5);
    const px = this.x;
    const py = this.y;
    const height = this.height;
    const width = this.width;
    const yOffset = this.yOffset;

    const bottomX = fpp.Rent().setFromFp(px);
    const bottomY = fpp.Rent().setAdd(py, yOffset);

    const topX = fpp.Rent().setFromFp(px);
    const topY = fpp.Rent().setSubtract(bottomY, height);

    const halfWidth = fpp.Rent().setMultiply(width, half);
    const halfHeight = fpp.Rent().setMultiply(height, half);

    const leftX = fpp.Rent().setSubtract(bottomX, halfWidth);
    const leftY = fpp.Rent().setSubtract(bottomY, halfHeight);

    const rightX = fpp.Rent().setAdd(bottomX, halfWidth);
    const rightY = fpp.Rent().setFromFp(leftY);

    this.curVerts[0].X.setFromFp(bottomX);
    this.curVerts[0].Y.setFromFp(bottomY);

    this.curVerts[1].X.setFromFp(leftX);
    this.curVerts[1].Y.setFromFp(leftY);

    this.curVerts[2].X.setFromFp(topX);
    this.curVerts[2].Y.setFromFp(topY);

    this.curVerts[3].X.setFromFp(rightX);
    this.curVerts[3].Y.setFromFp(rightY);
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

  public ResetECBShape(): void {
    this.height.setFromFp(this.originalHeight);
    this.width.setFromFp(this.originalWidth);
    this.yOffset.setFromFp(this.originalYOffset);
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
    const fpp = this.fpp;
    this.x.setFromNumber(snapShot.posX);
    this.y.setFromNumber(snapShot.posY);
    this.prevX.setFromNumber(snapShot.prevPosX);
    this.prevY.setFromNumber(snapShot.prevPosY);
    this.yOffset.setFromNumber(snapShot.YOffset);
    this.height.setFromNumber(snapShot.Height);
    this.width.setFromNumber(snapShot.Width);

    this.update();

    // Update prevVerts
    const half = fpp.Rent().setFromNumber(0.5);
    const px = this.prevX;
    const py = this.prevY;
    const height = this.height;
    const width = this.width;
    const yOffset = this.yOffset;

    const bottomX = fpp.Rent().setFromFp(px);
    const bottomY = fpp.Rent().setAdd(py, yOffset);

    const topX = fpp.Rent().setFromFp(px);
    const topY = fpp.Rent().setSubtract(bottomY, height);

    const halfWidth = fpp.Rent().setFromFp(width).multiply(half);
    const halfHeight = fpp.Rent().setFromFp(height).multiply(half);

    const leftX = fpp.Rent().setFromFp(bottomX).subtract(halfWidth);
    const leftY = fpp.Rent().setFromFp(bottomY).subtract(halfHeight);

    const rightX = fpp.Rent().setFromFp(bottomX).add(halfWidth);
    const rightY = leftY;

    this.prevVerts[0].X.setFromFp(bottomX);
    this.prevVerts[0].Y.setFromFp(bottomY);

    this.prevVerts[1].X.setFromFp(leftX);
    this.prevVerts[1].Y.setFromFp(leftY);

    this.prevVerts[2].X.setFromFp(topX);
    this.prevVerts[2].Y.setFromFp(topY);

    this.prevVerts[3].X.setFromFp(rightX);
    this.prevVerts[3].Y.setFromFp(rightY);
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
    startOffsetX: FixedPoint,
    startOffsetY: FixedPoint,
    endOffsetX: FixedPoint,
    endOffsetY: FixedPoint,
    radius: FixedPoint
  ) {
    this.StartOffsetX.setFromFp(startOffsetX);
    this.StartOffsetY.setFromFp(startOffsetY);
    this.EndOffsetX.setFromFp(endOffsetX);
    this.EndOffsetY.setFromFp(endOffsetY);
    this.Radius.setFromFp(radius);
  }

  public GetStartPosition(
    fpp: Pool<FixedPoint>,
    x: FixedPoint,
    y: FixedPoint,
    vecPool: Pool<PooledVector>
  ): PooledVector {
    return vecPool
      .Rent()
      .SetXY(
        fpp.Rent().setAdd(this.StartOffsetX, x),
        fpp.Rent().setAdd(this.StartOffsetY, y)
      );
  }

  public GetEndPosition(
    fpp: Pool<FixedPoint>,
    x: FixedPoint,
    y: FixedPoint,
    vecPool: Pool<PooledVector>
  ): PooledVector {
    return vecPool
      .Rent()
      .SetXY(
        fpp.Rent().setAdd(this.EndOffsetX, x),
        fpp.Rent().setAdd(this.EndOffsetY, y)
      );
  }
}

export class HurtCapsulesComponent {
  public readonly HurtCapsules: Array<HurtCapsule>;

  constructor(hurtCapsules: Array<HurtCapsule>) {
    this.HurtCapsules = hurtCapsules;
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
  private readonly curRadius = new FixedPoint(0);
  private readonly step = new FixedPoint(0);
  private readonly framesToFulll = new FixedPoint(300);
  private readonly fpp: Pool<FixedPoint>;
  private readonly damageMult = new FixedPoint(1.5);

  constructor(fpp: Pool<FixedPoint>, radius: FixedPoint, yOffset: FixedPoint) {
    this.curRadius = radius;
    this.InitialRadius = radius;
    this.YOffset = yOffset;
    this.step.setDivide(radius, this.framesToFulll);
    this.fpp = fpp;
  }

  public SnapShot(): ShieldSnapShot {
    return {
      CurrentRadius: this.curRadius.AsNumber,
      Active: this.Active,
    } as ShieldSnapShot;
  }

  public SetFromSnapShot(snapShot: ShieldSnapShot): void {
    this.Active = snapShot.Active;
    this.curRadius.setFromNumber(snapShot.CurrentRadius);
  }

  public get CurrentRadius(): FixedPoint {
    return this.curRadius;
  }

  public Grow(): void {
    if (this.curRadius.lessThan(this.InitialRadius)) {
      this.curRadius.add(this.step);
    }

    if (this.curRadius.greaterThan(this.InitialRadius)) {
      this.curRadius.setFromFp(this.InitialRadius);
    }
  }

  public Shrink(intensity: FixedPoint): void {
    if (this.curRadius.graterThanZero) {
      this.curRadius.subtract(
        this.fpp.Rent().setMultiply(this.step, intensity)
      );
    }

    if (this.curRadius.lessThanZero) {
      this.curRadius.setFromNumber(0);
    }
  }

  public Damage(d: FixedPoint) {
    const damageMod = this.fpp.Rent().setMultiply(d, this.damageMult);
    this.curRadius.subtract(damageMod);
    if (this.curRadius.lessThanZero) {
      this.curRadius.setFromNumber(0);
    }
  }

  public Reset() {
    this.curRadius.setFromFp(this.InitialRadius);
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
  private readonly yOffset: FixedPoint;
  private readonly x: FixedPoint = new FixedPoint(0);
  private readonly y: FixedPoint = new FixedPoint(0);
  private readonly width: FixedPoint = new FixedPoint(0);
  private readonly height: FixedPoint = new FixedPoint(0);
  private readonly rightSide: Array<FlatVec> = new Array<FlatVec>(4);
  private readonly leftSide: Array<FlatVec> = new Array<FlatVec>(4);
  private readonly fpp: Pool<FixedPoint>;

  constructor(
    fpp: Pool<FixedPoint>,
    x: FixedPoint,
    y: FixedPoint,
    width: FixedPoint,
    height: FixedPoint,
    yOffset = new FixedPoint(-130)
  ) {
    this.fpp = fpp;
    this.height = height;
    this.width = width;
    this.yOffset = yOffset;
    FillArrayWithFlatVec(this.rightSide);
    FillArrayWithFlatVec(this.leftSide);
    this.MoveTo(x, y);
  }

  public MoveTo(x: FixedPoint, y: FixedPoint): void {
    this.x.setFromFp(x);
    this.y.setAdd(y, this.yOffset);
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

    const widthRight = this.fpp.Rent().setAdd(this.x, this.width);
    const widthLeft = this.fpp.Rent().setSubtract(this.x, this.width);
    const bottomHeight = this.fpp.Rent().setAdd(this.y, this.height);

    //bottom left
    rightBottomLeft.X.setFromFp(this.x);
    rightBottomLeft.Y.setFromFp(bottomHeight);
    //top left
    rightTopLeft.X.setFromFp(this.x);
    rightTopLeft.Y.setFromFp(this.y);
    // top right
    rightTopRight.X.setFromFp(widthRight);
    rightTopRight.Y.setFromFp(this.y);
    // bottom right
    rightBottomRight.X.setFromFp(widthRight);
    rightBottomRight.Y.setFromFp(bottomHeight);

    //bottom left
    leftBottomLeft.X.setFromFp(widthLeft);
    leftBottomLeft.Y.setFromFp(bottomHeight);
    // top left
    leftTopLeft.X.setFromFp(widthLeft);
    leftTopLeft.Y.setFromFp(this.y);
    // top right
    leftTopRight.X.setFromFp(this.x);
    leftTopRight.Y.setFromFp(this.y);
    // bottom right
    leftBottomRight.X.setFromFp(this.x);
    leftBottomRight.Y.setFromFp(bottomHeight);
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
    this.MoveTo(
      this.fpp.Rent().setFromNumber(snapShot.middleX),
      this.fpp.Rent().setFromNumber(snapShot.middleY)
    );
    this.numberOfLedgeGrabs = snapShot.numberOfLedgeGrabs;
  }
}

export class JumpComponent implements IHistoryEnabled<number> {
  private readonly numberOfJumps: number = 2;
  private jumpCount: number = 0;
  public readonly JumpVelocity: FixedPoint = new FixedPoint(0);

  constructor(jumpVelocity: FixedPoint, numberOfJumps: number = 2) {
    this.JumpVelocity.setFromFp(jumpVelocity);
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

  public SetFromSnapShot(snapShot: number): void {
    this.jumpCount = snapShot;
  }
}

type bubbleId = number;
type frameNumber = number;

export class HitBubble {
  public readonly BubbleId: bubbleId;
  public readonly Damage: FixedPoint = new FixedPoint(0);
  public readonly Priority: number;
  public readonly Radius: FixedPoint = new FixedPoint(0);
  public readonly launchAngle: FixedPoint = new FixedPoint(0);
  public readonly activeStartFrame: frameNumber;
  public readonly activeEndFrame: frameNumber;
  public readonly frameOffsets: Map<frameNumber, FlatVec>;

  constructor(
    id: bubbleId,
    damage: FixedPoint,
    priority: number,
    radius: FixedPoint,
    launchAngle: FixedPoint,
    frameOffsets: Map<frameNumber, FlatVec>
  ) {
    this.BubbleId = id;
    this.Damage.setFromFp(damage);
    this.Priority = priority;
    this.Radius.setFromFp(radius);
    this.launchAngle.setFromFp(launchAngle);
    const activeframes = Array.from(frameOffsets.keys()).sort((a, b) => a - b);
    this.activeStartFrame = activeframes[0];
    this.activeEndFrame = activeframes[activeframes.length - 1];
    this.frameOffsets = frameOffsets;
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
    fpp: Pool<FixedPoint>,
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

    const globalX = facinRight
      ? fpp.Rent().setAdd(playerX, offset.X)
      : fpp.Rent().setSubtract(playerX, offset.X);
    const globalY = fpp.Rent().setAdd(playerY, offset.Y);

    return vecPool.Rent().SetXY(globalX, globalY);
  }
}

export type AttackOnUpdate = (w: World, p: Player, frameNumber: number) => void;
export type AttackOnEnter = (w: World, p: Player) => void;
export type AttackOnExit = (w: World, p: Player) => void;

export class Attack {
  public readonly Name: string;
  public readonly TotalFrameLength: number;
  public readonly InteruptableFrame: number;
  public readonly GravityActive: boolean;
  public readonly BaseKnockBack: FixedPoint = new FixedPoint(0);
  public readonly KnockBackScaling: FixedPoint = new FixedPoint(0);
  public readonly ImpulseClamp: FixedPoint | undefined;
  public readonly PlayerIdsHit: Set<number> = new Set<number>();
  public readonly Impulses: Map<frameNumber, FlatVec> = new Map<
    frameNumber,
    FlatVec
  >();
  public readonly CanOnlyFallOffLedgeIfFacingAwayFromIt: boolean = false;
  public readonly HitBubbles: Array<HitBubble>;
  private onEnter: AttackOnEnter = (w, p) => {};
  private onUpdate: AttackOnUpdate = (w, p, fN) => {};
  private onExit: AttackOnExit = (w, p) => {};

  constructor(
    name: string,
    totalFrameLength: number,
    interuptableFrame: number,
    baseKb: FixedPoint,
    kbScaling: FixedPoint,
    impulseClamp: FixedPoint | undefined,
    hitBubbles: Array<HitBubble>,
    canOnlyFallOffLedgeWhenFacingAwayFromIt: boolean = false,
    gravityActive: boolean = true,
    impulses: Map<frameNumber, FlatVec> | undefined = undefined,
    onEnter: AttackOnEnter | undefined,
    onUpdate: AttackOnUpdate | undefined,
    onExit: AttackOnExit | undefined
  ) {
    this.Name = name;
    this.TotalFrameLength = totalFrameLength;
    this.InteruptableFrame = interuptableFrame;
    this.GravityActive = gravityActive;
    this.CanOnlyFallOffLedgeIfFacingAwayFromIt =
      canOnlyFallOffLedgeWhenFacingAwayFromIt;
    this.BaseKnockBack.setFromFp(baseKb);
    this.KnockBackScaling.setFromFp(kbScaling);

    if (impulseClamp != undefined) {
      this.ImpulseClamp = new FixedPoint().setFromFp(impulseClamp);
    }

    this.HitBubbles = hitBubbles.sort((a, b) => a.Priority - b.Priority);

    if (impulses !== undefined) {
      this.Impulses = impulses;
    }

    if (onEnter !== undefined) {
      this.onEnter = onEnter;
    }

    if (onUpdate !== undefined) {
      this.onUpdate = onUpdate;
    }

    if (onExit !== undefined) {
      this.onExit = onExit;
    }
  }

  public get OnEnter(): AttackOnEnter {
    return this.onEnter;
  }

  public get OnUpdate(): AttackOnUpdate {
    return this.onUpdate;
  }

  public get OnExit(): AttackOnExit {
    return this.onExit;
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

export class AttackBuilder {
  private name: string = '';
  private totalFrames: number = 0;
  private interuptableFrame: number = 0;
  private hasGravtity: boolean = true;
  private readonly baseKnockBack: FixedPoint = new FixedPoint();
  private readonly knockBackScaling: FixedPoint = new FixedPoint();
  private impulseClamp: FixedPoint | undefined;
  private impulses: Map<frameNumber, FlatVec> | undefined;
  private hitBubbles: Array<HitBubble> = [];
  private canOnlyFallOffLedgeIfFacingAwayFromIt: boolean = false;
  private onEnter: AttackOnEnter | undefined;
  private onUpdate: AttackOnUpdate | undefined;
  private onExit: AttackOnExit | undefined;

  constructor(name: string) {
    this.name = name;
  }

  public WithTotalFrames(totalFrames: number): AttackBuilder {
    this.totalFrames = totalFrames;
    return this;
  }

  public WithImpulses(
    impulses: Map<frameNumber, FlatVec>,
    impulseClamp: FixedPoint | undefined
  ): AttackBuilder {
    this.impulses = impulses;
    this.impulseClamp =
      impulseClamp !== undefined
        ? new FixedPoint().setFromFp(impulseClamp)
        : undefined;
    return this;
  }

  public WithInteruptableFrame(interuptFrame: number): AttackBuilder {
    this.interuptableFrame = interuptFrame;
    return this;
  }

  public WithGravity(gravity: boolean): AttackBuilder {
    this.hasGravtity = gravity;
    return this;
  }

  public CanOnlyFallOffLedgeIfFacingIt(): AttackBuilder {
    this.canOnlyFallOffLedgeIfFacingAwayFromIt = true;
    return this;
  }

  public WithBaseKnockBack(baseKb: FixedPoint): AttackBuilder {
    this.baseKnockBack.setFromFp(baseKb);
    return this;
  }

  public WithKnockBackScaling(kbScaling: FixedPoint): AttackBuilder {
    this.knockBackScaling.setFromFp(kbScaling);
    return this;
  }

  public WithEnterAction(action: AttackOnEnter): AttackBuilder {
    this.onEnter = action;
    return this;
  }

  public WithUpdateAction(action: AttackOnUpdate): AttackBuilder {
    this.onUpdate = action;
    return this;
  }

  public WithExitAction(action: AttackOnExit): AttackBuilder {
    this.onExit = action;
    return this;
  }

  public WithHitBubble(
    damage: FixedPoint,
    radius: FixedPoint,
    priority: number,
    launchAngle: FixedPoint,
    frameOffsets: Map<frameNumber, FlatVec>
  ): AttackBuilder {
    const hitBubId = this.hitBubbles.length;
    const hitBub = new HitBubble(
      hitBubId,
      damage,
      priority,
      radius,
      launchAngle,
      frameOffsets
    );
    this.hitBubbles.push(hitBub);
    return this;
  }

  public Build(): Attack {
    return new Attack(
      this.name,
      this.totalFrames,
      this.interuptableFrame,
      this.baseKnockBack,
      this.knockBackScaling,
      this.impulseClamp,
      this.hitBubbles,
      this.canOnlyFallOffLedgeIfFacingAwayFromIt,
      this.hasGravtity,
      this.impulses,
      this.onEnter,
      this.onUpdate,
      this.onExit
    );
  }
}

export type AttackSnapShot = Attack | undefined;
export class AttackComponment implements IHistoryEnabled<AttackSnapShot> {
  private attacks: Map<AttackId, Attack>;
  private currentAttack: Attack | undefined = undefined;

  public constructor(attacks: Map<AttackId, Attack>) {
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
}

class Sensor {
  private readonly xOffset: FixedPoint = new FixedPoint();
  private readonly yOffset: FixedPoint = new FixedPoint();
  private readonly radius: FixedPoint = new FixedPoint();
  private active: boolean = false;

  public GetGlobalPosition(
    fpp: Pool<FixedPoint>,
    vecPool: Pool<PooledVector>,
    globalX: FixedPoint,
    globalY: FixedPoint,
    facingRight: boolean
  ): PooledVector {
    const x = facingRight
      ? fpp.Rent().setAdd(globalX, this.xOffset)
      : fpp.Rent().setMultiply(globalX, this.xOffset);
    const y = fpp.Rent().setAdd(globalY, this.yOffset);
    return vecPool.Rent().SetXY(x, y);
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

export type SensorReactor = (
  w: World,
  sensorOwner: Player,
  detectedPlayer: Player
) => void;

export type SensorSnapShot = {
  sensors: Array<{
    xOffset: number;
    yOffset: number;
    radius: number;
  }>;
  reactor: SensorReactor;
};

const defaultReactor: SensorReactor = (
  w: World,
  sensorOwner: Player,
  detectedPlayer: Player
) => {};

export class SensorComponent implements IHistoryEnabled<SensorSnapShot> {
  private currentSensorIdx: number = 0;
  private readonly sensors: Array<Sensor> = new Array<Sensor>(10);
  private sensorReactor: SensorReactor = defaultReactor;
  private readonly fpp: Pool<FixedPoint>;

  constructor(fpp: Pool<FixedPoint>) {
    this.fpp = fpp;
    for (let i = 0; i < this.sensors.length; i++) {
      this.sensors[i] = new Sensor();
    }
  }

  public ReactAction(
    world: World,
    pOwnerOfSensors: Player,
    playerDetectedBySensor: Player
  ): void {
    return this.sensorReactor(world, pOwnerOfSensors, playerDetectedBySensor);
  }

  public SetSensorReactor(sr: SensorReactor): void {
    this.sensorReactor = sr;
  }

  public ActivateSensor(
    yOffset: FixedPoint,
    xOffset: FixedPoint,
    radius: FixedPoint
  ): SensorComponent {
    if (this.currentSensorIdx >= this.sensors.length) {
      throw new Error('No more sensors available to activate.');
    }
    this.activateSensor(yOffset, xOffset, radius);
    return this;
  }

  private activateSensor(
    yOffset: FixedPoint,
    xOffset: FixedPoint,
    radius: FixedPoint
  ): void {
    const sensor = this.sensors[this.currentSensorIdx];
    sensor.XOffset.setFromFp(xOffset);
    sensor.YOffset.setFromFp(yOffset);
    sensor.Radius.setFromFp(radius);
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
    this.sensorReactor = defaultReactor;
    this.currentSensorIdx = 0;
  }

  public get Sensors(): Array<Sensor> {
    return this.sensors;
  }

  public get NumberActive(): number {
    return this.currentSensorIdx;
  }

  public SnapShot(): SensorSnapShot {
    const snapShot: SensorSnapShot = {
      sensors: [],
      reactor: this.sensorReactor,
    };

    const length = this.sensors.length;
    for (let i = 0; i < length; i++) {
      const sensor = this.sensors[i];
      if (sensor.IsActive) {
        snapShot.sensors.push({
          yOffset: sensor.YOffset.AsNumber,
          xOffset: sensor.XOffset.AsNumber,
          radius: sensor.Radius.AsNumber,
        });
      }
    }

    return snapShot;
  }

  public SetFromSnapShot(snapShot: SensorSnapShot): void {
    this.DeactivateSensors();
    const snapShotSensorLength = snapShot.sensors.length;
    for (let i = 0; i < snapShotSensorLength; i++) {
      const snapShotSensor = snapShot.sensors[i];
      this.activateSensor(
        this.fpp.Rent().setFromNumber(snapShotSensor.yOffset),
        this.fpp.Rent().setFromNumber(snapShotSensor.xOffset),
        this.fpp.Rent().setFromNumber(snapShotSensor.radius)
      );
    }
    this.sensorReactor = snapShot.reactor || defaultReactor;
    this.currentSensorIdx = snapShot.sensors.length;
  }
}

// builder ================================================

export class SpeedsComponentBuilder {
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
    aerialVelocityDecay: FixedPoint,
    aerialSpeedImpulseLimit: FixedPoint,
    aerialSpeedMultiplier: FixedPoint
  ) {
    this.aerialVelocityDecay.setFromFp(aerialVelocityDecay);
    this.aerialSpeedInpulseLimit.setFromFp(aerialSpeedImpulseLimit);
    this.aerialSpeedMultiplier.setFromFp(aerialSpeedMultiplier);
  }

  SetDodgeSpeeds(airDodgeSpeed: FixedPoint, dodgeRollSpeed: FixedPoint): void {
    this.airDodgeSpeed.setFromFp(airDodgeSpeed);
    this.dodgeRollSpeed.setFromFp(dodgeRollSpeed);
  }

  SetFallSpeeds(
    fastFallSpeed: FixedPoint,
    fallSpeed: FixedPoint,
    gravity: FixedPoint = new FixedPoint(1)
  ): void {
    this.fallSpeed.setFromFp(fallSpeed);
    this.fastFallSpeed.setFromFp(fastFallSpeed);
    this.gravity.setFromFp(gravity);
  }

  SetWalkSpeeds(
    maxWalkSpeed: FixedPoint,
    walkSpeedMultiplier: FixedPoint
  ): void {
    this.maxWalkSpeed.setFromFp(maxWalkSpeed);
    this.walkSpeedMulitplier.setFromFp(walkSpeedMultiplier);
  }

  SetRunSpeeds(maxRunSpeed: FixedPoint, runSpeedMultiplier: FixedPoint): void {
    this.runSpeedMultiplier.setFromFp(runSpeedMultiplier);
    this.maxRunSpeed.setFromFp(maxRunSpeed);
  }

  SetDashSpeeds(dashMultiplier: FixedPoint, maxDashSpeed: FixedPoint): void {
    this.dashMutiplier.setFromFp(dashMultiplier);
    this.maxDashSpeed.setFromFp(maxDashSpeed);
  }

  SetGroundedVelocityDecay(groundedVelocityDecay: FixedPoint): void {
    this.groundedVelocityDecay.setFromFp(groundedVelocityDecay);
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
