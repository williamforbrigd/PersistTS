import { Speed } from "../Enums/Speed";
import HashCode from "../Hashing/HashCode";
import HashMap from "../Maps/HashMap";
import { Utils } from "../Utils/Utils";
import Set from "../Interfaces/Set";
import AbstractSet from "../AbstractClasses/AbstractSet";

/**
 * HashSet is a set implementation that uses a hash map to store the elements.
 * It is an unordered collection of unique elements.
 * It is also a persistent data structure, meaning that an update to the set will return
 * a new instance of the set without modifying the original set.
 * 
 * The set is implemented as a wrapper around a hash map, which is used to store the elements (HashMap<T, undefined>).
 * The HashMap is based on the Hash Array Mapped Trie (HAMT) data structure
 * that Phil Bagwell introduced.
 * 
 * This structure is a hash trie that uses a bitmap and a dense array of non-null pointers to store its elements.
 * The bitmap is used to indicate which elements are present in the trie, and this can be used to index into the dense array.
 * 
 * For the complexity, it can achieve near constant time for most operations O(1) and O(log32(n)) for the worst case.
 * 
 * @see Phil Bagwell, "Fast and Space Efficient Trie Searches", EPFL, 2000.
 * @see Phil Bagwell, "Ideal Hash Trees", EPFL, 2001.
 * 
 */
export default class HashSet<T> extends AbstractSet<T> implements Set<T> {
    // hash code that is cached and lazyly initialized
    private _hashCode: number|null = null;

    // the map that is used to store the elements of the set
    readonly _map: HashMap<T, undefined>;

    constructor(
        _map?: HashMap<T, undefined>,
    ) {
        super();
        this._map = _map ?? HashMap.empty<T, undefined>();
    }

    /**
     * Returns an iterator that iterates over the keys of the map.
     * Since its a set, the keys are the values of the set.
     */
    *[Symbol.iterator](): IterableIterator<T> {
        for (const [key] of this._map) {
            yield key;
        }
    }

    /**
     * Static method to create a new HashSet with the given values.
     * @param values - The values to add to the set.
     * @returns A new HashSet with the values added to it.
     */
    static of<T>(...values: Array<T>): HashSet<T> {
        let hashSet = new HashSet<T>();
        for (const value of values) {
            hashSet = hashSet.add(value);
        }
        return hashSet;
    }

    /**
     * Get the number of elements in the set.
     * @returns the size of the set. 
     */
    size(): number {
        return this._map.size();
    }

    /**
     * Checks if the set is empty.
     * @returns true if the set is empty, false otherwise.
     */
    isEmpty(): boolean {
        return this.size() === 0;
    }
    
    /**
     * Return an empty HashSet
     * @returns a new empty HashSet.
     */
    empty(): HashSet<T> {
        return new HashSet<T>(this._map.empty());
    }

    /**
     * Can specify a different type for the empty HashSet.
     * @template TT - The type of the empty HashSet.
     * @returns a new empty HashSet.
     */
    createEmpty<TT>(): HashSet<TT> {
        return new HashSet<TT>();
    }

    /**
     * Adds a value to the set.
     * 
     * Complexity: O(1) on average, O(log32(n)) in the worst case.
     * 
     * @param value - The value to add to the set.
     * @returns A new HashSet with the value added to it.
     */
    add(value: T): HashSet<T> {
        return new HashSet<T>(this._map.set(value, undefined));
    }

    /**
     * Adds all values to the set.
     * 
     * Complexity: O(m) on average, O(m * log32(n)) in the worst case, where
     * m is the number of values to add.
     * 
     * @param values - The values to add to the set.
     * @returns A new HashSet with the values added to it.
     */
    addAll(values: Iterable<T>): HashSet<T> {
        return super.addAll(values) as HashSet<T>;
    }

    /**
     * Checks if the set contains a value.
     * 
     * @param value - The value to check if it is in the set.
     * @returns A boolean indicating if the value is in the set.
     */
    has(value: T): boolean {
        return this._map.has(value);
    }

    /**
     * Checks if the set contains all values.
     * @param values - The values to check if they are in the set.
     * @returns A boolean indicating if all values are in the set.
     */
    hasAll(values: Iterable<T>): boolean {
        for (const value of values) {
            if (!this.has(value)) return false;
        }
        return true;
    }

