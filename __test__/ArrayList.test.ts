import ArrayList from "../src/Arrays/ArrayList";
import LinkedList from "../src/LinkedLists/LinkedList";
import { createRandomIntArray, shuffleArray } from "../src/Utils/Utils";
import Sorting from "../src/Sorting/Sorting";

describe("ArrayList", () => {
    let arr: ArrayList<number>;

    beforeEach(() => {
        arr = new ArrayList<number>([1, 2, 3]);
    });

    test('contains', () => {
        const result = arr.has(2);
        expect(result).toBe(true);
    });

    test('containsAll', () => {
        const result = arr.hasAll([1, 2]);
        expect(result).toBe(true);
    });

    test('should initialize with given items', () => {
        expect(arr.length).toBe(3);
        expect(arr).toStrictEqual(new ArrayList([1, 2, 3]));
    });

    test('should map items correctly', () => {
        const result = arr.map(x => x * 2);
        expect(result).toStrictEqual(new ArrayList([2, 4, 6]));
    });

    test('should check every item correctly', () => {
        const allAboveZero = arr.every(x => x > 0);
        expect(allAboveZero).toBe(true);

        const allAboveTwo = arr.every(x => x > 2);
        expect(allAboveTwo).toBe(false);

        const allNumbers = arr.every(x => typeof x === 'number');
        expect(allNumbers).toBe(true);
    });

    test('should use thisArg correctly in map', () => {
        class Multiplier {
            factor: number;
            constructor(factor: number) {
                this.factor = factor;
            }
            multiply(value: number): number {
                return value * this.factor;
            }
        }

        const multiplier = new Multiplier(2);
        const result = arr.map(multiplier.multiply, multiplier);
        expect(result).toStrictEqual(new ArrayList([2, 4, 6]));
    });

    test('should filter items correctly', () => {
        const result = arr.filter(x => x > 1);
        expect(result).toStrictEqual(new ArrayList([2, 3]));
    });

    test('concat', () => {
        const arr2 = new ArrayList<number>([4, 5, 6]);
        const result1 = arr.concat(arr2);
        expect(result1).toStrictEqual(new ArrayList([1, 2, 3, 4, 5, 6]));

        const result2 = arr.concat([7, 8, 9]);
        expect(result2).toStrictEqual(new ArrayList([1, 2, 3, 7, 8, 9]));

        const result3 = arr.concat(10, 11, 12);
        expect(result3).toStrictEqual(new ArrayList([1, 2, 3, 10, 11, 12]));

        const result4 = arr.concat(13, [14, 15], new ArrayList<number>([16, 17]));
        expect(result4).toStrictEqual(new ArrayList([1, 2, 3, 13, 14, 15, 16, 17]));
    });

    test('every', () => {
        const allAboveZero = arr.every(x => x > 0);
        expect(allAboveZero).toBe(true);

        const allAboveTwo = arr.every(x => x > 2);
        expect(allAboveTwo).toBe(false);
    });

    test('filter', () => {
        const result = arr.filter(x => x > 1);
        expect(result).toStrictEqual(new ArrayList([2, 3]));

        const result2 = arr.filter(x => x > 3);
        expect(result2).toStrictEqual(new ArrayList([]));
    });

    test('findAll', () => {
        const result = arr.findAll(x => x === 1);
        expect(result).toStrictEqual(new ArrayList([1]));
    });

    test('flatMap', () => {
        const result = arr.flatMap(x => [x, x]);
        expect(result).toStrictEqual(new ArrayList([1, 1, 2, 2, 3, 3]));
    });

    test('forEach', () => {
        let sum = 0;
        arr.forEach(x => sum += x);
        expect(sum).toBe(6);
    });

    test('forEach with thisArg passed', () => {
        class Adder {
            sum: number;
            constructor() {
                this.sum = 0;
            }
            add(value: number) {
                this.sum += value;
            }
        }

        const adder = new Adder();
        arr.forEach(adder.add, adder);
        expect(adder.sum).toBe(6);
    });

    test('getFirst', () => {
        const first = arr.getFirst();
        expect(first).toBe(1);
    });

    test('getLast', () => {
        const result = arr.getLast();
        expect(result).toBe(3);
    });

    test('indexOf', () => {
        const index = arr.indexOf(2);
        expect(index).toBe(1);
    });

    test('isEmpty', () => {
        const result = arr.isEmpty();
        expect(result).toBe(false);
    });

    test('join', () => {
        const result = arr.join('-');
        expect(result).toBe('1-2-3');
    });

    test('lastIndexOf', () => {
        const result = arr.lastIndexOf(2);
        expect(result).toBe(1);
    });

    test('map', () => {
        const result = arr.map(x => x * 2);
        expect(result).toStrictEqual(new ArrayList([2, 4, 6]));
    });

    test('merge', () => {
        const arr2 = new ArrayList<number>([4, 5, 6]);
        const result = arr.merge(arr2);
        expect(result).toStrictEqual(new ArrayList([1, 2, 3, 4, 5, 6]));
    });

    test('partition', () => {
        const [trueItems, falseItems] = arr.partition(x => x > 1);
        expect(trueItems).toStrictEqual(new ArrayList([2, 3]));
        expect(falseItems).toStrictEqual(new ArrayList([1]));
    });

    test('reduce', () => {
        const result = arr.reduce((acc, x) => acc + x, 0);
        expect(result).toBe(6);
    });

    test('reduce gives error', () => {
        const emptyArr = new ArrayList<number>();
        expect(() => emptyArr.reduce((acc, x) => acc + x)).toThrow("Reduce of empty array with no initial value");
    });

    test('reduceRight', () => {
        const result = arr.reduceRight((acc, x) => acc + x, 0);
        expect(result).toBe(6);
    });

    test('removeItem', () => {
        const result = arr.removeItem(2);
        expect(result).toStrictEqual(new ArrayList([1, 3]));
    });

    test('remove first', () => {
        const result = arr.removeFirst();
        expect(result).toStrictEqual(new ArrayList([2, 3]));
    });

    test('removeAll', () => {
        const result = arr.removeAll([1, 3]);
        expect(result).toStrictEqual(new ArrayList([2]));
    });

    test('remove() at index', () => {
        const result = arr.remove(1);
        expect(result).toStrictEqual(new ArrayList([1, 3]));
    });

    test('removeIf()', () => {
        const result = arr.removeIf(x => x === 2);
        expect(result).toStrictEqual(new ArrayList([1, 3]));
    });

    test('replaceAll', () => {
        const result = arr.replaceAll([4, 5, 6]);
        expect(result).toStrictEqual(new ArrayList([4, 5, 6]));
    });

    test('retainAll', () => {
        const result = arr.retainAll([1, 3]);
        expect(result).toStrictEqual(new ArrayList([1, 3]));
    });

    test('reversed', () => {
        const result = arr.reversed();
        expect(result).toStrictEqual(new ArrayList([3, 2, 1]));
    });

    test('set', () => {
        const result = arr.set(1, 4);
        expect(result).toStrictEqual(new ArrayList([1, 4, 3]));
    });

    test('pop() on empty list', () => {
        let arr = new ArrayList<number>();
        expect(() => {
            arr = arr.pop();
        }).toThrow("Cannot pop from an empty list");
    })

    test('pop() one element is size - 1', () => {
        const arr = new ArrayList<number>([1, 2, 3]);
        const result = arr.pop();
        expect(result).toStrictEqual(new ArrayList([1, 2]));
    })

    test('pop() all the elements from the list', () => {
        const array = createRandomIntArray(10000);
        let arr = new ArrayList(array);
        expect(arr.length).toBe(10000);

        for (const _ of array) {
            arr = arr.pop();    
        }
        expect(arr.length).toBe(0);
    })

    test('shift', () => {
        const result = arr.shift();
        expect(result).toStrictEqual(new ArrayList([2, 3]));
    });

    test('slice', () => {
        const result = arr.slice(1, 2);
        expect(result).toStrictEqual(new ArrayList([2]));
    });

    test('slice with start', () => {
        const result = arr.slice(1);
        expect(result).toStrictEqual(new ArrayList([2, 3]));
    });

    test('slice with no parameters', () => {
        const result = arr.slice();
        expect(result).toStrictEqual(new ArrayList([1, 2, 3]));
    });

    test('some', () => {
        const result = arr.some(x => x > 2);
        expect(result).toBe(true);
    });

    test('sort', () => {
        const arr = new ArrayList<number>([3, 1, 2]);
        const result = arr.sort((a: number, b: number) => a - b);
        expect(result).toStrictEqual(new ArrayList([1, 2, 3]));
    });

    test('sort() method that uses the timSort method to sort large array in ascending and descending order', () => {
        const rndShuffled = shuffleArray(createRandomIntArray(1_000_000, 1, 10000));
        const arr = new ArrayList(rndShuffled);

        const compareAscending = (a: number, b: number) => a - b;
        const compareDescending = (a: number, b: number) => b - a;

        const sortedAscending = arr.sort(compareAscending);
        const sortedDescending = arr.sort(compareDescending);

        expect(Sorting.isSorted(sortedAscending.toArray(), compareAscending)).toBeTruthy();
        expect(Sorting.isSorted(sortedDescending.toArray(), compareDescending)).toBeTruthy();
    })

    test('sortedBy', () => {
        const arr = new ArrayList<number>([3, 1, 2]);
        const result = arr.sortedBy(x => x);
        expect(result).toStrictEqual(new ArrayList([1, 2, 3]));
    });

    test('sortedBy() on large array', () => {
        const rndShuffled = shuffleArray(createRandomIntArray(1_000_000, 1, 10000));
        const arr = new ArrayList(rndShuffled);

        const sorted = arr.sortedBy(x => x*x);
        expect(Sorting.isSorted(sorted.toArray(), (a: number, b: number) => a - b)).toBeTruthy();
    })

    test('splice', () => {
        const arr = new ArrayList<number>([1, 2, 3]);

        let result = arr.splice(1, 1);
        expect(result).toStrictEqual(new ArrayList([1, 3]));

        result = arr.splice(1, 0, 4, 5);
        expect(result).toStrictEqual(new ArrayList([1, 4, 5, 2, 3]));

        result = arr.splice(1, 2, 6);
        expect(result).toStrictEqual(new ArrayList([1, 6]));

        result = arr.splice(0);
        expect(result).toStrictEqual(new ArrayList([]));
    });

    test('unshift', () => {
        const result = arr.unshift(4, 5, 6);
        expect(result).toStrictEqual(new ArrayList([4, 5, 6, 1, 2, 3]));
    });

    test('zip() function with either List<T> or just T[]', () => {
        const result = arr.zip(new ArrayList([4, 5, 6]));
        const result2 = arr.zip([4, 5, 6]);

        expect(result).toStrictEqual(new ArrayList([[1, 4], [2, 5], [3, 6]]));
        expect(result2).toStrictEqual(new ArrayList([[1, 4], [2, 5], [3, 6]]));
    });

    test('zip() with ArrayList and LinkedList', () => {
        const result = ArrayList.of(1,2,3).zip(LinkedList.of(4,5,6));
        expect(result).toStrictEqual(new ArrayList([[1, 4], [2, 5], [3, 6]]));
    });

    test('zipAll()', () => {
        const result = arr.zipAll([4, 5, 6], [7, 8, 9]);
        expect(result).toStrictEqual(new ArrayList([[1, 4, 7], [2, 5, 8], [3, 6, 9]]));
    });

    test('zipAll() with LinkedList that has a different size', () => {
        const arrayList = new ArrayList([21, 213, 213, 22, 6,7,8,9,10]);
        const linkedList = LinkedList.of(4, 5, 6);
        const zipped = arrayList.zipAll(linkedList);
        expect(zipped).toStrictEqual(new ArrayList([[21, 4], [213, 5], [213, 6], [22, undefined], [6, undefined], [7, undefined], [8, undefined], [9, undefined], [10, undefined]]));
    });

    test('zipWith()', () => {
        const arr2 = new ArrayList<number>([4, 5, 6]);

        const add = (a: number, b: number) => a + b;
        const result = arr.zipWith(add, arr2);
        expect(result).toStrictEqual(new ArrayList([5, 7, 9]));

        const multiply = (a: number, b: number) => a * b;
        const result2 = arr.zipWith(multiply, [4, 5, 6]);
        expect(result2).toStrictEqual(new ArrayList([4, 10, 18]));
    });

    test('hashCode()', () => {
        const result = arr.hashCode();
        expect(result).toBe(555137);

        const arr2 = new ArrayList<number>([1, 2, 3]);
        const result2 = arr2.hashCode();
        expect(result2).toBe(result);

        const arr3 = new ArrayList([4, 5, 6]);
        const result3 = arr3.hashCode();
        expect(result3).not.toBe(result);
    });

    test('hashCode() is cached and does not change', () => {
        const list1 = new ArrayList([11, 22, 33]);
        const list2 = list1.add(44);
        const list3 = list2.remove(44);
        const hashCodeList3 = list3.hashCode();

        const list4 = list3.add(4454);
        const list5 = list4.add(777).remove(4454);

        const hashCodeList3Pram = list3.hashCode();

        expect(hashCodeList3).toBe(hashCodeList3Pram);
        expect(hashCodeList3).not.toBe(list5.hashCode());
    })

    test('equals()', () => {
        const arr2 = new ArrayList([1, 2, 3]);
        const result = arr.equals(arr2);
        expect(result).toBe(true);

        const arr3 = new ArrayList([4, 5, 6]);
        const result2 = arr.equals(arr3);
        expect(result2).toBe(false);
    });

    test('toArray()', () => {
        const result = arr.toArray();
        expect(result).toEqual([1, 2, 3]);
    });

    test('toArray(generator: (size: number) => T[])', () => {
        const result = arr.toArray(size => new Array(size).fill(0));
        expect(result).toEqual([0, 0, 0]);
    });
    test('find()', () => {
        const result = arr.find(x => x === 2);
        expect(result).toBe(2);

        const result2 = arr.find(x => x === 4);
        expect(result2).toBe(undefined);
    });
    test('distinct()', () => {
        const newArr = new ArrayList([1, 2, 2, 3, 3, 3]);
        const result = newArr.distinct();
        expect(result).toStrictEqual(new ArrayList([1, 2, 3]));
    });
});

