import HashSet from '../src/Sets/HashSet';
import { shuffleArray, createRandomIntArray, createRandomStringArray } from '../src/Utils/Utils';

describe('HashSet of()', () => {
    test('of() creates a set from arguments', () => {
        const set = HashSet.of(1, 2, 3, 4, 5);
        expect(set.toArray()).toEqual(expect.arrayContaining([1, 2, 3, 4, 5]));
    });
});

describe('HashSet add()', () => {
    test('add is immutable and enforces uniqueness', () => {
        const original = HashSet.of(1, 2, 3);
        const updated = original.add(3).add(4).add(4);

        // original is not changed
        expect([...original].sort()).toEqual([1, 2, 3]);

        // updated contains unique elements
        expect([...updated].sort()).toEqual([1, 2, 3, 4]);
    });

    test('add() and delete() operations chained', () => {
        const result = HashSet.of(1, 2, 3)
            .add(4)    // {1,2,3,4}
            .delete(2) // {1,3,4}
            .add(5)    // {1,3,4,5}
            .delete(9) // no‑op
            .add(1);   // duplicate, still single 1
        expect([...result].sort()).toEqual([1, 3, 4, 5]);
    });
});

describe('HashSet delete()', () => {
    test('delete() removes the target element', () => {
        const base = HashSet.of(1, 2, 3, 4);
        const withoutTwo = base.delete(2);
        expect([...base].sort()).toEqual([1, 2, 3, 4]);
        expect([...withoutTwo].sort()).toEqual([1, 3, 4]);

        // delete non-existing element does nothing
        expect(base.delete(42)).toStrictEqual(base);
    });
});

describe('HashSet add() and delete()', () => {
    test('add() and delete() many elements', () => {
        let s = HashSet.of<number>();
        const range = Array.from({ length: 2000 }, (_, i) => i);
        for (const n of range) s = s.add(n);
        expect([...s].length).toBe(2000);
        for (const n of range) s = s.delete(n);
        expect([...s].length).toBe(0);
    });
})

describe('HashSet get()', () => {
    test('get()', () => {
        const set = HashSet.of(1, 2, 3);
        expect(set.get(2)).toBe(2);
        expect(set.get(4)).toBeUndefined();
    })

    test('get() check that all random elements are found', () => {
        let arr = createRandomIntArray(1000, 1000);
        arr = shuffleArray(arr);
        const set = HashSet.of(...arr);
        for (const n of arr) {
            expect(set.get(n)).toBe(n);
        }
    })

    test('get() returns strictly equal stored element', () => {
        const a = { id: 1 };
        const b = { id: 1 };
        const set = HashSet.of(a);
        expect(set.get(a)).toBe(a); // same reference
        expect(set.get(a)).not.toBe(b); // different reference
    });
});

describe('HashSet has()', () => {
    test('has() returns true for present elements and false for absent', () => {
        const set = HashSet.of(1, 2, 3);
        expect(set.has(2)).toBe(true);
        expect(set.has(4)).toBe(false);
    });

    test('has() check that all random elements are found', () => {
        let arr = createRandomIntArray(1000, 1000);
        arr = shuffleArray(arr);
        const set = HashSet.of(...arr);
        for (const n of arr) {
            expect(set.has(n)).toBe(true);
        }
    })
});

describe('equals', () => {
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
    });
    test('equals() method on large random array. Order does not matter', () => {
        let arr = createRandomIntArray(1000, 1000);
        let a = HashSet.of(...arr);
        arr = shuffleArray(arr)
        let b = HashSet.of(...arr);
        expect(a.equals(b)).toBe(true); // same elements, different order
    });
});

