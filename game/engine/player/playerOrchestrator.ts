import { Stage } from '../stage/stageMain';
import { CharacterConfig } from '../../character/default';
import {
  AttackComponment,
  ECBComponent,
  FSMInfoComponent,
  HitStopComponent,
  HitStunComponent,
  HurtCapsulesComponent,
  JumpComponent,
  LedgeDetectorComponent,
  PlayerFlagsComponent,
  PlayerPointsComponent,
  PositionComponent,
  SensorComponent,
  ShieldComponent,
  SpeedsComponent,
  SpeedsComponentBuilder,
  VelocityComponent,
  WeightComponent,
} from './playerComponents';
import {
  LineSegmentIntersectionFp,
  LineSegmentIntersectionRaw,
} from '../physics/collisions';
import { FlatVec } from '../physics/vector';
import { FixedPoint, MultiplyRaw } from '../../math/fixedPoint';
import { PooledVector } from '../pools/PooledVector';

export type speedBuilderOptions = (scb: SpeedsComponentBuilder) => void;

const defaultSpeedsBuilderOptions: speedBuilderOptions = (
  scb: SpeedsComponentBuilder
) => {
  scb.SetWalkSpeeds(11, 2);
  scb.SetRunSpeeds(14, 2.2);
  scb.SetFallSpeeds(22, 15, 0.7);
  scb.SetAerialSpeeds(0.5, 13, 1.8);
  scb.SetDashSpeeds(3, 17);
  scb.SetDodgeSpeeds(25, 25);
  scb.SetGroundedVelocityDecay(0.8);
};

export class Player {
  private readonly position: PositionComponent;
  private readonly velocity: VelocityComponent;
  private readonly weight: WeightComponent;
  private readonly flags: PlayerFlagsComponent;
  private readonly points: PlayerPointsComponent;
  private readonly hitStun: HitStunComponent;
  private readonly hitStop: HitStopComponent;
  private readonly speeds: SpeedsComponent;
  private readonly ecb: ECBComponent;
  private readonly hurtCircles: HurtCapsulesComponent;
  private readonly jump: JumpComponent;
  private readonly fsmInfo: FSMInfoComponent;
  private readonly ledgeDetector: LedgeDetectorComponent;
  private readonly sensors: SensorComponent;
  private readonly attacks: AttackComponment;
  private readonly shield: ShieldComponent;
  public readonly ID: number = 0;

  constructor(Id: number, CharacterConfig: CharacterConfig) {
    const speedsBuilder = CharacterConfig.SCB;
    this.ID = Id;
    this.position = new PositionComponent();
    this.velocity = new VelocityComponent();
    this.weight = new WeightComponent(CharacterConfig.Weight);
    this.speeds = speedsBuilder.Build();
    this.flags = new PlayerFlagsComponent();
    this.points = new PlayerPointsComponent();
    this.hitStun = new HitStunComponent();
    this.hitStop = new HitStopComponent();

    this.ecb = new ECBComponent(
      CharacterConfig.ECBShapes,
      CharacterConfig.ECBHeight,
      CharacterConfig.ECBWidth,
      CharacterConfig.ECBOffset
    );
    this.hurtCircles = new HurtCapsulesComponent(CharacterConfig.HurtCapsules);
    this.jump = new JumpComponent(
      CharacterConfig.JumpVelocity,
      CharacterConfig.NumberOfJumps
    );
    this.fsmInfo = new FSMInfoComponent(CharacterConfig.FrameLengths);
    this.ledgeDetector = new LedgeDetectorComponent(
      this.position.X,
      this.position.Y,
      CharacterConfig.LedgeBoxWidth,
      CharacterConfig.LedgeBoxHeight,
      CharacterConfig.ledgeBoxYOffset
    );
    this.sensors = new SensorComponent();
    this.attacks = new AttackComponment(CharacterConfig.attacks);
    this.shield = new ShieldComponent(
      CharacterConfig.ShieldRadius,
      CharacterConfig.ShieldYOffset
    );
  }

  public get ECB(): ECBComponent {
    return this.ecb;
  }

  public get HurtBubbles(): HurtCapsulesComponent {
    return this.hurtCircles;
  }

  public get Flags(): PlayerFlagsComponent {
    return this.flags;
  }

  public get Points(): PlayerPointsComponent {
    return this.points;
  }

  public get HitStun(): HitStunComponent {
    return this.hitStun;
  }

  public get HitStop(): HitStopComponent {
    return this.hitStop;
  }

  public get Jump(): JumpComponent {
    return this.jump;
  }

  public get Position(): PositionComponent {
    return this.position;
  }

  public get Velocity(): VelocityComponent {
    return this.velocity;
  }

  public get Weight(): WeightComponent {
    return this.weight;
  }

  public get Speeds(): SpeedsComponent {
    return this.speeds;
  }

  public get FSMInfo(): FSMInfoComponent {
    return this.fsmInfo;
  }

  public get LedgeDetector(): LedgeDetectorComponent {
    return this.ledgeDetector;
  }

  public get Shield(): ShieldComponent {
    return this.shield;
  }

  public get Sensors(): SensorComponent {
    return this.sensors;
  }

  public get Attacks(): AttackComponment {
    return this.attacks;
  }

  // public CanOnlyFallOffLedgeWhenFacingAwayFromIt(): boolean {
  //   const a = this.attacks.GetAttack();

  //   if (a === undefined) {
  //     return false;
  //   }
  //   return a.CanOnlyFallOffLedgeIfFacingAwayFromIt;
  // }

  // public AddWalkImpulseToPlayer(impulse: number): void {
  //   const velocity = this.velocity;
  //   const speeds = this.speeds;
  //   velocity.AddClampedXImpulse(
  //     speeds.MaxWalkSpeed,
  //     impulse * speeds.WalkSpeedMulitplier
  //   );
  // }

  // public SetPlayerPosition(x: number, y: number) {
  //   const position = this.position;
  //   this.Position;
  //   position.X = x;
  //   position.Y = y;
  //   this.ecb.MoveToPosition(x, y);
  //   this.ledgeDetector.MoveTo(x, y);
  // }

  // public AddToPlayerPosition(x: number, y: number): void {
  //   const pos = this.position;
  //   pos.X += x;
  //   pos.Y += y;
  //   this.ecb.MoveToPosition(pos.X, pos.Y);
  //   this.ledgeDetector.MoveTo(pos.X, pos.Y);
  // }

  // public AddToPlayerYPosition(y: number): void {
  //   const position = this.position;
  //   position.Y += y;
  //   this.ecb.MoveToPosition(position.X, position.Y);
  //   this.ledgeDetector.MoveTo(position.X, position.Y);
  // }

  // public SetPlayerInitialPosition(x: number, y: number): void {
  //   this.Position.X = x;
  //   this.Position.Y = y;
  //   this.ecb.SetInitialPosition(x, y);
  //   this.ledgeDetector.MoveTo(x, y);
  // }
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
    speeds.MaxWalkSpeed.Raw,
    MultiplyRaw(impulse.Raw, speeds.WalkSpeedMulitplier.Raw)
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

export function PlayerOnStageOrPlats(
  s: Stage,
  ecbBottom: FlatVec,
  ecbSensorDepth: FixedPoint
) {
  if (PlayerOnPlats(s, ecbBottom, ecbSensorDepth)) {
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
