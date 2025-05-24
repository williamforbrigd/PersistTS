import HashCode from '../Hashing/HashCode';
import TreeMap from './TreeMap';
import {Comparator} from '../Interfaces/Comparator';
import SortedSet from '../Interfaces/SortedSet';
import { Speed } from '../Enums/Speed';
import AbstractSet from '../AbstractClasses/AbstractSet';

/**
 * A TreeSet is a sorted set that uses a TreeMap internally to store the elements.
 * The TreeMap is defined using a persistent red-black tree that follows the red invariant and black balanced invariant. 
 * Red invariant states that no two red nodes can be adjacent to each other. Black balanced invariant
 * states that the number of black nodes from the root to any leaf node is the same. This is also known as the height (black height) of the tree.
 * A red-black tree should also be a binary search tree, and the tree is ordered according to the comparator provided. 
 */
export default class TreeSet<T> extends AbstractSet<T> implements SortedSet<T> {
    private _hashCode: number | null = null;
    readonly _map: TreeMap<T, undefined>;

    constructor(
        private readonly compare: Comparator<T> = TreeSet.defaultComparator<T>,
        tree?: TreeMap<T, undefined>
    ) {
        super();
        this._map = tree ?? new TreeMap<T, undefined>(compare);
    }

    /**
     * Returns an iterator for the TreeSet.
     * The iterator uses the TreeMap iterator to iterate over the keys, and the values are undefined.
     * TreeMap iterator uses in-order traversal to iterate over the keys.
     */
    *[Symbol.iterator](): IterableIterator<T> {
        for (const [key] of this._map) {
            yield key;
        }
    }

    /**
     * Creates a new TreeSet from the provided values.
     * @param values to create the treeset from.
     * @returns a treeset with the defined values.
     */
    static of<T>(...values: Array<T>): TreeSet<T> {
        let treeSet = new TreeSet<T>();
        for (const value of values) {
            treeSet = treeSet.add(value);
        }
        return treeSet;
    }

    /**
     * Provided a default comparator for the TreeSet.
     * @param a 
     * @param b 
     * @returns a negative number if a is less than b, a positive number if a is greater than b, and 0 if a is equal to b.
     */
    static defaultComparator<T>(a: T, b: T): number {
        return a < b ? -1 : a > b ? 1 : 0;
    }


    /**
     * Returns the number of elements in the TreeSet 
     * @returns the number of elements in the TreeSet
     */
    size(): number {
        return this._map.size();
    }

    /**
     * Returns true if the TreeSet is empty, false otherwise.
     * @returns true if the TreeSet is empty, false otherwise.
     */
    isEmpty(): boolean {
        return this._map.getRoot() === null;
    }

    /**
     * Provides an empty TreeSet with the same comparator as the current TreeSet.
     * @returns an empty TreeSet with the same comparator as the current TreeSet.
     */
    empty(): TreeSet<T> {
        return new TreeSet(this.compare);
    }

    /**
     * Method to create an empty TreeSet with the provided comparator.
     * 
     * @param compare - optional comparator to be used for the new TreeSet.
     * @returns A new empty TreeSet with the provided comparator or the same comparator as the current TreeSet.
     */
    protected createEmpty<TT>(compare?: Comparator<TT>): TreeSet<TT> {
        return new TreeSet<TT>(compare ?? (this.compare as unknown as Comparator<TT>));
    }

    protected override equalsElement(a: T, b: T): boolean {
        return this.compare(a,b) === 0;
    }

    /**
     * Adds the specified value to the TreeSet if it is not already present.
     * More specifically, the element is added if the TreeSet does not contain an element e such that compare(e, value) === 0.
     * If the set already contains the element, the call leaves the set unchanged and returns the current TreeSet.
     * @param value to be added to the set.
     * @returns a new TreeSet with the value added if the set does not have it.
     */
    add(value: T): TreeSet<T> {
        return new TreeSet(this.compare, this._map.set(value, undefined));
    }

    /**
     * Adds all the values in the provided iterable to the TreeSet if they are not already present.
     * More specifically, the element is added if the TreeSet does not contain an element e such that compare(e, value) === 0.
     * The method will add only the values that are not already present in the TreeSet.
     * @param values to be added to the set.
     * @returns a new set with the values added if the set does not have them.
     */
    addAll(values: Iterable<T>): TreeSet<T> {
        let treeSet = new TreeSet(this.compare, this._map);
        for (const value of values) {
            treeSet = treeSet.add(value);
        }
        return treeSet;
    }

