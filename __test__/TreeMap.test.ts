import Sorting from "../src/Sorting/Sorting";
import TreeMap from "../src/Trees/TreeMap";
import { createRandomIntArray, shuffleArray } from "../src/Utils/Utils";

describe("TreeMap", () => {
    const compare = (a: number, b: number) => a - b;
    const compareReversed = (a: number, b: number) => b - a;
    let treeMap: TreeMap<number, string> = new TreeMap<number, string>(compare);
    const arr = [50, 40, 30, 10, 20, 30, 100, 0, 45, 55, 25, 15];
    const arrDistinct = Array.from(new Set(arr));
    const arrDistinctSorted = arrDistinct.slice().sort((a, b) => a - b);
    const arrDistinctReversed = arrDistinct.slice().sort((a, b) => b - a);

    arr.forEach((value) => {
        treeMap = treeMap.set(value, value.toString());
    });

    // beforeEach(() => {

    // });

    test('validateRedBlackTree() properties after adding and deletion of many nodes', () => {
        const tree = new TreeMap(compare);
        // let elements = [50, 40, 30, 10, 20, 30, 100, 0, 45, 55, 25, 15, 1000, 11111, 375, 376, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 389, 390];
        let elements = createRandomIntArray(1_000, 1, 1000);
        elements = shuffleArray(elements);

        // inserting many elements and validating the tree
        let newTree = tree;
        for (const elem of elements) {
            newTree = newTree.set(elem, elem.toString());
            // expect(newTree.isBST()).toBeTruthy();
            // expect(newTree.redInvariant()).toBeTruthy();
            // expect(newTree.blackBalancedInvariant()).toBeTruthy();
            expect(newTree.validateRedBlackTree()).toBeTruthy();
        }

        // Check that it contains all the elements after they have been added
        for (const elem of elements) {
            expect(newTree.has(elem)).toBeTruthy();
            expect(newTree.get(elem)).not.toBe(undefined);
        }

        // Check that the red-black tree properties are still valid after deletion
        const elementsToDelete = shuffleArray(elements);
        for (const elem of elementsToDelete) {
            newTree = newTree.delete(elem);
            // expect(newTree.isBST()).toBeTruthy();
            // expect(newTree.redInvariant()).toBeTruthy();
            // expect(newTree.blackBalancedInvariant()).toBeTruthy();
            expect(newTree.validateRedBlackTree()).toBeTruthy();
        }
    })

    // test('simulate large numbers to check complexity of tree', () => {
    //     const tm = new TreeMap<number, string>();
    //     const size = 1_000_000;

    //     const data = Array.from({ length: size }, (_, i) => i); // Sequential numbers

    //     console.log(`Inserting ${size} elements into the Red-Black Tree...`);
    //     console.time("Insertion Time");
    //     data.forEach(num => tm.set(num, num.toString()));
    //     console.timeEnd("Insertion Time");

    //     // console.log(`Searching ${size} elements in the Red-Black Tree...`);
    //     // console.time("Search Time");
    //     // data.forEach(num => tm.search(num));
    //     // console.timeEnd("Search Time");
    // })

    test('change compare to be reversed order', () => {
        let newTree = new TreeMap(compareReversed);
        for (const elem of arr) {
            newTree = newTree.set(elem, elem.toString());
        }
        expect(newTree.size()).toBe(arrDistinct.length);
        expect(newTree.firstKey()).toBe(100);
        expect(newTree.lastKey()).toBe(0);
        expect(newTree.validateRedBlackTree()).toBeTruthy();
    })

    test('next() on iterator', () => {
        const iterator = treeMap[Symbol.iterator]();
        let result = iterator.next();
        expect(result.value?.[0]).toBe(0);
        expect(result.value?.[1]).toBe("0");
        expect(result.done).toBe(false);

        result = iterator.next();
        expect(result.value?.[0]).toBe(10);
        expect(result.value?.[1]).toBe("10");
        expect(result.done).toBe(false);

    })

    test('throw() on iterator', () => {
        const iterator = treeMap[Symbol.iterator]();
        iterator.next();

        try {
            if (iterator.throw) {
                iterator.throw(new Error("test error"));
            }
        } catch (e: any) {
            expect(e.message).toBe("test error");
        }
        const result = iterator.next();
        expect(result.done).toBe(true);
    })

    test('return() on iterator', () => {
        const iterator = treeMap[Symbol.iterator]();
        iterator.next();

        let result;
        if (iterator.return) {
            result = iterator.return();
            expect(result.done).toBe(true);
            expect(result.value).toBeUndefined();
        }

        const nextResult = iterator.next();
        expect(nextResult.done).toBe(true);
    })


    test('get()', () => {
        const value = treeMap.get(50);
        expect(value).toBe("50");
    })

    test('has()', () => {
        const hasKey = treeMap.has(0);
        expect(hasKey).toBeTruthy();
    })

    test('hasValue()', () => {
        const check = "hasthisvalue";
        const newTree = treeMap.set(treeMap.size(), check);
        expect(newTree.hasValue(check)).toBeTruthy();
    })

    test('hasAll() check that it has all keys', () => {
        expect(treeMap.hasAll(arr)).toBeTruthy();
        expect(treeMap.hasAll(arrDistinct)).toBeTruthy();
    })

    test('has() and get()', () => {
        for (const elem of arrDistinct) {
            expect(treeMap.has(elem)).toBeTruthy();
            expect(treeMap.get(elem)).toBeTruthy();
        }
    })

    test('getRoot()', () => {
        const root = treeMap.getRoot();
        expect(root).not.toBeNull();
        const [key, value] = root!;
        expect(key).toBe(40);
        expect(value).toBe("40");
    })

    test('firstKey()', () => {
        const first = treeMap.firstKey();
        expect(first).toBe(0);
    })

    test('lastKey()', () => {
        const last = treeMap.lastKey();
        expect(last).toBe(100);
    })

    test('size()', () => {
        expect(treeMap.size()).toBe(arrDistinct.length);
    })

    test('keys()', () => {
        const keys = treeMap.keys();
        expect(keys).toEqual(arrDistinctSorted);
    })

    test('values()', () => {
        const values = Array.from(treeMap.values());
        expect(values).toEqual(arrDistinctSorted.map((value) => value.toString()));
    })

    test('entries()', () => {
        const entries = treeMap.entries();
        const expected = arrDistinctSorted.map((num) => ([num, num.toString()]));
        expect(entries).toEqual(expected);
    })

    test('isEmpty()', () => {
        expect(treeMap.isEmpty()).toBeFalsy();
    })

    test('has()', () => {
        let res = true;
        for (const elem of arrDistinct) {
            res = res && treeMap.has(elem);
        }
        expect(res).toBeTruthy();
    })

    test('hasAll()', () => {
        expect(treeMap.hasAll(arrDistinct)).toBeTruthy();
        const newArr = [213, 213, 111, 919];
        expect(treeMap.hasAll(newArr)).toBeFalsy();
    })

    test('delete()', () => {
        const newTreeMap = treeMap.delete(50);
        expect(newTreeMap.has(50)).toBeFalsy();
        expect(newTreeMap.has(40)).toBeTruthy();
        expect(newTreeMap.has(0)).toBeTruthy();

        expect(newTreeMap.validateRedBlackTree()).toBeTruthy();
    })

    test('deleteAll()', () => {
        const elemsToDelete = shuffleArray(arrDistinct);

        const newTreeMap = treeMap.deleteAll(elemsToDelete);
        expect(newTreeMap.size()).toBe(0)
        expect(newTreeMap.has(50)).toBeFalsy();
    })

    test('clear()', () => {
        const newTreeMap = treeMap.clear();
        expect(newTreeMap.isEmpty()).toBeTruthy();
    })

    test('equals()', () => {
        const otherTreeMap = new TreeMap<number, string>(compare)
            .set(1, "1").set(2, "2").set(3, "3");
        const otherTreeMap2 = new TreeMap<number, string>(compareReversed)
            .set(3, "3").set(2, "2").set(1, "1");
        expect(otherTreeMap.equals(otherTreeMap2)).toBeTruthy();
    });

    test("compareTo() advanced", () => {
        let mapA = new TreeMap<number, string>((a, b) => a - b)
            .set(10, "ten")
            .set(20, "twenty")
            .set(30, "thirty");

        let mapB = new TreeMap<number, string>((a, b) => a - b)
            .set(10, "ten")
            .set(20, "twenty")
            .set(30, "thirty");

        // mapA and mapB are identical  
        let cmp = mapA.compareTo(mapB);
        expect(cmp).toBe(0);

        // mapC and mapA have different sizes
        let mapC = new TreeMap<number, string>((a, b) => a - b)
            .set(10, "ten")
            .set(20, "twenty");
        cmp = mapA.compareTo(mapC);
        // should be greater since mapA has more entries
        expect(cmp).toBeGreaterThan(0);

        // mapA and mapD have different keys
        let mapD = new TreeMap<number, string>((a, b) => a - b)
            .set(10, "ten")
            .set(40, "forty")
            .set(50, "fifty");
        cmp = mapA.compareTo(mapD);
        // Both have 3 entries, but at the first differing key
        expect(cmp).toBeLessThan(0);

        // mapE and mapF have the same key but different values
        let mapE = new TreeMap<number, string>((a, b) => a - b)
            .set(1, "abc");
        let mapF = new TreeMap<number, string>((a, b) => a - b)
            .set(1, "xyz");
        cmp = mapE.compareTo(mapF);
        // comparing the values
        expect(cmp).toBeLessThan(0);
    });

    test('hashCode() same', () => {
        let otherTreeMap = new TreeMap<number, string>(compare);
        for (const elem of arr) {
            otherTreeMap = otherTreeMap.set(elem, elem.toString());
        }
        expect(treeMap.hashCode()).toBe(otherTreeMap.hashCode());
    })

    test('hashCode() differ', () => {
        const otherTreeMap = new TreeMap<number, string>(compare)
            .set(2, "2")
            .set(3, "3");
        expect(treeMap.hashCode()).not.toBe(otherTreeMap.hashCode());
    })

    test('copyOf()', () => {
        const copy = treeMap.copyOf(treeMap);
        expect(copy.hashCode()).toEqual(treeMap.hashCode());
    })

    test('hashCode() is cached and does not change', () => {
        const tree = new TreeMap<number, string>(compare);
        const tree1 = tree.set(1, "1");
        const tree2 = tree1.set(2, "2");
        const tree3 = tree2.set(3, "3");
        const tree4 = tree3.set(4, "4");
        const tree5 = tree4.set(5, "5");
        const tree6 = tree5.set(6, "6");
        const tree7 = tree6.set(7, "7");

        const hash7 = tree7.hashCode();

        const tree8 = tree7.set(8, "8");
        const tree9 = tree8.set(9, "9");
        const tree10 = tree9.set(10, "10");

        const hash77 = tree7.hashCode();

        expect(hash7).toBe(hash77);
        expect(tree7).not.toEqual(tree10);
    })


    test('getOrDefault()', () => {
        const value = treeMap.getOrDefault(50, "default");
        expect(value).toBe("50");

        const otherValue = treeMap.getOrDefault(155, "default");
        expect(otherValue).toBe("default");
    })


    test('computeIfAbsent()', () => {
        const result = treeMap.computeIfAbsent(50, _ => "default");
        expect(result[0]).toBe(treeMap);
        expect(result[1]).toBe("50");

        const result2 = treeMap.computeIfAbsent(4, _ => "default");
        expect(result2[0]).not.toBe(treeMap);
        expect(result2[1]).toBe("default");
    })


    test('computeIfPresent()', () => {
        const result = treeMap.computeIfPresent(15, _ => "default");
        expect(result[0]).not.toBe(treeMap);
        expect(result[1]).toBe("default");

        const result2 = treeMap.computeIfPresent(4, _ => "default");
        expect(result2[0]).toBe(treeMap);
        expect(result2[1]).not.toBe("default");
    })

    test('compute()', () => {
        const result = treeMap.compute(1, _ => "default");
        expect(result[0]).not.toBe(treeMap);
        expect(result[1]).toBe("default");
    })


    test('of()', () => {
        const newTreeMap = TreeMap.of(
            (a: number, b: number) => a - b,
            [1, "1"], [2, "2"]
        );
        expect(newTreeMap.size()).toBe(2);
        expect(newTreeMap.has(1)).toBeTruthy();
        expect(newTreeMap.get(1)).toBe("1");
        expect(newTreeMap.has(2)).toBeTruthy();
        expect(newTreeMap.get(2)).toBe("2");
    })

    test('every()', () => {
        const result = treeMap.every((value, key) => key >= 0);
        expect(result).toBeTruthy();

        const result2 = treeMap.every((value, key) => key > 1);
        expect(result2).toBeFalsy();
    })

    test('some()', () => {
        const result = treeMap.some((value, key) => key > 0);
        expect(result).toBeTruthy();

        const result2 = treeMap.some((value, key) => key > 150);
        expect(result2).toBeFalsy();
    })


    test('sort()', () => {
        const result = treeMap.sort();
        expect(result.size()).toBe(arrDistinct.length);

        const reversed = treeMap.sort(
            (a: number, b: number) => b - a
        );
        expect(reversed.size()).toBe(arrDistinct.length);
        expect(Array.from(reversed.keys())).toEqual(arrDistinctReversed);
    })

    test('sortBy() sort by key in descending order', () => {
        const sortedByKey = treeMap.sortBy((value, key) => key,
            (a: number, b: number) => b - a
        );
        expect(sortedByKey.size()).toBe(arrDistinctReversed.length);
        expect(sortedByKey.has(45)).toBeTruthy();
        expect(sortedByKey.has(25)).toBeTruthy();
        expect(sortedByKey.has(15)).toBeTruthy();
        expect(sortedByKey.has(0)).toBeTruthy();
        expect(Array.from(sortedByKey.keys())).toEqual(arrDistinctReversed);
    });

    test('sortBy() sort by value', () => {
        const sortedByValue = treeMap.sortBy((value) => value,
            (a: string, b: string) => a.length - b.length || a.localeCompare(b),
        );

        expect(sortedByValue.size()).toBe(arrDistinct.length);
        expect(sortedByValue.firstKey()).toBe("0")
        expect(sortedByValue.lastKey()).toBe("100")
        expect(sortedByValue.validateRedBlackTree()).toBeTruthy();
    })

    test('sortBy() on large random array', () => {
        const rndShuffled = shuffleArray(createRandomIntArray(1_000, 1, 1000));
        const entries: Iterable<[number, string]> = rndShuffled.map((value) => [value, value.toString()])
        const tree = new TreeMap<number, string>(compare).setAll(entries);

        const sortedByKey = tree.sortBy((value, key) => key,
            (a: number, b: number) => a - b
        );

        expect(Sorting.isSorted(sortedByKey.keys(), compare)).toBeTruthy();
    })

    test('forEach() keys', () => {
        const expected = arrDistinct.reduce((acc, curr) => acc + curr, 0);

        let sum = 0;
        treeMap.forEach((value, key) => {
            sum += key;
        });
        expect(sum).toBe(expected);
    });

    test('forEach() values', () => {
        // const expected = arrDistinctSorted.reduce((acc: string, curr: number) => acc + curr.toString(), "");
        const expected = treeMap.values().reduce((acc, curr) => acc + curr, "");

        let sum = "";
        treeMap.forEach((value: string) => {
            sum += value;
        })
        expect(sum).toBe(expected);
    })

    test('find()', () => {
        const result = treeMap.find((value, key) => key === 15);
        expect(result).toBe("15");

        const result2 = treeMap.find((value, key) => key === 666);
        expect(result2).toBeUndefined();
    })

    test('reduce() keys', () => {
        const expected = arrDistinct.reduce((acc, curr) => acc + curr, 0);
        const result = treeMap.reduce((accumulator, value, key) => accumulator + key, 0);
        expect(result).toBe(expected);
    })

    test('reduce() values', () => {
        const expected = arrDistinctSorted.reduce((acc, curr) => acc + curr.toString(), "");
        const result = treeMap.reduce((accumulator, value) => accumulator + value, "");
        expect(result).toBe(expected);
    })

    test('reduceRight() keys', () => {
        const expected = arrDistinct.reduce((acc, curr) => acc + curr, 0);
        const result = treeMap.reduceRight((accumulator, value, key) => accumulator + key, 0);
        expect(result).toBe(expected);
    })

    test('reduceRight() values', () => {
        const expected = arrDistinctReversed.reduce((acc, curr) => acc + curr.toString(), "");
        const result = treeMap.reduceRight((accumulator, value) => accumulator + value, "");
        expect(result).toBe(expected);
    })

    test('findMin()', () => {
        const result = treeMap.findMin();
        expect(result).not.toBeNull();
        const [k, v] = result!;
        expect(k).toEqual(0);
        expect(v).toEqual("0");
    });

    test('deleteMin()', () => {
        const min = treeMap.findMin();
        expect(min).not.toBeUndefined();
        const result = treeMap.deleteMin();
        expect(result.has(min![0])).toBeFalsy();

        // remove the key from arrDistinct
        const newArr = Array.from(arrDistinct);
        const index = newArr.indexOf(min![0]);
        newArr.splice(index, 1);
        newArr.forEach((key) => {
            expect(result.has(key)).toBeTruthy();
        })
    })

    test('findMax()', () => {
        const max = treeMap.findMax();
        expect(max).not.toBeNull();
        const [k, v] = max!;
        expect(k).toBe(100);
        expect(v).toBe("100");
    })

    test('findMax() of a specific key', () => {
        const maxOfNode = treeMap.findMax(20);
        expect(maxOfNode?.[0]).toBe(30);
    })

    test('deleteMax()', () => {
        const max = treeMap.findMax();
        expect(max).not.toBeUndefined();
        const result = treeMap.deleteMax();
        expect(result.has(max![0])).toBeFalsy();

        const newArr = Array.from(arrDistinct);
        const index = newArr.indexOf(max![0]);
        newArr.splice(index, 1);
        newArr.forEach((key) => {
            expect(result.has(key)).toBeTruthy();
        })
    })


    /*
    test('merge()', () => {
        const otherTreeMap = new TreeMap<number, string>(null, comparer)
            .set(4, "4")
            .set(5, "5");
        const result = treeMap.merge(otherTreeMap);
        expect(result.size()).toBe(5);
        expect(result.has(1)).toBeTruthy();
        expect(result.has(2)).toBeTruthy();
        expect(result.has(3)).toBeTruthy();
        expect(result.has(4)).toBeTruthy();
        expect(result.has(5)).toBeTruthy();
    })
     */

    test('tryPredecessor()', () => {
        const [res, out] = treeMap.tryPredecessor(50);
        expect(res).toBeTruthy();
        expect(out?.[0]).toBe(45);
        expect(out?.[1]).toBe("45");

        const [res2, out2] = treeMap.tryPredecessor(2);
        expect(res2).toBeFalsy();
        expect(out2).toBeUndefined();

        const [res3, out3] = treeMap.tryPredecessor(40);
        expect(res3).toBeTruthy();
        expect(out3?.[0]).toBe(30);
        expect(out3?.[1]).toBe("30");
    })

    test('trySuccessor()', () => {
        const [res, out] = treeMap.trySuccessor(0);
        expect(res).toBeTruthy();
        expect(out?.[0]).toBe(10);
        expect(out?.[1]).toBe("10");

        const [res2, out2] = treeMap.trySuccessor(2);
        expect(res2).toBeFalsy();
        expect(out2).toBeUndefined();

        const [res3, out3] = treeMap.trySuccessor(20);
        expect(res3).toBeTruthy();
        expect(out3?.[0]).toBe(25);
        expect(out3?.[1]).toBe("25");
    })

    test('tryWeakPredecessor()', () => {
        const [res, out] = treeMap.tryWeakPredecessor(50);
        expect(res).toBeTruthy();
        expect(out?.[0]).toBe(50);
        expect(out?.[1]).toBe("50");

        const [res2, out2] = treeMap.tryWeakPredecessor(35);
        expect(res2).toBeTruthy();
        expect(out2?.[0]).toBe(30);
        expect(out2?.[1]).toBe("30");
    })

    test('tryWeakSuccessor()', () => {
        const [res, out] = treeMap.tryWeakSuccessor(0);
        expect(res).toBeTruthy();
        expect(out?.[0]).toBe(0);
        expect(out?.[1]).toBe("0");

        const [res2, out2] = treeMap.tryWeakSuccessor(2);
        expect(res2).toBeTruthy();
        expect(out2?.[0]).toBe(10);
        expect(out2?.[1]).toBe("10");
    })

    test('predecessor()', () => {
        const pred = treeMap.predecessor(50);
        expect(pred?.[0]).toBe(45);

        const pred2 = treeMap.predecessor(2);
        expect(pred2?.[0]).toBe(undefined);

        const pred3 = treeMap.predecessor(40);
        expect(pred3?.[0]).toBe(30);
    });

    test('weakPredecessor()', () => {
        const weakPred = treeMap.weakPredecessor(50);
        expect(weakPred?.[0]).toBe(50);

        // since 35 does not exists, the weak predecessor should be 30
        const weakPred2 = treeMap.weakPredecessor(35);
        expect(weakPred2?.[0]).toBe(30);
    })

    test('weakPredecessor() returns undefined if there is no predecessor', () => {
        const weakPred = treeMap.weakPredecessor(-1);
        expect(weakPred).toBeUndefined();
    })

    test('successor()', () => {
        const succ = treeMap.successor(0);
        expect(succ?.[0]).toBe(10);

        const succ2 = treeMap.successor(2);
        expect(succ2?.[0]).toBe(undefined);

        const succ3 = treeMap.successor(20);
        expect(succ3?.[0]).toBe(25);

    });

    test('weakSuccessor()', () => {
        const succ = treeMap.weakSuccessor(0);
        expect(succ?.[0]).toBe(0);

        const succ2 = treeMap.weakSuccessor(2);
        expect(succ2?.[0]).toBe(10);
    })

    test('weakSuccessor() returns undefined if there is no successor', () => {
        const weakSucc = treeMap.weakSuccessor(110);
        expect(weakSucc).toBeUndefined();
    })

    test('merge() with other treeMap', () => {
        const otherTreeMap = new TreeMap<number, string>(compare)
            .set(666, "666")
            .set(555, "555");
        const expectedSize = arrDistinct.length + 2;
        const result = treeMap.merge(otherTreeMap);
        expect(result.size()).toBe(expectedSize);
        expect(result.has(50)).toBeTruthy();
        expect(result.has(666)).toBeTruthy();
        expect(result.has(555)).toBeTruthy();
        expect(result.findMax()?.[0]).toBe(666);
    })

    test('merge() with other iterable', () => {
        const iterable: [number, string][] = [[666, "666"], [555, "555"]];
        const expectedSize = arrDistinct.length + 2;
        const result = treeMap.merge(iterable);
        expect(result.size()).toBe(expectedSize);
        expect(result.has(50)).toBeTruthy();
        expect(result.has(666)).toBeTruthy();
        expect(result.has(555)).toBeTruthy();
        expect(result.findMax()?.[0]).toBe(666);
    })

    test('concat() with an iterable', () => {
        const iterable: [number, string][] = [[666, "666"], [555, "555"]];
        const expectedSize = arrDistinct.length + 2;
        const result = treeMap.concat(iterable);
        expect(result.size()).toBe(expectedSize);
        expect(result.has(50)).toBeTruthy();
        expect(result.has(666)).toBeTruthy();
        expect(result.has(555)).toBeTruthy();
        expect(result.findMax()?.[0]).toBe(666);
    })

    test('concat() with objects', () => {
        const obj1 = { "666": "666", "555": "555" };
        const obj2 = { "777": "777", "888": "888" };

        const expectedSize = arrDistinct.length + 4;
        const result = treeMap.concat(obj1, obj2);
        expect(result.size()).toBe(expectedSize);
        expect(result.has(50)).toBeTruthy();
        expect(result.has("666")).toBeTruthy();
        expect(result.has("555")).toBeTruthy();
        expect(result.has("777")).toBeTruthy();
        expect(result.has("888")).toBeTruthy();
    })

    test('updateOrAdd() with value', () => {
        // const result = treeMap.update(50, (value) => value + "50");
        const result = treeMap.updateOrAdd(50, "5050");
        expect(result.get(50)).toBe("5050");
    })

    test('updateOrAdd() with function', () => {
        const result = treeMap.updateOrAdd(50, (value) => value + "5050");
        expect(result.get(50)).toBe("505050");
    })

    test('updateOrAdd() when key does not exist so the key will be added', () => {
        const result = treeMap.updateOrAdd(666, "666");
        expect(result.get(666)).toBe("666");
    })

    test('mergeWith() an iterable', () => {
        const iterable: [number, string][] = [[50, "5050"], [40, "4040"]];
        const expectedSize = arrDistinct.length;
        const result = treeMap.mergeWith((oldVal, newVal) => oldVal + newVal, iterable);

        expect(result.size()).toBe(expectedSize); // size should not change
        expect(result.get(50)).toBe("505050");
    })

    test('mergeWith() another map', () => {
        const m1 = new TreeMap<number, number>(compare)
            .set(1, 1)
            .set(2, 2);
        const m2 = new TreeMap<number, number>(compare)
            .set(2, 20)
            .set(3, 3);

        const expectedSize = 3;
        const m = m1.mergeWith((a, b) => a + b, m2);
        expect(m.size()).toBe(expectedSize);
        expect(m.get(1)).toBe(1);
        expect(m.get(2)).toBe(22);
        expect(m.get(3)).toBe(3);
    })


    test('mergeWith() with an object', () => {
        const m1 = new TreeMap<number, number>(compare)
            .set(1, 1)
            .set(2, 2);

        const obj = { 2: 20, 3: 30 };
        const m = m1.mergeWith((a, b) => a + b, obj);

        const expectedSize = 3;
        expect(m.size()).toBe(expectedSize);
        expect(m.get(1)).toBe(1);
        expect(m.get(2)).toBe(22);
        expect(m.get(3)).toBe(30);
    })

    // test('mergeDeep()', () => {
    //     let otherTreeMap = new TreeMap<number, TreeMap<number, number>>(compare);
    //     const inner1 = new TreeMap<number, number>(compare).set(1, 1).set(2, 2);
    //     const inner2 = new TreeMap<number, number>(compare).set(3, 3).set(4, 4);
    //     otherTreeMap = otherTreeMap.set(1, inner1).set(2, inner2);

    //     let otherTreeMap2 = new TreeMap<number, TreeMap<number, number>>(compare);
    //     const inner3 = new TreeMap<number, number>(compare).set(5, 5).set(6, 6);
    //     const inner4 = new TreeMap<number, number>(compare).set(7, 7).set(8, 8);
    //     otherTreeMap2 = otherTreeMap2.set(1, inner3).set(2, inner4);

    //     const result = otherTreeMap.mergeDeep(otherTreeMap2);
    //     expect(result.size()).toBe(2);
    //     expect(result.get(1)?.size()).toBe(4);
    //     expect(result.get(2)?.size()).toBe(4);

    // })

    test('map()', () => {
        const result = treeMap.map((value) => value + value + value);
        expect(result.get(50)).toBe("505050");
        expect(result.get(40)).toBe("404040");
        expect(result.get(30)).toBe("303030");
        expect(result.get(10)).toBe("101010");
        expect(result.get(20)).toBe("202020");
        expect(result.get(100)).toBe("100100100");
    })

    test('map() to a number number map', () => {
        const result = treeMap.map((value, key) => key + key + key);
        expect(result.get(50)).toBe(150);
        expect(result.get(40)).toBe(120);
        expect(result.get(30)).toBe(90);
        expect(result.get(10)).toBe(30);
        expect(result.get(20)).toBe(60);
        expect(result.get(100)).toBe(300);
    })

    test('map() using the map size()', () => {
        const result = treeMap.map((value, key, map) => {
            const mapSize = map.size();
            return `${value}-${mapSize}`;
        });

        expect(result.get(50)).toBe("50-11");
        expect(result.get(40)).toBe("40-11");
        expect(result.get(30)).toBe("30-11");
        expect(result.get(10)).toBe("10-11");
        expect(result.get(20)).toBe("20-11");
        expect(result.get(100)).toBe("100-11");
    })

    test('mapKeys()', () => {
        const result = treeMap.mapKeys((key, value) => key * 2);
        expect(result.get(50 * 2)).toBe("50");
        expect(result.get(40 * 2)).toBe("40");
        expect(result.get(30 * 2)).toBe("30");
        expect(result.get(10 * 2)).toBe("10");
        expect(result.get(20 * 2)).toBe("20");
        expect(result.get(100 * 2)).toBe("100");
        expect(result.size()).toBe(arrDistinct.length)
    })

    test('mapKeys() map with thisArg', () => {
        const thisArg = { multiplier: 3 };
        const newCompare = (a: number, b: number) => b - a;
        const result = treeMap.mapKeys((key) => {
            if (thisArg) {
                return key * thisArg.multiplier;
            } else {
                return key * 3;
            }
        }, thisArg, newCompare);
        expect(result.get(50 * 3)).toBe("50");
        expect(result.get(40 * 3)).toBe("40");
        expect(result.get(30 * 3)).toBe("30");
        expect(result.get(10 * 3)).toBe("10");
        expect(result.get(20 * 3)).toBe("20");
        expect(result.get(100 * 3)).toBe("100");
        expect(result.size()).toBe(arrDistinct.length)
    })

    test('mapEntries()', () => {
        const result = treeMap.mapEntries(([k, v]) => {
            return [k * 2, v + v]
        });

        expect(result.get(50 * 2)).toBe("5050");
        expect(result.get(40 * 2)).toBe("4040");
        expect(result.get(30 * 2)).toBe("3030");
        expect(result.get(10 * 2)).toBe("1010");
        expect(result.get(20 * 2)).toBe("2020");
        expect(result.get(100 * 2)).toBe("100100");
        expect(result.size()).toBe(arrDistinct.length)
    })

    test('mapEntries() with thisArg and compare in descending order', () => {
        const thisArg = { multiplier: 3 };
        const newCompare = (a: number, b: number) => b - a;
        const result = treeMap.mapEntries(([k, v]) => {
            if (thisArg) {
                return [k * thisArg.multiplier, v + v]
            } else {
                return [k * 3, v + v]
            }
        }, thisArg, newCompare);

        expect(result.get(50 * 3)).toBe("5050");
        expect(result.get(40 * 3)).toBe("4040");
        expect(result.get(30 * 3)).toBe("3030");
        expect(result.get(10 * 3)).toBe("1010");
        expect(result.get(20 * 3)).toBe("2020");
        expect(result.get(100 * 3)).toBe("100100");
        expect(result.size()).toBe(arrDistinct.length)

        expect(result.firstKey()).toBe(100 * 3);
        expect(result.lastKey()).toBe(0 * 3);
    })

    test('mapEntries() with thisArg and compare in ascending order', () => {
        const thisArg = { multiplier: 3 };
        const newCompare = (a: number, b: number) => a - b;
        const result = treeMap.mapEntries(([k, v]) => {
            if (thisArg) {
                return [k * thisArg.multiplier, v + v]
            } else {
                return [k * 3, v + v]
            }
        }, thisArg, newCompare);

        expect(result.get(50 * 3)).toBe("5050");
        expect(result.get(40 * 3)).toBe("4040");
        expect(result.get(30 * 3)).toBe("3030");
        expect(result.get(10 * 3)).toBe("1010");
        expect(result.get(20 * 3)).toBe("2020");
        expect(result.get(100 * 3)).toBe("100100");
        expect(result.size()).toBe(arrDistinct.length)

        expect(result.firstKey()).toBe(0 * 3);
        expect(result.lastKey()).toBe(100 * 3);
    })

    test('flatMap() with thisArg', () => {
        const thisArg = { multiplier: 2 };
        const result = treeMap.flatMap((value, key) => {
            const newKey = key * thisArg.multiplier;
            const newValue = value + value;
            return new TreeMap<number, string>(compare).set(newKey, newValue);
        }, thisArg);
        expect(result.get(50 * 2)).toBe("5050");
        expect(result.get(40 * 2)).toBe("4040");
    })

    test('filter()', () => {
        const result = treeMap.filter((value, key) => key > 30);
        const expected = arrDistinct.filter((value) => value > 30);
        expect(result.size()).toBe(expected.length);
        expect(result.has(40)).toBeTruthy();
        expect(result.has(50)).toBeTruthy();
        expect(result.has(55)).toBeTruthy();
        expect(result.has(100)).toBeTruthy();
    })

    test('filter() with thisArg', () => {
        const thisAarg = { listIncluded: [40, 50] };
        const result = treeMap.filter((value, key) => {
            return thisAarg.listIncluded.includes(key);
        }
            , thisAarg);
        expect(result.size()).toBe(2);
        expect(result.has(40)).toBeTruthy();
        expect(result.has(50)).toBeTruthy();
    })

    test('partition()', () => {
        const [trueTree, falseTree] = treeMap.partition((value, key) => key > 30);
        const expectedTrue = arrDistinct.filter((value) => value > 30);
        const expectedFalse = arrDistinct.filter((value => value <= 30));
        expect(trueTree.size()).toBe(expectedTrue.length);
        expect(falseTree.size()).toBe(expectedFalse.length);

        expect(trueTree.size()).toBe(expectedTrue.length);
        for (const entry of expectedTrue) {
            expect(trueTree.has(entry)).toBeTruthy();
        }

        expect(falseTree.size()).toBe(expectedFalse.length);
        for (const entry of expectedFalse) {
            expect(falseTree.has(entry)).toBeTruthy();
        }
    })

    test('flip() check that the keys and values are flipped', () => {
        const flipped = treeMap.flip();
        expect(flipped.size()).toBe(arrDistinct.length);
        expect(flipped.get("50")).toBe(50);
        expect(flipped.get("40")).toBe(40);
        expect(flipped.get("30")).toBe(30);
        expect(flipped.get("10")).toBe(10);
        expect(flipped.get("20")).toBe(20);
    })

    test('cut()', () => {
        const result = treeMap.cut(((k: number) => k % 3), 1, 2);
        const expected = [10, 25, 40, 55, 100];
        expect(result.size()).toBe(expected.length);
        for (const elem of expected) {
            expect(result.has(elem)).toBeTruthy();
        }
    })

    test('rangeFrom()', () => {
        const result = treeMap.rangeFrom(30);
        const expected = [30, 40, 45, 50, 55, 100];
        expect(result.size()).toBe(6);
        for (const elem of expected) {
            expect(result.has(elem)).toBeTruthy();
        }
    })

    test('rangeTo()', () => {
        const result = treeMap.rangeTo(30);
        const expected = arrDistinct.filter((elem) => elem <= 30);
        expect(result.size()).toBe(expected.length);
        for (const elem of expected) {
            expect(result.has(elem)).toBeTruthy();
        }
    })

    test('rangeFromTo()', () => {
        const result = treeMap.rangeFromTo(30, 50);
        const expected = arrDistinct.filter((elem) => elem >= 30 && elem < 50);
        expect(result.size()).toBe(expected.length);
        for (const elem of expected) {
            expect(result.has(elem)).toBeTruthy();
        }
    })

    test('removeRangeFrom()', () => {
        const result = treeMap.removeRangeFrom(30);
        const expected = arrDistinct.filter((elem) => elem < 30);
        expect(result.size()).toBe(expected.length);
        for (const elem of expected) {
            expect(result.has(elem)).toBeTruthy();
        }
    })

    test('removeRangeTo()', () => {
        const result = treeMap.removeRangeTo(55);
        const expected = arrDistinct.filter((elem) => elem >= 55);
        expect(result.size()).toBe(expected.length);
        for (const elem of expected) {
            expect(result.has(elem)).toBeTruthy();
        }

    })

    test('removeRangeFromTo()', () => {
        const result = treeMap.removeRangeFromTo(30, 50);
        const expected = arrDistinct.filter((elem) => elem < 30 || elem >= 50);
        expect(result.size()).toBe(expected.length);
        for (const elem of expected) {
            expect(result.has(elem)).toBeTruthy();
        }
    })

})