describe('HashSet compareTo()', () => {
    test('compareTo() returns 0 for equal sets', () => {
        const a = HashSet.of(1, 2, 3);
        const b = HashSet.of(3, 1, 2);
        expect(a.compareTo(b)).toBe(0);
        expect(b.compareTo(a)).toBe(0);
    });

    test('compareTo() checks the size first', () => {
        const a = HashSet.of(1, 2);
        const b = HashSet.of(1, 2, 3);
        expect(a.compareTo(b)).toBeLessThan(0);
        expect(b.compareTo(a)).toBeGreaterThan(0);
    });

    test('compareTo() when sizes are equal, so check the elements', () => {
        const a = HashSet.of(1, 2, 4);
        const b = HashSet.of(1, 2, 5);
        expect(a.compareTo(b)).toBeLessThan(0);
        expect(b.compareTo(a)).toBeGreaterThan(0);
    });

    test('compareTo() handles the comparison of empty sets', () => {
        const empty = HashSet.of<number>();
        const nonEmpty = HashSet.of(1);
        expect(empty.compareTo(nonEmpty)).toBeLessThan(0);
        expect(nonEmpty.compareTo(empty)).toBeGreaterThan(0);
        expect(empty.compareTo(empty)).toBe(0);
    });

    test('compaareTo() random elements that have same elements but in different order', () => {
        let arr = createRandomIntArray(1000, 1000);
        const a = HashSet.of(...arr);
        arr = shuffleArray(arr);
        const b = HashSet.of(...arr);
        expect(a.compareTo(b)).toBe(0);
    })

    test('compareTo() random elements of strings', () => {
        let arr = createRandomStringArray(1000, 1000);
        const a = HashSet.of(...arr);
        arr = shuffleArray(arr);
        const b = HashSet.of(...arr);
        expect(a.compareTo(b)).toBe(0);
        expect(b.compareTo(a)).toBe(0);
    })
});

describe('HashSet hashCode()', () => {
    test('hashCode() returns the same hash for equal sets', () => {
        const a = HashSet.of(1, 2, 3);
        const b = HashSet.of(3, 1, 2);
        expect(a.hashCode()).toBe(b.hashCode());
    });

    test('hashCode() returns different hashes for different sets', () => {
        const a = HashSet.of(1, 2, 3);
        const b = HashSet.of(1, 2, 4);
        expect(a.hashCode()).not.toBe(b.hashCode());
    });
    test('hashCode() returns the same hash for sets with same elements in different order', () => {
        let arr = createRandomIntArray(1000, 1000);
        const a = HashSet.of(...arr);
        arr = shuffleArray(arr);
        const b = HashSet.of(...arr);
        expect(a.hashCode()).toBe(b.hashCode());
        expect(b.hashCode()).toBe(a.hashCode());
    })
})


describe('HashSet every()', () => {
    test('every() returns true for all elements', () => {
        const set = HashSet.of(1, 2, 3);
        expect(set.every((value) => value > 0)).toBe(true);
        expect(set.every((value) => value < 4)).toBe(true);
        expect(set.every((value) => value > 2)).toBe(false);
    });

    test('every() on empty set', () => {
        const set = HashSet.of<number>();
        expect(set.every(() => false)).toBe(true);
    });

    test('every() on large random set', () => {
        let arr = createRandomIntArray(1000, 1000);
        arr = shuffleArray(arr);
        const set = HashSet.of(...arr);
        expect(set.every((value) => value > 0)).toBe(true);
        expect(set.every((value) => value < 1000)).toBe(true);
        expect(set.every((value) => value > 500)).toBe(false);
    });

    test('every() on large string set', () => {
        let arr = createRandomStringArray(1000, 1000);
        arr = shuffleArray(arr);
        const set = HashSet.of(...arr);
        expect(set.every((value) => value.length > 0)).toBe(true);
        expect(set.every((value) => value.length < 1000)).toBe(true);
        expect(set.every((value) => value.length > 500)).toBe(false);
    })
})

