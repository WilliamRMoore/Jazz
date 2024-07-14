import { ECS, Entity } from '../../ECS/ECS';
import { ECSBuilderExtension } from '../../ECS/Extensions/ECSBuilderExtensions';
import { InputStorageManager } from '../../input/InputStorageManager';
import {
  InputAction,
  InputActionPacket,
  InvalidGuessSpec,
} from '../../input/GamePadInput';
import { FrameStorageManager } from '../../network/FrameStorageManager';
import { FrameComparisonManager } from '../../network/FrameComparisonManager';
import { RollBackManager } from '../../network/rollBackManager';
import { SyncroManager } from '../../network/SyncroManager';
import { InitStageManinComponent } from '../../ECS/Components/StageMain';
import { StageCollisionSystem } from '../../ECS/Systems/StageCollisionSystem';
import { LedgeDetectionSystem } from '../../ECS/Systems/LedgeDetectionSystem';
import { GravitySystem } from '../../ECS/Systems/GravitySystem';
import { PlayerVelocityECSSystem } from '../../ECS/Systems/VelocitySystem';

export function initLoop() {
  console.log('init');
  const ecs = new ECS();
  const extension = new ECSBuilderExtension();
  extension.Visit(ecs);

  const playerEnt = extension.BuildDefaultPlayer();
  const players = new Array<Entity>();
  players.push(playerEnt);
  const stageEnt = ecs.CreateEntity();
  stageEnt.Attach(InitStageManinComponent());
  const ism = new InputStorageManager(InvalidGuessSpec);
  const fsm = new FrameStorageManager();

  const SCS = new StageCollisionSystem(stageEnt, players);
  const LDS = new LedgeDetectionSystem(stageEnt, players);
  const PGS = new GravitySystem(ecs);
  const PVS = new PlayerVelocityECSSystem(players);
}
