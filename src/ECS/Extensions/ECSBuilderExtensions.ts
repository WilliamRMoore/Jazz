import { FlatVec } from '../../Physics/FlatVec';
import { GravityComponent } from '../Components/Actor/Gravity';
import { CurrentStateComponent } from '../Components/Actor/Player/CurrentState';
import { DirectionComponent } from '../Components/Actor/Player/Direction';
import { ECBComponent } from '../Components/Actor/Player/ECB';
import { GroundedComponent } from '../Components/Actor/Player/Grounded';
import { JumpComponent } from '../Components/Actor/Player/Jump';
import { LedgeDetectorComponent } from '../Components/Actor/Player/LedgeDetector';
import {
  SpeedsComponent,
  SpeedsComponentBuilder,
} from '../Components/Actor/Player/Speeds';
import { PositionComponent } from '../Components/Actor/Position';
import { VelocityComponent } from '../Components/Actor/Velocity';
import { EcsExtension } from '../ECS';

export class ECSBuilderExtension extends EcsExtension {
  BuildDefaultPlayer() {
    const ent = this.ecs.CreateEntity();

    let speedsCompBuilder = new SpeedsComponentBuilder();

    speedsCompBuilder.SetAerialSpeeds(0.8, 10);
    speedsCompBuilder.SetFallSpeeds(15, 10);
    speedsCompBuilder.SetRunSpeeds(18, 12);
    speedsCompBuilder.SetWalkSpeeds(12, 5);

    let speedsComp = speedsCompBuilder.Build();

    this.ecs.RegisterComponent(ent, speedsComp);
    this.ecs.RegisterComponent(ent, new PositionComponent());
    this.ecs.RegisterComponent(ent, new VelocityComponent());
    this.ecs.RegisterComponent(ent, new GravityComponent());
    this.ecs.RegisterComponent(ent, new DirectionComponent());
    this.ecs.RegisterComponent(ent, new JumpComponent(20));
    this.ecs.RegisterComponent(ent, new GroundedComponent());
    this.ecs.RegisterComponent(ent, new CurrentStateComponent());
    this.ecs.RegisterComponent(ent, new ECBComponent());
    this.ecs.RegisterComponent(ent, new LedgeDetectorComponent(0, 0, 30, 70));

    return ent;
  }
}