    /**
     * Checks whether the set has the given value. 
     * Methods uses the iterator to traverse the set and check if the value is present. 
     * @param value to be checked within the set. 
     * @returns true if the set has the value or false otherwise.
     */
    has(value: T): boolean {
        return this._map.has(value);
    }

    /**
     * Checks whether the set contains all the values in the provided iterable.
     * The method uses the iterator to traverse the set and check if all the values are present.
     * @param values to be checked within the set.
     * @returns true if the set has all the values or false otherwise.
     */
    hasAll(values: Iterable<T>): boolean {
        for (const value of values) {
            if (!this.has(value)) {
                return false;
            }
        }
        return true;
    }


    /**
     * Returns a new TreeSet with the value deleted from the set if the set has it.
     * Uses the delete method defined in the persistent red-black tree.
     * @param value to be deleted from the set.
     * @returns a new TreeSet with the value removed if the set has it.
     */
    delete(value: T): TreeSet<T> {
        return new TreeSet(this.compare, this._map.delete(value));
    }

    /**
     * Deletes all the values in the provided iterable from the TreeSet if they are present.
     * The method uses the delete method defined in the persistent red-black tree to delete the values.
     * @param values to be deleted from the set.
     * @returns a new TreeSet with the values removed if the set has them.
     */
    deleteAll(values: Iterable<T>): TreeSet<T> {
        let treeSet = new TreeSet(this.compare, this._map);
        for (const value of values) {
            treeSet = treeSet.delete(value);
        }
        return treeSet;
    }

    /**
     * Returns a new TreeSet with all the values removed.
     * It will use the same comparator as already provided.
     * @returns a new TreeSet with all the values removed.
     */
    clear(): TreeSet<T> {
        return new TreeSet(this.compare, this._map.clear());
    }

    /**
     * Returns the value from the set if it is present or undefined oterwise.
     * @param value to be retrieved from the TreeSet.
     * @returns the value if it is present or undefined if it does not exist.
     */
    get(value: T): T | undefined {
        for (const _value of this) {
            if (value === _value) return value;
        }
        return undefined;
    }

    /**
     * Returns an array of all the values in the TreeSet.
     * This method is equivalent to the toArray method.
     * @returns an array of all the values in the TreeSet.
     */
    values(): Array<T> {
        return Array.from(this);
    }

    /**
     * Returns an array of all the values in the TreeSet.
     * This method is equivalent to the values method.
     * @returns an array of all the values in the TreeSet.
     */
    toArray(): Array<T> {
        return Array.from(this);
    }

    /**
     * Checks whether the caller TreeSet is equal to the provided object.
     * To be equal, they must have the same size and the same elements.
     * The method also checks for whether the order of the elements is the same.
     * @param o to be checked for equality with this.
     * @returns true if the objects are equal and false otherwise.
     */
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

    compareTo(o: TreeSet<T>): number {
        // Check if the are the same object
        if (this === o) return 0;
    
        // Compare the size
        const sizeDiff = this.size() - o.size();
        if (sizeDiff !== 0) return sizeDiff;

        // Compare each element
        const iter1 = this[Symbol.iterator]();
        const iter2 = o[Symbol.iterator]();
        while (true) {
            const a = iter1.next();
            const b = iter2.next();
            if (a.done && b.done) {
                return 0;
            }
            if (a.done) return -1; // 'this' ended first
            if (b.done) return 1;  // 'other' ended first
            // Compare the elements:
            const cmp = this.compare(a.value, b.value);
            if (cmp !== 0) return cmp;
        }
    }

    // Speed of different types of operations

    /**
     * To check whether the TreeSet has a given value, the complexity is logarithmic O(log n).
     * This is because of the red-black tree properties.
     * @returns the speed of the TreeSet, which is Logarithmic.
     */
    hasSpeed(): Speed {
        return Speed.Log;
    }

    /**
     * To add a value to the TreeSet, the complexity is logarithmic O(log n).
     * This is because of the red-black tree properties.
     * @returns the speed of the TreeSet, which is Logarithmic.
     */
    addSpeed(): Speed {
        return Speed.Log;
    }

    /**
     * To delete a value from the TreeSet, the complexity is logarithmic O(log n).
     * This is because of the red-black tree properties.
     * @returns the speed of the TreeSet, which is Logarithmic.
     */
    removeSpeed(): Speed {
        return Speed.Log;
    }

