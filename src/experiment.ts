// class ECS {
//   private Components = new Map<string, unknown>();
//   private Entities = new Map<number, EntityToComponent>();
//   private entityGeneratorIndex = 0;

//   public CreateEntity() {
//     let id = this.GenerateId(this.entityGeneratorIndex);
//     this.entityGeneratorIndex++;
//     return id;
//   }

//   public AddComponent(cName: string, comp: unknown) {
//     this.Components.set(cName, comp);
//   }

//   public RegisterEntityToComponent(eId: number, cName: string) {

//     if (this.Entities.has(eId) && this.Components.has(cName)) {

//       const etc = this.Entities.get(eId)!;
//       etc.Components.push(this.Components.get(cName));
//       return;
//     }

//     const etc = {
//       ID: eId,
//       Components: new Array<string>(),
//     } as EntityToComponent;

//     etc.Components.push(this.Components.get(cName));

//     this.Entities.set(eId, etc);
//     return;
//   }

//   public GetEntitiesWithComponents(eId: number, components: Array<string>) {
//     const etc = this.EntitiesToComponents.get(eId);
//   }

//   public GetEntityWithAllComponents() {}

//   private GenerateId(seed: number) {
//     this.entities.push(seed);
//     return seed;
//   }
// }

// function run() {
//   let ecs = new ECS();

//   let newEntityID = ecs.CreateEntity();
// }

// type EntityToComponent = {
//   ID: Number;
//   Components: Array<unknown>;
// };
