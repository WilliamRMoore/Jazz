export abstract class EcsExtension {
  ecs: ECS;
  Extend(host: ECS): void {
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
  public readonly Components = new Map<string, Component>();
  public readonly Tags = new Set<string>();
  constructor(id: number, tags: string[] | null = null) {
    this.ID = id;
    if (tags) {
      const tl = tags.length;

      for (let i = 0; i < tl; i++) {
        this.Tags.add(tags[i]);
      }
    }
  }

  Attach(comp: Component) {
    this.Components.set(comp.CompName, comp);
    comp.Attach(this);
  }
}

export type ComponentCollection = Map<string, Component>;
export type EntityRegistry = Map<number, Entity>;

export class ECS {
  public EntityRegistry: EntityRegistry;
  private currentId: number;

  constructor() {
    this.currentId = 0;
    this.EntityRegistry = new Map<number, Entity>();
  }

  CreateEntity(): Entity {
    let newEnt = new Entity(this.GetNextId());
    this.EntityRegistry.set(newEnt.ID, newEnt);
    return newEnt;
  }

  ExtendEcs(ext: EcsExtension): void {
    ext.Extend(this);
  }

  private GetNextId(): number {
    const newId = this.currentId;
    this.currentId++;
    return newId;
  }
}
