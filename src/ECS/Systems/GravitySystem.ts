import {
  GravityComponent,
  UnboxGravityComponent,
} from '../Components/Actor/Gravity';
import {
  ComponentCollection,
  DTO,
  ECS,
  EcsExtension,
  EntiyCollection,
} from '../ECS';
import { VelocityECSExtension } from './VelocitySystem';

export class GravitySystem {
  ECS: EntiyCollection;
  VelExt: VelocityECSExtension;
  private gravity: number = 0.5;

  constructor(ecs: ECS) {
    this.ECS = ecs.EntityRegistry;
    this.VelExt = new VelocityECSExtension();
    this.VelExt.Visit(ecs);
  }

  RunAll() {
    for (let [eid, comps] of this.ECS) {
      let grav = UnboxGravityComponent(comps);
      if (grav) {
        let vc = this.VelExt.UnboxVel(comps);
        vc.Vel.Y += this.gravity;
      }
    }
  }
}