describe('HashSet some()', () => {
    test('some() returns true for at least one element', () => {
        const set = HashSet.of(1, 2, 3);
        expect(set.some((value) => value > 2)).toBe(true);
        expect(set.some((value) => value < 0)).toBe(false);
    }
    );

    test('some() on empty set', () => {
        const set = HashSet.of<number>();
        expect(set.some(() => true)).toBe(false);
    });

    test('some() on large random set', () => {
        let arr = createRandomIntArray(1000, 1000);
        arr = shuffleArray(arr);
        const set = HashSet.of(...arr);
        expect(set.some((value) => value > 500)).toBe(true);
        expect(set.some((value) => value < 0)).toBe(false);
        expect(set.some((value) => value > 1000)).toBe(false);
    });
})

describe('HashSet forEach()', () => {
    test('forEach() iterates over all elements', () => {
        const set = HashSet.of(1, 2, 3);
        const result: number[] = [];
        set.forEach((value) => result.push(value));
        expect(result.sort()).toEqual([1, 2, 3]);
    });

    test('forEach() on empty set', () => {
        const set = HashSet.of<number>();
        const result: number[] = [];
        set.forEach((value) => result.push(value));
        expect(result).toEqual([]);
    });
});

describe('HashSet find()', () => {
    test('find() returns the first element that matches the predicate', () => {
        const set = HashSet.of(1, 2, 3);
        expect(set.find((value) => value > 1)).toBe(2);
        expect(set.find((value) => value > 3)).toBeUndefined();
    });

    test('find() on empty set', () => {
        const set = HashSet.of<number>();
        expect(set.find(() => true)).toBeUndefined();
    });

    test('find() on large random set', () => {
        let arr = createRandomIntArray(1000, 1000);
        arr = shuffleArray(arr);
        const set = HashSet.of(...arr);
        expect(set.find((value) => value > 500)).toBeGreaterThan(500);
        expect(set.find((value) => value < 0)).toBeUndefined();
        expect(set.find((value) => value > 1000)).toBeUndefined();
    });
})

describe('HashSet reduce()', () => {
    test('reduce() accumulates values correctly', () => {
        const set = HashSet.of(1, 2, 3);
        const sum = set.reduce((acc, value) => acc + value, 0);
        expect(sum).toBe(6);
    });

    test('reduce() on empty set', () => {
        const set = HashSet.of<number>();
        const sum = set.reduce((acc, value) => acc + value, 0);
        expect(sum).toBe(0);
    });

    test('reduce() on string set', () => {
        const set = HashSet.of('a', 'b', 'c');
        const concatenated = set.reduce((acc, value) => acc + value, '');
        expect(concatenated).toBe('abc');
    })
    test('reduce() on large random set', () => {
        let arr = createRandomIntArray(1000, 1000);
        arr = shuffleArray(arr);
        const set = HashSet.of(...arr);
        const sum = set.reduce((acc, value) => acc + value, 0);
        const expectedSum = Array.from(new Set(arr)).reduce((acc, value) => acc + value, 0);
        expect(sum).toBe(expectedSum);
    });
});

describe('HashSet reduceRight()', () => {
    test('reduceRight() accumulates values correctly', () => {
        const set = HashSet.of(1, 2, 3);
        const sum = set.reduceRight((acc, value) => acc + value, 0);
        expect(sum).toBe(6);
    });

    test('reduceRight() on empty set', () => {
        const set = HashSet.of<number>();
        const sum = set.reduceRight((acc, value) => acc + value, 0);
        expect(sum).toBe(0);
    });

    test('reduceRight() on string set', () => {
        const set = HashSet.of('a', 'b', 'c');
        const concatenated = set.reduceRight((acc, value) => acc + value, '');
        expect(concatenated).toBe('cba');
    })
    test('reduceRight() on large random set', () => {
        let arr = createRandomIntArray(1000, 1000);
        arr = shuffleArray(arr);
        const set = HashSet.of(...arr);
        const sum = set.reduceRight((acc, value) => acc + value, 0);
        const expectedSum = Array.from(new Set(arr)).reduce((acc, value) => acc + value, 0);
        expect(sum).toBe(expectedSum);
    }
    );
})

