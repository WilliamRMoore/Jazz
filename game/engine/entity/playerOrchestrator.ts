import { Stage } from '../stage/stageMain';
import { LineSegmentIntersectionRaw } from '../physics/collisions';
import { FlatVec, Line } from '../physics/vector';
import { PooledVector } from '../pools/PooledVector';
import { CharacterConfig } from '../../character/shared';
import { FixedPoint } from '../math/fixedPoint';
import { AttackComponment } from './components/attack';
import { ECBComponent } from './components/ecb';
import { PlayerFlagsComponent } from './components/flags';
import { FSMInfoComponent } from './components/fsmInfo';
import { HitStopComponent } from './components/hitStop';
import { HitStunComponent } from './components/hitStun';
import { HurtCapsulesComponent } from './components/hurtCircles';
import { JumpComponent } from './components/jump';
import { LedgeDetectorComponent } from './components/ledgeDetector';
import { PlayerDamageComponent } from './components/damage';
import { PositionComponent } from './components/position';
import { SensorComponent } from './components/sensor';
import { ShieldComponent } from './components/shield';
import {
  SpeedsComponentConfigBuilder,
  SpeedsComponent,
} from './components/speeds';
import { VelocityComponent } from './components/velocity';
import { WeightComponent } from './components/weight';
import { GrabComponent } from './components/grab';
import { GrabMeterComponent } from './components/grabMeter';
import { PlayerStateHistory } from '../systems/history';
import { HoldComponent } from './components/hold';

export type speedBuilderOptions = (scb: SpeedsComponentConfigBuilder) => void;

export class Player {
  public readonly Position: PositionComponent;
  public readonly Velocity: VelocityComponent;
  public readonly Weight: WeightComponent;
  public readonly Flags: PlayerFlagsComponent;
  public readonly Damage: PlayerDamageComponent;
  public readonly HitStun: HitStunComponent;
  public readonly HitStop: HitStopComponent;
  public readonly Speeds: SpeedsComponent;
  public readonly ECB: ECBComponent;
  public readonly HurtCircles: HurtCapsulesComponent;
  public readonly Jump: JumpComponent;
  public readonly FSMInfo: FSMInfoComponent;
  public readonly LedgeDetector: LedgeDetectorComponent;
  public readonly Sensors: SensorComponent;
  public readonly Attacks: AttackComponment;
  public readonly Grabs: GrabComponent;
  public readonly GrabMeter: GrabMeterComponent;
  public readonly Hold: HoldComponent;
  public readonly Shield: ShieldComponent;
  public readonly ID: number = 0;

  constructor(Id: number, cc: CharacterConfig) {
    const sB = new SpeedsComponentConfigBuilder();
    sB.SetWalkSpeeds(cc.MaxWalkSpeed, cc.WalkSpeedMulitplier);
    sB.SetRunSpeeds(cc.MaxRunSpeed, cc.RunSpeedMultiplier);
    sB.SetFallSpeeds(cc.FastFallSpeed, cc.FallSpeed, cc.Gravity);
    sB.SetAerialSpeeds(
      cc.AerialVelocityDecay,
      cc.AerialSpeedInpulseLimit,
      cc.AerialSpeedMultiplier,
    );
    sB.SetDashSpeeds(cc.DashMutiplier, cc.MaxDashSpeed);
    sB.SetDodgeSpeeds(cc.AirDodgeSpeed, cc.DodgeRollSpeed);
    sB.SetGroundedVelocityDecay(cc.GroundedVelocityDecay);
    sB.SetWallKickVelocity(cc.WallKickVelocity.x, cc.WallKickVelocity.y);
    this.ID = Id;
    this.Position = new PositionComponent();
    this.Velocity = new VelocityComponent();
    this.Weight = new WeightComponent(cc.Weight);
    this.Speeds = sB.Build();
    this.Flags = new PlayerFlagsComponent();
    this.Damage = new PlayerDamageComponent();
    this.HitStun = new HitStunComponent();
    this.HitStop = new HitStopComponent();

    const isFacingRight = () => this.Flags.IsFacingRight;

    this.ECB = new ECBComponent(
      cc.ECBShapes,
      this.Position.Ref,
      cc.ECBHeight,
      cc.ECBWidth,
      cc.ECBOffset,
    );
    this.HurtCircles = new HurtCapsulesComponent(cc.HurtCapsules);
    this.Jump = new JumpComponent(cc.JumpVelocity, cc.NumberOfJumps);
    this.FSMInfo = new FSMInfoComponent(cc.FrameLengths);
    this.LedgeDetector = new LedgeDetectorComponent(
      this.Position.Ref,
      cc.LedgeBoxWidth,
      cc.LedgeBoxHeight,
      cc.LedgeBoxYOffset,
    );
    this.Sensors = new SensorComponent();
    this.Attacks = new AttackComponment(
      cc.Attacks,
      this.Position.Ref,
      isFacingRight,
    );
    this.Grabs = new GrabComponent(cc.Grabs, this.Position.Ref, isFacingRight);
    this.GrabMeter = new GrabMeterComponent();
    this.Hold = new HoldComponent();
    this.Shield = new ShieldComponent(cc.ShieldRadius, cc.ShieldYOffset);
  }
}