    /**
     * The hashcode is computed lazily, which means that it is only computed once and then cached.
     * Hashcode accounts for the order of the elements in the TreeSet.
     * Hashcode is computed using a prime number and the hashcode of the elements in the TreeSet.
     * The order of the elements are also taken into account, so the elements must be in the same order for the hashcode to be the same.
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

    /**
     * Returns a string representation of the set.
     * @returns a string representation of the set.
     */
    toString(): string {
        let str = "{";
        let first = true;
        for (const value of this) {
            if (!first) {
                str += ", ";
            }
            str += value;
            first = false;
        }
        str += "}";
        return str;
    }

    // Higher Order Functions

    /**
     * Checks that every value in the set satisfies the predicate.
     * The method calls the every method defined in the TreeMap class to check if every element satisfies the predicate.
     * @param predicate to be checked for every element in the set.
     * @param thisArg allows you to set the context for the predicate function.
     * @returns true if the predicate returns true for every element in the set or false otherwise.
     */
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
        return this._map.every((_, key) => predicate.call(thisArg, key, key, this));
    }

    /**
     * Checks the some value in the set satisfies the predicate.
     * Returns true if the predicate returns true for any value in the set or false otherwise. 
     * @param predicate function to be checked against the values in the set.
     * @param thisArg context to be used against the predicate function.
     * @returns true if some value satisfies the predicate or false otherwise.
     */
    some(predicate: (value: T, key: T, map: this) => boolean, thisArg?: unknown): boolean {
        return this._map.some((_, key) => predicate.call(thisArg, key, key, this));
    }

    /**
     * Returns a new TreeSet with the values sorted according to the comparator provided.
     * If no comparator is provided, the natural ordering of the elements is used.
     * @param compare to be used to sort the elements in the set.
     * @returns a new TreeSet with the values sorted according to the comparator provided
    */
    sort(compare?: Comparator<T>): TreeSet<T> {
        let treeSet = new TreeSet<T>(compare ?? this.compare);
        for (const value of this) {
            treeSet = treeSet.add(value);
        }
        return treeSet;
    }   


    /**
     * Sorts the elements in the set based on the comparatorValueMapper function.
     * The comparatorValueMapper function is used to map the elements to a different type, and the comparator is used to sort the elements.
     * @param comparatorValueMapper A function that takes an elemen, and maps it to an element of type C.
     * @param comparator optional comparator to sort the elements of type C. If not provided, the default comparator for type C is used.
     * @returns a new TreeSet with the elements sorted based on the comparatorValueMapper function.
     */
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

    /**
     * Executes a callback function to each value of the set.
     * Method is built on top of the forEach method defined in the TreeMap class.
     * @param callback function to apply to the values of the set.
     * @param thisArg optional parameter to set the `this` context within the callback. 
     * @returns void
     */
    forEach(callback: (value: T, key: T, set: this) => void, thisArg?: unknown): void {
        return this._map.forEach((_, key) => callback.call(thisArg, key, key, this));
    }

    /**
     * Finds and returns the first value in the set that matches the given predicate.
     * Predicate is invoked for each value in the set according to the order of the values.
     * If no value matches the predicate, then undefiend is returned.
     * @param predicate to be checked against the values in the set.
     * @param thisArg optional parameter. An object to use as `this` value when executing the predicate.
     * @returns the first element for which the predicate is satisfied or undefined if no element satisfies the predicate.
     */
    find(predicate: (value: T, key: T, set: this) => boolean, thisArg?: unknown): T | undefined {
        return super.find(predicate, thisArg);
    }

    /**
     * Reduces the TreeSet to a single accumulated value by applying a callback function on each element in order.
     * If initial value is provided, it is used as the first accumulator value; otherwise the first element of the set is used as the initial accumulator value.
     * @param callback function to be applied to each element of the set.
     * @param initialValue Optional. The initial value to be used as accumulator or the first element if not provided.
     * @returns the accumulated value after applying the callback function to each element in the set.
     */
    reduce(callback: (accumulator: T, value: T, key: T, set: this) => T, initialValue?: T): T;
    reduce<R>(callback: (accumulator: R, value: T, key: T, set: this) => R, initialValue?: R): R;
    reduce<R>(callback: (accumulator: R, value: T, key: T, set: this) => R, initialValue?: R): R {
        return this._map.reduce((acc, _, key) => callback(acc, key, key, this), initialValue);
    }


    /**
     * Reduces the TreeSet to a single accumulated value by applying a callback function on each element in reverse order.
     * If initial value is provided, it is used as the first accumulator value; otherwise the first element of the set is used as the initial accumulator value.
     * @param callback function to be applied to each element of the set.
     * @param initialValue Optional. The initial value to be used as accumulator or the first element if not provided.
     * @returns the accumulated value after applying the callback function to each element in the set in reverse order.
     */
    reduceRight(callback: (accumulator: T, value: T, key: T, set: this) => T, initialValue?: T): T;
    reduceRight<R>(callback: (accumulator: R, value: T, key: T, set: this) => R, initialValue?: R): R;
    reduceRight<R>(callback: (accumulator: R, value: T, key: T, set: this) => R, initialValue?: R): R {
        return this._map.reduceRight((acc, _, key) => callback(acc, key, key, this), initialValue);
    }

    /**
     * Returns a new TreeSet representing the union of the current set with the provided collections.
     * All elements of the current set and each iterable is added to the new set.
     * Semantically the same as the merge and concat methods.
     * @param collections one or more iterables to be added to the set.
     * @returns a new TreeSet containing all the distinct elements from the current set and the provided collections.
     */
    union<C>(...collections: Array<Iterable<C>>): TreeSet<T | C> {
        return super.union(...collections) as TreeSet<T | C>;
    }
    /**
     * Returns a new TreeSet representing the union of the current set with the provided collections.
     * All elements of the current set and each iterable is added to the new set.
     * Semantically the same as the union and concat methods.
     * @param collections one or more iterable to be added to the set.
     * @returns a new TreeSet containing all the distinct elements from the current set and the provided collections.
     */
    merge<C>(...collections: Array<Iterable<C>>): TreeSet<T | C> {
        return this.union(...collections);
    }

    /**
     * Returns a new TreeSet representing the union of the current set with the provided collections.
     * All elements of the current set and each iterable is added to the new set.
     * Semantically the same as the union and merge methods.
     * @param collections one or more iterable to be added to the set.
     * @returns a new TreeSet containing all the distinct elements from the current set and the provided collections.
     */
    concat<C>(...collections: Array<Iterable<C>>): TreeSet<T | C> {
        return this.union(...collections);
    }

    /**
     * Returns a new set representing only the elements that are present in the current set
     * and in every one of the provided collections.
     * 
     * Method iterates over each element in the current set and checks whether it exists in all of the provided collections.
     * If an element is found in all the collections, it is added to the resulting set.
     * @param collections One or more iterables whose elements must be present in the current set to be included in the intersection.
     * @returns a new TreeSet representing the insertion of the current set with the provided collections.
     */
    intersect(...collections: Array<Iterable<T>>): TreeSet<T> {
        return super.intersect(...collections) as TreeSet<T>;
    }

    /**
     * Returns a new TreeSet with all the elements from the provided collections removed.
     * 
     * The method subtracts each element found in the provieded iterables from the current set.
     * For each element in each collection, if it exists in the current set it is removed.
     * The original TreeSet remains unchanged and a new TreeSet is returned.
     * 
     * @param collections One ore more iterables whose elements should be removed from the current set.
     * @returns A new set containing the elements of the current set excluding those found in the provided collections.
     */
    subtract(...collections: Array<Iterable<T>>): TreeSet<T> {
        return super.subtract(...collections) as TreeSet<T>;
    }

    /**
     * Maps the values of the set to a new set using the provided mapper function.
     * 
     * Mapper function is called for each element in the set.
     * The resulting values of type M are added to the new set that is returned.
     * 
     * @param mapper Callback function to be applied to each element of the set. 
     * @param thisArg Optional. An object to use as `this` context when executing the mapper function.
     * @param compare Optional. A comparator function for the mapped value of type M. It not provided,
     * the default comparator for type M is used.
     * @returns a new TreeSet containing the mapped values.
     */
    map<M>(
        mapper: (value: T, key: T, set: this) => M,
        thisArg?: unknown,
        compare?: Comparator<M>
      ): TreeSet<M> {
        const comp = compare ?? TreeSet.defaultComparator<M>;
        return super.map(mapper, thisArg, comp) as TreeSet<M>;
      }

    /**
     * Transforms each element of the TreeSet into an iterable of new values and flattens the result into a new TreeSet.
     * 
     * The mapper should return an iterable of values of type M. 
     * All values from each returned iterable are added to the set. 
     * 
     * @param mapper A function that transforms an element of type T into an element of type M.
     * @param thisArg Optional. An object to use as `this` context when executing the mapper function.
     * @param compare Optional. A comparator function for the mapped values of type M. If not proivided, the default comparator for M is used.
     * @returns A new TreeSet containing all the values produced by the mapper function, flattened into a single set.
     */
    flatMap<M>(
        mapper: (value: T, key: T, set: this) => Iterable<M>,
        thisArg?: unknown,
        compare?: Comparator<M>
    ): TreeSet<M> {
        const comp = compare ?? TreeSet.defaultComparator<M>;
        return super.flatMap(mapper, thisArg, comp) as TreeSet<M>;
    }

    /**
     * Filters out all the elements in the set that does not satisfy the predicate.
     * @param predicate Function that returns true if the element should be included in the new set.
     * @param thisArg Optional. An object to use as `this` context when executing the predicate function.
     * @returns A new TreeSet containing only the elements that satisfy the predicate.
     */
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
        return super.filter(predicate, thisArg) as TreeSet<any>;
    }


    /**
     * Partitions the set into two sets based on the predicate.
     * All the values that satisfy the predicate are added to the true set, and the rest are added to the false set.
     * 
     * @param predicate Function that returns true if the element should be included in the first set 
     * or false if the elements should be included in the second set.
     * @param thisArg Optional. An object to use as `this` context when executing the predicate function.
     * @returns An array with two sets. The first set contains the values that satisfy the predicate, and the second set contains the rest.
     */
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

    /**
     * Returns the comparator that is used for the order of the set.
     * @returns the comparator that is used for the order of the set.
     */
    getComparator(): Comparator<T> {
        return this.compare;
    }
    /**
     * Finds the minimum value in the set.
     * The minumum value is the first (lowest) value currently in the set.
     * 
     * Minimum value is retrieved when traversing the leftmost path of the set,
     * and is therefore dependent on the order of the elements according to the comparator.
     * Undefined is returned if the set is empty.
     * 
     * @returns the first (lowest) value currently in the set.
     */
    findMin(): T | undefined {
        const res = this._map.findMin();
        return res ? res[0] : undefined;
    }

    /**
     * Finds the maximum value in the set.
     * The maximum value is the last (highest) value currently in the set.
     * 
     * Maximum value is retrieved when traversing the rightmost path of the set,
     * and is therefore dependent on the order of the elements according to the comparator.
     * Undefined is returned if the set is empty.
     * 
     * @returns the last (highest) value currently in the set.
     */
    findMax(): T | undefined {
        const res = this._map.findMax();
        return res ? res[0] : undefined;
    }

    /**
     * Returns a new TreeSet with the first (lowest) value removed.
     * Empty set will remain empty
     * 
     * @returns a new TreeSet with the minimum value removed.
     */
    deleteMin(): TreeSet<T> {
        if (this.isEmpty()) return this.empty();
        const min = this.findMin();
        if (min === undefined) return this;
        return this.delete(min);
    }

    /**
     * Returns a new TreeSet with the last (highest) value removed.
     * Empty set will remain empty
     * 
     * @returns a new TreeSet with the maximum value removed.
     */
    deleteMax(): TreeSet<T> {
        if (this.isEmpty()) return this.empty();
        const max = this.findMax();
        if (max === undefined) return this;
        return this.delete(max);
    }

    /**
     * Try to get the predecessor of the given value
     * Predecessor is the largest element in the tree strictly less than the given value
     * If the predecessor is found, return true and the predecessor
     * If the predecessor is not found, return false and undefined
     * 
     * @param value to find the predecessor of
     * @returns true and the predecessor if found, false and undefined if not found
     */
    tryPredecessor(value: T): [boolean, T | undefined] {
        const [found, pair] = this._map.tryPredecessor(value);
        return [found, pair?.[0]];
    }
    
    /**
     * Try to get the successor of the given value
     * Successor is the smallest element in the tree strictly greater than the given value
     * If the successor is found, return true and the successor
     * If the successor is not found, return false and undefined
     * 
     * @param value to find the successor of
     * @returns true and the successor if found, false and undefined if not found
     */
    trySuccessor(value: T): [boolean, T | undefined] {
        const [found, pair] = this._map.trySuccessor(value);
        return [found, pair?.[0]];
    }

    /**
     * Try to get the weak predecessor of the given value
     * Weak predecessor is the largest element in the tree less than or equal to the given value
     * If the weak predecessor is found, return true and the weak predecessor
     * If the weak predecessor is not found, return false and undefined
     * 
     * @param value to find weak predecessor of
     * @returns true and the weak predecessor if found, false and undefined if not found
     */
    tryWeakPredecessor(value: T): [boolean, T | undefined] {
        const [found, pair] = this._map.tryWeakPredecessor(value);
        return [found, pair?.[0]];
    }
    
    /**
     * Try to get the weak successor of the given value
     * Weak successor is the smallest element in the tree greater than or equal to the given value
     * If the weak successor is found, return true and the weak successor
     * If the weak successor is not found, return false and undefined
     * 
     * @param value to find weak successor of
     * @returns true and the weak successor if found, false and undefined if not found
     */
    tryWeakSuccessor(value: T): [boolean, T | undefined] {
        const [found, pair] = this._map.tryWeakSuccessor(value);
        return [found, pair?.[0]];
    }

    /**
     * Returns the predecessor of a given value. 
     * The predecessor is defined as the element in the set whose value is strictly less than the provieded value,
     * according to the set's comparator.
     * 
     * If the given value is the smallest element or no such element exists, the method returns undefined.
     * 
     * @param value The value for which to find the predecessor.
     * @returns The predecessor of the given value or undefined if the predecessor does not exist.
     */
    predecessor(value: T): T | undefined {
        const [found, result] = this.tryPredecessor(value);
        return found ? result : undefined;
    }

    /**
     * Returns the successor of a given value. 
     * The successor is defined as the smallest element in the set whose value is strictly greater than the provided value,
     * according to the set's comparator.
     * 
     * If the given value is the largest element or no such element exists, the method returns undefined.
     * 
     * @param value The value for which to find the successor.
     * @returns The successor of the given value or undefined if the successor does not exist.
     */
    successor(value: T): T | undefined {
        const [found, result] = this.trySuccessor(value);
        return found ? result : undefined;
    }

    /**
     * Returns the weak successor of a given value in the set.
     * The weak successor is defined as the least element in the set that is greater than or equal to the provided value,
     * according to the set's comparator.
     * If no element in the set meets this condition (i.e. the provided value is greater than the maximum element),
     * the method returns undefined.
     *
     * @param value The value for which to find the weak successor.
     * @returns The weak successor of the given value, or undefined if no such element exists.
    */
    weakSuccessor(value: T): T | undefined {
        const [found, result] = this.tryWeakSuccessor(value);
        return found ? result : undefined;
    }

    /**
     * Returns the weak predecessor of a given value in the set.
     * The weak predecessor is defined as the greatest element in the set that is less than or equal to the provided value,
     * according to the set's comparator.
     * If no such element exists (i.e. the provided value is less than the minimum element), the method returns undefined.
     *
     * @param value The value for which to find the weak predecessor.
     * @returns The weak predecessor of the given value, or undefined if no such element exists.
    */
    weakPredecessor(value: T): T | undefined {
        const [found, result] = this.tryWeakPredecessor(value);
        return found ? result : undefined;
    }

    /**
     * Partition the set based on a provided cut function by selecting only the elements whose computed
     * cut value falls between two threshold values.
     * @param cutFunction that computes a numerical value for an element of type T.
     * The value is used to determine whether element falls within specified range.
     * @param fromValue The lower threshold value inclusive. The result of cutFunction(fromValue) sets the lower bound.
     * @param toValue The upper threshold value non-inclusive. The result of cutFunction(toValue) sets the upper bound.
     * @returns A new TreeSet containing only the elements from which the computed cut value is greater than or equal to 
     * cutFunction(fromValue) and less than cutFunction(toValue).
     */
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

    /**
     * Create a range from the provied value to the maximum value in the set.
     * @param fromValue The value to create the range from (inclusive).
     * @returns a TreeSet starting from the provided value to the maximum value in the set.
     */
    rangeFrom(fromValue: T): TreeSet<T> {
        let result = new TreeSet<T>(this.compare);
        for (const value of this) {
            if (this.compare(value, fromValue) >= 0) {
                result = result.add(value);
            }
        }
        return result;
    }

    /**
     * Create a range from the minimum value in the set to the provided value.
     * @param toValue The value to create the range to (exclusive).
     * @returns a TreeSet starting from the minimum value in the set to the provided value.
     */
    rangeTo(toValue: T): TreeSet<T> {
        let result = new TreeSet<T>(this.compare);
        for (const value of this) {
            if (this.compare(value, toValue) < 0) {
                result = result.add(value);
            }
        }
        return result;
    }

    /**
     * Create a TreeSet from the provided fromValue inclusive to the provided toValue exclusive.
     * @param fromValue The value to create the range from (inclusive).
     * @param toValue The value to create the range to (exclusive).
     * @returns a TreeSet starting from the provided fromValue to the provided toValue.
     */
    rangeFromTo(fromValue: T, toValue: T): TreeSet<T>  {
        let result = new TreeSet<T>(this.compare);
        for (const value of this) {
            if (this.compare(value, fromValue) >= 0 && this.compare(value, toValue) < 0) {
                result = result.add(value);
            }
        }
        return result;
    }

    /**
     * Removes all the elements in the set from the value to the maximum value in the set.
     * Returns a TreeSet with all the elements removed.
     * @param fromValue The value to remove the range from (inclusive).
     * @returns a TreeSet where all the elements from the value are removed. 
     */
    removeRangeFrom(fromValue: T): TreeSet<T> {
        let result = new TreeSet<T>(this.compare);
        for (const value of this) {
            if (this.compare(value, fromValue) < 0) {
                result = result.add(value);
            }
        }
        return result;
    }

    /**
     * Removes all the elements in the set from the minimum value to the provided value exclusive.
     * @param toValue The value to remove the range to (exclusive).
     * @returns a TreeSet where all the elements up to the value are removed.
     */
    removeRangeTo(toValue: T): TreeSet<T> {
        let result = new TreeSet<T>(this.compare);
        for (const value of this) {
            if (this.compare(value, toValue) >= 0) {
                result = result.add(value);
            }
        }
        return result;
    }

    /**
     * Removes all the elements in the range from the value inclusive to the value exclusive.
     * Returns the set with all the elements in the range removed.
     * @param fromValue The value to remove from (inclusive).
     * @param toValue The value to remove to (exclusive).
     * @returns a TreeSet with all the elements in the range removed.
     */
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

    /**
     * Helper method to print the tree structure of the TreeSet.
     * Tree is printed using the in-order traversal defined in TreeMap
     */
    printTree(): void {
        this._map.printTree();
    }

    // Methods to check invariants

    /**
     * Checks whether the underlying structure of the TreeSet is a binary search tree (BST).
     * 
     * Method verifies that the tree maintains the BST property, meaning that for every node in the tree, it is ordered correctly according to the comparator.
     * If the comparator sorts in natural ascending order, every element to the left should be smaller and every element to the right should be larger.
     * If the comparator sorts in descending order, elements in right subtree should be smaller than elements in left subtree.
     * 
     * 
     * @returns true if the tree satisfies this BST property or false otherwise.
     */
    isBST(): boolean {
        return this._map.isBST();
    }


    /**
     * Verifies the red invariant of the red-black tree.
     * Red invariant states that no two consecutive nodes in the tree can be red.
     * @returns true if the red property is satisfied or false otherwise.
     */
    redInvariant(): boolean {
        return this._map.redInvariant();
    }

    /**
     * Validate every path in the tree has the same black height.
     * This is the black height invariant and requires that every path from the root to a leaf (null) node
     * contains the same number of black nodes. This property is critical for ensuring that the tree remains balanced
     * and that its operations are performed in logarithmic time.
     * 
     * @returns true if the black height invariant is maintained, or false otherwise.
     */
    public blackBalancedInvariant(): boolean {
        return this._map.blackBalancedInvariant();
      }

    /**
     * Validates the tree properties for the red-black tree: BST, red invariant, and black height invariant.
     * Firstly, checks that the tree is a binary search tree.
     * Then it validates that there are no consecutive red nodes.
     * Lastly, it validates that the black height invariant is maintained.
     * 
     * All of this is done in a single traversal of the tree. 
     * @returns true if the tree is a valid red-black tree, or false otherwise.
     */
    validateRedBlackTree(): boolean {
        return this._map.validateRedBlackTree();
    }
}