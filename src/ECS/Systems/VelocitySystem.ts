import { PositionComponent } from '../Components/Actor/Position';
import { VelocityComponent } from '../Components/Actor/Velocity';
import {
  ComponentCollection,
  DTO,
  ECS,
  EcsExtension,
  EntiyCollection,
} from '../ECS';

export class VelocityECSSystem {
  ECS: EntiyCollection;
  Extensions: VelocityECSExtension;
  constructor(ecs: ECS) {
    let ex = new VelocityECSExtension();
    ex.Visit(ecs);
    this.Extensions = ex;
    this.ECS = ecs.EntityRegistry;
  }

  RunAll() {
    for (let [eid, comps] of this.ECS) {
      let dto = this.Extensions.GetPosAndVel(comps);
      let res = dto.Data;

      if (res.pc && res.vc) {
        res.pc.Pos.X += res.vc.Vel.X;
        res.pc.Pos.Y += res.vc.Vel.Y;
      }
    }
  }
}

export type vpdto = {
  pc: PositionComponent | null;
  vc: VelocityComponent | null;
};

export class VelocityECSExtension extends EcsExtension {
  private dto: DTO<vpdto>;
  constructor() {
    super();
    this.dto = new DTO<vpdto>({ pc: null, vc: null }, (d) => {
      d.pc = null;
      d.vc = null;
    });
  }

  GetPosAndVel(comps: ComponentCollection): DTO<vpdto> {
    this.dto.clear();
    this.dto.Data.pc = this.UnboxPos(comps);
    this.dto.Data.vc = this.UnboxVel(comps);
    return this.dto;
  }

  UnboxPos(comps: ComponentCollection): PositionComponent {
    return comps.get(PositionComponent.CompName) as PositionComponent;
  }

  UnboxVel(comps: ComponentCollection) {
    return comps.get(VelocityComponent.CompName) as VelocityComponent;
  }
}
