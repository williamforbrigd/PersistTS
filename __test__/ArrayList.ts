import ArrayList from "../src/Arrays/ArrayList";

describe("ArrayList", () => {
    let arr: ArrayList<number>;

    beforeEach(() => {
        arr = new ArrayList<number>([1,2,3]);
    });


    test('should initialize with given items', () => {
        expect(arr.length).toBe(3);
        expect(arr.toString()).toBe('[1, 2, 3]');
    });

    test('should map items correctly', () => {
        const result = arr.map(x => x * 2);
        expect(result.toString()).toBe('[2, 4, 6]');
    });

    test('should check every item correctly', () => {
        const allAboveZero = arr.every(x => x > 0);
        expect(allAboveZero).toBe(true);

        const allAboveTwo = arr.every(x => x > 2);
        expect(allAboveTwo).toBe(false);
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
        expect(result.toString()).toBe('[2, 4, 6]');
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
        expect(result.toString()).toBe('[2, 4, 6]');
    });

    test('should filter items correctly', () => {
        const result = arr.filter(x => x > 1);
        expect(result.toString()).toBe('[2, 3]');
    });

    test('concat', () => {

        // Concatenate with another ArrayList
        const arr2 = new ArrayList<number>([4, 5, 6]);
        const result1 = arr.concat(arr2);
        expect(result1.toString()).toBe('[1, 2, 3, 4, 5, 6]');

        // Concatenate with an array
        const result2 = arr.concat([7, 8, 9]);
        expect(result2.toString()).toBe('[1, 2, 3, 7, 8, 9]');

        // Concatenate with individual values
        const result3 = arr.concat(10, 11, 12);
        expect(result3.toString()).toBe('[1, 2, 3, 10, 11, 12]');

        // Concatenate with a mix of values and collections
        const result4 = arr.concat(13, [14, 15], new ArrayList<number>([16, 17]));
        expect(result4.toString()).toBe('[1, 2, 3, 13, 14, 15, 16, 17]');
    });

    test('every', () => {
        const allAboveZero = arr.every(x => x > 0);
        expect(allAboveZero).toBe(true);

        const allAboveTwo = arr.every(x => x > 2);
        expect(allAboveTwo).toBe(false);
    });

    test('filter', () => {
       const result = arr.filter(x => x > 1);
       expect(result.toString()).toBe('[2, 3]');

         const result2 = arr.filter(x => x > 3);
         expect(result2.toString()).toBe('[]');
    });

    test('findAll', () => {
       const result = arr.findAll(x => x === 1);
       expect(result.toString()).toBe('[1]');
    });

    test('flatMap', () => {
        const result = arr.flatMap(x => [x, x]);
        expect(result.toString()).toBe('[1, 1, 2, 2, 3, 3]');
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
        expect(result.toString()).toBe('[2, 4, 6]');
    });

    test('merge', () => {
       const arr2 = new ArrayList<number>([4, 5, 6]);
     const result = arr.merge(arr2);
        expect(result.toString()).toBe('[1, 2, 3, 4, 5, 6]');
    });

    test('partition', () => {
       const [trueItems, falseItems] = arr.partition(x => x > 1);
        expect(trueItems.toString()).toBe('[2, 3]');
        expect(falseItems.toString()).toBe('[1]');
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
    test('remove', () => {
        const result = arr.remove(2);
        expect(result.toString()).toBe('[1, 3]');
    });
    test('remove first', () => {
        const result = arr.removeFirst();
        expect(result.toString()).toBe('[2, 3]');
    });
    test('removeAll', () => {
       const result = arr.removeAll([1, 3]);
        expect(result.toString()).toBe('[2]');
    });
    test('removeAt', () => {
         const result = arr.removeAt(1);
          expect(result.toString()).toBe('[1, 3]');
    });
    test('removeIf()', () => {
       const result = arr.removeIf(x => x === 2);
        expect(result.toString()).toBe('[1, 3]');
    });
    test('replaceAll', () => {
        const result = arr.replaceAll([4, 5, 6]);
        expect(result.toString()).toBe('[4, 5, 6]');
    });
    test('retainAll', () => {
       const result = arr.retainAll([1, 3]);
        expect(result.toString()).toBe('[1, 3]');
    });
    test('reversed', () => {
        const result = arr.reversed();
        expect(result.toString()).toBe('[3, 2, 1]');
    });
    test('set', () => {
        const result = arr.set(1, 4);
        expect(result.toString()).toBe('[1, 4, 3]');
    });
    test('shift', () => {
        const result = arr.shift();
        expect(result.toString()).toBe('[2, 3]');
    });
    test('slice', () => {
       const result = arr.slice(1, 2);
        expect(result.toString()).toBe('[2]');
    });
    test('slice with start', () => {
       const result = arr.slice(1);
        expect(result.toString()).toBe('[2, 3]');
    });
    test('slice with no parameters', () => {
       const result = arr.slice();
        expect(result.toString()).toBe('[1, 2, 3]');
    });
    test('some', () => {
        const result = arr.some(x => x > 2);
        expect(result).toBe(true);
    })
    test('sort', () => {
        const arr = new ArrayList<number>([3, 1, 2]);
        const result = arr.sort((a: number, b: number) => a - b);
        expect(result.toString()).toBe('[1, 2, 3]');
    })
    test('splice', () => {
        const arr = new ArrayList<number>([1, 2, 3]);

        // Remove 1 element at index 1
        let result = arr.splice(1, 1);
        expect(result.toString()).toBe('[1, 3]');

        // Remove 0 elements at index 1 and insert 4, 5
        result = arr.splice(1, 0, 4, 5);
        expect(result.toString()).toBe('[1, 4, 5, 2, 3]');

        // Remove 2 elements at index 1 and insert 6
        result = arr.splice(1, 2, 6);
        //expect(result.toString()).toBe('[1, 6, 3]');

        // Remove all elements from index 0
        result = arr.splice(0);
        //expect(result.toString()).toBe('[]');
    });
    test('unshift', () => {
        const result= arr.unshift(4, 5,6);
        expect(result.toString()).toBe('[4, 5, 6, 1, 2, 3]');
    });
    test('zip() function with either List<T> or just T[]', () => {
       const result = arr.zip(ArrayList.from([4, 5, 6]));
       const result2 = arr.zip([4, 5, 6]);
        expect(result.toString()).toBe('[[1, 4], [2, 5], [3, 6]]');
        expect(result2.toString()).toBe('[[1, 4], [2, 5], [3, 6]]');
    });
    test('zipAll()', () => {
       const result = arr.zipAll([4, 5, 6], [7, 8, 9]);
        expect(result.toString()).toBe('[[1, 4, 7], [2, 5, 8], [3, 6, 9]]');
    });
    test('zipWith()', () => {
       const arr2 = new ArrayList<number>([4, 5, 6]);

       const add = (a: number, b: number ) => a+b;
       const result = arr.zipWith(add, arr2);
        expect(result.toString()).toBe('[5, 7, 9]');

        const multiply = (a: number, b: number) => a*b;
        const result2 = arr.zipWith(multiply, [4,5,6]);
        expect(result2.toString()).toBe('[4, 10, 18]');
    });
    test('hashCode()', () => {
        const result = arr.hashCode();
        expect(result).toBe(555137);

        const arr2 = new ArrayList<number>([1,2,3]);
        const result2 = arr2.hashCode();
        expect(result2).toBe(result);

        const arr3 = ArrayList.from([4,5,6]);
        const result3 = arr3.hashCode();
        expect(result3).not.toBe(result);
    });
    test('equals()', () => {
       const arr2 = ArrayList.from([1,2,3]);
        const result = arr.equals(arr2);
        expect(result).toBe(true);

        const arr3 = ArrayList.from([4,5,6]);
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
});