    /**
     * Deletes a value from the set.
     * 
     * Complexity: O(1) on average, O(log32(n)) in the worst case.
     * 
     * @param value - The value to delete from the set.
     * @returns A new HashSet with the value deleted from it.
     */
    delete(value: T): HashSet<T> {
        return new HashSet<T>(this._map.delete(value));
    }

    /**
     * Deletes all values from the set.
     * 
     * Complexity: O(m) on average, O(m * log32(n)) in the worst case, where
     * m is the number of values to delete.
     * 
     * @param values - The values to delete from the set.
     * @returns A new HashSet with the values deleted from it.
     */
    deleteAll(values: Iterable<T>): HashSet<T> {
        let hashSet: HashSet<T> = this;
        for (const value of values) {
            hashSet = hashSet.delete(value);
        }
        return hashSet;
    }

    /**
     * Clears the set. Returns an empty set.
     * 
     * @returns A new HashSet with all values deleted from it.
     */
    clear(): HashSet<T> {
        return new HashSet<T>(this._map.clear());
    }

    /**
     * Gets a value from the set.
     * 
     * Complexity: O(1) on average, O(log32(n)) in the worst case.
     * 
     * @param value - The value to get from the set.
     * @returns The value if it is in the set, undefined otherwise.
     */
    get(value: T): T | undefined {
        for (const _value of this) {
            if (Utils.equals(value, _value)) return value;
        }
        return undefined;
    }

    /**
     * Return an array of the values in the set.
     * @returns An array of the values in the set.
     */
    values(): Array<T> {
        return Array.from(this);
    }

    /**
     * Return an array of the values in the set.
     * @returns An array of the values in the set.
     */
    toArray(): Array<T> {
        return Array.from(this);
    }

    /**
     * Checks whether this set is equal to another object.
     * First checks if the object is a HashSet.
     * Then checks if the size is the same.
     * Finally, checks if the values are the same.
     * Since the set is unordered, the order of the values does not matter.
     * 
     * @param o - The object to compare to.
     * @returns true if the object is equal to this set, false otherwise.
     */
    equals(o: Object): boolean {
        if (this === o) return true;
        if (!(o instanceof HashSet)) return false;
        if (this.size() !== o.size()) return false;

        const other = o as HashSet<T>;
        const iter1 = this[Symbol.iterator]();
        const iter2 = other[Symbol.iterator]();

        while (true) {
            const a = iter1.next();
            const b = iter2.next();
            if (a.done && b.done) break;
            if (a.done || b.done) return false;
            if (!Utils.equals(a.value, b.value)) return false;
        }
        return true;
    }

    /**
     * Compares this set to another HashSet.
     * First checks if the object is a HashSet.
     * Then checks if the size is the same.
     * Finally, checks if the values are the same.
     * Since the set is unordered, the order of the values does not matter.
     * 
     * @param o - The HashSet to compare to.
     * @returns -1 if this set is less than the other set, 
     *          1 if this set is greater than the other set, 
     *          0 if they are equal.
     */
    compareTo(o: HashSet<T>): number {
        if (this === o) return 0;

        const sizeDiff = this.size() - o.size();
        if (sizeDiff !== 0) return sizeDiff;

        const valuesA = Array.from(this).sort();
        const valuesB = Array.from(o).sort();

        const len = valuesA.length;
        for (let i = 0; i < len; i++) {
            const a = valuesA[i];
            const b = valuesB[i];
            if (a < b) return -1;
            if (a > b) return 1;
        }
        return 0;
    }

    /**
     * Returns the time complexity of the has operation.
     * @returns the time complexity of the has operation.
     */
    hasSpeed(): Speed {
        return Speed.Constant;
    }

    /**
     * Returns the time complexity of the add operation.
     * @returns the time complexity of the add operation.
     */
    addSpeed(): Speed {
        return Speed.Constant;
    }

    /**
     * Returns the time complexity of the remove operation.
     * @returns the time complexity of the remove operation.
     */
    removeSpeed(): Speed {
        return Speed.Constant;
    }

    /**
     * Returns the hash code of the set.
     * The hash code is calculated by hashing each value in the set and adding them together.
     * It does not care about the order of the values in the set.
     * 
     * @returns the hash code of the set.
     */
    hashCode(): number {
        if (this._hashCode === null) {
            let hash = 0;
            for (const value of this) {
                hash += HashCode.hashCode(value);
            }
            this._hashCode = hash;
        }
        return this._hashCode;
    }

