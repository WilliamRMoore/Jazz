import { FlatVec, VectorAllocator } from '../../../../Physics/FlatVec';
import { Component, ComponentCollection, Entity } from '../../../ECS';

export class StageCollisionResultComponent extends Component {
  static CompName = 'StageColRes';
  public CompName = StageCollisionResultComponent.CompName;
  EntId: number = -1;
  private CollisionOccured: boolean = false;
  private Resolution: FlatVec = VectorAllocator();

  Attach(ent: Entity): void {
    this.EntId = ent.ID;
  }

  Clear(): void {
    this.Resolution.X = 0;
    this.Resolution.Y = 0;
    this.CollisionOccured = false;
  }

  Set(resolution: FlatVec): void {
    this.CollisionOccured = true;
    this.Resolution.X = resolution.X;
    this.Resolution.Y = resolution.Y;
  }

  DidCollisionOccure(): boolean {
    return this.CollisionOccured;
  }

  GetResolution(): FlatVec {
    return this.Resolution;
  }
}

export function UnboxStageCollisionResultComponent(
  comps: ComponentCollection
): StageCollisionResultComponent | undefined {
  return comps.get(StageCollisionResultComponent.CompName) as
    | StageCollisionResultComponent
    | undefined;
}
