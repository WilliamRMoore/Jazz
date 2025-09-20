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
  readonly PositionHistory: Array<FlatVec> = [];
  readonly FsmInfoHistory: Array<FSMInfoSnapShot> = [];
  readonly PlayerPointsHistory: Array<PlayerPointsSnapShot> = [];
  readonly PlayerHitStunHistory: Array<hitStunSnapShot> = [];
  readonly PlayerHitStopHistory: Array<hitStopSnapShot> = [];
  readonly VelocityHistory: Array<FlatVec> = [];
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

// Player Components
export class PositionComponent implements IHistoryEnabled<FlatVec> {
  private x: number;
  private y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  public get X(): number {
    return this.x;
  }

  public get Y(): number {
    return this.y;
  }

  public set X(val: number) {
    this.x = val;
  }

  public set Y(val: number) {
    this.y = val;
  }

  public SnapShot(): FlatVec {
    return new FlatVec(this.x, this.y);
  }

  public SetFromSnapShot(snapShot: FlatVec): void {
    this.x = snapShot.X;
    this.y = snapShot.Y;
  }
}

export class WeightComponent {
  public readonly Weight: number;

  constructor(weight: number) {
    this.Weight = weight;
  }
}

export class VelocityComponent implements IHistoryEnabled<FlatVec> {
  private x: number;
  private y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  public AddClampedXImpulse(clamp: number, x: number): void {
    const upperBound: number = Math.abs(clamp);
    const vel: number = this.x;

    if (Math.abs(vel) > upperBound) {
      return;
    }

    this.x = Clamp(vel + x, upperBound);
  }

  public AddClampedYImpulse(clamp: number, y: number): void {
    const upperBound: number = Math.abs(clamp);
    const vel: number = this.y;

    if (Math.abs(vel) > clamp) {
      return;
    }

    this.y = Clamp(vel + y, upperBound);
  }

  public SnapShot(): FlatVec {
    return new FlatVec(this.x, this.y);
  }

  public SetFromSnapShot(snapShot: FlatVec): void {
    this.x = snapShot.X;
    this.y = snapShot.Y;
  }

  public get X(): number {
    return this.x;
  }

  public get Y(): number {
    return this.y;
  }

  public set X(val: number) {
    this.x = val;
  }

  public set Y(val: number) {
    this.y = val;
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
  hitStunFrames: number;
  vx: number;
  vy: number;
};

export class HitStunComponent implements IHistoryEnabled<hitStunSnapShot> {
  private framesOfHitStun: number = 0;
  private xVelocity: number = 0;
  private yVelocity: number = 0;

  public set FramesOfHitStun(hitStunFrames: number) {
    this.framesOfHitStun = hitStunFrames;
  }

  public get VX(): number {
    return this.xVelocity;
  }

  public get VY(): number {
    return this.yVelocity;
  }

  public SetHitStun(hitStunFrames: number, vx: number, vy: number): void {
    this.framesOfHitStun = hitStunFrames;
    this.xVelocity = vx;
    this.yVelocity = vy;
  }

  public DecrementHitStun(): void {
    this.framesOfHitStun--;
  }

  public Zero(): void {
    this.framesOfHitStun = 0;
    this.xVelocity = 0;
    this.yVelocity = 0;
  }

  public SnapShot(): hitStunSnapShot {
    return {
      hitStunFrames: this.framesOfHitStun,
      vx: this.xVelocity,
      vy: this.yVelocity,
    } as hitStunSnapShot;
  }

  public SetFromSnapShot(snapShot: hitStunSnapShot): void {
    this.framesOfHitStun = snapShot.hitStunFrames;
    this.xVelocity = snapShot.vx;
    this.yVelocity = snapShot.vy;
  }
}

export class SpeedsComponent {
  public readonly GroundedVelocityDecay: number;
  public readonly AerialVelocityDecay: number;
  public readonly AirDogeSpeed: number;
  public readonly ArielVelocityMultiplier: number;
  public readonly AerialSpeedInpulseLimit: number;
  public readonly MaxWalkSpeed: number;
  public readonly MaxRunSpeed: number;
  public readonly WalkSpeedMulitplier: number;
  public readonly RunSpeedMultiplier: number;
  public readonly FastFallSpeed: number;
  public readonly FallSpeed: number;
  public readonly Gravity: number;
  public readonly DashMultiplier: number;
  public readonly MaxDashSpeed: number;
  // Might need a general Aerial speed limit for each character

