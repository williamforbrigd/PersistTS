import HashMap, {ctpop} from "../src/Maps/HashMap";
import {createRandomIntArray, shuffleArray} from "../src/Utils/Utils";

/**
 * Utility: build a map with `size` distinct integer keys
 * (values are the string form of the key).
 */
function buildMap(size: number): { arr: number[]; map: HashMap<number, string> } {
    const arr = shuffleArray(Array.from({ length: size }, (_, i) => i));
    let map = HashMap.empty<number, string>();
    for (const k of arr) {
        map = map.set(k, k.toString());
    }
    return { arr, map };
}

/**
 * This test is inspired by the properties described in Bagwell's "Ideal Hash Trees" paper. 
 * A single update in HAMT must create only O(log_32 N) new nodes while sharing the rest with prior versions.
 * This test checks that:
 *      1. Earlier versions are never mutated.
 *      2. Successive versions re-use >= 95 % of their internal nodes.
 */
describe('HashMap persistencen and structural sharing', () => {
    test("updates creates new versions that share most nodes", () => {
        const SIZE = 1024;

        let m0 = HashMap.empty<number, number>();
        for (let i=0; i < SIZE; i++) {
            m0 = m0.set(i, i);
        }
        const n0 = m0.entriesNode();

        const m1 = m0.set(0, 999);
        const n1 = m1.entriesNode();

        const m2 = m1.set(SIZE-1, 123);
        const n2 = m2.entriesNode();

        const m3 = m2.delete(1);
        const n3 = m3.entriesNode();

        // count the shared object references between two node arrays.
        const shared = (a: any[], b: any[]) => a.filter(x => b.includes(x)).length;


        // expect more than 95 % of the nodes to be shared between successive versions
        expect(shared(n0, n1)).toBeGreaterThanOrEqual(Math.floor(n0.length * 0.95));
        expect(shared(n1, n2)).toBeGreaterThanOrEqual(Math.floor(n1.length * 0.95));
        expect(shared(n2, n3)).toBeGreaterThanOrEqual(Math.floor(n2.length * 0.95));

        // expect that the number of shared nodes are not 100 %, because something has changed
        expect(shared(n0, n1)).not.toBeGreaterThanOrEqual(Math.floor(n0.length * 1));
        expect(shared(n1, n2)).not.toBeGreaterThanOrEqual(Math.floor(n1.length * 1));
        expect(shared(n2, n3)).not.toBeGreaterThanOrEqual(Math.floor(n2.length * 1));

        // earlier versions must remain semantically the same
        expect(m0.get(0)).toBe(0);
        expect(m0.size()).toBe(SIZE);

        expect(m1.get(0)).toBe(999);
        expect(m1.size()).toBe(SIZE);

        expect(m2.get(SIZE-1)).toBe(123);
        expect(m2.size()).toBe(SIZE);

        expect(m3.has(1)).toBe(false);
        expect(m3.size()).toBe(SIZE-1);
    })
})

describe('HashMap general tests', () => {

    test("size equals number of distinct keys and all values are retrievable", () => {
        const SIZE = 10_000;                   // keep it moderate for Jest
        const { arr, map } = buildMap(SIZE);

        expect(map.size()).toBe(SIZE);

        for (const k of arr) {
            expect(map.get(k)).toBe(k.toString());
        }
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
            map = map.set(k, k.toString());
        }

        expect(map.size()).toBe(arr.length);
        expect(map.get(5)).toBe('5');
        const updatedMap = map.delete(5);
        expect(updatedMap.size()).toBe(arr.length - 1);
        expect(updatedMap.get(5)).toBeUndefined();
    })

    test('delete() removes all the elements from an array', () => {
        const SIZE = 10_000;
        const { map } = buildMap(SIZE);
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

        const m1 = m0.set(1, 'one');
        const h1_before = m1.hashCode();

        const m2 = m1.set(2, 'two');   // another structural change

        // the hashes of older versions must stay exactly the same
        expect(m0.hashCode()).toBe(h0);
        expect(m1.hashCode()).toBe(h1_before);

        // a structurally different map should usually have a different hash
        // (strict equality is not required by contract, but very likely)
        expect(m2.hashCode()).not.toBe(h1_before);
    });

    test('equals() compares two maps for equality', () => {
        const m0 = HashMap.empty<number, string>();
        const m1 = m0.set(1, 'one');
        const m2 = m1.set(2, 'two');

        expect(m0.equals(m0)).toBe(true); // identical
        expect(m1.equals(m1)).toBe(true);
        expect(m2.equals(m2)).toBe(true);

        expect(m0.equals(m1)).toBe(false); // different
        expect(m1.equals(m2)).toBe(false);

        const m3 = HashMap.empty<number, string>().set(1, 'one').set(2, 'two');
        expect(m3.equals(m2)).toBe(true); // structurally equal
    })
})