describe('HashSet union()', () => {
    test('union() combines sets correctly', () => {
        const setA = HashSet.of(1, 2, 3);
        const setB = HashSet.of(3, 4, 5);
        const unionSet = setA.union(setB);
        expect(unionSet.toArray().sort()).toEqual([1, 2, 3, 4, 5]);
    });

    test('union() with empty set', () => {
        const setA = HashSet.of(1, 2, 3);
        const setB = HashSet.of<number>();
        const unionSet = setA.union(setB);
        expect(unionSet.toArray().sort()).toEqual([1, 2, 3]);
    });

    test('union() with itself returns the same set', () => {
        const setA = HashSet.of(1, 2, 3);
        const unionSet = setA.union(setA);
        expect(unionSet.toArray().sort()).toEqual([1, 2, 3]);
    });

    test('union() with multiple sets', () => {
        const setA = HashSet.of(1, 2);
        const setB = HashSet.of(3, 4);
        const setC = HashSet.of(5, 6);
        const unionSet = setA.union(setB, setC);
        expect(unionSet.toArray().sort()).toEqual([1, 2, 3, 4, 5, 6]);
    });
})

describe('HashSet merge()', () => {
    test('merge() combines sets correctly', () => {
        const setA = HashSet.of(1, 2, 3);
        const setB = HashSet.of(3, 4, 5);
        const mergedSet = setA.merge(setB);
        expect(mergedSet.toArray().sort()).toEqual([1, 2, 3, 4, 5]);
    });

    test('merge() with empty set', () => {
        const setA = HashSet.of(1, 2, 3);
        const setB = HashSet.of<number>();
        const mergedSet = setA.merge(setB);
        expect(mergedSet.toArray().sort()).toEqual([1, 2, 3]);
    });

    test('merge() with itself returns the same set', () => {
        const setA = HashSet.of(1, 2, 3);
        const mergedSet = setA.merge(setA);
        expect(mergedSet.toArray().sort()).toEqual([1, 2, 3]);
    });

    test('merge() with multiple sets', () => {
        const setA = HashSet.of(1, 2);
        const setB = HashSet.of(3, 4);
        const setC = HashSet.of(5, 6);
        const mergedSet = setA.merge(setB, setC);
        expect(mergedSet.toArray().sort()).toEqual([1, 2, 3, 4, 5, 6]);
    });
})

describe('HashSet concat()', () => {
    test('concat() combines sets correctly', () => {
        const setA = HashSet.of(1, 2, 3);
        const setB = HashSet.of(3, 4, 5);
        const concatenatedSet = setA.concat(setB);
        expect(concatenatedSet.toArray().sort()).toEqual([1, 2, 3, 4, 5]);
    });

    test('concat() with empty set', () => {
        const setA = HashSet.of(1, 2, 3);
        const setB = HashSet.of<number>();
        const concatenatedSet = setA.concat(setB);
        expect(concatenatedSet.toArray().sort()).toEqual([1, 2, 3]);
    });

    test('concat() with itself returns the same set', () => {
        const setA = HashSet.of(1, 2, 3);
        const concatenatedSet = setA.concat(setA);
        expect(concatenatedSet.toArray().sort()).toEqual([1, 2, 3]);
    });

    test('concat() with multiple sets', () => {
        const setA = HashSet.of(1, 2);
        const setB = HashSet.of(3, 4);
        const setC = HashSet.of(5, 6);
        const concatenatedSet = setA.concat(setB, setC);
        expect(concatenatedSet.toArray().sort()).toEqual([1, 2, 3, 4, 5, 6]);
    });
})

