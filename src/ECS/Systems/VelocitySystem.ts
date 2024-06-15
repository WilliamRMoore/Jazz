import {
  PositionComponent,
  UnboxPositionComponent,
} from '../Components/Actor/Position';
import {
  UnboxVelocityComponent,
  VelocityComponent,
} from '../Components/Actor/Velocity';
import { ComponentCollection, DTO, ECS, Entity, EntityRegistry } from '../ECS';

export class VelocityECSSystem {
  ECS: EntityRegistry;
  private dto: DTO<vpdto>;
  constructor(ecs: ECS) {
    this.ECS = ecs.EntityRegistry;
    this.dto = new DTO<vpdto>({ pc: null, vc: null }, (d) => {
      d.pc = null;
      d.vc = null;
    });
  }

  Run() {
    let eid: number;
    let ent: Entity;
    let indexes = this.ECS.keys();

    for (eid of indexes) {
      ent = this.ECS.get(eid)!;
      let dto = UnboxPositionAndVelocity(ent.Components, this.dto);

      if (dto.Data.pc && dto.Data.vc) {
        dto.Data.pc.Pos.X += dto.Data.vc.Vel.X;
        dto.Data.pc.Pos.Y += dto.Data.vc.Vel.Y;
      }
    }
  }
}

export type vpdto = {
  pc: PositionComponent | null;
  vc: VelocityComponent | null;
};

function UnboxPositionAndVelocity(
  comps: ComponentCollection,
  dto: DTO<vpdto>
): DTO<vpdto> {
  dto.clear();
  dto.Data.pc = UnboxPositionComponent(comps) ?? null;
  dto.Data.vc = UnboxVelocityComponent(comps) ?? null;

  return dto;
}
