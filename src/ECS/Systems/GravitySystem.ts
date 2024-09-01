import { UnboxGravityComponent } from '../Components/Gravity';
import { UnboxPlayerFlagsComponent } from '../Components/PlayerStateFlags';
import { UnboxSpeedsComponent } from '../Components/Speeds';
import {
  UnboxVelocityComponent,
  VelocityComponent,
} from '../Components/Velocity';
import { ECS, EntityRegistry } from '../ECS';
export class GravitySystem {
  EntityRegistry: EntityRegistry;
  private gravity: number = 0.5;

  constructor(ecs: ECS) {
    this.EntityRegistry = ecs.EntityRegistry;
  }

  RunAll() {
    for (let [eid, ent] of this.EntityRegistry) {
      const grav = UnboxGravityComponent(ent.Components);
      const flags = UnboxPlayerFlagsComponent(ent.Components);
      const speedInfo = UnboxSpeedsComponent(ent.Components);

      if (grav && flags && speedInfo) {
        const vc = UnboxVelocityComponent(ent.Components)!;

        if (flags.IsGrounded() || flags.IsInLedgeGrab()) {
          vc.Vel.Y = 0;
          continue;
        }

        AddClampedImpluseToPlayerForGravity(
          vc,
          speedInfo.FallSpeed,
          this.gravity
        );
        // vc.Vel.Y += this.gravity;
      }
    }
  }
}

function AddClampedImpluseToPlayerForGravity(
  vc: VelocityComponent,
  clamp: number,
  y: number
) {
  const upperBound = Math.abs(clamp);
  const pvy = vc.Vel.Y;

  if (y > 0 && pvy < upperBound) {
    const test = pvy + y;
    if (test <= upperBound) {
      vc.Vel.Y += y;
      return;
    }
    vc.Vel.Y += upperBound - pvy;
  }
}
