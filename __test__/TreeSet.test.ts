import TreeSet from "../src/Trees/TreeSet";
import {shuffleArray, createRandomStringArray} from "../src/Utils/Utils";


describe("TreeMap", () => {

    const compare = (a: string, b: string) => a.localeCompare(b)
    const compareReversed = (a: string, b: string) => b.localeCompare(a);
    let tree: TreeSet<string> = new TreeSet<string>(compare);
    const arr = [50, 40, 30, 10, 20, 30, 100, 0, 45, 55, 25, 15].map((num) => num.toString());
    const arrDistinct = Array.from(new Set(arr));
    const arrDistinctSorted = arrDistinct.slice().sort(compare);
    const arrDistinctReversed = arrDistinct.slice().sort(compareReversed);

    const arr2 = [50, 40, 30, 10, 20, 30, 100, 0, 45, 55, 25, 15];
    let treeNumbers = new TreeSet<number>((a, b) => a - b);

    beforeEach(() => {
        arr.forEach((elem) => {
            tree = tree.add(elem);
        })
        arr2.forEach((elem) => {
            treeNumbers = treeNumbers.add(elem);
        })
    });

    test('validate red-black tree properties when adding and deleting many values', () => {
        let tree = new TreeSet(compare);
        let elements = createRandomStringArray(10_000, 1, 1000);
        elements = shuffleArray(elements);

        for (const elem of elements) {
            tree = tree.add(elem);
            // expect(newTree.isBST()).toBeTruthy();
            // expect(newTree.redInvariant()).toBeTruthy();
            // expect(newTree.blackBalancedInvariant()).toBeTruthy();
            expect(tree.validateRedBlackTree()).toBeTruthy();
        }

        const elementsToDelete = shuffleArray(elements);
        for (const elem of elementsToDelete) {
            tree = tree.delete(elem);
            // expect(newTree.isBST()).toBeTruthy();
            // expect(newTree.redInvariant()).toBeTruthy();
            // expect(newTree.blackBalancedInvariant()).toBeTruthy();
            expect(tree.validateRedBlackTree()).toBeTruthy();
        }
    })

    test('validate red-black tree properties when adding and deleting many values of a tree in reversed order', () => {
        let tree = new TreeSet(compareReversed);
        let elements = createRandomStringArray(10_000, 1, 1000);
        elements = shuffleArray(elements);

        for (const elem of elements) {
            tree = tree.add(elem);
            // expect(newTree.isBST()).toBeTruthy();
            // expect(newTree.redInvariant()).toBeTruthy();
            // expect(newTree.blackBalancedInvariant()).toBeTruthy();
            expect(tree.validateRedBlackTree()).toBeTruthy();
        }

        const elementsToDelete = shuffleArray(elements);
        for (const elem of elementsToDelete) {
            tree = tree.delete(elem);
            // expect(newTree.isBST()).toBeTruthy();
            // expect(newTree.redInvariant()).toBeTruthy();
            // expect(newTree.blackBalancedInvariant()).toBeTruthy();
            expect(tree.validateRedBlackTree()).toBeTruthy();
        }
    })

    test('static of() method', () => {
        const tree = TreeSet.of("hello", "world");
        expect(tree.size()).toBe(2);
        expect(tree.has("hello")).toBeTruthy();
        expect(tree.has("world")).toBeTruthy();
    })

    test('isEmpty()', () => {
        tree = tree.clear();
        expect(tree.isEmpty()).toBeTruthy();
    })

    test('has()', () => {
        const res = tree.has("100");
        expect(res).toBeTruthy();
    })

    test('hasAll()', () => {
        const res = tree.hasAll(arrDistinct);
        expect(res).toBeTruthy();
    })

    test('deleteAll()', () => {
        const res = tree.deleteAll(arrDistinct);
        expect(res.size()).toBe(0);

    })
    test('toArray()', () => {
        const res = tree.toArray();
        expect(res).toEqual(arrDistinctSorted);
    }) 

    test('equals()', () => {
        let tree1 = new TreeSet(compare);
        arr.forEach((elem) => {
            tree1 = tree1.add(elem);
        })
        let tree2 = new TreeSet(compareReversed);
        arr.forEach((elem) => {
            tree2 = tree2.add(elem);
        })

        expect(tree.equals(tree1)).toBeTruthy();
        expect(tree1.equals(tree2)).toBeFalsy();
    })

    test('compareTo()', () => {
        let set1 = new TreeSet<number>((a, b) => a - b);
        let set2 = new TreeSet<number>((a, b) => a - b);
        let set3 = new TreeSet<number>((a, b) => a - b);
    
        // same elements in the same order
        set1 = set1.add(10).add(20).add(30);
        set2 = set2.add(10).add(20).add(30);
    
        // different elements in the same order
        set3 = set3.add(10).add(20).add(40);
    
        expect(set1.compareTo(set2)).toBe(0);
        expect(set2.compareTo(set1)).toBe(0);
    
        expect(set1.compareTo(set3)).toBeLessThan(0);
    
        expect(set3.compareTo(set1)).toBeGreaterThan(0);

        // different sizes
        let set4 = new TreeSet<number>((a, b) => a - b);
        set4 = set4.add(10).add(20);
        expect(set1.compareTo(set4)).toBeGreaterThan(0);
    });

    test('hashCode() that accounts for order of the elements', () => {
        const hash = tree.hashCode();

        let tree1 = new TreeSet(compare);
        arr.forEach((elem) => {
            tree1 = tree1.add(elem);
        })

        let tree2 = new TreeSet(compareReversed);
        arr.forEach((elem) => {
            tree2 = tree2.add(elem);
        })

        expect(tree.hashCode()).toBe(hash);
        expect(tree1.hashCode()).toBe(hash);
        expect(tree2.hashCode()).not.toBe(hash);
    })

    test('hashCode() is cached and does not change', () => {
        const newTree = new TreeSet<number>((a, b) => a-b);
        const tree1 = newTree.add(1); 
        const tree2 = tree1.add(2); 
        const tree3 = tree2.add(3); 
        const tree4 = tree3.add(4); 
        const tree5 = tree4.add(5);
        const tree6 = tree5.add(6);
        const tree7 = tree6.add(7);
        const hashCodeOfTree7 = tree7.hashCode();

        const tree8 = tree7.add(8);
        const tree9 = tree8.add(9);
        const tree10 = tree9.add(10);

        const hashCodeOfTree7Pram = tree7.hashCode();

        expect(hashCodeOfTree7).toBe(hashCodeOfTree7Pram);
        expect(hashCodeOfTree7).not.toBe(tree10.hashCode());
    })

    test('every()', () => {
        const res = tree.every((value) => value.length > 0);
        expect(res).toBeTruthy();
    });

    test('every() with thisArg', () => {
        const res = tree.every(function(value) {
            return value.length > 0;
        }, this);
        expect(res).toBeTruthy();
    });

    test('some()', () => {
        const res = tree.some((value) => value.length === 0);
        expect(res).toBeFalsy();
    })

    test('sort()', () => {
        const res = tree.sort();
        expect(res.toArray()).toEqual(arrDistinctSorted);
    })

    test('sort() reversed', () => {
        const res = tree.sort(compareReversed);
        expect(res.toArray()).toEqual(arrDistinctReversed);
    })

    test('sortBy() the length of the string', () => {
        const res = tree.sortBy((value) => value.length);
        expect(res.size()).toEqual(arrDistinct.length);
        const expected = arrDistinct.slice().sort((a,b) => {
            const diff = a.length - b.length;
            return diff !== 0 ? diff : a.localeCompare(b)
        });
        expect(res.toArray()).toEqual(expected);
    })

    test('sortBy() reversed', () => {
        const res = tree.sortBy((value) => value.length, (a, b) => b - a);
        expect(res.size()).toEqual(arrDistinctReversed.length);
        const expected = arrDistinct.slice().sort((a,b) => {
            const diff = b.length - a.length;
            return diff !== 0 ? diff : a.localeCompare(b)
        })
        expect(res.toArray()).toEqual(expected);
    })

    test('forEach() get the length of the tree', () => {
        let count = 0;
        tree.forEach((_) => count++);
        expect(count).toBe(arrDistinct.length);
    })

    test('find()', () => {
        const res = tree.find((value) => value.length === 0);
        expect(res).toBeUndefined();

        const res2 = tree.find((value) => value === "100");
        expect(res2).toBe("100");

        const res3 = tree.find((value) => value === "0");
        expect(res3).toBe("0");
    })

    test('reduce()', () => {
        const res = tree.reduce((acc, value) => acc + value, "");
        expect(res).toBe(arrDistinctSorted.join(""));
    });

    test('reduceRight()', () => {
        const res = tree.reduceRight((acc, value) => acc + value, "");
        expect(res).toBe(arrDistinctSorted.reverse().join(""));
    });

    test('union(), merge() and concat() produce the same result', () => {
        const other = TreeSet.of("hello", "world");
        const res = tree.union(other);
        expect(res.size()).toBe(arrDistinct.length + 2);
        expect(res.hasAll(arrDistinct)).toBeTruthy();
        expect(res.has("hello")).toBeTruthy();
        expect(res.has("world")).toBeTruthy();

        const other2 = TreeSet.of("hello", "world");
        const res2 = tree.merge(other2);
        expect(res2.size()).toBe(arrDistinct.length + 2);
        expect(res2.hasAll(arrDistinct)).toBeTruthy();
        expect(res2.has("hello")).toBeTruthy();
        expect(res2.has("world")).toBeTruthy();

        const other3 = TreeSet.of("hello", "world");
        const res3 = tree.concat(other3);
        expect(res3.size()).toBe(arrDistinct.length + 2);
        expect(res3.hasAll(arrDistinct)).toBeTruthy();
        expect(res3.has("hello")).toBeTruthy();
        expect(res3.has("world")).toBeTruthy();
    })

    test('intersect()', () => {
        const tree1 = TreeSet.of("1", "2", "3", "4", "5");
        const tree2 = TreeSet.of("3", "4", "5", "6", "7");
        const res = tree1.intersect(tree2);
        expect(res.size()).toBe(3);
        expect(res.has("3")).toBeTruthy();
        expect(res.has("4")).toBeTruthy();
        expect(res.has("5")).toBeTruthy();
    })

    test('subtract()', () => {
        const tree1 = TreeSet.of("1", "2", "3", "4", "5");
        const tree2 = TreeSet.of("3", "4", "5", "6", "7");
        const res = tree1.subtract(tree2);
        expect(res.size()).toBe(2);
        expect(res.has("1")).toBeTruthy();
        expect(res.has("2")).toBeTruthy();
    })

    test('map()', () => {
        const res = tree.map((value) => value.length);
        expect(res.size()).toBe(3);
        expect(res.toArray()).toEqual([1,2,3]);
    })

    test('flatMap()', () => {
        const res = tree.flatMap((value) => [value.length, value.length + 1]);
        expect(res.size()).toBe(4);
        expect(res.toArray()).toEqual([1,2,3,4]);
    })

    test('flatMap() again', () => {
        const set = TreeSet.of("a", "bb", "cc", "dddd");
        const res = set.flatMap((value) => [value, value.toUpperCase()])
        expect(res.size()).toBe(8);
        expect(res.toArray()).toEqual(['A', 'BB', 'CC', 'DDDD', 'a', 'bb', 'cc', 'dddd']);
    })

    test('filter()', () => {
        const res = tree.filter((value => value.length > 1));
        const expected = arrDistinct.filter((value) => value.length > 1);
        expect(res.size()).toBe(expected.length);
        for (const elem of expected) {
            expect(res.has(elem)).toBeTruthy();
        }
        expect(res.has("0")).toBeFalsy();
    })

    test('partition()', () => {
        const [trueTree, falseTree] = tree.partition((value) => value.length > 1);
        const trueExpected = arrDistinct.filter((value) => value.length > 1);
        const falseExpected = arrDistinct.filter((value) => value.length <= 1);
        expect(trueTree.size()).toBe(trueExpected.length);
        for (const elem of trueExpected) {
            expect(trueTree.has(elem)).toBeTruthy();
        }
        expect(falseTree.size()).toBe(falseExpected.length);
        for (const elem of falseExpected) {
            expect(falseTree.has(elem)).toBeTruthy();
        }
    })

    test('findMin()', () => {
        const res = tree.findMin();
        expect(res).toBe("0");
    })

    test('findMax()', () => {
        const res = tree.findMax();
        expect(res).toBe("55");
    })

    test('deleteMin()', () => {
        const res = tree.deleteMin();
        expect(res.size()).toBe(arrDistinct.length - 1);
        expect(res.has("0")).toBeFalsy();
    })

    test('deleteMax()', () => {
        const res = tree.deleteMax();
        expect(res.size()).toBe(arrDistinct.length - 1);
        expect(res.has("55")).toBeFalsy();
    })

    test('predecessor()', () => {
        const res = treeNumbers.predecessor(100);
        expect(res).toBe(55);

        const res2 = treeNumbers.predecessor(55);
        expect(res2).toBe(50);

        const res3 = treeNumbers.predecessor(10);
        expect(res3).toBe(0);
    })

    test('successor()', () => {
        const res = treeNumbers.successor(100);
        expect(res).toBeUndefined();

        const res2 = treeNumbers.successor(55);
        expect(res2).toBe(100);

        const res3 = treeNumbers.successor(10);
        expect(res3).toBe(15);
    })

    test('weakPredecessor() return the closest value or itself', () => {
        const res = treeNumbers.weakPredecessor(105);
        expect(res).toBe(100);

        const res2 = treeNumbers.weakPredecessor(53);
        expect(res2).toBe(50);

        const res3 = treeNumbers.weakPredecessor(10);
        expect(res3).toBe(10);
    })

    test('weakSuccessor() return the closest value or itself', () => {
        const res = treeNumbers.weakSuccessor(105);
        expect(res).toBe(undefined);

        const res2 = treeNumbers.weakSuccessor(53);
        expect(res2).toBe(55);

        const res3 = treeNumbers.weakSuccessor(10);
        expect(res3).toBe(10);

        const res4 = treeNumbers.weakSuccessor(7);
        expect(res4).toBe(10);
    })

    test('cut()', () => {
        // Test with numbers using identity function
        const treeNum = TreeSet.of(10, 20, 30, 40, 50);
        const res1 = treeNum.cut((x: number) => x, 20, 40);
        expect(res1.toArray()).toEqual([20, 30]);
    
        // Test with no matching elements
        const res2 = treeNum.cut((x: number) => x, 60, 70);
        expect(res2.size()).toBe(0);
    
        // Test with strings using a custom cut function
        let treeStr = new TreeSet<string>((a, b) => a.localeCompare(b));
        ['10', '20', '30', '40', '50'].forEach(num => {
            treeStr = treeStr.add(num);
        });
        const res3 = treeStr.cut((s: string) => parseInt(s, 10), '20', '40');
        expect(res3.toArray()).toEqual(['20', '30']);
    })

    test('rangeFrom()', () => {
        const tree1 = TreeSet.of(10, 20, 30, 40, 50, 60);
        const res1 = tree1.rangeFrom(30);
        expect(res1.toArray()).toEqual([30, 40, 50, 60]);

        const res2 = tree1.rangeFrom(35);
        expect(res2.toArray()).toEqual([40, 50, 60]);

        const res3 = tree1.rangeFrom(70);
        expect(res3.size()).toBe(0);
    })

    test('rangeTo()', () => {
        const tree1 = TreeSet.of(10, 20, 30, 40, 50, 60);
        const res1 = tree1.rangeTo(30);
        expect(res1.toArray()).toEqual([10, 20]);

        const res2 = tree1.rangeTo(35);
        expect(res2.toArray()).toEqual([10, 20, 30]);

        const res3 = tree1.rangeTo(5);
        expect(res3.size()).toBe(0);

    })

    test('rangeFromTo()', () => {
        const tree1 = TreeSet.of(10, 20, 30, 40, 50, 60);
        const res1 = tree1.rangeFromTo(20, 40);
        expect(res1.toArray()).toEqual([20, 30]);

        const res2 = tree1.rangeFromTo(25, 45);
        expect(res2.toArray()).toEqual([30, 40]);

        const res3 = tree1.rangeFromTo(70, 80);
        expect(res3.size()).toBe(0);
    })

    test('removeRangeFrom()', () => {
        const tree1 = TreeSet.of(21, 19, 17, 77, 66, 69, 96);
        const res1 = tree1.removeRangeFrom(50);
        expect(res1.toArray()).toEqual([17, 19, 21]);

        const res2 = tree1.removeRangeFrom(20);
        expect(res2.size()).toBe(2);
        expect(res2.toArray()).toEqual([17, 19]);

        // does not change
        const res3 = tree1.removeRangeFrom(100);
        expect(res3.size()).toBe(tree1.size());
    })

    test('removeRangeTo()', () => {
        const tree1 = TreeSet.of(21, 19, 17, 77, 66, 69, 96);
        const res1 = tree1.removeRangeTo(50);
        expect(res1.toArray()).toEqual([66, 69, 77, 96]);

        const res2 = tree1.removeRangeTo(20);
        expect(res2.size()).toBe(5);
        expect(res2.toArray()).toEqual([21, 66, 69, 77, 96]);

        const res3 = tree1.removeRangeTo(21);
        expect(res3.size()).toBe(5);
        expect(res3.toArray()).toEqual([21, 66, 69, 77, 96]);
    })

    test('removeRangeFromTo()', () => {
        const tree1 = TreeSet.of(21, 19, 17, 77, 66, 69, 96);
        const res1 = tree1.removeRangeFromTo(21, 77);
        expect(res1.toArray()).toEqual([17, 19, 77, 96]);
        
        const res2 = tree1.removeRangeFromTo(20, 80);
        expect(res2.toArray()).toEqual([17, 19, 96]);

        const res3 = tree1.removeRangeFromTo(0, 96);
        expect(res3.toArray()).toEqual([96])
    })
});