export function CanOnlyFallOffLedgeWhenFacingAwayFromIt(p: Player): boolean {
  const a = p.Attacks.GetAttack();

  if (a === undefined) {
    return false;
  }

  return a.CanOnlyFallOffLedgeIfFacingAwayFromIt;
}

export function SetPlayerInitialPositionRaw(
  p: Player,
  xRaw: number,
  yRaw: number,
): void {
  p.Position.X.SetFromRaw(xRaw);
  p.Position.Y.SetFromRaw(yRaw);
  p.ECB.Update();
  p.LedgeDetector.MoveToPos();
}

export function AddToPlayerYPositionRaw(p: Player, yRaw: number): void {
  const position = p.Position;
  position.Y.AddRaw(yRaw);
  p.ECB.Update();
  p.LedgeDetector.MoveToPos();
}

export function AddToPlayerXPostionRaw(p: Player, xRaw: number): void {
  const position = p.Position;
  position.X.AddRaw(xRaw);
  p.ECB.Update();
  p.LedgeDetector.MoveToPos();
}

export function SetPlayerPosition(p: Player, x: FixedPoint, y: FixedPoint) {
  const position = p.Position;
  position.X.SetFromFp(x);
  position.Y.SetFromFp(y);
  p.ECB.Update();
  p.LedgeDetector.MoveToPos();
}

export function SetPlayerPositionRaw(p: Player, xRaw: number, yRaw: number) {
  const position = p.Position;
  position.X.SetFromRaw(xRaw);
  position.Y.SetFromRaw(yRaw);
  p.ECB.Update();
  p.LedgeDetector.MoveToPos();
}

export function AddToPlayerPositionFp(
  p: Player,
  x: FixedPoint,
  y: FixedPoint,
): void {
  AddToPlayerPositionRaw(p, x.Raw, y.Raw);
}

export function AddToPlayerPositionVec(p: Player, v: PooledVector): void {
  AddToPlayerPositionRaw(p, v.X.Raw, v.Y.Raw);
}

export function AddToPlayerPositionRaw(
  p: Player,
  xRaw: number,
  yRaw: number,
): void {
  const pos = p.Position;
  pos.X.AddRaw(xRaw);
  pos.Y.AddRaw(yRaw);
  p.ECB.Update();
  p.LedgeDetector.MoveToPos();
}

export function PlayerOnStage(
  s: Stage,
  ecbBottom: FlatVec,
  ecbSensorDepth: FixedPoint,
) {
  const grnd = s.StageVerticies.GetGround();
  const grndLoopLength = grnd.length;

  for (let i = 0; i < grndLoopLength; i++) {
    const gP = grnd[i];
    if (
      LineSegmentIntersectionRaw(
        gP.X1.Raw,
        gP.Y1.Raw,
        gP.X2.Raw,
        gP.Y2.Raw,
        ecbBottom.X.Raw,
        ecbBottom.Y.Raw,
        ecbBottom.X.Raw,
        ecbBottom.Y.Raw - ecbSensorDepth.Raw,
      )
    ) {
      return true;
    }
  }

  return false;
}