const cmp = TreeMap.defaultComparator;

function node(
    key: number,
    left?: TreeMap<number, string>,
    right?: TreeMap<number, string>
): TreeMap<number, string> {
    return new TreeMap<number, string>(
        cmp,                               // comparator
        undefined as any,                  // let ctor default the colour
        left ?? new TreeMap<number, string>(cmp),
        [key, key.toString()],
        right ?? new TreeMap<number, string>(cmp)
    );
}


describe('TreeMap isBST()', () => {
    const empty = new TreeMap<number, string>(cmp);
    test('fails when the left child key is GREATER than the parent key', () => {
        //   10
        //  /
        // 15     ← bad: 15 ≥ 10 on left
        const badTree = node(10, node(15), empty);
        expect(badTree.isBST()).toBe(false);
    });

    test('fails when the right child key is SMALLER than the parent key', () => {
        // 10
        //   \
        //    5   ← bad: 5 ≤ 10 on right
        const badTree = node(10, empty, node(5));
        expect(badTree.isBST()).toBe(false);
    });

    test('fails when the left child key is EQUAL to the parent key', () => {
        // 10
        // /
        // 10  ← bad: duplicate on left
        const badTree = node(10, node(10), empty);
        expect(badTree.isBST()).toBe(false);
    });

    test('fails when the right child key is EQUAL to the parent key', () => {
        // 10
        //   \
        //    10 ← bad: duplicate on right
        const badTree = node(10, empty, node(10));
        expect(badTree.isBST()).toBe(false);
    });

    test('fails for a DEEP violation: grand-child in left subtree greater than the root', () => {
        //
        //        20
        //       /  \
        //     10    30
        //       \
        //        25
        //
        const leftSub = node(10, empty, node(25));   // 25 breaks the global BST rule
        const badTree = node(20, leftSub, node(30));
        expect(badTree.isBST()).toBe(false);
    });
});