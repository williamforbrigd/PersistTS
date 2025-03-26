import HashCode from '../Hashing/HashCode';
import TreeMap from './TreeMap';
import {Comparator} from '../Interfaces/Comparator';
import SortedSet from '../Interfaces/SortedSet';
import { Speed } from '../Enums/Speed';

/**
 * A TreeSet is a sorted set that uses a TreeMap internally to store the elements.
 * The TreeMap is defined using a persistent red-black tree that follows the red invariant and black balanced invariant. 
 * Red invariant states that no two red nodes can be adjacent to each other. Black balanced invariant
 * states that the number of black nodes from the root to any leaf node is the same. This is also known as the height (black height) of the tree.
 */
export default class TreeSet<T> implements SortedSet<T> {
    _hashCode: number | null = null;
    private readonly tree: TreeMap<T, undefined>;

    constructor(
        private readonly compare: Comparator<T> = TreeSet.defaultComparator<T>,
        tree?: TreeMap<T, undefined>
    ) {
        this.tree = tree ?? new TreeMap<T, undefined>(compare);
    }

    *[Symbol.iterator](): IterableIterator<T> {
        for (const [key] of this.tree) {
            yield key;
        }
    }

    static of<T>(...values: Array<T>): TreeSet<T> {
        let treeSet = new TreeSet<T>();
        for (const value of values) {
            treeSet = treeSet.add(value);
        }
        return treeSet;
    }

    static defaultComparator<T>(a: T, b: T): number {
        return a < b ? -1 : a > b ? 1 : 0;
    }

    size(): number {
        return this.tree.size();
    }

    isEmpty(): boolean {
        return this.tree.getRoot() === null;
    }
    empty(): TreeSet<T> {
        return new TreeSet(this.compare);
    }

    add(value: T): TreeSet<T> {
        return new TreeSet(this.compare, this.tree.set(value, undefined));
    }

    addAll(values: Iterable<T>): TreeSet<T> {
        let treeSet = new TreeSet(this.compare, this.tree);
        for (const value of values) {
            treeSet = treeSet.add(value);
        }
        return treeSet;
    }

    has(value: T): boolean {
        for (const _value of this) {
            if (value === _value) {
                return true;
            }
        }
        return false;
    }

    hasAll(values: Iterable<T>): boolean {
        for (const value of values) {
            if (!this.has(value)) {
                return false;
            }
        }
        return true;
    }

    containsSpeed(): Speed {
        return Speed.Log;
    }

    delete(value: T): TreeSet<T> {
        return new TreeSet(this.compare, this.tree.delete(value));
    }

    deleteAll(values: Iterable<T>): TreeSet<T> {
        let treeSet = new TreeSet(this.compare, this.tree);
        for (const value of values) {
            treeSet = treeSet.delete(value);
        }
        return treeSet;
    }

    clear(): TreeSet<T> {
        return new TreeSet(this.compare, this.tree.clear());
    }

    get(value: T): T | undefined {
        throw new Error("")
    }

    values(): Array<T> {
        return this.toArray();
    }

    toArray(): Array<T> {
        const arr = [];
        for (const value of this) {
            arr.push(value);
        }
        return arr;
    }

    // toSet(): Set<T> {
    //     throw new Error("Method not implemented");
    // }


    equals(o: Object): boolean {
        if (this === o) return true;
        if (!(o instanceof TreeSet)) return false;
        if (this.size() !== o.size()) return false;

        const other = o as TreeSet<T>;
        const iter1 = this[Symbol.iterator]();
        const iter2 = other[Symbol.iterator]();

        while (true) {
            const a = iter1.next();
            const b = iter2.next();
            if (a.done && b.done) break;
            if (a.done || b.done) return false;
            if (this.compare(a.value, b.value) !== 0) return false;
        }
        return true;
    } 

    /**
     * The hashcode is computed lazily, which means that it is only computed once and then cached.
     * Hashcode accounts for the order of the elements in the TreeSet.
     * @returns the hash code of the TreeSet
     */
    hashCode(): number {
        if (this._hashCode === null) {
            let hash = 1;
            for (const value of this) {
                hash = 31 * hash + HashCode.hashCode(value);
            }
            this._hashCode = hash;
        }
        return this._hashCode;
    }

    toString(): string {
        return this.tree.toString();
    }

    // HOFs
    every(
        predicate: (value: T, key: T, set: this) => boolean,
        thisArg?: unknown
    ): this is TreeSet<T>;
    every(
        predicate: (value: T, key: T, set: this) => unknown,
        thisArg?: unknown
    ): boolean;
    every(
        predicate: (value: T, key: T, set: this) => unknown,
        thisArg?: unknown
    ): unknown {
        return this.tree.every((_, key) => predicate.call(thisArg, key, key, this));
    }

