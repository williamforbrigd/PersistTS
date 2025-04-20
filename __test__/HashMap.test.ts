import HashMap, {ctpop} from "../src/Maps/HashMap";
import {createRandomIntArray, shuffleArray} from "../src/Utils/Utils";
import Sorting from "../src/Sorting/Sorting";

/**
 * Utility: build a map with `size` distinct integer keys
 * (values are the string form of the key).
 */
function buildMap(size: number): { arr: number[]; map: HashMap<number, string> } {
    const arr = shuffleArray(Array.from({ length: size }, (_, i) => i));
    let map = HashMap.empty<number, string>();
    for (const k of arr) {
        map = map.put(k, k.toString());
    }
    return { arr, map };
}

describe('HashMap', () => {
    let map = HashMap.empty<number, string>();
    const SIZE = 10_000;
    beforeAll(() => {
        const {arr, map} = buildMap(SIZE)
    })

    test("size equals number of distinct keys and all values are retrievable", () => {
        const SIZE = 10_000;                   // keep it moderate for Jest
        const { arr, map } = buildMap(SIZE);

        expect(map.size()).toBe(SIZE);

        for (const k of arr) {
            expect(map.get(k)).toBe(k.toString());
        }
    });

    test("put returns a *new* map and never mutates the original", () => {
        const { map } = buildMap(1_000);

        const updated = map.put(123, "UPDATED");
        const extended = map.put(1001, "1001");

        expect(map.get(123)).toBe("123");
        expect(updated.get(123)).toBe("UPDATED");

        expect(updated.size()).toBe(map.size());      // updated existing key
        expect(extended.size()).toBe(map.size() + 1); // added brand‑new key
    });

    test("keys() returns every key exactly once", () => {
        const SIZE = 5_000;
        const { map } = buildMap(SIZE);

        const keys = map.keys();
        expect(keys.length).toBe(SIZE);
        expect(new Set(keys).size).toBe(SIZE);        // no duplicates
    });

    test('delete() removes a key and returns a new map', () => {
        let map = HashMap.empty<number, string>()
        const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        for (const k of arr) {
            map = map.put(k, k.toString());
        }

        expect(map.size()).toBe(arr.length);
        expect(map.get(5)).toBe('5');
        const updatedMap = map.delete(5);
        expect(updatedMap.size()).toBe(arr.length - 1);
        expect(updatedMap.get(5)).toBeUndefined();
    })

    test('delete() removes all the elements from an array', () => {
        const SIZE = 10_000;
        const { arr, map } = buildMap(SIZE);
        const keys = map.keys();

        let updatedMap = map;
        for (const key of keys) {
            updatedMap = updatedMap.delete(key);
        }
        expect(updatedMap.size()).toBe(0);
        for (const key of keys) {
            expect(updatedMap.get(key)).toBeUndefined();
        }
    })

    test('ctpop counts set bits correctly (fixed vectors + random fuzz)', () => {

        const SK5 = 0x55555555, SK3 = 0x33333333;
        const SKF0=0xF0F0F0F,SKFF=0xFF00FF;

        /** simple reference implementation */
        const slowPop = (n: number): number =>
            (n >>> 0).toString(2).split('0').join('').length; // => bit‑count


        const vectors: [number, number][] = [
            [0x00000000, 0],
            [0x00000001, 1],
            [0xffffffff, 32],
            [0xaaaaaaaa, 16],
            [0xf0f0f0f0, 16],
            [0x12345678, 13],
        ];

        for (const [val, expected] of vectors) {
            expect(ctpop(val)).toBe(expected);
        }

        for (let i = 0; i < 1_000; i++) {
            const x = Math.floor(Math.random() * 0x1_0000_0000); // 0 → 2³²‑1
            expect(ctpop(x)).toBe(slowPop(x));
        }
    });


    test('hashCode() remains stable for prior persistent versions', () => {
        const m0 = HashMap.empty<number, string>();
        const h0 = m0.hashCode();

        const m1 = m0.put(1, 'one');
        const h1_before = m1.hashCode();

        const m2 = m1.put(2, 'two');   // another structural change

        // the hashes of older versions must stay exactly the same
        expect(m0.hashCode()).toBe(h0);
        expect(m1.hashCode()).toBe(h1_before);

        // a structurally different map should usually have a different hash
        // (strict equality is not required by contract, but very likely)
        expect(m2.hashCode()).not.toBe(h1_before);
    });




})