  constructor(
    grndSpeedVelDecay: number,
    aerialVelocityDecay: number,
    aerialSpeedInpulseLimit: number,
    aerialVelocityMultiplier: number,
    airDodgeSpeed: number,
    maxWalkSpeed: number,
    maxRunSpeed: number,
    walkSpeedMultiplier: number,
    runSpeedMultiplier: number,
    fastFallSpeed: number,
    fallSpeed: number,
    dashMultiplier: number,
    maxDashSpeed: number,
    gravity: number
  ) {
    this.GroundedVelocityDecay = grndSpeedVelDecay;
    this.AerialVelocityDecay = aerialVelocityDecay;
    this.AerialSpeedInpulseLimit = aerialSpeedInpulseLimit;
    this.ArielVelocityMultiplier = aerialVelocityMultiplier;
    this.AirDogeSpeed = airDodgeSpeed;
    this.MaxWalkSpeed = maxWalkSpeed;
    this.MaxRunSpeed = maxRunSpeed;
    this.WalkSpeedMulitplier = walkSpeedMultiplier;
    this.RunSpeedMultiplier = runSpeedMultiplier;
    this.FastFallSpeed = fastFallSpeed;
    this.FallSpeed = fallSpeed;
    this.DashMultiplier = dashMultiplier;
    this.MaxDashSpeed = maxDashSpeed;
    this.Gravity = gravity;
  }
}

type PlayerPointsSnapShot = {
  damagePoints: number;
  matchPoints: number;
};

export class PlayerPointsComponent
  implements IHistoryEnabled<PlayerPointsSnapShot>
{
  private damagePoints: number = 0;
  private matchPoints: number = 0;
  private defaultMatchPoints: number;

  public constructor(defaultMatchPoints: number = 4) {
    this.defaultMatchPoints = defaultMatchPoints;
  }

  public AddDamage(number: number): void {
    this.damagePoints += number;
  }

  public SubtractDamage(number: number): void {
    this.damagePoints -= number;
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
    this.damagePoints = 0;
  }

  public get Damage(): number {
    return this.damagePoints;
  }

  public SnapShot(): PlayerPointsSnapShot {
    return {
      damagePoints: this.damagePoints,
      matchPoints: this.matchPoints,
    } as PlayerPointsSnapShot;
  }

  public SetFromSnapShot(snapShot: PlayerPointsSnapShot): void {
    this.damagePoints = snapShot.damagePoints;
    this.matchPoints = snapShot.matchPoints;
  }
}

export type FlagsSnapShot = {
  FacingRight: boolean;
  FastFalling: boolean;
  HitPauseFrames: number;
  IntangabilityFrames: number;
  DisablePlatDetection: number;
};

export class PlayerFlagsComponent implements IHistoryEnabled<FlagsSnapShot> {
  private facingRight: boolean = false;
  private fastFalling: boolean = false;
  private hitPauseFrames: number = 0;
  private intangabilityFrames: number = 0;
  private disablePlatformDetection: number = 0;

  public FaceRight(): void {
    this.facingRight = true;
  }

  public FaceLeft(): void {
    this.facingRight = false;
  }

  public FastFallOn(): void {
    this.fastFalling = true;
  }

  public FastFallOff(): void {
    this.fastFalling = false;
  }

  public ChangeDirections(): void {
    this.facingRight = !this.facingRight;
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
    } as FlagsSnapShot;
  }

  public SetFromSnapShot(snapShot: FlagsSnapShot): void {
    this.fastFalling = snapShot.FastFalling;
    this.facingRight = snapShot.FacingRight;
    this.hitPauseFrames = snapShot.HitPauseFrames;
    this.intangabilityFrames = snapShot.IntangabilityFrames;
    this.disablePlatformDetection = snapShot.DisablePlatDetection;
  }
}

export type ECBSnapShot = {
  posX: number;
  posY: number;
  prevPosX: number;
  prevPosY: number;
  YOffset: number;
  Height: number;
  Width: number;
};

export type ECBShape = { height: number; width: number; yOffset: number };

export type ECBShapes = Map<StateId, ECBShape>;

