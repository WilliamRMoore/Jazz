import { test } from '@jest/globals';
import { ECS } from '../../ECS/ECS';
import { VelocityECSSystem } from '../../ECS/Systems/VelocitySystem';
import { GravitySystem } from '../../ECS/Systems/GravitySystem';
import {
  PositionComponent,
  UnboxPositionComponent,
} from '../../ECS/Components/Actor/Position';
import { GravityComponent } from '../../ECS/Components/Actor/Gravity';
import {
  UnboxVelocityComponent,
  VelocityComponent,
} from '../../ECS/Components/Actor/Velocity';
import { ECSBuilderExtension } from '../../ECS/Extensions/ECSBuilderExtensions';

test('Gravity System', () => {
  const ecs = new ECS();
  const vSys = new VelocityECSSystem(ecs);
  const gSys = new GravitySystem(ecs);

  let e1 = ecs.CreateEntity(); //Player 1
  let e2 = ecs.CreateEntity();
  ecs.RegisterComponent(e1, new PositionComponent());
  ecs.RegisterComponent(e1, new VelocityComponent());
  ecs.RegisterComponent(e1, new GravityComponent());

  // pretend we are in a new system
  let e1vc = ecs.EntityRegistry.get(e1.ID)!.get(
    VelocityComponent.CompName
  ) as VelocityComponent;
  let xInput = 10;
  let yInput = 5;

  e1vc.Vel.X = xInput;
  e1vc.Vel.Y = yInput;

  gSys.RunAll();
  vSys.RunAll();
});

test('Player Entity Builder', () => {
  const ecs = new ECS();
  const extension = new ECSBuilderExtension();
  extension.Visit(ecs);

  const playerEnt = extension.BuildDefaultPlayer();

  const compList = ecs.EntityRegistry.get(playerEnt.ID)!;
  let pPos = UnboxPositionComponent(compList);
  let pVel = UnboxVelocityComponent(compList);
});
