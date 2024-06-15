import { UnboxGravityComponent } from '../Components/Actor/Gravity';
import { UnboxVelocityComponent } from '../Components/Actor/Velocity';
import { ECS, EntityRegistry } from '../ECS';
export class GravitySystem {
  EntityRegistry: EntityRegistry;
  private gravity: number = 0.5;

  constructor(ecs: ECS) {
    this.EntityRegistry = ecs.EntityRegistry;
  }

  RunAll() {
    for (let [eid, ent] of this.EntityRegistry) {
      let grav = UnboxGravityComponent(ent.Components);
      if (grav) {
        let vc = UnboxVelocityComponent(ent.Components)!;
        vc.Vel.Y += this.gravity;
      }
    }
  }
}
