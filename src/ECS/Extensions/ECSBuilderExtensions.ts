import {
  GravityComponent,
  UnboxGravityComponent,
} from '../Components/Actor/Gravity';
import {
  CurrentStateComponent,
  UnboxCurrentStateComponent,
} from '../Components/Actor/Player/CurrentState';
import {
  DirectionComponent,
  UnboxDirectionComponent,
} from '../Components/Actor/Player/Direction';
import {
  ECBComponent,
  UnboxECBComponent,
} from '../Components/Actor/Player/ECB';
import {
  GroundedComponent,
  UnboxGroundedComponent,
} from '../Components/Actor/Player/Grounded';
import {
  JumpComponent,
  UnboxJumpComponent,
} from '../Components/Actor/Player/Jump';
import {
  LedgeDetectorComponent,
  UnboxLedgeDetectorComponent,
} from '../Components/Actor/Player/LedgeDetector';
import { SpeedsComponentBuilder } from '../Components/Actor/Player/Speeds';
import {
  StageCollisionResultComponent,
  UnboxStageCollisionResultComponent,
} from '../Components/Actor/Player/StageCollisionResult';
import {
  PositionComponent,
  UnboxPositionComponent,
} from '../Components/Actor/Position';
import {
  UnboxVelocityComponent,
  VelocityComponent,
} from '../Components/Actor/Velocity';
import { EcsExtension, Entity } from '../ECS';

export class ECSBuilderExtension extends EcsExtension {
  BuildDefaultPlayer() {
    const ent = this.ecs.CreateEntity();

    let speedsCompBuilder = new SpeedsComponentBuilder();

    speedsCompBuilder.SetAerialSpeeds(0.8, 10);
    speedsCompBuilder.SetFallSpeeds(15, 10);
    speedsCompBuilder.SetRunSpeeds(18, 12);
    speedsCompBuilder.SetWalkSpeeds(12, 5);

    let speedsComp = speedsCompBuilder.Build();

    ent.Attach(speedsComp);
    ent.Attach(new PositionComponent());
    ent.Attach(new VelocityComponent());
    ent.Attach(new GravityComponent());
    ent.Attach(new DirectionComponent());
    ent.Attach(new JumpComponent(20));
    ent.Attach(new GroundedComponent());
    ent.Attach(new CurrentStateComponent());
    ent.Attach(new ECBComponent());
    ent.Attach(new LedgeDetectorComponent(0, 0, 30, 70));
    ent.Attach(new StageCollisionResultComponent());

    return ent;
  }
}

export class UnboxedPlayer {
  public Id: number;
  public PosComp: PositionComponent;
  public VelComp: VelocityComponent;
  public GravComp: GravityComponent;
  public DirectionComp: DirectionComponent;
  public JumpInfoComp: JumpComponent;
  public GroundedComp: GroundedComponent;
  public CurrentSateComp: CurrentStateComponent;
  public ECBComp: ECBComponent;
  public LedgeDetectorComp: LedgeDetectorComponent;
  public StageColResComp: StageCollisionResultComponent;

  constructor(playerEnt: Entity) {
    this.Id = playerEnt.ID;
    this.PosComp = UnboxPositionComponent(playerEnt.Components)!;
    this.VelComp = UnboxVelocityComponent(playerEnt.Components)!;
    this.GravComp = UnboxGravityComponent(playerEnt.Components)!;
    this.DirectionComp = UnboxDirectionComponent(playerEnt.Components)!;
    this.JumpInfoComp = UnboxJumpComponent(playerEnt.Components)!;
    this.GroundedComp = UnboxGroundedComponent(playerEnt.Components)!;
    this.CurrentSateComp = UnboxCurrentStateComponent(playerEnt.Components)!;
    this.ECBComp = UnboxECBComponent(playerEnt.Components)!;
    this.LedgeDetectorComp = UnboxLedgeDetectorComponent(playerEnt.Components)!;
    this.StageColResComp = UnboxStageCollisionResultComponent(
      playerEnt.Components
    )!;
  }
}