export function PlayerOnPlats(
  s: Stage,
  ecbBottom: FlatVec,
  ecbSensorDepth: FixedPoint,
): boolean {
  const plats = s.Platforms;
  if (plats === undefined) {
    return false;
  }
  const platLength = plats.length;

  for (let i = 0; i < platLength; i++) {
    const plat = plats[i];
    if (
      LineSegmentIntersectionRaw(
        ecbBottom.X.Raw,
        ecbBottom.Y.Raw,
        ecbBottom.X.Raw,
        ecbBottom.Y.Raw - ecbSensorDepth.Raw,
        plat.X1.Raw,
        plat.Y1.Raw,
        plat.X2.Raw,
        plat.Y2.Raw,
      )
    ) {
      return true;
    }
  }
  return false;
}

export function PlayerOnPlatsReturnsYCoord(
  s: Stage,
  ecbBottom: FlatVec,
  ecbSensorDepth: FixedPoint,
): FixedPoint | undefined {
  const plats = s.Platforms;
  if (plats === undefined) {
    return undefined;
  }
  const platLength = plats.length;

  for (let i = 0; i < platLength; i++) {
    const plat = plats[i];
    if (
      LineSegmentIntersectionRaw(
        ecbBottom.X.Raw,
        ecbBottom.Y.Raw,
        ecbBottom.X.Raw,
        ecbBottom.Y.Raw - ecbSensorDepth.Raw,
        plat.X1.Raw,
        plat.Y1.Raw,
        plat.X2.Raw,
        plat.Y2.Raw,
      )
    ) {
      return plat.Y1;
    }
  }
  return undefined;
}

export function PlayerOnPlatsReturnsPlatform(
  s: Stage,
  ecbBottom: FlatVec,
  ecbSensorDepth: FixedPoint,
): Line | undefined {
  const plats = s.Platforms;
  if (plats === undefined) {
    return undefined;
  }
  const platLength = plats.length;

  for (let i = 0; i < platLength; i++) {
    const plat = plats[i];
    if (
      LineSegmentIntersectionRaw(
        ecbBottom.X.Raw,
        ecbBottom.Y.Raw,
        ecbBottom.X.Raw,
        ecbBottom.Y.Raw - ecbSensorDepth.Raw,
        plat.X1.Raw,
        plat.Y1.Raw,
        plat.X2.Raw,
        plat.Y2.Raw,
      )
    ) {
      return plat;
    }
  }
  return undefined;
}

export function PlayerOnStageOrPlats(s: Stage, p: Player) {
  const ecbBottom = p.ECB.Bottom;
  const ecbSensorDepth = p.ECB.SensorDepth;

  if (
    !p.Flags.IsPlatDetectDisabled &&
    PlayerOnPlats(s, ecbBottom, ecbSensorDepth)
  ) {
    return true;
  }
  return PlayerOnStage(s, ecbBottom, ecbSensorDepth);
}

export function PlayerTouchingStageLeftWall(
  s: Stage,
  ecbRight: FlatVec,
  sensorDepth: FixedPoint,
) {
  const left = s.StageVerticies.GetLeftWall();
  const leftLoopLength = left.length - 1;

  for (let i = 0; i < leftLoopLength; i++) {
    const lP = left[i];
    if (
      LineSegmentIntersectionRaw(
        lP.X1.Raw,
        lP.Y1.Raw,
        lP.X2.Raw,
        lP.Y2.Raw,
        ecbRight.X.Raw,
        ecbRight.Y.Raw,
        ecbRight.X.Raw - sensorDepth.Raw,
        ecbRight.Y.Raw,
      )
    ) {
      return true;
    }
  }

  return false;
}

export function PlayerTouchingStageRightWall(
  s: Stage,
  ecbLeft: FlatVec,
  sensorDepth: FixedPoint,
) {
  const left = s.StageVerticies.GetLeftWall();
  const leftLoopLength = left.length - 1;

  for (let i = 0; i < leftLoopLength; i++) {
    const lP = left[i];
    if (
      LineSegmentIntersectionRaw(
        lP.X1.Raw,
        lP.Y1.Raw,
        lP.X2.Raw,
        lP.Y2.Raw,
        ecbLeft.X.Raw,
        ecbLeft.Y.Raw,
        ecbLeft.X.Raw + sensorDepth.Raw,
        ecbLeft.Y.Raw,
      )
    ) {
      return true;
    }
  }

  return false;
}

