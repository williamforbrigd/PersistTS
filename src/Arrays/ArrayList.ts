import List, {ListInput} from "../Interfaces/List";
import {Comparator} from "../Interfaces/Comparator";
import HashCode from "../Hashing/HashCode";
import AbstractList from "../AbstractClasses/AbstractList";
import Collection from "../Interfaces/Collection";
import { Speed } from "../Enums/Speed";
import Sorting from "../Sorting/Sorting";

/**
 * A persistent ArrayList implementation.
 * It contains a list of items
 * On modifications, it creates a new instance of the list without altering the original list.
 * This way, you can keep the original list intact and create new versions of it. 
 */
class ArrayList<T> extends AbstractList<T> implements List<T> {
    private _hashCode: number | null = null;
    readonly items: T[];
    readonly length: number;

    constructor(items: ArrayList<T> | T[] = []) {
        super();
        //this.items = items;
        this.items = items instanceof ArrayList ? items.items : items;
        this.length = this.items.length;

        // Proxy to allow for array-like access
        return new Proxy(this, {
            get(target, prop) {
                if (typeof prop === "string") {
                    const index = Number(prop);
                    if (!isNaN(index)) return target.get(index); // calls the get() method
                }
                return (target as any)[prop]; // default property access
            }
        });
    }

    /**
     * Creates a new ArrayList from the provided items.
     * @param items - The items to create the ArrayList from.
     * @returns A new ArrayList instance containing the items.
     */
    static of<T>(...items: T[]): ArrayList<T> {
        return new ArrayList<T>(Array.from(items));
    }

    /**
     * Class method to create a new ArrayList from the provided items.
     * @param items  - The items to create the ArrayList from.
     * @returns A new ArrayList instance containing the items.
     */
    of(...items: T[]): ArrayList<T> {
        return new ArrayList<T>(Array.from(items));
    }

    /**
     * Creates a new empty ArrayList.
     * @returns A new empty ArrayList instance.
     */
    empty(): ArrayList<T> {
        return new ArrayList<T>();
    }

    /**
     * Get the item at the specified index.
     */
    [index: number]: T | undefined;
    get(index: number): T | undefined {
        return this.items[index];
    }

    FIFO(): boolean {
        return false;
    }

    /**
     * Returns an iterator for the items in the list.
     */
    *[Symbol.iterator](): IterableIterator<T> {
        for (const item of this.items) {
            yield item;
        }
    }

    /**
     * Adds an item to the list.
     * @param item - The item to add to the list.
     */
    add(item: T): ArrayList<T>;
    add(index: number, item: T): ArrayList<T>;
    add(pointer: ArrayList<T>, item: T): ArrayList<T>;
    add(arg1: T | number | ArrayList<T>, arg2?: T): ArrayList<T> {
        if (typeof arg1 === 'number' && arg2 !== undefined) {
            const index = arg1;
            const item = arg2;
            const newItems = this.items.slice();
            newItems.splice(index, 0, item);
            return new ArrayList(newItems);
        } else if (arg1 instanceof ArrayList) {
            const newItems = this.items.slice();
            newItems.push(...arg1.items);
            return new ArrayList(newItems);
        } else {
            const item = arg1 as T;
            const newItems = this.items.slice();
            newItems.push(item);
            return new ArrayList(newItems);
        }
    }

    /**
     * Adds all items from the provided iterable to the list.
     * @param items - The items to add to the list.
     */
    addAll(items: Iterable<T>): ArrayList<T>;
    addAll(index: number, items: Iterable<T>): ArrayList<T>;
    addAll(arg1: Iterable<T> | number, arg2?: Iterable<T>): ArrayList<T> {
        if (typeof arg1 === 'number' && arg2 !== undefined) {
            const index = arg1;
            const items = Array.from(arg2);
            const newItems = this.items.slice();
            newItems.splice(index, 0, ...items);
            return new ArrayList(newItems);
        } else {
            const items = Array.from(arg1 as Iterable<T>);
            const newItems = this.items.slice();
            newItems.push(...items);
            return new ArrayList(newItems);
        }
    }

    /**
     * Adds an item to the beginning of the list.
     * @param item - The item to add to the beginning of the list.
     * @returns A new ArrayList instance with the item added at the beginning.
     */
    addFirst(item: T): ArrayList<T> {
        return this.set(0, item);
    }

    /**
     * Adds an item to the end of the list.
     * @param item - The item to add to the end of the list.
     * @returns A new ArrayList instance with the item added at the end.
     */
    addLast(item: T): ArrayList<T> {
        return this.set(this.length-1, item)
    }