export class ECBComponent implements IHistoryEnabled<ECBSnapShot> {
  public readonly SensorDepth: number = 1;
  private yOffset: number;
  private x: number = 0;
  private y: number = 0;
  private prevX: number = 0;
  private prevY: number = 0;
  private color: string;
  private height: number;
  private width: number;
  private readonly originalHeight: number;
  private readonly originalWidth: number;
  private readonly originalYOffset: number;
  private readonly curVerts = new Array<FlatVec>(4);
  private readonly prevVerts = new Array<FlatVec>(4);
  private readonly allVerts = new Array<FlatVec>(8);
  private readonly ecbStateShapes: ECBShapes;

  constructor(
    shapes: ECBShapes,
    height: number = 100,
    width: number = 100,
    yOffset: number = 0
  ) {
    this.color = 'orange';
    this.height = height;
    this.width = width;
    this.originalHeight = height;
    this.originalWidth = width;
    this.originalYOffset = yOffset;
    this.yOffset = yOffset;
    this.ecbStateShapes = shapes;
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
    this.prevX = this.x;
    this.prevY = this.y;

    const prevVert: FlatVec[] = this.prevVerts;
    const curVert: FlatVec[] = this.curVerts;
    prevVert[0].X = curVert[0].X;
    prevVert[0].Y = curVert[0].Y;
    prevVert[1].X = curVert[1].X;
    prevVert[1].Y = curVert[1].Y;
    prevVert[2].X = curVert[2].X;
    prevVert[2].Y = curVert[2].Y;
    prevVert[3].X = curVert[3].X;
    prevVert[3].Y = curVert[3].Y;
  }

  public SetInitialPosition(x: number, y: number): void {
    this.MoveToPosition(x, y);
    this.UpdatePreviousECB();
  }