    /**
     * Converts the set to a string representation.
     * @returns a string representation of the set.
     */
    toString(): string {
        const values = Array.from(this).map(v => String(v));
        return `{${values.join(", ")}}`;
    }

    /**
     * Checks that every valie in the set passes the predicate.
     * Method calls the every method defined in the HashMap class.
     * @param predicate - The predicate to test each value.
     * @param thisArg - allows you to set the context for the predicate function.
     * @returns true if every value passes the predicate, false otherwise.
     */
    every(
        predicate: (value: T, key: T, set: this) => boolean,
        thisArg?: unknown
    ): this is HashSet<T>;
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
     * Checks that some value in the set passes the predicate.
     * Method calls the some method defined in the HashMap class.
     * 
     * @param predicate - The predicate to test each value.
     * @param thisArg - allows you to set the context for the predicate function.
     * @returns true if some value passes the predicate, false otherwise.
     */
    some(predicate: (value: T, key: T, map: this) => boolean, thisArg?: unknown): boolean {
        return this._map.some((_, key) => predicate.call(thisArg, key, key, this));
    }

    /**
     * Calls the callback for each value in the set.
     * Method calls the forEach method defined in the HashMap class. 
     * @param callback - The callback to call for each value. 
     * @param thisArg - allows you to set the context for the callback function.
     * @returns void
     */
    forEach(callback: (value: T, key: T, set: this) => void, thisArg?: unknown): void {
        return this._map.forEach((_, key) => callback.call(thisArg, key, key, this));
    }

    /**
     * Find the first value that passes the predicate.
     * 
     * @param predicate - The predicate to test each value.
     * @param thisArg - allows you to set the context for the predicate function.
     * @returns The first value that passes the predicate, or undefined if none do.
     */
    find(predicate: (value: T, key: T, set: this) => boolean, thisArg?: unknown): T | undefined {
        return super.find(predicate, thisArg);
    }

    /**
     * Reduces the HashSet to a single accumulated value by applying the callback to each value.
     * The initial value is optional, if not provided, the first value in the set will be used as the initial value.
     * Calls the reduce method defined in the HashMap class.
     * 
     * @param callback - The callback to call for each value.
     * @param initialValue - The initial value to use for the reduction.
     */
    reduce(callback: (accumulator: T, value: T, key: T, set: this) => T, initialValue?: T): T;
    reduce<R>(callback: (accumulator: R, value: T, key: T, set: this) => R, initialValue?: R): R;
    reduce<R>(callback: (accumulator: R, value: T, key: T, set: this) => R, initialValue?: R): R {
        return this._map.reduce((acc, _, key) => callback(acc, key, key, this), initialValue);
    }

    /**
     * Reduces the HashSet to a single accumulated value by applying the callback to each value, 
     * starting from the last value.
     * The initial value is optional, if not provided, the last value in the set will be used as the initial value.
     * Calls the reduceRight method defined in the HashMap class.
     * 
     * @param callback - The callback to call for each value.
     * @param initialValue - The initial value to use for the reduction.
     * @returns The reduced value.
     */
    reduceRight(callback: (accumulator: T, value: T, key: T, set: this) => T, initialValue?: T): T;
    reduceRight<R>(callback: (accumulator: R, value: T, key: T, set: this) => R, initialValue?: R): R;
    reduceRight<R>(callback: (accumulator: R, value: T, key: T, set: this) => R, initialValue?: R): R {
        return this._map.reduceRight((acc, _, key) => callback(acc, key, key, this), initialValue);
    }

    /**
     * Returns a new HashSet with the values from the collections added to it.
     * 
     * @param collections - The collections to union with.
     * @returns A new HashSet with the values from the collections added to it.
     */
    union<C>(...collections: Array<Iterable<C>>): HashSet<T | C> {
        return super.union(...collections) as HashSet<T | C>;
    }

    /**
     * Merges the collections into a new HashSet.
     * This is an alias for the union method.
     * 
     * @param collections - The collections to merge with.
     * @returns A new HashSet with the values from the collections added to it.
     */
    merge<C>(...collections: Array<Iterable<C>>): HashSet<T | C> {
        return this.union(...collections);
    }