export function PlayerTouchingStageCeiling(
  s: Stage,
  ecbTop: FlatVec,
  sensorDepth: FixedPoint,
) {
  const left = s.StageVerticies.GetLeftWall();
  const leftLoopLength = left.length - 1;

  for (let i = 0; i < leftLoopLength; i++) {
    const lP = left[i];
    if (
      LineSegmentIntersectionRaw(
        lP.X1.Raw,
        lP.Y1.Raw,
        lP.X2.Raw,
        lP.Y2.Raw,
        ecbTop.X.Raw,
        ecbTop.Y.Raw,
        ecbTop.X.Raw,
        ecbTop.Y.Raw + sensorDepth.Raw,
      )
    ) {
      return true;
    }
  }

  return false;
}

type aabbdto = {
  xRaw: number;
  yRaw: number;
  widthRaw: number;
  heightRaw: number;
};

export function PlayerECBAABB(
  p: Player,
  lastPState: PlayerStateHistory,
  abdto: aabbdto,
) {
  const curLeft = p.ECB.Left.X.Raw;
  const curTop = p.ECB.Top.Y.Raw;
  const curRight = p.ECB.Right.X.Raw;
  const curBottom = p.ECB.Bottom.Y.Raw;

  const lastBottom = lastPState.comp_ecbDiamond[0].yRaw;
  const lastLeft = lastPState.comp_ecbDiamond[1].xRaw;
  const lastRight = lastPState.comp_ecbDiamond[2].xRaw;
  const lastTop = lastPState.comp_ecbDiamond[3].yRaw;

  abdto.xRaw = Math.min(curLeft, lastLeft);
  abdto.yRaw = Math.min(curTop, lastTop);
  abdto.widthRaw = Math.max(curRight, lastRight) - abdto.xRaw;
  abdto.heightRaw = Math.max(curBottom, lastBottom) - abdto.yRaw;
}

export function PlayerHurtCapAABB(
  p: Player,
  lastPState: PlayerStateHistory,
  abdto: aabbdto,
) {
  const maxInt = Number.MAX_SAFE_INTEGER;
  const minInt = -maxInt;

  // --- Current Frame ---
  let currentLeft = maxInt;
  let currentRight = minInt;
  let currentTop = maxInt;
  let currentBottom = minInt;

  const pX = p.Position.X.Raw;
  const pY = p.Position.Y.Raw;
  const hurtCapsules = p.HurtCircles.HurtCapsules;

  for (let i = 0; i < hurtCapsules.length; i++) {
    const cap = hurtCapsules[i];
    const radius = cap.Radius.Raw;
    const x1 = cap.StartOffsetX.Raw + pX;
    const y1 = cap.StartOffsetY.Raw + pY;
    const x2 = cap.EndOffsetX.Raw + pX;
    const y2 = cap.EndOffsetY.Raw + pY;

    currentLeft = Math.min(currentLeft, Math.min(x1, x2) - radius);
    currentRight = Math.max(currentRight, Math.max(x1, x2) + radius);
    currentTop = Math.min(currentTop, Math.min(y1, y2) - radius);
    currentBottom = Math.max(currentBottom, Math.max(y1, y2) + radius);
  }

  // --- Previous Frame ---
  let prevLeft = maxInt;
  let prevRight = minInt;
  let prevTop = maxInt;
  let prevBottom = minInt;

  const prevHurtCapsules = lastPState.comp_hurtCapsules;

  for (let i = 0; i < prevHurtCapsules.length; i++) {
    const cap = prevHurtCapsules[i];
    if (!cap.active) {
      continue;
    }
    const radius = cap.radiusRaw;
    const x1 = cap.x1Raw;
    const y1 = cap.y1Raw;
    const x2 = cap.x2Raw;
    const y2 = cap.y2Raw;

    prevLeft = Math.min(prevLeft, Math.min(x1, x2) - radius);
    prevRight = Math.max(prevRight, Math.max(x1, x2) + radius);
    prevTop = Math.min(prevTop, Math.min(y1, y2) - radius);
    prevBottom = Math.max(prevBottom, Math.max(y1, y2) + radius);
  }

  // --- Union AABB ---
  abdto.xRaw = Math.min(currentLeft, prevLeft);
  abdto.yRaw = Math.min(currentTop, prevTop);
  abdto.widthRaw = Math.max(currentRight, prevRight) - abdto.xRaw;
  abdto.heightRaw = Math.max(currentBottom, prevBottom) - abdto.yRaw;
}
