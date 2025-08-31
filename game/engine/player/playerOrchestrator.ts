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
  SpeedsComponent,
  SpeedsComponentBuilder,
  VelocityComponent,
  WeightComponent,
} from './playerComponents';
import { LineSegmentIntersection } from '../physics/collisions';
import { FlatVec } from '../physics/vector';

export type speedBuilderOptions = (scb: SpeedsComponentBuilder) => void;

const defaultSpeedsBuilderOptions: speedBuilderOptions = (
  scb: SpeedsComponentBuilder
) => {
  scb.SetWalkSpeeds(11, 2);
  scb.SetRunSpeeds(14, 2.2);
  scb.SetFallSpeeds(22, 15, 0.7);
  scb.SetAerialSpeeds(0.5, 13, 1.8);
  scb.SetDashSpeeds(3, 17);
  scb.SetAirDodgeSpeed(25);
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

  public get Sensors(): SensorComponent {
    return this.sensors;
  }

  public get Attacks(): AttackComponment {
    return this.attacks;
  }

  public AddWalkImpulseToPlayer(impulse: number): void {
    const velocity = this.velocity;
    const speeds = this.speeds;
    velocity.AddClampedXImpulse(
      speeds.MaxWalkSpeed,
      impulse * speeds.WalkSpeedMulitplier
    );
  }

  public SetPlayerPosition(x: number, y: number) {
    const position = this.position;
    this.Position;
    position.X = x;
    position.Y = y;
    this.ecb.MoveToPosition(x, y);
    this.ledgeDetector.MoveTo(x, y);
  }

  public AddToPlayerPosition(x: number, y: number): void {
    const pos = this.position;
    pos.X += x;
    pos.Y += y;
    this.ecb.MoveToPosition(pos.X, pos.Y);
    this.ledgeDetector.MoveTo(pos.X, pos.Y);
  }

  public AddToPlayerYPosition(y: number): void {
    const position = this.position;
    position.Y += y;
    this.ecb.MoveToPosition(position.X, position.Y);
    this.ledgeDetector.MoveTo(position.X, position.Y);
  }

  public SetPlayerInitialPosition(x: number, y: number): void {
    this.Position.X = x;
    this.Position.Y = y;
    this.ecb.SetInitialPosition(x, y);
    this.ledgeDetector.MoveTo(x, y);
  }
}

export function PlayerOnStage(
  s: Stage,
  ecbBottom: FlatVec,
  ecbSensorDepth: number
) {
  const grnd = s.StageVerticies.GetGround();
  const grndLoopLength = grnd.length;

  for (let i = 0; i < grndLoopLength; i++) {
    const gP = grnd[i];
    if (
      LineSegmentIntersection(
        gP.X1,
        gP.Y1,
        gP.X2,
        gP.Y2,
        ecbBottom.X,
        ecbBottom.Y,
        ecbBottom.X,
        ecbBottom.Y - ecbSensorDepth
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
  ecbSensorDepth: number
): boolean {
  const plats = s.Platforms;
  if (plats === undefined) {
    return false;
  }
  const platLength = plats.length;

  for (let i = 0; i < platLength; i++) {
    const plat = plats[i];
    if (
      LineSegmentIntersection(
        ecbBottom.X,
        ecbBottom.Y,
        ecbBottom.X,
        ecbBottom.Y - ecbSensorDepth,
        plat.X1,
        plat.Y1,
        plat.X2,
        plat.Y2
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
  ecbSensorDepth: number
): number | undefined {
  const plats = s.Platforms;
  if (plats === undefined) {
    return undefined;
  }
  const platLength = plats.length;

  for (let i = 0; i < platLength; i++) {
    const plat = plats[i];
    if (
      LineSegmentIntersection(
        ecbBottom.X,
        ecbBottom.Y,
        ecbBottom.X,
        ecbBottom.Y - ecbSensorDepth,
        plat.X1,
        plat.Y1,
        plat.X2,
        plat.Y2
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
  ecbSensorDepth: number
) {
  if (PlayerOnPlats(s, ecbBottom, ecbSensorDepth)) {
    return true;
  }
  return PlayerOnStage(s, ecbBottom, ecbSensorDepth);
}

export function PlayerTouchingStageLeftWall(
  s: Stage,
  ecbRight: FlatVec,
  sensorDepth: number
) {
  const left = s.StageVerticies.GetLeftWall();
  const leftLoopLength = left.length - 1;

  for (let i = 0; i < leftLoopLength; i++) {
    const lP = left[i];
    if (
      LineSegmentIntersection(
        lP.X1,
        lP.Y1,
        lP.X2,
        lP.Y2,
        ecbRight.X,
        ecbRight.Y,
        ecbRight.X - sensorDepth,
        ecbRight.Y
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
  sensorDepth: number
) {
  const left = s.StageVerticies.GetLeftWall();
  const leftLoopLength = left.length - 1;

  for (let i = 0; i < leftLoopLength; i++) {
    const lP = left[i];
    if (
      LineSegmentIntersection(
        lP.X1,
        lP.Y1,
        lP.X2,
        lP.Y2,
        ecbLeft.X,
        ecbLeft.Y,
        ecbLeft.X + sensorDepth,
        ecbLeft.Y
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
  sensorDepth: number
) {
  const left = s.StageVerticies.GetLeftWall();
  const leftLoopLength = left.length - 1;

  for (let i = 0; i < leftLoopLength; i++) {
    const lP = left[i];
    if (
      LineSegmentIntersection(
        lP.X1,
        lP.Y1,
        lP.X2,
        lP.Y2,
        ecbTop.X,
        ecbTop.Y,
        ecbTop.X,
        ecbTop.Y + sensorDepth
      )
    ) {
      return true;
    }
  }

  return false;
}