    /**
     * Concatenates the collections into a new HashSet.
     * This is an alias for the union method.
     * 
     * @param collections - The collections to concatenate with.
     * @returns A new HashSet with the values from the collections added to it.
     */
    concat<C>(...collections: Array<Iterable<C>>): HashSet<T | C> {
        return this.union(...collections);
    }

    /**
     * Returns a new HashSet with the values from the collections intersected with it.
     * 
     * @param collections - The collections to intersect with.
     * @returns A new HashSet with the values from the collections intersected with it.
     */
    intersect(...collections: Array<Iterable<T>>): HashSet<T> {
        return super.intersect(...collections) as HashSet<T>;
    }

    /**
     * Returns a new HashSet with the values from the collections subtracted from it.
     * 
     * @param collections - The collections to subtract from.
     * @returns A new HashSet with the values from the collections subtracted from it.
     */
    subtract(...collections: Array<Iterable<T>>): HashSet<T> {
        return super.subtract(...collections) as HashSet<T>;
    }

    /**
     * Transforms the values in the set using the mapper function.
     * The mapper function is called for each value in the set.
     * The thisArg parameter allows you to set the context for the mapper function.
     * 
     * @param mapper - The mapper function to call for each value.
     * @param thisArg - allows you to set the context for the mapper function.
     * @returns A new HashSet with the mapped values.
     */
    map<M>(
        mapper: (value: T, key: T, set: this) => M,
        thisArg?: unknown,
    ): HashSet<M> {
        return super.map(mapper, thisArg) as HashSet<M>;
    }

    /**
     * Transforms the values in the set using the mapper function.
     * The mapper function is called for each value in the set.
     * The thisArg parameter allows you to set the context for the mapper function.
     * 
     * @param mapper - The mapper function to call for each value.
     * @param thisArg - allows you to set the context for the mapper function.
     * @returns A new HashSet with the mapped values.
     */
    flatMap<M>(
        mapper: (value: T, key: T, set: this) => Iterable<M>,
        thisArg?: unknown,
    ): HashSet<M> {
        return super.flatMap(mapper, thisArg) as HashSet<M>;
    }

    /**
     * Filters the values in the set using the predicate function.
     * The predicate function is called for each value in the set.
     * The thisArg parameter allows you to set the context for the predicate function.
     * 
     * @param predicate - The predicate function to call for each value.
     * @param thisArg - allows you to set the context for the predicate function.
     * @returns A new HashSet with the filtered values.
     */
    filter<F extends T>(
        predicate: (value: T, key: T, set: this) => value is F,
        thisArg?: unknown
    ): HashSet<F>;
    filter(
        predicate: (value: T, key: T, set: this) => unknown,
        thisArg?: unknown
    ): HashSet<T>;
    filter(
        predicate: (value: T, key: T, set: this) => unknown,
        thisArg?: unknown
    ): HashSet<any> {
        return super.filter(predicate, thisArg) as HashSet<any>;
    }

    /**
     * Partitions the values in the set into two sets based on the predicate function.
     * The predicate function is called for each value in the set.
     * The thisArg parameter allows you to set the context for the predicate function.
     * 
     * @param predicate - The predicate function to call for each value.
     * @param thisArg - allows you to set the context for the predicate function.
     * @returns A tuple of two HashSets, one with the values that passed the predicate and one with the values that did not.
     */
    partition<F extends T, C>(
        predicate: (this: C, value: T, key: T, set: this) => value is F,
        thisArg?: C
      ): [HashSet<F>, HashSet<Exclude<T, F>>];
    partition<C>(
        predicate: (this: C, value: T, key: T, set: this) => unknown,
        thisArg?: C
    ): [HashSet<T>, HashSet<T>];
    partition(
        predicate: (value: T, key: T, set: this) => unknown,
        thisArg?: unknown
    ): [HashSet<any>, HashSet<any>] {
        let trueSet: HashSet<any> = this.empty();
        let falseSet: HashSet<any> = this.empty();
        for (const value of this) {
            if (predicate.call(thisArg, value, value, this)) {
                trueSet = trueSet.add(value);
            } else {
                falseSet = falseSet.add(value);
            }
        }
        return [trueSet, falseSet];
    }  
}