describe('HashSet intersect()', () => {
    test('intersect() returns common elements of two sets', () => {
        const setA = HashSet.of(1, 2, 3, 4);
        const setB = HashSet.of(3, 4, 5, 6);
        const result = setA.intersect(setB);
        expect(result.toArray().sort()).toEqual([3, 4]);
    });

    test('intersect() with disjoint sets returns empty set', () => {
        const setA = HashSet.of(1, 2);
        const setB = HashSet.of(3, 4);
        const result = setA.intersect(setB);
        expect(result.isEmpty()).toBe(true);
    });

    test('intersect() with multiple sets returns common elements in all', () => {
        const setA = HashSet.of(1, 2, 3, 4);
        const setB = HashSet.of(2, 3, 4, 5);
        const setC = HashSet.of(3, 4, 5, 6);
        const result = setA.intersect(setB, setC);
        expect(result.toArray().sort()).toEqual([3, 4]);
    });

    test('intersect() with itself returns the same set', () => {
        const setA = HashSet.of(1, 2, 3);
        const result = setA.intersect(setA);
        expect(result.equals(setA)).toBe(true);
    });

    test('intersect() with empty set returns empty set', () => {
        const setA = HashSet.of(1, 2, 3);
        const empty = HashSet.of<number>();
        const result = setA.intersect(empty);
        expect(result.isEmpty()).toBe(true);
    });

    test('intersect() on custom generic objects', () => {
        const a1 = { id: 1, name: 'Alice' };
        const a2 = { id: 2, name: 'Bob' };
        const a3 = { id: 3, name: 'Charlie' };
        const a4 = { id: 4, name: 'Dana' };

        const b1 = { id: 3, name: 'Charlie' };
        const b2 = { id: 4, name: 'Dana' };
        const b3 = { id: 5, name: 'Eve' };

        const setA = HashSet.of(a1, a2, a3, a4);
        const setB = HashSet.of(b1, b2, b3);

        const result = setA.intersect(setB);

        expect(result.toArray()).toMatchObject([
            { id: 3, name: 'Charlie' },
            { id: 4, name: 'Dana' }
        ]);
        expect(result.size()).toBe(2);
    });
});

describe('HashSet subtract()', () => {
    test('subtract() returns elements in setA not in setB', () => {
        const setA = HashSet.of(1, 2, 3, 4);
        const setB = HashSet.of(3, 4, 5, 6);
        const result = setA.subtract(setB);
        expect(result.toArray().sort()).toEqual([1, 2]);
    });

    test('subtract() with disjoint sets returns the same set', () => {
        const setA = HashSet.of(1, 2);
        const setB = HashSet.of(3, 4);
        const result = setA.subtract(setB);
        expect(result.equals(setA)).toBe(true);
    });

    test('subtract() with multiple sets', () => {
        const setA = HashSet.of(1, 2, 3, 4);
        const setB = HashSet.of(2, 3, 4, 5);
        const setC = HashSet.of(3, 4, 5, 6);
        const result = setA.subtract(setB, setC);
        expect(result.toArray().sort()).toEqual([1]);
    });

    test('subtract() with itself returns empty set', () => {
        const setA = HashSet.of(1, 2, 3);
        const result = setA.subtract(setA);
        expect(result.isEmpty()).toBe(true);
    });

    test('subtract() with empty set returns the same set', () => {
        const setA = HashSet.of(1, 2, 3);
        const empty = HashSet.of<number>();
        const result = setA.subtract(empty);
        expect(result.equals(setA)).toBe(true);
    });


    test('subtract() on large random set', () => {
        const arrA = createRandomIntArray(1000, 2000); // values between 0–1999
        const arrB = createRandomIntArray(500, 1000);  // values between 0–999

        const setA = HashSet.of(...arrA);
        const setB = HashSet.of(...arrB);

        const result = setA.subtract(setB);

        for (const v of setB) {
            expect(result.has(v)).toBe(false);
        }

        for (const v of result) {
            expect(setA.has(v)).toBe(true);
            expect(setB.has(v)).toBe(false);
        }

        const expected = new Set(arrA.filter(v => !arrB.includes(v)));
        expect(result.size()).toBe(expected.size);
    });
})

