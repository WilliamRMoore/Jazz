import { expect, test } from '@jest/globals';
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
import assert from 'assert';

test('Gravity System', () => {
  const ecs = new ECS();
  const vSys = new VelocityECSSystem(ecs);
  const gSys = new GravitySystem(ecs);

  let e1 = ecs.CreateEntity(); //Player 1
  let e2 = ecs.CreateEntity();
  e1.Attach(new PositionComponent());
  e1.Attach(new VelocityComponent());
  e1.Attach(new GravityComponent());

  // pretend we are in a new system
  let e1vc = UnboxVelocityComponent(e1.Components)!;
  let xInput = 10;
  let yInput = 5;

  e1vc.Vel.X = xInput;
  e1vc.Vel.Y = yInput;

  gSys.RunAll();
  vSys.Run();
  let e1p = UnboxPositionComponent(e1.Components);
  expect(e1p?.Pos);
  expect(e1p?.Pos?.X ?? 0 > 0);
  expect(e1p?.Pos?.Y ?? 0 > 0);
});

test('Player Entity Builder', () => {
  const ecs = new ECS();
  const extension = new ECSBuilderExtension();
  extension.Visit(ecs);

  const playerEnt = extension.BuildDefaultPlayer();

  let pPos = UnboxPositionComponent(playerEnt.Components);
  let pVel = UnboxVelocityComponent(playerEnt.Components);
});
