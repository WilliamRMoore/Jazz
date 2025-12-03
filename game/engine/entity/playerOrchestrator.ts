import { Stage } from '../stage/stageMain';
import { LineSegmentIntersectionRaw } from '../physics/collisions';
import { FlatVec } from '../physics/vector';
import { PooledVector } from '../pools/PooledVector';
import { CharacterConfig } from '../../character/shared';
import { FixedPoint, MultiplyRaw } from '../math/fixedPoint';
import { AttackComponment } from './components/attack';
import { ECBComponent } from './components/ecb';
import { PlayerFlagsComponent } from './components/flags';
import { FSMInfoComponent } from './components/fsmInfo';
import { HitStopComponent } from './components/hitStop';
import { HitStunComponent } from './components/hitStun';
import { HurtCapsulesComponent } from './components/hurtCircles';
import { JumpComponent } from './components/jump';
import { LedgeDetectorComponent } from './components/ledgeDetector';
import { PlayerPointsComponent } from './components/points';
import { PositionComponent } from './components/position';
import { SensorComponent } from './components/sensor';
import { ShieldComponent } from './components/shield';
import {
  SpeedsComponentConfigBuilder,
  SpeedsComponent,
} from './components/speeds';
import { VelocityComponent } from './components/velocity';
import { WeightComponent } from './components/weight';

export type speedBuilderOptions = (scb: SpeedsComponentConfigBuilder) => void;

export class Player {
  public readonly Position: PositionComponent;
  public readonly Velocity: VelocityComponent;
  public readonly Weight: WeightComponent;
  public readonly Flags: PlayerFlagsComponent;
  public readonly Points: PlayerPointsComponent;
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
  public readonly Shield: ShieldComponent;
  public readonly ID: number = 0;

  constructor(Id: number, cc: CharacterConfig) {
    const sB = new SpeedsComponentConfigBuilder();
    sB.SetWalkSpeeds(cc.maxWalkSpeed, cc.walkSpeedMulitplier);
    sB.SetRunSpeeds(cc.maxRunSpeed, cc.runSpeedMultiplier);
    sB.SetFallSpeeds(cc.fastFallSpeed, cc.fallSpeed, cc.gravity);
    sB.SetAerialSpeeds(
      cc.aerialVelocityDecay,
      cc.aerialSpeedInpulseLimit,
      cc.aerialSpeedMultiplier
    );
    sB.SetDashSpeeds(cc.dashMutiplier, cc.maxDashSpeed);
    sB.SetDodgeSpeeds(cc.airDodgeSpeed, cc.dodgeRollSpeed);
    sB.SetGroundedVelocityDecay(cc.groundedVelocityDecay);
    this.ID = Id;
    this.Position = new PositionComponent();
    this.Velocity = new VelocityComponent();
    this.Weight = new WeightComponent(cc.Weight);
    this.Speeds = sB.Build();
    this.Flags = new PlayerFlagsComponent();
    this.Points = new PlayerPointsComponent();
    this.HitStun = new HitStunComponent();
    this.HitStop = new HitStopComponent();

    this.ECB = new ECBComponent(
      cc.ECBShapes,
      cc.ECBHeight,
      cc.ECBWidth,
      cc.ECBOffset
    );
    this.HurtCircles = new HurtCapsulesComponent(cc.HurtCapsules);
    this.Jump = new JumpComponent(cc.JumpVelocity, cc.NumberOfJumps);
    this.FSMInfo = new FSMInfoComponent(cc.FrameLengths);
    this.LedgeDetector = new LedgeDetectorComponent(
      this.Position.X.AsNumber,
      this.Position.Y.AsNumber,
      cc.LedgeBoxWidth,
      cc.LedgeBoxHeight,
      cc.ledgeBoxYOffset
    );
    this.Sensors = new SensorComponent();
    this.Attacks = new AttackComponment(cc.attacks);
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
  yRaw: number
): void {
  p.Position.X.SetFromRaw(xRaw);
  p.Position.Y.SetFromRaw(yRaw);
  p.ECB.SetInitialPositionRaw(xRaw, yRaw);
  p.LedgeDetector.MoveToRaw(xRaw, yRaw);
}

export function AddToPlayerYPositionRaw(p: Player, yRaw: number): void {
  const position = p.Position;
  position.Y.AddRaw(yRaw);
  p.ECB.MoveToPosition(position.X, position.Y);
  p.LedgeDetector.MoveTo(position.X, position.Y);
}

export function AddWalkImpulseToPlayer(p: Player, impulse: FixedPoint): void {
  const velocity = p.Velocity;
  const speeds = p.Speeds;
  velocity.AddClampedXImpulseRaw(
    speeds.MaxWalkSpeedRaw,
    MultiplyRaw(impulse.Raw, speeds.WalkSpeedMulitplierRaw)
  );
}

export function SetPlayerPosition(p: Player, x: FixedPoint, y: FixedPoint) {
  const position = p.Position;
  position.X.SetFromFp(x);
  position.Y.SetFromFp(y);
  p.ECB.MoveToPosition(x, y);
  p.LedgeDetector.MoveTo(x, y);
}

export function SetPlayerPositionRaw(p: Player, xRaw: number, yRaw: number) {
  const position = p.Position;
  position.X.SetFromRaw(xRaw);
  position.Y.SetFromRaw(yRaw);
  p.ECB.MoveToPositionRaw(xRaw, yRaw);
  p.LedgeDetector.MoveToRaw(xRaw, yRaw);
}

export function AddToPlayerPositionFp(
  p: Player,
  x: FixedPoint,
  y: FixedPoint
): void {
  AddToPlayerPositionRaw(p, x.Raw, y.Raw);
}

export function AddToPlayerPositionVec(p: Player, v: PooledVector): void {
  AddToPlayerPositionRaw(p, v.X.Raw, v.Y.Raw);
}

export function AddToPlayerPositionRaw(
  p: Player,
  xRaw: number,
  yRaw: number
): void {
  const pos = p.Position;
  pos.X.AddRaw(xRaw);
  pos.Y.AddRaw(yRaw);
  p.ECB.MoveToPosition(pos.X, pos.Y);
  p.LedgeDetector.MoveTo(pos.X, pos.Y);
}

export function PlayerOnStage(
  s: Stage,
  ecbBottom: FlatVec,
  ecbSensorDepth: FixedPoint
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
        ecbBottom.Y.Raw - ecbSensorDepth.Raw
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
  ecbSensorDepth: FixedPoint
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
        plat.Y2.Raw
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
  ecbSensorDepth: FixedPoint
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
        plat.Y2.Raw
      )
    ) {
      return plat.Y1;
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
  sensorDepth: FixedPoint
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
        ecbRight.Y.Raw
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
  sensorDepth: FixedPoint
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
        ecbLeft.Y.Raw
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
  sensorDepth: FixedPoint
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
        ecbTop.Y.Raw + sensorDepth.Raw
      )
    ) {
      return true;
    }
  }

  return false;
}