describe("HashMap set()",() => {
    let map: HashMap<number, string>;

    beforeEach(() => {
        map = HashMap.empty<number, string>();
    })

    test("set() returns a *new* map and never mutates the original", () => {
        const { map } = buildMap(1_000);

        const updated = map.set(123, "UPDATED");
        const extended = map.set(1001, "1001");

        expect(map.get(123)).toBe("123");
        expect(updated.get(123)).toBe("UPDATED");

        expect(updated.size()).toBe(map.size());      // updated existing key
        expect(extended.size()).toBe(map.size() + 1); // added brand‑new key
    });

    test('set new key increases size', () => {
        const m1 = map.set(1, "one");
        expect(m1.size()).toBe(1);
        expect(map.size()).toBe(0);
    });

    test('set existing key updates value without changing size', () => {
        const m1 = map.set(1, "one");
        const m2 = m1.set(1, "uno");
        expect(m2.size()).toBe(1);
        expect(m2.get(1)).toBe("uno");
    });

    test('setAll adds multiple entries', () => {
        const map = HashMap.empty<number, string>();
        const arr: [number, string][] = createRandomIntArray(1000).map(num => [num, num.toString()]);
        const m = map.setAll(arr as Iterable<[number, string]>);

        // go through the iterable and check that every element is set
        for (const [k, v] of arr) {
            expect(m.get(k)).toEqual(v);
        }
    });
})

describe('HashMap get()', () => {
    let map: HashMap<number, string>;
    beforeEach(() => {
        map = HashMap.of([1, "one"], [2, "two"]);
    });

    test('get returns correct value', () => {
        expect(map.get(1)).toBe("one");
        expect(map.get(2)).toBe("two");
    });

    test('get returns undefined for missing key', () => {
        expect(map.get(3)).toBeUndefined();
    });
});

describe('HashMap delete()', () => {
    let map: HashMap<number, string>;
    beforeEach(() => {
        map = HashMap.of([1, "one"], [2, "two"]);
    });

    test('delete existing key removes it', () => {
        const m1 = map.delete(1);
        expect(m1.has(1)).toBe(false);
        expect(m1.size()).toBe(1);
    });

    test('delete missing key returns same instance', () => {
        const m1 = map.delete(3);
        expect(m1).toBe(map);
    });

    test('deleteAll removes multiple entries', () => {
        let map = HashMap.of([1, "one"], [2, "two"], [3, "three"]);
        map = map.deleteAll([1, 3]);
        expect(map.has(1)).toBe(false);
        expect(map.has(3)).toBe(false);
        expect(map.size()).toBe(1);
    });

    test('delete method deletes all entries when used in loop', () => {
        const entries: [number, string][] = createRandomIntArray(10_000).map(num => [num, num.toString()]);
        let map = HashMap.of(...entries);

        expect(map.size()).not.toBe(0);
        for (const [k, _] of entries) {
            map = map.delete(k);
        }
        expect(map.size()).toBe(0);
        expect(map.isEmpty()).toBeTruthy();
    })

    test('deleteAll method deletes all entries', () => {
        const keys = createRandomIntArray(10_000);
        const entries: [number, string][] = keys.map(num => [num, num.toString()]);
        let map = HashMap.of(...entries);

        expect(map.size()).not.toBe(0);
        map = map.deleteAll(keys);
        expect(map.size()).toBe(0);
        expect(map.isEmpty()).toBeTruthy();
    })
});


describe('HashMap size(), isEmpty()', () => {
    test('empty map has size 0 and isEmpty true', () => {
        const map = HashMap.empty<number, string>();
        expect(map.size()).toBe(0);
        expect(map.isEmpty()).toBe(true);
    });

    test('non-empty map has isEmpty false', () => {
        const map = HashMap.of([1, "one"]);
        expect(map.isEmpty()).toBe(false);
    });
});

describe('HashMap clear()', () => {
    test('clear returns an empty map', () => {
        const map = HashMap.of([1, "one"], [2, "two"]);
        const m1 = map.clear();
        expect(m1.size()).toBe(0);
    });
});