    some(predicate: (value: T, key: T, map: this) => boolean, thisArg?: unknown): boolean {
        return this.tree.some((_, key) => predicate.call(thisArg, key, key, this));
    }

    sort(compare?: Comparator<T>): TreeSet<T> {
        let treeSet = new TreeSet<T>(compare ?? this.compare);
        for (const value of this) {
            treeSet = treeSet.add(value);
        }
        return treeSet;
    }   

    // sortBy<C>(
    //     comparatorValueMapper: (value: T, key: T, set: this) => C,
    //     compare?: (valueA: C, valueB: C) => number
    // ): TreeSet<T | C> {
    //     const compForC = compare ?? ((a: C, b: C) => a < b ? -1 : a > b ? 1 : 0);

    //     const mappedValues = [];
    //     for (const value of this) {
    //         const newValue = comparatorValueMapper(value, value, this);
    //         mappedValues.push(newValue);
    //     }

    //     mappedValues.sort(compForC);

    //     const newComparator: Comparator<T | C> = compare
    //         ? ((a,b) => compare(a as C, b as C))
    //         : ((a,b) => a < b ? -1 : a > b ? 1 : 0);

    //     let treeSet = new TreeSet<T | C>(newComparator);
    //     for (const value of mappedValues) {
    //         treeSet = treeSet.add(value);
    //     }
    //     return treeSet;
    // }

    sortBy<C>(
        comparatorValueMapper: (value: T, key: T, set: this) => C,
        comparator?: (valueA: C, valueB: C) => number
    ): TreeSet<T> {
        // Use the provided comparator or default to natural ordering for C
        const compForC = comparator ?? ((a: C, b: C) => (a < b ? -1 : a > b ? 1 : 0));
    
        // Create a new comparator for T that maps each element to a C value
        // and, in case of ties, falls back to the original comparator
        const newComparator = (a: T, b: T): number => {
            const aMapped = comparatorValueMapper(a, a, this);
            const bMapped = comparatorValueMapper(b, b, this);
            const cmp = compForC(aMapped, bMapped);
            return cmp !== 0 ? cmp : this.compare(a, b);
        };
    
        let treeSet = new TreeSet<T>(newComparator);
        for (const value of this) {
            treeSet = treeSet.add(value);
        }
        return treeSet;
    }

    forEach(callback: (value: T, key: T, set: this) => void, thisArg?: unknown): void {
        return this.tree.forEach((_, key) => callback.call(thisArg, key, key, this));
    }
    find(predicate: (value: T, key: T, set: this) => boolean, thisArg?: unknown): T | undefined {
        // return this.tree.find((_, key) => predicate.call(thisArg, key, key, this));
        for (const value of this) {
            if (predicate.call(thisArg, value, value, this)) {
                return value;
            }
        }
        return undefined;
    }
    reduce(callback: (accumulator: T, value: T, key: T, set: this) => T, initialValue?: T): T;
    reduce<R>(callback: (accumulator: R, value: T, key: T, set: this) => R, initialValue?: R): R;
    reduce<R>(callback: (accumulator: R, value: T, key: T, set: this) => R, initialValue?: R): R {
        return this.tree.reduce((acc, _, key) => callback(acc, key, key, this), initialValue);
    }


    reduceRight(callback: (accumulator: T, value: T, key: T, set: this) => T, initialValue?: T): T;
    reduceRight<R>(callback: (accumulator: R, value: T, key: T, set: this) => R, initialValue?: R): R;
    reduceRight<R>(callback: (accumulator: R, value: T, key: T, set: this) => R, initialValue?: R): R {
        return this.tree.reduceRight((acc, _, key) => callback(acc, key, key, this), initialValue);
    }

    union<C>(...collections: Array<Iterable<C>>): TreeSet<T | C> {
        let treeSet = new TreeSet<T | C>(this.compare as unknown as (a: T | C, b: T | C) => number);
        for (const value of this) {
            treeSet = treeSet.add(value);
        }
        for (const collection of collections) {
            for (const value of collection) {
                treeSet = treeSet.add(value);
            }
        }
        return treeSet;
    }
    merge<C>(...collections: Array<Iterable<C>>): TreeSet<T | C> {
        return this.union(...collections);
    }
    concat<C>(...collections: Array<Iterable<C>>): TreeSet<T | C> {
        return this.union(...collections);
    }

    intersect(...collections: Array<Iterable<T>>): TreeSet<T> {
        let result = new TreeSet<T>(this.compare);

        outer: for (const v1 of this) {
            for (const collection of collections) {
                let found = false;
                for (const v2 of collection) {
                    if (this.compare(v1, v2) === 0) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    continue outer;
                }
            }
            result = result.add(v1);
        }
        return result;
    }

