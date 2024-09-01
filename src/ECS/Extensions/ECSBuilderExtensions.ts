import { MakeStateMachine } from '../../Game/State/EcsStateMachine';
import { GravityComponent, UnboxGravityComponent } from '../Components/Gravity';
import {
  CurrentStateComponent,
  UnboxCurrentStateComponent,
} from '../Components/CurrentState';
import { ECBComponent, UnboxECBComponent } from '../Components/ECB';
import { JumpComponent, UnboxJumpComponent } from '../Components/Jump';
import {
  LedgeDetectorComponent,
  UnboxLedgeDetectorComponent,
} from '../Components/LedgeDetector';
import {
  PlayerFlagsComponent,
  UnboxPlayerFlagsComponent,
} from '../Components/PlayerStateFlags';
import {
  SpeedsComponent,
  SpeedsComponentBuilder,
  UnboxSpeedsComponent,
} from '../Components/Speeds';
import {
  StateMachineComponent,
  UnboxStateMachineComponent,
} from '../Components/StateMachine';
import {
  PositionComponent,
  UnboxPositionComponent,
} from '../Components/Position';
import {
  UnboxVelocityComponent,
  VelocityComponent,
} from '../Components/Velocity';
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

    ent.Attach(new PositionComponent());
    ent.Attach(new VelocityComponent());
    ent.Attach(new GravityComponent());
    ent.Attach(new PlayerFlagsComponent());
    ent.Attach(new JumpComponent(20));
    ent.Attach(new CurrentStateComponent());
    ent.Attach(new ECBComponent());
    ent.Attach(new LedgeDetectorComponent(0, 0, 30, 70));
    ent.Attach(speedsComp); // SpeedsComponent
    MakeStateMachine(ent); // StateMachineComponent

    return ent;
  }
}

export class UnboxedPlayer {
  public Entity: Entity;
  public PosComp: PositionComponent;
  public VelComp: VelocityComponent;
  public GravComp: GravityComponent;
  public FlagsComp: PlayerFlagsComponent;
  public JumpInfoComp: JumpComponent;
  public CurrentSateComp: CurrentStateComponent;
  public ECBComp: ECBComponent;
  public LedgeDetectorComp: LedgeDetectorComponent;
  public SpeedsComp: SpeedsComponent;
  public StateMachineComp: StateMachineComponent;

  constructor(playerEnt: Entity) {
    this.Entity = playerEnt;
    this.PosComp = UnboxPositionComponent(playerEnt.Components)!;
    this.VelComp = UnboxVelocityComponent(playerEnt.Components)!;
    this.GravComp = UnboxGravityComponent(playerEnt.Components)!;
    this.FlagsComp = UnboxPlayerFlagsComponent(playerEnt.Components)!;
    this.JumpInfoComp = UnboxJumpComponent(playerEnt.Components)!;
    this.CurrentSateComp = UnboxCurrentStateComponent(playerEnt.Components)!;
    this.ECBComp = UnboxECBComponent(playerEnt.Components)!;
    this.LedgeDetectorComp = UnboxLedgeDetectorComponent(playerEnt.Components)!;
    this.SpeedsComp = UnboxSpeedsComponent(playerEnt.Components)!;
    this.StateMachineComp = UnboxStateMachineComponent(playerEnt.Components)!;
  }

  public UpdatePlayerPosition(x: number, y: number) {
    const pos = this.PosComp.Pos;
    pos.X = x;
    pos.Y = y;
    this.ECBComp.MoveToPosition(x, y);
    this.LedgeDetectorComp.MoveTo(x, y);
  }

  public AddToPlayerPosition(vx: number, vy: number) {
    const pos = this.PosComp.Pos;
    pos.X += vx;
    pos.Y += vy;
    const posX = pos.X;
    const posY = pos.Y;
    this.ECBComp.MoveToPosition(posX, posY);
    this.LedgeDetectorComp.MoveTo(posX, posY);
  }
}
