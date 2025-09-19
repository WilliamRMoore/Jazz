export interface IPooledObject {
  Zero(): void;
}

//TODO:  this is NOT jit friendly.
// Replace with one large pool class that contains concrete instances of the different pool types.
export class Pool<T extends IPooledObject> {
  private poolIndex: number = 0;
  private readonly pool: Array<T>;
  private readonly constructorFunc: () => T;

  constructor(poolSize: number, constructorFunc: () => T) {
    this.pool = new Array(poolSize);
    this.constructorFunc = constructorFunc;
    for (let i = 0; i < poolSize; i++) {
      this.pool[i] = constructorFunc();
    }
  }

  Rent(): T {
    const pi = this.poolIndex;
    const p = this.pool;
    const pLength = p.length;

    if (pi < pLength) {
      const item = p[pi];
      item.Zero();
      this.poolIndex++;
      return item;
    }

    return this.constructorFunc();
  }

  Zero(): void {
    this.poolIndex = 0;
  }

  get ActiveCount(): number {
    return this.poolIndex;
  }
}