  public MoveToPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.update();
  }

  public SetECBShape(stateId: StateId): void {
    const shape: ECBShape | undefined = this.ecbStateShapes.get(stateId);
    if (shape === undefined) {
      this.yOffset = this.originalYOffset;
      this.height = this.originalHeight;
      this.width = this.originalWidth;
      this.update();
      return;
    }

    this.yOffset = shape.yOffset;
    this.height = shape.height;
    this.width = shape.width;
    this.update();
  }

  private update(): void {
    const px = this.x;
    const py = this.y;
    const height = this.height;
    const width = this.width;
    const yOffset = this.yOffset;

    const bottomX = px;
    const bottomY = py + yOffset;

    const topX = px;
    const topY = bottomY - height;

    const leftX = bottomX - width / 2;
    const leftY = bottomY - height / 2;

    const rightX = bottomX + width / 2;
    const rightY = leftY;

    this.curVerts[0].X = bottomX;
    this.curVerts[0].Y = bottomY;

    this.curVerts[1].X = leftX;
    this.curVerts[1].Y = leftY;

    this.curVerts[2].X = topX;
    this.curVerts[2].Y = topY;

    this.curVerts[3].X = rightX;
    this.curVerts[3].Y = rightY;
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

  public get Height(): number {
    return this.height;
  }

  public get Width(): number {
    return this.width;
  }

  public get YOffset(): number {
    return this.yOffset;
  }

  public GetColor(): string {
    return this.color;
  }

  public SetColor(color: string): void {
    this.color = color;
  }

  public ResetECBShape(): void {
    this.height = this.originalHeight;
    this.width = this.originalWidth;
    this.yOffset = this.originalYOffset;
    this.update();
  }

  public SnapShot(): ECBSnapShot {
    return {
      posX: this.x,
      posY: this.y,
      prevPosX: this.prevX,
      prevPosY: this.prevY,
      YOffset: this.yOffset,
      Height: this.height,
      Width: this.width,
    } as ECBSnapShot;
  }

  public SetFromSnapShot(snapShot: ECBSnapShot): void {
    this.x = snapShot.posX;
    this.y = snapShot.posY;
    this.prevX = snapShot.prevPosX;
    this.prevY = snapShot.prevPosY;
    this.yOffset = snapShot.YOffset;
    this.height = snapShot.Height;
    this.width = snapShot.Width;

    this.update();

    // Update prevVerts

    const px = this.prevX;
    const py = this.prevY;
    const height = this.height;
    const width = this.width;
    const yOffset = this.yOffset;

    const bottomX = px;
    const bottomY = py + yOffset;

    const topX = px;
    const topY = bottomY - height;

    const leftX = bottomX - width / 2;
    const leftY = bottomY - height / 2;

    const rightX = bottomX + width / 2;
    const rightY = leftY;

    this.prevVerts[0].X = bottomX;
    this.prevVerts[0].Y = bottomY;

    this.prevVerts[1].X = leftX;
    this.prevVerts[1].Y = leftY;

    this.prevVerts[2].X = topX;
    this.prevVerts[2].Y = topY;

    this.prevVerts[3].X = rightX;
    this.prevVerts[3].Y = rightY;
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
  public readonly StartOffsetX: number;
  public readonly StartOffsetY: number;
  public readonly EndOffsetX: number;
  public readonly EndOffsetY: number;
  public readonly Radius: number;

  constructor(
    startOffsetX: number,
    startOffsetY: number,
    endOffsetX: number,
    endOffsetY: number,
    radius: number
  ) {
    this.StartOffsetX = startOffsetX;
    this.StartOffsetY = startOffsetY;
    this.EndOffsetX = endOffsetX;
    this.EndOffsetY = endOffsetY;
    this.Radius = radius;
  }

  public GetStartPosition(
    x: number,
    y: number,
    vecPool: Pool<PooledVector>
  ): PooledVector {
    return vecPool.Rent().SetXY(this.StartOffsetX + x, this.StartOffsetY + y);
  }

  public GetEndPosition(
    x: number,
    y: number,
    vecPool: Pool<PooledVector>
  ): PooledVector {
    return vecPool.Rent().SetXY(this.EndOffsetX + x, this.EndOffsetY + y);
  }
}

export class HurtCapsulesComponent {
  public readonly HurtCapsules: Array<HurtCapsule>;

  constructor(hurtCapsules: Array<HurtCapsule>) {
    this.HurtCapsules = hurtCapsules;
  }
}

export type ShieldSnapShot = {
  CurrentRadius: number;
  Active: boolean;
};

export class ShieldComponent implements IHistoryEnabled<ShieldSnapShot> {
  public readonly InitialRadius: number;
  public readonly YOffset: number;
  public Active: boolean = false;
  private curRadius: number;
  private readonly step: number;

  constructor(radius: number, yOffset: number) {
    this.curRadius = radius;
    this.InitialRadius = radius;
    this.YOffset = yOffset;
    this.step = radius / 300;
  }

  public SnapShot(): ShieldSnapShot {
    return {
      CurrentRadius: this.curRadius,
      Active: this.Active,
    } as ShieldSnapShot;
  }

  public SetFromSnapShot(snapShot: ShieldSnapShot): void {
    this.Active = snapShot.Active;
    this.curRadius = snapShot.CurrentRadius;
  }

  public get CurrentRadius(): number {
    return this.curRadius;
  }

  public Grow(): void {
    if (this.curRadius < this.InitialRadius) {
      this.curRadius += this.step;
    }

    if (this.curRadius > this.InitialRadius) {
      this.curRadius = this.InitialRadius;
    }
  }

  public Shrink(intensity: number): void {
    if (this.curRadius > 0) {
      this.curRadius -= this.step * intensity;
    }

    if (this.curRadius < 0) {
      this.curRadius = 0;
    }
  }

  public Damage(d: number) {
    const damageMod = d * 1.5;
    this.curRadius -= damageMod;
    if (this.curRadius < 0) {
      this.curRadius = 0;
    }
  }

  public Reset() {
    this.curRadius = this.InitialRadius;
  }
}

export type LedgeDetectorSnapShot = {
  middleX: number;
  middleY: number;
  numberOfLedgeGrabs: number;
};

export class LedgeDetectorComponent
  implements IHistoryEnabled<LedgeDetectorSnapShot>
{
  private maxGrabs: number = 15;
  private numberOfLedgeGrabs: number = 0;
  private yOffset: number;
  private x: number = 0;
  private y: number = 0;
  private width: number;
  private height: number;
  private rightSide: Array<FlatVec> = new Array<FlatVec>(4);
  private leftSide: Array<FlatVec> = new Array<FlatVec>(4);

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    yOffset = -130
  ) {
    this.height = height;
    this.width = width;
    this.yOffset = yOffset;
    FillArrayWithFlatVec(this.rightSide);
    FillArrayWithFlatVec(this.leftSide);
    this.MoveTo(x, y);
  }

  public MoveTo(x: number, y: number): void {
    this.x = x;
    this.y = y + this.yOffset;
    this.update();
  }

  public get LeftSide(): Array<FlatVec> {
    return this.leftSide;
  }

  public get RightSide(): Array<FlatVec> {
    return this.rightSide;
  }

  public get Width(): number {
    return this.width;
  }

  public get Height(): number {
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

    const widthRight = this.x + this.width;
    const widthLeft = this.x - this.width;
    const bottomHeight = this.y + this.height;

    //bottom left
    rightBottomLeft.X = this.x;
    rightBottomLeft.Y = bottomHeight;
    //top left
    rightTopLeft.X = this.x;
    rightTopLeft.Y = this.y;
    // top right
    rightTopRight.X = widthRight;
    rightTopRight.Y = this.y;
    // bottom right
    rightBottomRight.X = widthRight;
    rightBottomRight.Y = bottomHeight;

    //bottom left
    leftBottomLeft.X = widthLeft;
    leftBottomLeft.Y = bottomHeight;
    // top left
    leftTopLeft.X = widthLeft;
    leftTopLeft.Y = this.y;
    // top right
    leftTopRight.X = this.x;
    leftTopRight.Y = this.y;
    // bottom right
    leftBottomRight.X = this.x;
    leftBottomRight.Y = bottomHeight;
  }

  public SnapShot(): LedgeDetectorSnapShot {
    return {
      middleX: this.x,
      middleY: this.y,
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
    this.MoveTo(snapShot.middleX, snapShot.middleY);
    this.numberOfLedgeGrabs = snapShot.numberOfLedgeGrabs;
  }
}

export class JumpComponent implements IHistoryEnabled<number> {
  private readonly numberOfJumps: number = 2;
  private jumpCount: number = 0;
  public readonly JumpVelocity: number;

  constructor(jumpVelocity: number, numberOfJumps: number = 2) {
    this.JumpVelocity = jumpVelocity;
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
  public readonly Damage: number;
  public readonly Priority: number;
  public readonly Radius: number;
  public readonly launchAngle: number;
  public readonly activeStartFrame: frameNumber;
  public readonly activeEndFrame: frameNumber;
  public readonly frameOffsets: Map<frameNumber, FlatVec>;

  constructor(
    id: bubbleId,
    damage: number,
    priority: number,
    radius: number,
    launchAngle: number,
    frameOffsets: Map<frameNumber, FlatVec>
  ) {
    this.BubbleId = id;
    this.Damage = damage;
    this.Priority = priority;
    this.Radius = radius;
    this.launchAngle = launchAngle;
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
    vecPool: Pool<PooledVector>,
    playerX: number,
    playerY: number,
    facinRight: boolean,
    attackFrameNumber: frameNumber
  ): PooledVector | undefined {
    const offset = this.frameOffsets.get(attackFrameNumber);

    if (offset === undefined) {
      return undefined;
    }

    const globalX = facinRight ? playerX + offset.X : playerX - offset.X;
    const globalY = playerY + offset.Y;

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
  public readonly BaseKnockBack: number;
  public readonly KnockBackScaling: number;
  public readonly ImpulseClamp: number | undefined;
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
    baseKb: number,
    kbScaling: number,
    impulseClamp: number | undefined,
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
    this.BaseKnockBack = baseKb;
    this.KnockBackScaling = kbScaling;
    this.ImpulseClamp = impulseClamp;
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
  private baseKnockBack: number = 0;
  private knockBackScaling: number = 0;
  private impulseClamp: number | undefined;
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
    impulseClamp: number | undefined
  ): AttackBuilder {
    this.impulses = impulses;
    this.impulseClamp = impulseClamp;
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

  public WithBaseKnockBack(baseKb: number): AttackBuilder {
    this.baseKnockBack = baseKb;
    return this;
  }

  public WithKnockBackScaling(kbScaling: number): AttackBuilder {
    this.knockBackScaling = kbScaling;
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
    damage: number,
    radius: number,
    priority: number,
    launchAngle: number,
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
  private xOffset: number = 0;
  private yOffset: number = 0;
  private radius: number = 0;
  private active: boolean = false;

  public GetGlobalPosition(
    vecPool: Pool<PooledVector>,
    globalX: number,
    globalY: number,
    facingRight: boolean
  ): PooledVector {
    const x = facingRight ? globalX + this.xOffset : globalX - this.xOffset;
    const y = globalY + this.yOffset;
    return vecPool.Rent().SetXY(x, y);
  }

  public set Radius(value: number) {
    this.radius = value;
  }

  public set XOffset(value: number) {
    this.xOffset = value;
  }

  public set YOffset(value: number) {
    this.yOffset = value;
  }

  public get Radius(): number {
    return this.radius;
  }

  public get XOffset(): number {
    return this.xOffset;
  }

  public get YOffset(): number {
    return this.yOffset;
  }

  public get IsActive(): boolean {
    return this.active;
  }

  public Activate(): void {
    this.active = true;
  }

  public Deactivate(): void {
    this.xOffset = 0;
    this.yOffset = 0;
    this.radius = 0;
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

  constructor() {
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
    yOffset: number,
    xOffset: number,
    radius: number
  ): SensorComponent {
    if (this.currentSensorIdx >= this.sensors.length) {
      throw new Error('No more sensors available to activate.');
    }
    this.activateSensor(yOffset, xOffset, radius);
    return this;
  }

  private activateSensor(
    yOffset: number,
    xOffset: number,
    radius: number
  ): void {
    const sensor = this.sensors[this.currentSensorIdx];
    sensor.XOffset = xOffset;
    sensor.YOffset = yOffset;
    sensor.Radius = radius;
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
          yOffset: sensor.YOffset,
          xOffset: sensor.XOffset,
          radius: sensor.Radius,
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
        snapShotSensor.yOffset,
        snapShotSensor.xOffset,
        snapShotSensor.radius
      );
    }
    this.sensorReactor = snapShot.reactor || defaultReactor;
    this.currentSensorIdx = snapShot.sensors.length;
  }
}

// builder ================================================

export class SpeedsComponentBuilder {
  private groundedVelocityDecay: number = 0;
  private aerialVelocityDecay: number = 0;
  private aerialSpeedInpulseLimit: number = 0;
  private aerialSpeedMultiplier: number = 0;
  private airDodgeSpeed: number = 0;
  private maxWalkSpeed: number = 0;
  private maxRunSpeed: number = 0;
  private dashMutiplier: number = 0;
  private maxDashSpeed: number = 0;
  private walkSpeedMulitplier: number = 0;
  private runSpeedMultiplier: number = 0;
  private fastFallSpeed: number = 0;
  private fallSpeed: number = 0;
  private gravity: number = 0;

  SetAerialSpeeds(
    aerialVelocityDecay: number,
    aerialSpeedImpulseLimit: number,
    aerialSpeedMultiplier: number
  ) {
    this.aerialVelocityDecay = aerialVelocityDecay;
    this.aerialSpeedInpulseLimit = aerialSpeedImpulseLimit;
    this.aerialSpeedMultiplier = aerialSpeedMultiplier;
  }

  SetAirDodgeSpeed(airDodgeSpeed: number): void {
    this.airDodgeSpeed = airDodgeSpeed;
  }

  SetFallSpeeds(
    fastFallSpeed: number,
    fallSpeed: number,
    gravity: number = 1
  ): void {
    this.fallSpeed = fallSpeed;
    this.fastFallSpeed = fastFallSpeed;
    this.gravity = gravity;
  }

  SetWalkSpeeds(maxWalkSpeed: number, walkSpeedMultiplier: number): void {
    this.maxWalkSpeed = maxWalkSpeed;
    this.walkSpeedMulitplier = walkSpeedMultiplier;
  }

  SetRunSpeeds(maxRunSpeed: number, runSpeedMultiplier: number): void {
    this.runSpeedMultiplier = runSpeedMultiplier;
    this.maxRunSpeed = maxRunSpeed;
  }

  SetDashSpeeds(dashMultiplier: number, maxDashSpeed: number): void {
    this.dashMutiplier = dashMultiplier;
    this.maxDashSpeed = maxDashSpeed;
  }

  SetGroundedVelocityDecay(groundedVelocityDecay: number): void {
    this.groundedVelocityDecay = groundedVelocityDecay;
  }

  Build(): SpeedsComponent {
    return new SpeedsComponent(
      this.groundedVelocityDecay,
      this.aerialVelocityDecay,
      this.aerialSpeedInpulseLimit,
      this.aerialSpeedMultiplier,
      this.airDodgeSpeed,
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
