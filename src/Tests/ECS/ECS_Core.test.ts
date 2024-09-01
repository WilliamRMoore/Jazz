import { expect, test } from '@jest/globals';
import { ECS } from '../../ECS/ECS';
import {
  PositionComponent,
  UnboxPositionComponent,
} from '../../ECS/Components/Position';
import { GravityComponent } from '../../ECS/Components/Gravity';
import {
  UnboxVelocityComponent,
  VelocityComponent,
} from '../../ECS/Components/Velocity';
import {
  ECSBuilderExtension,
  UnboxedPlayer,
} from '../../ECS/Extensions/ECSBuilderExtensions';
import { ECBComponent } from '../../ECS/Components/ECB';
import { PlayerFlagsComponent } from '../../ECS/Components/PlayerStateFlags';
import { SpeedsComponent } from '../../ECS/Components/Speeds';
import { LedgeDetectorComponent } from '../../ECS/Components/LedgeDetector';
import { JumpComponent } from '../../ECS/Components/Jump';
import { CurrentStateComponent } from '../../ECS/Components/CurrentState';
import { StateMachineComponent } from '../../ECS/Components/StateMachine';

test('Attach component', () => {
  const ecs = new ECS();
  let comp = new PositionComponent();
  const ent = ecs.CreateEntity();

  expect(UnboxPositionComponent(ent.Components)).toBeUndefined;

  ent.Attach(comp);

  expect(UnboxPositionComponent(ent.Components)).toBeDefined;
});

test('Entity ID generation', () => {
  const ecs = new ECS();
  const e1 = ecs.CreateEntity();
  const e2 = ecs.CreateEntity();
  const e3 = ecs.CreateEntity();

  expect(e3.ID).toBeGreaterThan(e2.ID);
  expect(e2.ID).toBeGreaterThan(e1.ID);

  expect(e1.ID).toBe(0);
  expect(e2.ID).toBe(1);
  expect(e3.ID).toBe(2);
});

test('Player Entity Builder', () => {
  const ecs = new ECS();
  const ext = new ECSBuilderExtension();
  ecs.ExtendEcs(ext);
  const player = new UnboxedPlayer(ext.BuildDefaultPlayer());

  expect(player.PosComp).toBeInstanceOf(PositionComponent);
  expect(player.VelComp).toBeInstanceOf(VelocityComponent);
  expect(player.ECBComp).toBeInstanceOf(ECBComponent);
  expect(player.FlagsComp).toBeInstanceOf(PlayerFlagsComponent);
  expect(player.LedgeDetectorComp).toBeInstanceOf(LedgeDetectorComponent);
  expect(player.SpeedsComp).toBeInstanceOf(SpeedsComponent);
  expect(player.JumpInfoComp).toBeInstanceOf(JumpComponent);
  expect(player.GravComp).toBeInstanceOf(GravityComponent);
  expect(player.CurrentSateComp).toBeInstanceOf(CurrentStateComponent);
  expect(player.StateMachineComp).toBeInstanceOf(StateMachineComponent);
});