    subtract(...collections: Array<Iterable<T>>): TreeSet<T> {
        let result = new TreeSet<T>(this.compare, this.tree);

        for (const collection of collections) {
            for (const value of collection) {
                result = result.delete(value);
            }
        }
        return result;
    }

    map<M>(
        mapper: (value: T, key: T, set: this) => M,
        thisArg?: unknown,
        compare?: Comparator<M>
      ): TreeSet<M> {
        const comp = compare ?? TreeSet.defaultComparator<M>;
        let result = new TreeSet<M>(comp);
        for (const value of this) {
            result = result.add(mapper.call(thisArg, value, value, this));
        }
        return result;
      }

    flatMap<M>(
        mapper: (value: T, key: T, set: this) => Iterable<M>,
        thisArg?: unknown,
        compare?: Comparator<M>
    ): TreeSet<M> {
        const comp = compare ?? TreeSet.defaultComparator<M>;
        let result = new TreeSet<M>(comp);
        for (const value of this) {
            const iterable = mapper.call(thisArg, value, value, this);
            for (const mappedValue of iterable) {
                result = result.add(mappedValue);
            }
        }
        return result;
    }

    filter<F extends T>(
        predicate: (value: T, key: T, set: this) => value is F,
        thisArg?: unknown
    ): TreeSet<F>;
    filter(
        predicate: (value: T, key: T, set: this) => unknown,
        thisArg?: unknown
    ): TreeSet<T>;
    filter(
        predicate: (value: T, key: T, set: this) => unknown,
        thisArg?: unknown
    ): TreeSet<any> {
        let result = new TreeSet<T>(this.compare);
        for (const value of this) {
            if (predicate.call(thisArg, value, value, this)) {
                result = result.add(value);
            }
        }
        return result;
    }

    partition<F extends T, C>(
        predicate: (this: C, value: T, key: T, set: this) => value is F,
        thisArg?: C
      ): [TreeSet<T>, TreeSet<F>];
    partition<C>(
        predicate: (this: C, value: T, key: T, set: this) => unknown,
        thisArg?: C
    ): [TreeSet<T>, TreeSet<T>];
    partition(
        predicate: (value: T, key: T, set: this) => unknown,
        thisArg?: unknown
    ): [TreeSet<T>, TreeSet<T>] {
        let trueTree = new TreeSet<T>(this.compare);
        let falseTree = new TreeSet<T>(this.compare);
        for (const value of this) {
            if (predicate.call(thisArg, value, value, this)) {
                trueTree = trueTree.add(value);
            } else {
                falseTree = falseTree.add(value);
            }
        }
        return [trueTree, falseTree];
    }

    


    // zip<U>(other: Collection<unknown, U>): OrderedSet<[T, U]>;
    // zip<U, V>(
    //   other1: Collection<unknown, U>,
    //   other2: Collection<unknown, V>
    // ): OrderedSet<[T, U, V]>;
    // zip(
    //   ...collections: Array<Collection<unknown, unknown>>
    // ): OrderedSet<unknown>;

    // zipAll<U>(other: Collection<unknown, U>): OrderedSet<[T, U]>;
    // zipAll<U, V>(
    //   other1: Collection<unknown, U>,
    //   other2: Collection<unknown, V>
    // ): OrderedSet<[T, U, V]>;
    // zipAll(
    //   ...collections: Array<Collection<unknown, unknown>>
    // ): OrderedSet<unknown>;

    // zipWith<U, Z>(
    //     zipper: (value: T, otherValue: U) => Z,
    //     otherCollection: Collection<unknown, U>
    //   ): OrderedSet<Z>;
    //   zipWith<U, V, Z>(
    //     zipper: (value: T, otherValue: U, thirdValue: V) => Z,
    //     otherCollection: Collection<unknown, U>,
    //     thirdCollection: Collection<unknown, V>
    //   ): OrderedSet<Z>;
    //   zipWith<Z>(
    //     zipper: (...values: Array<unknown>) => Z,
    //     ...collections: Array<Collection<unknown, unknown>>
    //   ): OrderedSet<Z>;

    

    // Methods from Set

