import HashMap from "../src/Maps/HashMap";
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



})