describe('HashSet map()', () => {
    test('map() transforms elements correctly', () => {
        const set = HashSet.of(1, 2, 3);
        const mappedSet = set.map((value) => value * 2);
        expect(mappedSet.toArray().sort()).toEqual([2, 4, 6]);
    });

    test('map() on empty set', () => {
        const set = HashSet.of<number>();
        const mappedSet = set.map((value) => value * 2);
        expect(mappedSet.isEmpty()).toBe(true);
    });

    test('map() on string set', () => {
        const set = HashSet.of('a', 'b', 'c');
        const mappedSet = set.map((value) => value.toUpperCase());
        expect(mappedSet.toArray().sort()).toEqual(['A', 'B', 'C']);
    })
})

describe('HashSet flatMap()', () => {
    test('flatMap() flattens nested arrays of numbers', () => {
        const set = HashSet.of(1, 2, 3);
        const result = set.flatMap((value) => [value, value * 10]);
        expect(result.toArray().sort((a, b) => a - b)).toEqual([1, 2, 3, 10, 20, 30]);
    });

    test('flatMap() on empty set returns empty set', () => {
        const set = HashSet.of<number>();
        const result = set.flatMap((value) => [value, value * 10]);
        expect(result.isEmpty()).toBe(true);
    });

    test('flatMap() with string mapping', () => {
        const set = HashSet.of('a', 'b');
        const result = set.flatMap((value) => [value, value.toUpperCase()]);
        expect(result.toArray().sort()).toEqual(['A', 'B', 'a', 'b']);
    });

    test('flatMap() avoids duplicates', () => {
        const set = HashSet.of(1, 2, 3);
        const result = set.flatMap((value) => [value, 1]);
        expect(result.has(1)).toBe(true);
        expect(result.size()).toBeLessThanOrEqual(4);
    });
})

describe('HashSet filter()', () => {
    test('filter() retains elements that match the predicate', () => {
        const set = HashSet.of(1, 2, 3, 4);
        const filteredSet = set.filter((value) => value > 2);
        expect(filteredSet.toArray().sort()).toEqual([3, 4]);
    });

    test('filter() on empty set returns empty set', () => {
        const set = HashSet.of<number>();
        const filteredSet = set.filter(() => true);
        expect(filteredSet.isEmpty()).toBe(true);
    });

    test('filter() with string predicate', () => {
        const set = HashSet.of('apple', 'banana', 'cherry');
        const filteredSet = set.filter((value) => value.startsWith('b'));
        expect(filteredSet.toArray().sort()).toEqual(['banana']);
    });
})

describe('HashSet partition()', () => {
        test('partition() divides set into matching and non-matching sets', () => {
        const set = HashSet.of(1, 2, 3, 4, 5, 6);
        const [evenSet, oddSet] = set.partition((v) => v % 2 === 0);
        expect(evenSet.toArray().sort()).toEqual([2, 4, 6]);
        expect(oddSet.toArray().sort()).toEqual([1, 3, 5]);
    });

    test('partition() on empty set returns two empty sets', () => {
        const set = HashSet.of<number>();
        const [pass, fail] = set.partition((v) => v > 0);
        expect(pass.isEmpty()).toBe(true);
        expect(fail.isEmpty()).toBe(true);
    });

    test('partition() using type guard retains type in right partition', () => {
        const values: Array<string | number> = ['a', 1, 'b', 2];
        const set = HashSet.of(...values);
        const [numbers, nonNumbers] = set.partition((value): value is number => typeof value === 'number');
        expect(numbers.toArray().sort()).toEqual([1, 2]);
        expect(nonNumbers.toArray().sort()).toEqual(['a', 'b']);
    });

    test('partition() returns same set if all match or none match', () => {
        const all = HashSet.of(1, 2, 3);
        const [yes, no] = all.partition((v) => v > 0);
        expect(no.isEmpty()).toBe(true);
        expect(yes.equals(all)).toBe(true);

        const [none, allOut] = all.partition((v) => v < 0);
        expect(none.isEmpty()).toBe(true);
        expect(allOut.equals(all)).toBe(true);
    });
})