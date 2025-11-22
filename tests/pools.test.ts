import { Pool, IPooledObject } from '../game/engine/pools/Pool';

class MockPooledObject implements IPooledObject {
    public value: number = 0;
    public zeroCalled: number = 0;

    constructor(initialValue: number = 0){
        this.value = initialValue;
    }

    Zero(): void {
        this.value = 0;
        this.zeroCalled++;
    }
}

describe('Pool', () => {
    it('should be initialized with the correct number of items', () => {
        const pool = new Pool(10, () => new MockPooledObject());
        expect(pool.ActiveCount).toBe(0);
    });

    it('should rent an item from the pool', () => {
        const pool = new Pool(10, () => new MockPooledObject());
        const item = pool.Rent();
        expect(item).toBeInstanceOf(MockPooledObject);
        expect(pool.ActiveCount).toBe(1);
    });

    it('should call Zero on a rented item', () => {
        const pool = new Pool(10, () => new MockPooledObject(5));
        
        const item = pool.Rent();
        item.value = 10;
        
        const item2 = pool.Rent()
        item2.value = 20;

        pool.Zero();

        const rentedItem = pool.Rent();
        expect(rentedItem.value).toBe(0);
        // expect(rentedItem.zeroCalled).toBe(1); // This will be one because the pool is new
        
        rentedItem.value = 10;

        const rentedItem2 = pool.Rent();
        expect(rentedItem2.value).toBe(0);


        pool.Zero();
        const rerentedItem = pool.Rent();
        expect(rerentedItem).toBe(rentedItem);
        expect(rerentedItem.value).toBe(0);

    });

    it('should create a new item if the pool is exhausted', () => {
        const poolSize = 5;
        const pool = new Pool(poolSize, () => new MockPooledObject());
        for (let i = 0; i < poolSize; i++) {
            pool.Rent();
        }
        expect(pool.ActiveCount).toBe(poolSize);
        const extraItem = pool.Rent();
        expect(extraItem).toBeInstanceOf(MockPooledObject);
        expect(pool.ActiveCount).toBe(poolSize); // ActiveCount doesn't go above pool size
    });

    it('should reset the pool when Zero is called', () => {
        const pool = new Pool(10, () => new MockPooledObject());
        pool.Rent();
        pool.Rent();
        expect(pool.ActiveCount).toBe(2);
        pool.Zero();
        expect(pool.ActiveCount).toBe(0);
    });

    it('should reuse objects after the pool is zeroed', () => {
        const pool = new Pool(5, () => new MockPooledObject());
        const rentedItems = [];
        for (let i = 0; i < 5; i++) {
            rentedItems.push(pool.Rent());
        }

        pool.Zero();

        const rerentedItem = pool.Rent();
        expect(rerentedItem).toBe(rentedItems[0]);
    });
});
