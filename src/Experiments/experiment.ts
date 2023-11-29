export class ECS {
  private Entites = new Map<number, entity>();
  private ComponentsSingltons = new Map<string, unknown>();
  private ComponentFactories = new Map<string, unknown>();
  private nextEntityID = 0;

  public CreateEntiity() {
    const id = this.nextEntityID;
    const e = { ID: id, Components: new Map<string, unknown>() } as entity;
    this.nextEntityID++;
    this.Entites.set(id, e);

    return id;
  }

  public RegisterSingletonComponent(cName: string, component: unknown) {
    this.ComponentsSingltons.set(cName, component);
  }

  public RegisterComponentFactory(cName: string, factory: () => unknown) {
    this.ComponentFactories.set(cName, factory);
  }

  public AddSingltonComponentToEntityID(id: number, cName: string) {
    const e = this.Entites.get(id);
    const comp = this.ComponentsSingltons.get(cName);
    e!.Components.set(cName, comp!);
  }

  public AddComponentToEntityID(id: number, cName: string) {
    const e = this.Entites.get(id);
    const comp = (this.ComponentFactories.get(cName) as () => unknown)();
    e?.Components.set(cName, comp);
  }

  public QueryECS(cName: string) {
    let res = new Map<number, entity>();

    this.Entites.forEach((value, key) => {
      if (value.Components.has(cName)) {
        res.set(key, value);
      }
    });

    return res;
  }
}

export type component = {
  x: number;
  y: number;
};

export type position = {
  x: number;
  y: number;
};

export type velocity = {
  xv: number;
  yv: number;
};

export type entity = {
  ID: number;
  Components: Map<string, unknown>;
};

class MixInECS {}