    /**
     * Clears all items from the list.
     * @returns A new ArrayList instance with all items removed.
     */
    clear(): ArrayList<T> {
        return new ArrayList<T>();
    }

    /**
     * Concat the collection with the given values or collections.
     * @param valuesOrCollections - values or collections to be concatenated
     * @returns A new collection with the values or collections concatenated.
     */
    concat<C extends T>(...valuesOrCollections: Array<Iterable<C> | C>): ArrayList<T | C> {
        return super.concat(...valuesOrCollections) as ArrayList<T | C>;
    }

    /**
     * Checks if the list contains the specified item.
     * @param item - The item to check for in the list.
     * @returns A boolean indicating whether the item is in the list.
     */
    has(item: T): boolean {
        return super.has(item);
    }

    /**
     * Checks if the list contains all items from the provided iterable.
     * @param items - The items to check for in the list.
     * @returns A boolean indicating whether all items are in the list.
     */
    hasAll(items: Iterable<T>): boolean {
        return super.hasAll(items);
    }

    /**
     * Converts the list to an array.
     */
    toArray(): T[];
    toArray(generator: (size: number) => T[]): T[];
    toArray(generator?: (size: number) => T[]): T[] {
        return generator ? generator(this.size()) : this.items.slice();
    }

    /**
     * Copies the array list items to the provided array.
     * @param array - The array to copy the items to.
     * @param arrayIndex - The index in the array to start copying to.
     */
    copyTo(array: T[], arrayIndex: number): void {
        return super.copyTo(array, arrayIndex);
    }

    /**
     * Checks that every element in the collection passes the callback function.
     * @param callback - The function to apply to each element.
     * @param thisArg - The context to bind the function to.
     */
    every<S extends T>(callback: (value: T, index: number, array: ArrayList<T>) => value is S, thisArg?: any): this is ArrayList<S>;
    every(callback: (value: T, index: number, array: ArrayList<T>) => unknown, thisArg?: any): boolean;
    every(callback: (value: T, index: number, array: ArrayList<T>) => unknown, thisArg?: any): any {
        return super.every(callback, thisArg);
    }

    /**
     * Filters and returns a new collection with the elements that pass the filter.
     * @param predicate - function to filter the elements
     * @param thisArg - context for the predicate function
     */
    filter<F extends T>(predicate: (value: T, index: number, iter: this) => value is F, context?: any): ArrayList<F>;
    filter(predicate: (value: T, index: number, iter: this) => unknown, context?: any): this;
    filter(predicate: (value: T, index: number, iter: this) => unknown, context?: any): any {
        return super.filter(predicate, context);
    }

    /**
     * Finds all elements in the collection that pass the filter function.
     * @param filter - function to filter the elements
     * @returns a new collection with the elements that pass the filter
     */
    findAll(filter: (item: T) => boolean): ArrayList<T> {
        const newList = this.items.filter(filter);
        return new ArrayList(newList);
    }

    /**
     * Applies the mapper function to each element and flattens the result.
     * @param mapper - function to map the elements of the collection
     * @param thisArg - context for the mapper function
     */
    flatMap<M>(mapper: (value: T, key: number, iter: this) => Iterable<M>, context?: any): ArrayList<M> {
        return super.flatMap(mapper, context) as ArrayList<M>;
    }

    /**
     * Applies the callback function to each element in the collection.
     * @param callback - function to apply to each element
     * @param thisArg - context for the callback function
     */
    forEach(callback: (value: T, index: number, array: this) => void, thisArg?: any): void {
        super.forEach(callback, thisArg);
    }

    /**
     * Gets the first element of the collection.
     * @returns the first element of the collection
     */
    getFirst(): T | undefined {
        return super.getFirst();
    }

    /**
     * Gets the last element of the collection.
     * @returns the last element of the collection
     */
    getLast(): T | undefined {
        return super.getLast();
    }

    /**
     * 
     * @param item - the item to find the index of
     * @returns the index of the item in the collection, or -1 if not found
     */
    indexOf(item: T): number {
        return super.indexOf(item);
    }

    /**
     * Checks if the collection is empty.
     * @returns true if the collection is empty, false otherwise
     */
    isEmpty(): boolean {
        return super.isEmpty();
    }

    /**
     * Concatenates the collection to a string, using the specified separator.
     * Default separator is ", ".
     * @param separator - the separator to use
     * @returns A string representation of the collection
     */
    join(separator?: string): string {
        return super.join(separator);
    }