    getComparator(): Comparator<T> {
        return this.compare;
    }
    findMin(): T | undefined {
        const res = this.tree.findMin();
        return res ? res[0] : undefined;
    }
    findMax(): T | undefined {
        const res = this.tree.findMax();
        return res ? res[0] : undefined;
    }
    deleteMin(): TreeSet<T> {
        if (this.isEmpty()) return this.empty();
        const min = this.findMin();
        if (min === undefined) return this;
        return this.delete(min);
    }
    deleteMax(): TreeSet<T> {
        if (this.isEmpty()) return this.empty();
        const max = this.findMax();
        if (max === undefined) return this;
        return this.delete(max);
    }
    predecessor(value: T): T | undefined {
        const res = this.tree.predecessor(value);
        return res ? res[0] : undefined;
    }
    successor(value: T): T | undefined {
        const res = this.tree.successor(value);
        return res ? res[0] : undefined;
    }
    weakSuccessor(value: T): T | undefined {
        const res = this.tree.weakSuccessor(value);
        return res ? res[0] : undefined;
    }
    weakPredecessor(value: T): T | undefined {
        const res = this.tree.weakPredecessor(value);
        return res ? res[0] : undefined;
    }
    cut(cutFunction: (compareToOther: T) => number, fromValue: T, toValue: T): TreeSet<T> {
        const lower = cutFunction(fromValue);
        const upper = cutFunction(toValue);

        let result = new TreeSet<T>(this.compare);

        for (const value of this) {
            const cutValue = cutFunction(value);
            if (cutValue >= lower && cutValue < upper) {
                result = result.add(value);
            }
        }
        return result;
    }
    rangeFrom(fromValue: T): TreeSet<T> {
        let result = new TreeSet<T>(this.compare);
        for (const value of this) {
            if (this.compare(value, fromValue) >= 0) {
                result = result.add(value);
            }
        }
        return result;
    }
    rangeTo(toValue: T): TreeSet<T> {
        let result = new TreeSet<T>(this.compare);
        for (const value of this) {
            if (this.compare(value, toValue) < 0) {
                result = result.add(value);
            }
        }
        return result;
    }
    rangeFromTo(fromValue: T, toValue: T): TreeSet<T>  {
        let result = new TreeSet<T>(this.compare);
        for (const value of this) {
            if (this.compare(value, fromValue) >= 0 && this.compare(value, toValue) < 0) {
                result = result.add(value);
            }
        }
        return result;
    }

    removeRangeFrom(fromValue: T): TreeSet<T> {
        let result = new TreeSet<T>(this.compare);
        for (const value of this) {
            if (this.compare(value, fromValue) < 0) {
                result = result.add(value);
            }
        }
        return result;
    }
    removeRangeTo(toValue: T): TreeSet<T> {
        let result = new TreeSet<T>(this.compare);
        for (const value of this) {
            if (this.compare(value, toValue) >= 0) {
                result = result.add(value);
            }
        }
        return result;
    }
    removeRangeFromTo(fromValue: T, toValue: T): TreeSet<T> {
        let result = new TreeSet<T>(this.compare);
        for (const value of this) {
            if (!(this.compare(value, fromValue) >= 0 && this.compare(value, toValue) < 0)) {
                result = result.add(value);
            }
        }
        return result;
    }

    // Helper methods
    printTree(): void {
        this.tree.printTree();
    }

    // Methods to check invariants
    isBST(): boolean {
        return this.tree.isBST();
    }


    redInvariant(): boolean {
        return this.tree.redInvariant();
    }

    /**
     * Validate every path in the tree has the same black height.
     * This is the black height invariant.
     * @returns true if the black height invariant is maintained.
     */
    public blackBalancedInvariant(): boolean {
        return this.tree.blackBalancedInvariant();
      }

    /**
     * Validates if the red-black tree is a binary search tree.
     * Then it validates that there are no consecutive red nodes.
     * Lastly, it validates that the black height invariant is maintained.
     * 
     * All of this is done in a single traversal of the tree. 
     * @returns true if the tree is a valid red-black tree.
     */
    validateRedBlackTree(): boolean {
        return this.tree.validateRedBlackTree();
    }
}

// let treeset = new TreeSet<number>();

// treeset = treeset.add(1);
// treeset = treeset.add(2);
// treeset = treeset.add(3);
// treeset = treeset.add(4);


// console.log(treeset.hashCode());
// treeset.printTree();

// let reversed = new TreeSet<number>((a, b) => b - a);
// reversed = reversed.add(1);
// reversed = reversed.add(2);
// reversed = reversed.add(3);
// reversed = reversed.add(4);

// console.log("------------------------")

// console.log(reversed.hashCode());
// reversed.printTree();


const arr = [50, 40, 30, 10, 20, 30, 100, 0, 45, 55, 25, 15].map((num) => num.toString());
let treeset = new TreeSet<string>((a, b) => a.localeCompare(b));
for (const num  of arr) {
    treeset = treeset.add(num);
}

treeset.printTree();
console.log("------------------------------------------------")

const arr2 = [50, 40, 30, 10, 20, 30, 100, 0, 45, 55, 25, 15]
let treeset2 = new TreeSet<number>((a, b) => a - b);
for (const num  of arr2) {
    treeset2 = treeset2.add(num);
}
treeset2.printTree();

