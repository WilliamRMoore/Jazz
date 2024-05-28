import { StageMainComponent } from '../Components/StageMain';
import {
  ComponentCollection,
  ECS,
  EcsExtension,
  EntiyCollection,
} from '../ECS';

export class StageCollisionSystem {
  private StageMain: ComponentCollection;
  private Players: EntiyCollection = new Map<number, ComponentCollection>();

  constructor(ecs: ECS, stageEntId: number, playerIds: Array<number>) {
    playerIds.forEach((x) => this.Players.set(x, ecs.EntityRegistry.get(x)!));
    this.StageMain = ecs.EntityRegistry.get(stageEntId)!;
  }
}
