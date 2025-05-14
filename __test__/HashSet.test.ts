import HashSet from '../src/Sets/HashSet';
import { shuffleArray, createRandomIntArray } from '../src/Utils/Utils';

describe('HashSet general tests', () => {
    let set: HashSet<number>;
    beforeAll(() => {
        for (let i = 0; i < 100; i++) {
            set = HashSet.of(1, 2, 3, 4, 5).add(i);
        }
    })

    test('HashSet of', () => {
        const set = HashSet.of(1, 2, 3, 4, 5);
        expect(set.toArray()).toEqual(expect.arrayContaining([1, 2, 3, 4, 5]));
    });

    test('add is immutable and enforces uniqueness', () => {
        const original = HashSet.of(1, 2, 3);
        const updated = original.add(3).add(4).add(4);

        // original left untouched
        expect([...original].sort()).toEqual([1, 2, 3]);

        // updated contains each element exactly once
        expect([...updated].sort()).toEqual([1, 2, 3, 4]);
    });

    test('delete is immutable and removes only the target element', () => {
        const base = HashSet.of(1, 2, 3, 4);
        const withoutTwo = base.delete(2);

        expect([...base].sort()).toEqual([1, 2, 3, 4]);
        expect([...withoutTwo].sort()).toEqual([1, 3, 4]);

        // deleting a non‑present element should be a no‑op (same instance)
        expect(base.delete(42)).toStrictEqual(base);
    });

    test('get returns strictly equal stored element', () => {
        const a = { id: 1 };
        const b = { id: 1 };

        const set = HashSet.of(a);

        expect(set.get(a)).toBe(a);          // exact reference
        expect(set.get(b)).toBeUndefined();  // different reference, same shape
    });

    test('high‑volume add/delete maintains integrity', () => {
        let s = HashSet.of<number>();
        const range = Array.from({ length: 2000 }, (_, i) => i);

        for (const n of range) s = s.add(n);
        expect([...s].length).toBe(2000);

        for (const n of range) s = s.delete(n);
        expect([...s].length).toBe(0);
    });

    test('chained operations behave correctly', () => {
        const result = HashSet.of(1, 2, 3)
            .add(4)    // {1,2,3,4}
            .delete(2) // {1,3,4}
            .add(5)    // {1,3,4,5}
            .delete(9) // no‑op
            .add(1);   // duplicate, still single 1

        expect([...result].sort()).toEqual([1, 3, 4, 5]);
    });

    test('equals() compares sets correctly', () => {
        const a = HashSet.of(1, 2, 3);
        const b = HashSet.of(1, 2, 3);
        const c = HashSet.of(1, 2, 4);
        const d = HashSet.of(3, 2, 1);

        expect(a.equals(b)).toBe(true); // same elements
        expect(a.equals(c)).toBe(false); // different elements
        expect(a.equals(HashSet.of(1, 2))).toBe(false); // different sizes
        expect(a.equals(HashSet.of(1, 2, 3, 4))).toBe(false); // different sizes
        expect(a.equals(d)).toBe(true); // same elements, different order
    })

    test('equals() method on large random array. Order does not matter', () => {
        let arr = createRandomIntArray(1000, 1000);
        let a = HashSet.of(...arr);

        arr = shuffleArray(arr)
        let b = HashSet.of(...arr);
        expect(a.equals(b)).toBe(true); // same elements, different order
    })

})