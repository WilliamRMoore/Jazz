export abstract class Visitor {
  abstract Visit(host: any): void;
}

export abstract class Vistable {
  abstract Accept(visitor: Visitor): void;
}

export abstract class EcsExtension extends Visitor {
  ecs: ECS;
  Visit(host: ECS): void {
    this.ecs = host;
  }
}

export class DTO<T> {
  Data: T;
  private clearFunc: (d: T) => void;
  constructor(data: T, clearFunc: (d: T) => void) {
    this.clearFunc = clearFunc;
    this.Data = data;
  }

  clear(): void {
    this.clearFunc(this.Data);
  }
}

export abstract class Component {
  static CompName: string;
  public CompName: string;
  EntId: number;
  abstract Attach(ent: Entity): void;
}

export class Entity {
  public readonly ID: number;
  constructor(id: number) {
    this.ID = id;
  }

  Attach(comp: Component) {
    comp.Attach(this);
  }
}

export type ComponentCollection = Map<string, Component>;
export type EntiyCollection = Map<number, ComponentCollection>;

export class ECS extends Vistable {
  public EntityRegistry: EntiyCollection;
  private currentId: number;

  constructor() {
    super();
    this.currentId = 0;
    this.EntityRegistry = new Map<number, Map<string, Component>>();
  }

  CreateEntity(): Entity {
    let newEnt = new Entity(this.GetNextId());
    this.EntityRegistry.set(newEnt.ID, new Map<string, Component>());
    return newEnt;
  }

  RegisterComponent(e: Entity, c: Component) {
    e.Attach(c);
    this.EntityRegistry.get(e.ID)!.set(c.CompName, c);
  }

  Accept(visitor: EcsExtension): void {
    visitor.Visit(this);
  }

  private GetNextId(): number {
    const newId = this.currentId;
    this.currentId++;
    return newId;
  }
}