describe('HashMap keys(), values(), entries()', () => {
    const entries = [[1, "one"], [2, "two"], [3, "three"]] as [number, string][];
    const map = HashMap.of(...entries);

    test('keys returns all keys', () => {
        expect(map.keys().sort()).toEqual([1, 2, 3].sort());
    });

    test('values returns all values', () => {
        expect(map.values().sort()).toEqual(["one", "two", "three"].sort());
    });

    test('entries returns all entries', () => {
        expect(map.entries().sort()).toEqual(entries.sort());
    });
});

describe('HashMap has(), hasValue(), hasAll()', () => {
    const map = HashMap.of([1, "one"], [2, "two"], [3, "three"]);

    test('has returns true for existing key', () => {
        expect(map.has(2)).toBe(true);
        expect(map.has(4)).toBe(false);
    });

    test('hasValue returns true for existing value', () => {
        expect(map.hasValue("two")).toBe(true);
        expect(map.hasValue("four")).toBe(false);
    });

    test('hasAll returns true if all keys exist', () => {
        expect(map.hasAll([1, 3])).toBe(true);
        expect(map.hasAll([1, 4])).toBe(false);
    });
});

describe('HashMap getOrDefault(), computeIfAbsent, computeIfPresent, compute()', () => {
    let map = HashMap.of([1, "one"]);

    test('getOrDefault returns default for missing key', () => {
        expect(map.getOrDefault(2, "default")).toBe("default");
    });

    test('computeIfAbsent adds and returns computed value', () => {
        const [m, v] = map.computeIfAbsent(2, k => k.toString());
        expect(v).toBe("2");
        expect(m.get(2)).toBe("2");
    });

    test('computeIfPresent updates existing key', () => {
        const [m, v] = map.computeIfPresent(1, (k, v) => v + "!");
        expect(v).toBe("one!");
        expect(m.get(1)).toBe("one!");
    });

    test('computeIfPresent does nothing for missing key', () => {
        const [m, v] = map.computeIfPresent(3, _ => "x");
        expect(m).toBe(map);
        expect(v).toBeUndefined();
    });

    //TODO look at compute
    test('compute updates or adds', () => {
        const [_, v1] = map.compute(1, (k, v) => v + "?");
        expect(v1).toBe("one?");
        /*
        const [m2, v2] = map.compute(3, (k, v) => v + v);
        expect(v2).toBe(6);
        expect(m2.get(3)).toBe(6);

         */
    });
});

describe("HashMap copyOf()", () => {
    test('copyOf create a new instance with the same entries', () => {
        const original = HashMap.of([1, "one"], [2, "two"]);
        const copy = original.copyOf(original);

        expect(copy.size()).toBe(original.size());
        expect(copy.get(1)).toBe(original.get(1));
        expect(copy.get(2)).toBe(original.get(2));
    })
})

describe('HashMap every(), some()', () => {
    const map = HashMap.of([1, 2], [2, 4], [3, 6]);

    test('every returns true if all satisfy', () => {
        expect(map.every(v => v % 2 === 0)).toBe(true);
        expect(map.every(v => v > 2)).toBe(false);
    });

    test('some returns true if any satisfy', () => {
        expect(map.some(v => v > 5)).toBe(true);
        expect(map.some(v => v > 10)).toBe(false);
    });
});

describe('HashMap sort() and sortBy()', () => {
    const map = HashMap.of([3, "c"], [1, "a"], [2, "b"]);

    test('sort returns map sorted by key', () => {
        const sorted = map.sort();
        expect(sorted.entries()).toEqual([[1, "a"], [2, "b"], [3, "c"]]);
    });

    // test('sortBy sort by values', () => {
    //     const map = HashMap.of([1, "b"], [3, "a"], [2, "c"]);
    //     const sorted = map.sortBy(v => v);
    //     expect(sorted.entries()).toEqual([[3, "a"], [1, "b"], [2, "c"]]);
    // });
});

describe('HashMap forEach()', () => {
    test('forEach iterates over all entries', () => {
        const map = HashMap.of([1, "one"], [2, "two"]);
        const results: string[] = [];
        map.forEach(v => results.push(v));
        expect(results.sort()).toEqual(["one", "two"]);
    });
});

describe('HashMap find()', () => {
    test('find returns first matching value', () => {
        const map = HashMap.of([1, 2], [2, 4], [3, 6]);
        expect(map.find((v) => v > 3)).toBe(4);
        expect(map.find((v) => v > 10)).toBeUndefined();
    });

    test('find returns undefined for empty map', () => {
        const map = HashMap.empty<number, string>();
        expect(map.find((_, k) => k > 0)).toBeUndefined();
    });
});

