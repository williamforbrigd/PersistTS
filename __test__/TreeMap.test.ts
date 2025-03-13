import TreeMap from "../src/Trees/TreeMap";

// use this helper function when deleting nodes from the tree
function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

describe("TreeMap", () => {
    const compare = (a: number, b: number) => a-b;
    let treeMap: TreeMap<number, string> = new TreeMap<number, string>(null, compare);
    const arr = [50, 40, 30, 10, 20, 30, 100, 0, 45, 55, 25, 15];
    const arrDistinct = Array.from(new Set(arr));
    const arrDistinctSorted = arrDistinct.slice().sort((a, b) => a-b);
    const arrDistinctReversed = arrDistinct.slice().sort((a, b) => b-a);

    arr.forEach((value, index) => {
        treeMap = treeMap.set(value, value.toString());
    });

    // beforeEach(() => {
        
    // });

    test('validateRedBlackTree() properties after adding and deletion of many nodes', () => {
        const tree = new TreeMap(null, compare);
        let elements = [50, 40, 30, 10, 20, 30, 100, 0, 45, 55, 25, 15, 1000, 11111, 375, 376, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 389, 390];
        elements = shuffleArray(elements);

        let newTree = tree;
        for (const elem of elements) {
            newTree = newTree.set(elem, elem.toString());
            expect(newTree.validateRedBlackTree()).toBeTruthy();
        }

        // const elementsToDelete = shuffleArray(elements);
        // for (const elem of elementsToDelete) {
        //     newTree = newTree.delete(elem);
        //     expect(newTree.validateRedBlackTree()).toBeTruthy();
        // }
    })

    test('get()', () => {
        const value = treeMap.get(50);
        expect(value).toBe("50");
    })

    test('has()', () => {
        const hasKey = treeMap.has(0);
        expect(hasKey).toBeTruthy();
    })

    test('getRoot()', () => {
        expect(treeMap.getRoot()).not.toBeNull();
        expect(treeMap.getRoot()?.key).toBe(40);
        expect(treeMap.getRoot()?.value).toBe("40");
    })

    test('firstKey()', () => {
        const first = treeMap.firstKey();
        expect(first).toBe(40);
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
        const expected = arrDistinctSorted.map((value) => ({ key: value, value: value.toString() }));
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

    /*
    test('delete()', () => {
        const newTreeMap = treeMap.delete(1);
        expect(newTreeMap.has(1)).toBeFalsy();
        expect(newTreeMap.has(2)).toBeTruthy();
        expect(newTreeMap.has(3)).toBeTruthy();
    })
     */

    /*
    test('deleteAll()', () => {
        const newTreeMap = treeMap.deleteAll([1, 2]);
        expect(newTreeMap.has(1)).toBeFalsy();
        expect(newTreeMap.has(2)).toBeFalsy();
        expect(newTreeMap.has(3)).toBeTruthy();
    })

     */

    test('clear()', () => {
        const newTreeMap = treeMap.clear();
        expect(newTreeMap.isEmpty()).toBeTruthy();
    })

    test('equals()', () => {
        const otherTreeMap = new TreeMap<number, string>(null, compare)
            .set(1, "1").set(2, "2").set(3, "3");
        const otherTreeMap2 = new TreeMap<number, string>(null, (a: number, b: number) => b-a)
            .set(3, "3").set(2, "2").set(1, "1");
        expect(otherTreeMap.equals(otherTreeMap2)).toBeTruthy();
    });

    test('hashCode() same', () => {
        let otherTreeMap = new TreeMap<number, string>(null,compare);
        for (const elem of arr) {
           otherTreeMap = otherTreeMap.set(elem, elem.toString());
        }
        expect(treeMap.hashCode()).toBe(otherTreeMap.hashCode());
    })

    test('hashCode() differ', () => {
        const otherTreeMap = new TreeMap<number, string>(null, compare)
            .set(2, "2")
            .set(3, "3");
        expect(treeMap.hashCode()).not.toBe(otherTreeMap.hashCode());
    })

    test('copyOf()', () => {
        const copy = treeMap.copyOf(treeMap);
        expect(copy.hashCode()).toEqual(treeMap.hashCode());
    })

    test('check that hashCode() does not change', () => {
        const tree = new TreeMap<number, string>(null, compare);
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
       const result = treeMap.computeIfAbsent(50, (key) => "default");
        expect(result[0]).toBe(treeMap);
        expect(result[1]).toBe("50");

        const result2 = treeMap.computeIfAbsent(4, (key) => "default");
        expect(result2[0]).not.toBe(treeMap);
        expect(result2[1]).toBe("default");
    })


    test('computeIfPresent()', () => {
        const result = treeMap.computeIfPresent(15, (key, value) => "default");
        expect(result[0]).not.toBe(treeMap);
        expect(result[1]).toBe("default");

        const result2 = treeMap.computeIfPresent(4, (key, value) => "default");
        expect(result2[0]).toBe(treeMap);
        expect(result2[1]).not.toBe("default");
    })

    test('compute()', () => {
        const result = treeMap.compute(1, (key, value) => "default");
        expect(result[0]).not.toBe(treeMap);
        expect(result[1]).toBe("default");
    })


    test('of()', () => {
        const newTreeMap = TreeMap.of(
            (a: number, b: number) => a-b,
            {key: 1, value: "1"}, {key: 2, value: "2"}
        );
        expect(newTreeMap.size()).toBe(2);
        expect(newTreeMap.has(1)).toBeTruthy();
        expect(newTreeMap.get(1)).toBe("1");
        expect(newTreeMap.has(2)).toBeTruthy();
        expect(newTreeMap.get(2)).toBe("2");
    })

    test('every()', () => {
        const result = treeMap.every((value, key, map) => key >= 0);
        expect(result).toBeTruthy();

        const result2 = treeMap.every((value, key, map) => key > 1);
        expect(result2).toBeFalsy();
    })

    test('some()', () => {
        const result = treeMap.some((value, key, map) => key > 0);
        expect(result).toBeTruthy();

        const result2 = treeMap.some((value, key, map) => key > 150);
        expect(result2).toBeFalsy();
    })


    test('sort()', () => {
        const result = treeMap.sort();
        expect(result.size()).toBe(arrDistinct.length);

        const reversed = treeMap.sort(
            (a: number, b: number) => b-a
        );
        expect(reversed.size()).toBe(arrDistinct.length);
        expect(Array.from(reversed.keys())).toEqual(arrDistinctReversed);
    })

    // test('sortBy() sort by key', () => {
    //     const sortedByKey = treeMap.sortBy((value, key) => key,
    //         (a: number, b: number) => b - a
    //     );
    //     expect(sortedByKey.size()).toBe(3);
    //     expect(sortedByKey.has(1)).toBeTruthy();
    //     expect(sortedByKey.has(2)).toBeTruthy();
    //     expect(sortedByKey.has(3)).toBeTruthy();
    //     expect(Array.from(sortedByKey.keys())).toEqual([3, 2, 1]);
    // });

    // test('sortBy() sort by value', () => {
    //     const sortedByValue = treeMap.sortBy((value) => value,
    //         (a: string, b: string) => a.length - b.length,
    //     );

    //     expect(sortedByValue.size()).toBe(3);
    //     expect(sortedByValue.has(1)).toBeTruthy();
    //     expect(sortedByValue.has(2)).toBeTruthy();
    //     expect(sortedByValue.has(3)).toBeTruthy();
    //     expect(Array.from(sortedByValue.keys())).toEqual([3, 2, 1]);
    // })

    test('forEach() keys', () => {
        const expected = arrDistinct.reduce((acc, curr) => acc + curr, 0);

        let sum=0;
        treeMap.forEach((value, key, map) => {
            sum += key;
        });
        expect(sum).toBe(expected);
    });

    test('forEach() values', () => {
        // const expected = arrDistinctSorted.reduce((acc: string, curr: number) => acc + curr.toString(), "");
        const expected = treeMap.values().reduce((acc, curr) => acc + curr, "");

        let sum="";
        treeMap.forEach((value: string, key: number, map) => {
            sum += value;
        })
        expect(sum).toBe(expected);
    })

    test('find()', () => {
        const result = treeMap.find((value, key, map) => key === 15);
        expect(result).toBe("15");

        const result2 = treeMap.find((value, key, map) => key === 666);
        expect(result2).toBeUndefined();
    })

    test('reduce() keys', () => {
        const expected = arrDistinct.reduce((acc, curr) => acc + curr, 0);
        const result = treeMap.reduce((accumulator, value, key, map) => accumulator + key, 0);
        expect(result).toBe(expected);
    })

    test('reduce() values', () => {
        const expected = arrDistinctSorted.reduce((acc, curr) => acc + curr.toString(), "");
        const result = treeMap.reduce((accumulator, value, key, map) => accumulator + value, "");
        expect(result).toBe(expected);
    })

    test('reduceRight() keys', () => {
        const expected = arrDistinct.reduce((acc, curr) => acc + curr, 0);
        const result = treeMap.reduceRight((accumulator, value, key, map) => accumulator + key, 0);
        expect(result).toBe(expected);
    })

    test('reduceRight() values', () => {
        const expected = arrDistinctReversed.reduce((acc, curr) => acc + curr.toString(), "");
        const result = treeMap.reduceRight((accumulator, value, key, map) => accumulator + value, "");
        expect(result).toBe(expected);
    })

    test('findMin()', () => {
        const result = treeMap.findMin();
        expect(result?.key).toEqual(0);
        expect(result?.value).toEqual("0");
    });

    // test('deleteMin()', () => {
    //     const result = treeMap.deleteMin();
    //     expect(result.has(1)).toBeFalsy();
    //     expect(result.has(2)).toBeTruthy();
    //     expect(result.has(3)).toBeTruthy();
    // })

    test('findMax()', () => {
        const max = treeMap.findMax();
        expect(max).not.toBeNull();
        expect(max?.key).toBe(100);
        expect(max?.value).toBe("100");
    })

    test('findMax() pass in key', () => {
        // the max subchildren of 20 is 30 for this specific tree
        const maxOfNode = treeMap.findMax(20);
        expect(maxOfNode?.key).toBe(30);
    })

    // test('deleteMax()', () => {
    //     const result = treeMap.deleteMax();
    //     expect(result.has(1)).toBeTruthy();
    //     expect(result.has(2)).toBeTruthy();
    //     expect(result.has(3)).toBeFalsy();
    // })


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

    test('successor()', () => {
        const succ = treeMap.successor(0);
        expect(succ?.key).toBe(10);

        const succ2 = treeMap.successor(2);
        expect(succ2?.key).toBe(undefined);

        const succ3 = treeMap.successor(0);
        expect(succ3?.key).toBe(10);

    });

    test('predecessor()', () => {
        const pred = treeMap.predecessor(50);
        expect(pred?.key).toBe(45);

        const pred2 = treeMap.predecessor(2);
        expect(pred2?.key).toBe(undefined);

        const pred3 = treeMap.predecessor(40);
        expect(pred3?.key).toBe(30);
    });

    test('merge() with other treeMap', () => {
        const otherTreeMap = new TreeMap<number, string>(null, compare)
            .set(666, "666")
            .set(555, "555");
        const expectedSize = arrDistinct.length + 2;
        const result = treeMap.merge(otherTreeMap);
        expect(result.size()).toBe(expectedSize);
        expect(result.has(50)).toBeTruthy();
        expect(result.has(666)).toBeTruthy();
        expect(result.has(555)).toBeTruthy();
        expect(result.findMax()?.key).toBe(666);
    })

    test('merge() with other iterable', () => {
        const iterable = [{key: 666, value: "666"}, {key: 555, value: "555"}];
        const expectedSize = arrDistinct.length + 2;
        const result = treeMap.merge(iterable);
        expect(result.size()).toBe(expectedSize);
        expect(result.has(50)).toBeTruthy();
        expect(result.has(666)).toBeTruthy();
        expect(result.has(555)).toBeTruthy();
        expect(result.findMax()?.key).toBe(666);
    })

    test('concat() with an iterable', () => {
        const iterable = [{key: 666, value: "666"}, {key: 555, value: "555"}];
        const expectedSize = arrDistinct.length + 2;
        const result = treeMap.concat(iterable);
        expect(result.size()).toBe(expectedSize);
        expect(result.has(50)).toBeTruthy();
        expect(result.has(666)).toBeTruthy();
        expect(result.has(555)).toBeTruthy();
        expect(result.findMax()?.key).toBe(666);
    })

})