    /**
     * Get the last index of the item in the collection.
     * @param item - the item to find the last index of
     * @returns The last index of the item in the collection, or -1 if not found.
     */
    lastIndexOf(item: T): number {
        return super.lastIndexOf(item);
    }

    /**
     * Maps the elements of the collection to a new collection.
     * @param mapper - function to map the elements of the collection
     * @param context - context for the mapper function
     * @returns A new collection with the mapped elements
     */
    map<M>(mapper: (value: T, key: number, iter: this) => M, context?: any): ArrayList<M> {
        return super.map(mapper, context) as ArrayList<M>;
    }

    /**
     * Merges the collection with one or more iterables.
     * @param collections - collections to merge with
     * @returns A new collection with the merged elements
     */
    merge<C extends T>(...collections: Array<Iterable<C>>): ArrayList<T | C> {
        return super.merge(...collections) as ArrayList<T | C>;
    }

    /**
     * Partitions the collection into two collections based on the predicate function.
     * @param predicate - function to filter the elements
     * @param context - context for the predicate function
     */
    partition<F extends T, C>(predicate: (this: C, value: T, index: number, iter: this) => value is F, context?: C): [ArrayList<T>, ArrayList<F>];
    partition<C>(predicate: (this: C, value: T, index: number, iter: this) => unknown, context?: C): [this, this];
    partition<C>(predicate: (this: C, value: T, index: number, iter: this) => unknown, context?: any): any {
        return super.partition(predicate, context) as [ArrayList<T>, ArrayList<T>];
    }