describe('HashMap reduce() and reduceRight()', () => {
    const map = HashMap.of([1, 1], [2, 2], [3, 3]);

    test('reduce sums values left to right', () => {
        expect(map.reduce((acc, v) => acc + v, 0)).toBe(6);
    });

    test('reduceRight sums values right to left', () => {
        expect(map.reduceRight((acc, v) => acc + v, 0)).toBe(6);
    });
});

describe('HashMap updateOrAdd()', () => {
    let map = HashMap.of([1, 1]);

    test('updateOrAdd updates existing', () => {
        const m = map.updateOrAdd(1, v => v + 1);
        expect(m.get(1)).toBe(2);
    });

    test('updateOrAdd adds new', () => {
        const m = map.updateOrAdd(2, () => 10);
        expect(m.get(2)).toBe(10);
    });
});

describe('HashMap merge(), concat(), mergeWith()', () => {
    const m1 = HashMap.of([1, 1], [2, 2]);
    const m2 = HashMap.of([2, 20], [3, 3]);

    test('merge combines maps, later wins', () => {
        const m = m1.merge(m2);
        expect(m.get(1)).toBe(1);
        expect(m.get(2)).toBe(20);
        expect(m.get(3)).toBe(3);
    });

    test('concat behaves like merge', () => {
        const m = m1.concat(m2);
        expect(m.get(3)).toBe(3);
    });

    test('mergeWith another HashMap resolves conflicts with callback', () => {
        const m = m1.mergeWith((a, b) => a + b, m2);
        expect(m.get(2)).toBe(22);
    });

    test('mergeWith another iterable', () => {
        const iter: [number, number][] = [[2, 22], [3, 33]];
        const m = m1.mergeWith((a, b) => a + b, iter);
        expect(m.get(1)).toBe(1);
        expect(m.get(2)).toBe(24);
        expect(m.get(3)).toBe(33);
    })

    test('mergeWith another object', () => {
        const obj = { 2: 22, 3: 33 };
        const m = m1.mergeWith((a, b) => a + b, obj);
        expect(m.get(1)).toBe(1);
        expect(m.get(2)).toBe(24);
        expect(m.get(3)).toBe(33);
    })
});

describe('HashMap map(), mapKeys(), mapEntries(), flatMap()', () => {
    const map = HashMap.of([1, 10], [2, 20]);

    test('map transforms values', () => {
        const m = map.map(v => v / 10);
        expect(m.get(1)).toBe(1);
        expect(m.get(2)).toBe(2);
    });

    test('mapKeys transforms keys', () => {
        const m = map.mapKeys(k => k * 10);
        expect(m.has(10)).toBe(true);
        expect(m.has(20)).toBe(true);

        // check that the values does not change
        expect(m.get(10)).toBe(10);
        expect(map.get(1)).toBe(10)

        expect(m.get(20)).toBe(20);
        expect(map.get(2)).toBe(20);
    });

    test('mapEntries transforms entries', () => {
        const m = map.mapEntries(([k, v]) => [k * 3, v / 10]);
        expect(m.get(3)).toBe(1);
        expect(m.get(6)).toBe(2);
    });

    test('flatMap flattens', () => {
        //const m = HashMap.of(["a", 1]).flatMap((v, k) => [[k + "1", v + 1]]);
        //expect(m.get("a1")).toBe(2);
        const m = HashMap.of([1, 10], [2, 20])
            .flatMap((value, key) => {
                const newKey = key * 2;
                const newValue = value + 1;
                return HashMap.of([newKey, newValue]);
            });
        expect(m.get(2)).toBe(11);
        expect(m.get(4)).toBe(21);
    });
});

describe('HashMap filter() and partition()', () => {
    const map = HashMap.of([1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8]);

    test('filter selects values', () => {
        const m = map.filter(v => v > 1);
        expect(m.has(1)).toBe(false);
        expect(m.has(2)).toBe(true);
        expect(m.has(8)).toBe(true);
    });

    test('partition splits into two maps', () => {
        const [mTrue, mFalse] = map.partition(v => v % 2 === 0);

        // true map should have even numbers
        expect(mTrue.keys()).toEqual([2, 4, 6, 8]);
        expect(mTrue.has(1)).toBe(false);

        // false map should have odd numbers
        expect(mFalse.keys()).toEqual([1, 3, 5, 7]);
        expect(mFalse.has(2)).toBe(false);
    });
});

describe('HashMap flip()', () => {
    test('flip swaps keys and values', () => {
        const map = HashMap.of([1, "one"]);
        const f = map.flip();
        expect(f.get("one")).toBe(1);
    });
});