    /**
     * Reduces the collection to a single value using the callback function.
     * @param callback - function to reduce the elements of the collection
     * @param initialValue - initial value for the reduction
     */
    reduce(callback: (previousValue: T, currentValue: T, currentIndex: number, array: this) => T): T;
    reduce<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, array: this) => U, initialValue: U): U;
    reduce(callback: any, initialValue?: any): any {
        return super.reduce(callback, initialValue) as any;
    }

    /**
     * Reduces the collection to a single value using the callback function, starting from the right.
     * @param callback - function to reduce the elements of the collection
     */
    reduceRight(callback: (previousValue: T, currentValue: T, currentIndex: number, array: this) => T): T;
    reduceRight(callback: (previousValue: T, currentValue: T, currentIndex: number, array: this) => T, initialValue: T): T;
    reduceRight<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, array: this) => U, initialValue: U): U;
    reduceRight(callback: any, initialValue?: any): any {
        return super.reduceRight(callback, initialValue) as any;
    }

    // remove(item: T): ArrayList<T>;
    // remove(): ArrayList<T>;
    // remove(item?: T): ArrayList<T> {
    //     if (item === undefined) {
    //         if (this.FIFO()) {
    //             return this.removeFirst();
    //         } else {
    //             return this.removeLast();
    //         }
    //     } else {
    //         const index = this.indexOf(item);
    //         if (index === -1) {
    //             return this;
    //         } else {
    //             const newItems = this.items.slice();
    //             newItems.splice(index, 1);
    //             return new ArrayList(newItems);
    //         }
    //     }
    // }

    /**
     * Remove all the items from the collection.
     * @param items - the items to remove from the collection
     * @returns a new collection with the items removed
     */
    removeAll(items: Iterable<T>): ArrayList<T> {
        const itemsToRemove = new Set(items);
        const newItems = this.items.filter(item => !itemsToRemove.has(item));
        return new ArrayList(newItems);
    }

    /**
     * Remove the item at a specified index from the collection.
     * @param index - the index of the item to remove
     * @returns a new collection with the item removed
     */
    remove(index: number): ArrayList<T> {
        const newItems = this.items.slice();
        newItems.splice(index, 1);
        return new ArrayList(newItems);
    }

    /**
     * Remove the specified item from the collection.
     * @param item - the item to remove from the collection
     * @returns a new collection with the item removed
     */
    removeItem(item: T): ArrayList<T> {
        return super.removeItem(item) as ArrayList<T>;
    }

    /**
     * Remove the first item from the collection.
     * @returns a new collection with the first item removed
     */
    removeFirst(): ArrayList<T> {
        return this.remove(0);
    }

    /**
     * Remove the last item from the collection.
     * @returns a new collection with the last item removed
     */
    removeLast(): ArrayList<T> {
        return this.remove(this.length - 1);
    }

    /**
     * Remove all the items from the collection that pass the filter function.
     * @param filter - function to filter the elements
     * @returns A new collection with the items removed. 
     */
    removeIf(filter: (item: T) => boolean): ArrayList<T> {
        return super.removeIf(filter) as ArrayList<T>;
    }

    /**
     * Replace all items in the collection with the provided items.
     * @param items - the items to replace the current items with
     * @returns A new collection with the items replaced
     */
    replaceAll(items: Iterable<T>): ArrayList<T> {
        const newItems = Array.from(items);
        return new ArrayList(newItems);
    }

    /**
     * Retain only the items in the collection that are also in the provided iterable.
     * @param items - the items to retain in the collection
     * @returns A new collection with the items retained
     */
    retainAll(items: Iterable<T>): ArrayList<T> {
        const itemsToRetain = new Set(items);
        const newItems = this.items.filter(item => itemsToRetain.has(item));
        return new ArrayList(newItems);
    }

    /**
     * Reverse the order of the items in the collection.
     * @returns A new collection with the items in reverse order
     */
    reversed(): ArrayList<T> {
        const newItems = this.items.slice().reverse();
        return new ArrayList(newItems);
    }

    /**
     * Set the item at the specified index in the collection.
     * @param index - the index of the item to set
     * @param item - the item to set at the specified index
     * @returns a new collection with the item set at the specified index
     */
    set(index: number, item: T): ArrayList<T> {
        const newItems = this.items.slice();
        newItems[index] = item;
        return new ArrayList(newItems);
    }

    /**
     * Remove the last item from the collection.
     * @returns the last item in the collection
     */
    pop(): ArrayList<T> {
        if (this.isEmpty()) {
            throw new RangeError("Cannot pop from an empty list");
        }
        return this.removeLast();
    }

    /**
     * Remove the first item from the collection.
     * @returns the first item in the collection
     */
    shift(): ArrayList<T> {
        if (this.size() == 0) {
            return this;
        }
        return this.removeFirst();
    }

    /**
     * Get the size of the collection.
     */
    size(): number {
        return this.length;
    }

    /**
     * Get a slice of the collection.
     * Start and end ranges are optimal, and if not provided, the entire collection is copied.
     * @param start - the starting index of the slice
     * @param end - the ending index of the slice
     * @returns A new collection with the items in the specified range
     */
    slice(start?: number, end?: number): ArrayList<T> {
        return new ArrayList(this.items.slice(start, end));
    }

    /**
     * Checks if at least one element in the collection passes the test implemented by the provided function.
     * @param callback - function to test each element
     * @param thisArg - context for the callback function
     * @returns true if at least one element passes the test, false otherwise
     */
    some(callback: (value: T, index: number, array: this) => unknown, thisArg?: any): boolean {
        return super.some(callback, thisArg);
    }

    /**
     * Sorts the items in the collection using the provided comparator function.
     * @param compare - A comparator function to sort the items
     * @returns A new collection with the items sorted
     */
    sort(compare?: Comparator<T>): Collection<T> {
        const mutableArray = this.toArray();
        const defaultComparator = (a: T, b: T) => {
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        }
        Sorting.timSort(mutableArray, compare ?? defaultComparator);
        return new ArrayList(mutableArray);
        // return super.sort(compare) as ArrayList<T>;
    }

    /**
     * Sort the collection by a specific key using the provided key selector and comparator function.
     * @param keySelector - function to select the key for sorting
     * @param compareFn - function to compare the keys
     * @returns A new collection with the items sorted by the selected key
     */
    sortBy<U>(keySelector: (value: T) => U, compareFn?: ((a: U, b: U) => number) | undefined): ArrayList<T> {
        const newItems = this.items.slice();
        Sorting.timSort(newItems, (a, b) => {
            const keyA = keySelector(a);
            const keyB = keySelector(b);
            return compareFn ? compareFn(keyA, keyB) : keyA < keyB ? -1 : keyA > keyB ? 1 : 0;
        });
        return new ArrayList(newItems);
    }

    /**
     * Get the distinct items in the collection.
     * @returns A new collection with the items in the collection that are distinct.
     */
    distinct(): ArrayList<T> {
        const uniqueItems = Array.from(new Set(this.items));
        return new ArrayList(uniqueItems);
    }

    /**
     * Splice the collection at the specified index, removing and/or adding items.
     * @param start - the starting index of the splice
     * @param deleteCount - the number of items to delete
     */
    splice(start: number, deleteCount?: number): ArrayList<T>;
    splice(start: number, deleteCount: number, ...items: T[]): ArrayList<T>;
    splice(start: number, deleteCount?: number, ...items: T[]): ArrayList<T> {
        const newItems = this.items.slice();
        if (deleteCount === undefined) {
            newItems.splice(start);
        } else {
            newItems.splice(start, deleteCount, ...items);
        }
        return new ArrayList<T>(newItems);
    }


    /**
     * Adds items to the beginning of the collection.
     * @param items - the items to add to the beginning of the collection
     * @returns a new collection with the items added to the beginning
     */
    unshift(...items: T[]): ArrayList<T> {
        const newItems = this.items.slice();
        newItems.unshift(...items);
        return new ArrayList(newItems);
    }

    /**
     * Combines elements of this collection with one or more iterables into tuples, 
     * stopping when the shortest input is exhausted.
     * @param other - other collections to combine with
     */
    zip<U>(other: ListInput<T>): ArrayList<[T, U]>;
    zip<U, V>(
        other: ListInput<T>,
        other2: ListInput<T>
    ): ArrayList<[T, U, V]>;
    zip(...collections: Array<ListInput<unknown>>): ArrayList<unknown>;
    zip<U, V>(...other: (ListInput<U> | ListInput<unknown> | ListInput<V>)[]): ArrayList<unknown> {
        return super.zip(...other) as ArrayList<unknown>;
    }

    /**
     * Combines elements of this collection with one or more iterables into tuples, 
     * continuing until the longest input is exhausted.
     * @param other - other collections to combine with
     */
    zipAll<U>(other: ListInput<U>): ArrayList<[T, U]>;
    zipAll<U, V>(other: ListInput<U>, other2: ListInput<V>): ArrayList<[T, U, V]>;
    zipAll(...collections: Array<ListInput<unknown>>): ArrayList<unknown>;
    zipAll<U, V>(...other: (ListInput<U> | ListInput<unknown> | ListInput<V>)[]): ArrayList<unknown> {
        return super.zipAll(...other) as ArrayList<unknown>;
    }

    /**
     * Combines elements of this collection with one or more iterables by applying a zipper function
     * to the elements.
     * @param zipper - Function that takes one element from this collection and one from other collections
     * to produce a result value.
     * @param collections - Collections to zip with.
     */
    zipWith<U, Z>(
        zipper: (value: T, otherValue: U) => Z,
        otherCollection: ListInput<U>
    ): ArrayList<Z>;
    zipWith<U, V, Z>(
        zipper: (value: T, otherValue: U, thirdValue: V) => Z,
        otherCollection: ListInput<U>,
        thirdCollection: ListInput<V>
    ): ArrayList<Z>;
    zipWith<Z>(
        zipper: (...values: unknown[]) => Z,
        ...collections: Array<ListInput<unknown>>
    ): ArrayList<Z>;
    zipWith<U, V, Z>(
        zipper: any,
        ...otherCollection: (ListInput<U> | ListInput<unknown> | ListInput<V>)[]
    ): ArrayList<Z> {
        return super.zipWith(zipper, ...otherCollection) as ArrayList<Z>;
    }

    // Speed for different types of operations
    indexingSpeed(): Speed {
        return Speed.Linear;
    }

    hasSpeed(): Speed {
        return Speed.Linear;
    }

    addSpeed(): Speed {
        return Speed.Linear;
    }

    removeSpeed(): Speed {
        return Speed.Linear;
    }


    /**
     * Calculates the hash code of the collection.
     * The hash code is lazily computed, meaning that it is only calculated when needed. 
     * @returns The hash code of the collection.
     */
    hashCode(): number {
        if (this._hashCode === null) {
            this._hashCode = HashCode.hashCodeArray(this.items);
        }
        return this._hashCode;
    }

    /**
     * Compares this collection with another object for equality.
     * @param o - The object to compare with.
     * @returns true if the object is equal to this collection, false otherwise.
     */
    equals(o: Object): boolean {
        if (this === o) return true;
        if (!(o instanceof ArrayList)) return false;
        if (this.items.length !== o.items.length) return false;

        return this.every((value, index) => Object.is(value, o.items[index]));
    }

    /**
     * Converts the collection to a string representation.
     * @returns A string representation of the collection.
     */
    toString(): string {
        return `[${this.items.map(item => Array.isArray(item) ? `[${item.join(', ')}]` : item).join(', ')}]`;
    }
}


export default ArrayList;