import List, {ListInput} from '../Interfaces/List';
import Queue from '../Interfaces/Queue';
import HashCode from '../Hashing/HashCode';
import { Comparator } from '../Interfaces/Comparator';
import { Speed } from '../Enums/Speed';
import AbstractList from '../AbstractClasses/AbstractList';

/**
 * This class represents a singly linked list that is persistent and immutable.
 * This list is recursively defined.
 * 
 * It has a pointer to the head of the list and a pointer to the tail.
 * All mutation operations return a new list; while the original remains unchanged.
 * 
 */
export default class LinkedList<T> extends AbstractList<T> 
                                    implements List<T>, Queue<T> {
    // hash code that is lazily computed
    private _hashCode: number | null = null;
    
    constructor(
        private readonly head: T | null = null,
        private readonly tail: LinkedList<T> | null = null
    ) {
        super();

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
     * Static method to create a new LinkedList from an array of items.
     * @param items - The items to be added to the list.
     * @returns A new LinkedList containing the items.
     */
    static of<T>(...items: T[]): LinkedList<T> {
        let list = new LinkedList<T>();
        for (const item of items) {
            list = list.addLast(item);
        }
        return list;
    }

    /**
     * Class method to create a new LinkedList from an array of values.
     * @param values - The values to be added to the list.
     * @returns A new LinkedList containing the values.
     */
    of(...values: T[]): LinkedList<T> {
        let list = this.empty();
        for (const value of values) {
            list = list.addLast(value);
        }
        return list;
    }

    /**
     * Returns an iterator for the linked list.
     * @returns An iterator for the linked list.
     */
    *[Symbol.iterator](): Iterator<T> {
        let current: LinkedList<T> | null = this;

        while(current && current.head !== null) {
            yield current.head;
            current = current.tail;
        }
    }

    /**
     * Check if the list is empty.
     * @returns true if the list is empty, false otherwise.
     */
    isEmpty(): boolean {
        return this.head === null && this.tail === null;
    }

    /**
     * Returns a new empty linked list.
     * @returns A new empty linked list.
     */
    empty(): LinkedList<T> {
        return new LinkedList<T>();
    }

    /**
     * Static method to create a new empty linked list.
     * @returns A new empty linked list.
     */
    static empty<T>(): LinkedList<T> {
        return new LinkedList<T>();
    }

    /**
     * Returns the size of the linked list.
     * @returns The size of the linked list.
     */
    size(): number {
        return super.size();
    }

    /**
     * Gets the item at the specified index.
     * @param index - The index of the item to be retrieved.
     * @returns The item at the specified index, or undefined if the index is out of bounds.
     */
    get(index: number): T | undefined {
        if (index < 0) return undefined;

        if (index === 0) return this.head as T;

        if (this.tail) {
            return this.tail.get(index - 1);
        } else {
            return undefined;
        }
    }

    /**
     * Adds an item to the linked list.
     */
    add(item: T): LinkedList<T>;
    add(index: number, item: T): LinkedList<T>;
    add(e: T): LinkedList<T>;
    add(arg1: T | number, item?: T): LinkedList<T> {
       if (typeof arg1 === 'number' && item !== undefined) {
            return this._addAtIndex(arg1, item!);
       } else {
            return this.addLast(arg1 as T);
       }
    }

    /**
     * Adds an item to the front of the linked list.
     * @param item - The item to be added to the front of the list.
     * @returns A new linked list with the item added to the front.
     */
    addFirst(item: T): LinkedList<T> {
        return new LinkedList(item, this.isEmpty() ? null : this);
    }

    /**
     * Adds an item to the end of the linked list.
     * @param item - The item to be added to the end of the list.
     * @returns A new linked list with the item added to the end.
     */
    addLast(item: T): LinkedList<T> {
        if (this.isEmpty()) {
            return new LinkedList(item, null);
        } else {
            return new LinkedList(this.head!, this.tail?.addLast(item) ?? new LinkedList(item, null));
        }
    }

    /**
     * Helper method to add an item at a specific index in the linked list.
     * @param index - The index at which the item should be added.
     * @param item - The item to be added.
     * @returns A new linked list with the item added at the specified index.
     */
    private _addAtIndex(index: number, item: T): LinkedList<T> {
        if (index < 0) return this;

        if (index === 0) return this.addFirst(item);

        if (this.tail) {
            return new LinkedList(this.head!, this.tail._addAtIndex(index - 1, item) ?? new LinkedList(item, null));
        } else {
            return this;
        }
    } 

    /**
     * Adds all items from an iterable to the linked list.
     * @param items - The items to be added to the list.
     * @returns A new linked list with the items added to the end.
     */
    addAll(items: Iterable<T>): LinkedList<T>;
    addAll(items: Iterable<T>, index: number): LinkedList<T>;
    addAll(items: Iterable<T>, index?: number): LinkedList<T> {
        if (index !== undefined) {
            return this._addAllAtIndex(index!, items);
        } else {
            return this._addAllAtEnd(items);
        }
    }
    /**
     * Helper method to add all items from an iterable to the linked list.
     * @param items - The items to be added to the list.
     * @returns A new linked list with the items added to the end.
     */
    private _addAllAtEnd(items: Iterable<T>): LinkedList<T> {
        let newList: LinkedList<T> = this;
        for(const item of items) {
            newList = newList.addLast(item);
        }
        return newList;
    }

    /**
     * Helper method to add all items from an iterable at a specific index in the linked list.
     * @param index - The index at which the items should be added.
     * @param items - The items to be added to the list.
     * @returns A new linked list with the items added at the specified index.
     */
    private _addAllAtIndex(index: number, items: Iterable<T>): LinkedList<T> {
        let newList: LinkedList<T> = this;
        for (const item of items) {
            newList = newList.add(index, item);
            index++;
        }
        return newList;
    }

    /**
     * Clears the linked list.
     * @returns A empty linked list
     */
    clear(): LinkedList<T> {
        return new LinkedList();
    }

    /**
     * Concat the linked list with the given values or collections.
     * @param valuesOrCollections - values or collections to be concatenated
     * @returns A new linked list with the values or collections concatenated.
     */
    concat<C extends T>(...valuesOrCollections: Array<Iterable<C> | C>): LinkedList<T | C> {
        return super.concat(...valuesOrCollections) as LinkedList<T | C>;
    }

    /**
     * Get the distinct values from the linked list.
     * @returns A new linked list with the distinct values.
     */
    distinct(): LinkedList<T> {
        return super.distinct() as LinkedList<T>;
    }

     /**
     * Filters and returns a new linked list with the elements that pass the filter.
     * @param predicate - function to filter the elements
     * @param thisArg - context for the predicate function
     */
    filter<F extends T>(predicate: (value: T, index: number, iter: this) => value is F, thisArg?: any): LinkedList<F>;
    filter(predicate: (value: T, index: number, iter: this) => unknown, thisArg?: any): this;
    filter(predicate: (value: T, index: number, iter: this) => unknown, thisArg?: any): any {
        return super.filter(predicate, thisArg) as LinkedList<T>;
    }

    /**
     * Applies the mapper function to each element and flattens the result.
     * @param mapper - function to map the elements of the collection
     * @param thisArg - context for the mapper function
     */
    flatMap<M>(mapper: (value: T, key: number, iter: this) => Iterable<M>, thisArg?: any): LinkedList<M> {
        return super.flatMap(mapper, thisArg) as LinkedList<M>;
    }

    /**
     * Traverses and applies the given function to each element.
     * @param mapper - function to map the elements of the collection
     * @param thisArg - context for the mapper function
     */
    map<M>(mapper: (value: T, key: number, collection: this) => M, thisArg?: any): LinkedList<M> {
        return super.map(mapper, thisArg) as LinkedList<M>;
    }

    /**
     * Merges with the given collections.
     * 
     * @param collections - collections to be merged
     * @returns A new collection with the collections merged.
     */
    merge<C extends T>(...collections: Array<Iterable<C>>): LinkedList<T | C> {
        return super.merge(...collections) as LinkedList<T | C>;
    }

    /**
     * Partitions into a true collection for the elements that pass the predicate function.
     * The rest of the elements will go into the false collection. 
     * @param predicate - To apply to the elements.
     * @param thisArg - context for the predicate function.
     */
    partition<F extends T, C>(predicate: (this: C, value: T, index: number, iter: this) => value is F, thisArg?: C): [LinkedList<T>, LinkedList<F>];
    partition<C>(predicate: (this: C, value: T, index: number, iter: this) => unknown, thisArg?: C): [this, this];
    partition<C>(predicate: (this: C, value: T, index: number, iter: this) => unknown, thisArg?: any): any {
        return super.partition(predicate, thisArg) as [LinkedList<T>, LinkedList<T>];
    }

    /**
     * Accumulates the values in the collection using the provided callback function.
     * 
     * @param callback - The function to apply to each element.
     */
    reduce(callback: (previousValue: T, currentValue: T, currentIndex: number, collection: this) => T): T;
    reduce<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, collection: this) => U, initialValue: U): U;
    reduce(callback: any, initialValue?: any): any {
        return super.reduce(callback, initialValue) as any;
    }
    
    /**
     * Accumulates the values in the collection using the provided callback function, starting from the end.
     * @param callback - The function to apply to each element.
     */
    reduceRight(callback: (previousValue: T, currentValue: T, currentIndex: number, collection: this) => T): T;
    reduceRight(callback: (previousValue: T, currentValue: T, currentIndex: number, collection: this) => T, initialValue: T): T;
    reduceRight<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, collection: this) => U, initialValue: U): U;
    reduceRight(callback: any, initialValue?: any): any {
        return super.reduceRight(callback, initialValue) as any;
    }
    

    // remove(e: T): LinkedList<T>;
    // remove(item: T): LinkedList<T>;
    // remove(index: number): LinkedList<T>;
    // remove(): LinkedList<T>;
    // remove(arg1?: T | number): LinkedList<T> {
    //     if (typeof arg1 === 'number') {
    //         return this.removeAt(arg1);
    //     } else {
    //         return this.removeItem(arg1 as T);
    //     }
    // }

    /**
     * Removes the first occurrence of the specified item from the linked list.
     * @param item - The item to be removed.
     * @returns A new linked list with the item removed.
     */
    removeItem(item: T): LinkedList<T> {
        if (this.isEmpty()) {
            return this;
        }
        if (this.head === item) {
            return this.tail ?? new LinkedList<T>();
        }
        const newTail = this.tail?.removeItem(item) ?? null;
        return new LinkedList(this.head, newTail);
    }

    /**
     * Removes the item at the specified index from the linked list.
     * Or remove the first item if no index is specified.
     */
    remove(): LinkedList<T>;
    remove(index: number): LinkedList<T>;
    remove(index?: number): LinkedList<T> {
        if (index === undefined) {
            return this.removeFirst();
        }
        return this._removeAt(index);
    }

    /**
     * Removes the item at the specified index from the linked list.
     * @param index - The index of the item to be removed.
     * @returns A new linked list with the item removed.
     */
    private _removeAt(index: number): LinkedList<T> {
        if (index < 0) {
            return this;
        }

        if (index === 0) {
            return this.tail ?? new LinkedList();
        }

        const newTail = this.tail?._removeAt(index - 1) ?? null;
        return new LinkedList(this.head, newTail);
    }

    /**
     * Remove all the items in the collection from the linked list.
     * @param c - The collection of items to be removed.
     * @returns A new linked list with the items removed.
     */
    removeAll(c: Iterable<T>): LinkedList<T> {
        let newList: LinkedList<T> | null = this;
        for (const item of c) {
            newList = newList.removeItem(item);
        }
        return newList;
    }

    /**
     * Removes the first item from the linked list.
     * @returns A new linked list with the first item removed.
     */
    removeFirst(): LinkedList<T> {
        return this.tail ?? new LinkedList();
    }

    /**
     * Remove the items that pass the filter function
     * @param filter - The filter function to be applied to each item.
     * @returns A new linked list with the items that do not pass the filter.
     */
    removeIf(filter: (item: T) => boolean): LinkedList<T> {
        return super.removeIf(filter) as LinkedList<T>;
       
        /*
        if (this.isEmpty()) return this;

        if (filter(this.head!)) {
            return this.tail ? this.tail.removeIf(filter) : new LinkedList();
        } else {
            const newTail = this.tail?.removeIf(filter) ?? null;
            return new LinkedList(this.head, newTail);
        }

         */
    }

    /**
     * Removes the last item from the linked list.
     * @returns A new linked list with the last item removed.
     */
    removeLast(): LinkedList<T> {
        if (this.isEmpty()) {
            return this;
        }
        if (!this.tail?.tail) {
            return new LinkedList<T>(this.head);
        }

        return new LinkedList(this.head, this.tail.removeLast());
    }

    /**
     * Replace all the items in the linked list with the given items.
     * @param items - The items to add to the linked list.
     * @returns A new linked list with the items added.
     */
    replaceAll(items: Iterable<T>): LinkedList<T> {
        const newList = new LinkedList<T>();
        newList.addAll(items);
        return newList;
    }

    /**
     * Retain all the items in the linked list that are also in the given collection.
     * @param items - The items to retain in the linked list.
     * @returns A new linked list with the items retained.
     */
    retainAll(items: Iterable<T>): LinkedList<T> {
        const itemsToRetain = new Set(items);
        const res = this._retainAllRecursive(itemsToRetain);
        return res ?? new LinkedList<T>();
    }

    /**
     * Helper method to retain all the items in the linked list that are also in the given collection.
     * @param itemsToRetain - The items to retain in the linked list. 
     * @returns A new linked list with the items retained.
     */
    private _retainAllRecursive(itemsToRetain: Set<T>): LinkedList<T> | null{
        if (this.isEmpty()) {
            return null;
        }

        const newTail = this.tail?._retainAllRecursive(itemsToRetain) ?? null;
        if (itemsToRetain.has(this.head!)) {
            return new LinkedList(this.head!, newTail);
        } else {
            return null;
        }
    }

    /**
     * Reverses the linked list.
     * @returns A new linked list with the items in reverse order.
     */
    reversed(): LinkedList<T> {
        let newList = new LinkedList<T>();
        for (const item of this) {
            newList = newList.addFirst(item);
        }
        return newList;
    }

    /**
     * Set the item at the specified index in the linked list.
     * @param index - The index of the item to be set.
     * @param item - The item to be set.
     * @returns A new linked list with the item set at the specified index.
     */
    set(index: number, item: T): LinkedList<T> {
        if (index < 0) return this;

        if (index === 0 ) {
            return new LinkedList(item, this.tail);
        }

        if (this.tail === null) {
            return this;
        }

        const newTail = this.tail.set(index - 1, item);
        return new LinkedList(this.head, newTail);
    }

    /**
     * Remove the last item from the linked list.
     * @returns A new linked list with the last item removed.
     */
    pop(): LinkedList<T> {
        if (this.isEmpty()) throw new RangeError("Cannot pop from an empty list");
        const res = this._popHelper();
        return res ?? new LinkedList<T>();
    }

    /**
     * Helper method to remove the last item from the linked list.
     * @returns A new linked list with the last item removed.
     */
    private _popHelper(): LinkedList<T> | null {
        if (this.tail === null) return null;

        const newTail = this.tail._popHelper();
        return new LinkedList(this.head!, newTail);
    }

    /**
     * Remove the first item from the linked list.
     * @returns A new linked list with the first item removed.
     */
    shift(): LinkedList<T> {
        return this.tail ?? new LinkedList<T>();
    }

    /**
     * Adds an item to the front of the linked list.
     * @param items - The items to be added to the front of the list.
     * @returns A new linked list with the items added to the front.
     */
    unshift(...items: T[]): LinkedList<T> {
        return super.unshift(...items) as LinkedList<T>;
    }

    /**
     * Returns a new linked list with the items in the specified range.
     * If no range is specified, it returns a shallow copy of the linked list.
     * @param start - The starting index of the slice.
     * @param end - The ending index of the slice.
     * @returns A new linked list with the items in the specified range.
     */
    slice(start?: number, end?: number): LinkedList<T> {
        if (start === undefined) start = 0;
        if (end === undefined) end = this.size();
        if (start < 0) start = Math.max(0, this.size() + start);
        if (end < 0) end = Math.max(0, this.size() + end);

        return this._sliceHelper(start, end, 0) ?? new LinkedList<T>();
    }

    /**
     * Helper method to return a new linked list with the items in the specified range.
     */
    private _sliceHelper(start: number, end: number, currentIndex: number = 0): LinkedList<T> | null {
        if (start >= end || this.isEmpty()) return null;

        if (currentIndex < start) {
            return this.tail ? this.tail._sliceHelper(start, end, currentIndex + 1) : null;
        }

        if (currentIndex >= end) {
            return null;
        }

        return new LinkedList(this.head, this.tail?._sliceHelper(start, end, currentIndex + 1) ?? null);

    }

    /**
     * Sort the linked list using the provided comparator function.
     * Uses the Timsort algorithm.
     * @param compare - The comparator function to be used for sorting.
     * @returns A new linked list with the items sorted.
     */
    sort(compare?: Comparator<T>): LinkedList<T> {
        return super.sort(compare) as LinkedList<T>;
    }

    /**
     * Sort the linked list using the provided key selector and comparator function.
     * @param keySelector - The function to be used to select the key for sorting.
     * @param compareFn - The comparator function to be used for sorting.
     * @returns A new linked list with the items sorted.
     */
    sortBy<U>(keySelector: (value: T) => U, compareFn?: ((a: U, b: U) => number)): LinkedList<T> {
        return super.sortBy(keySelector, compareFn) as LinkedList<T>;
    }

    /**
     * Returns a new list with the section removed and optionally replaced with new items.
     * @param start - The starting index of the splice.
     * @param deleteCount - The number of items to be removed from the list.
     */
    splice(start: number, deleteCount?: number): LinkedList<T>;
    splice(start: number, deleteCount: number, ...items: T[]): LinkedList<T>;
    splice(start: number, deleteCount?: number, ...items: T[]): LinkedList<T> {
        if (start < 0) start = Math.max(0, this.size() + start);
        if (deleteCount === undefined) deleteCount = this.size() - start;

        if (deleteCount < 0) deleteCount = 0;

        const before = this.slice(0, start);
        const after = this.slice(start + deleteCount);

        let newList = before;
        for(const item of items) {
            newList = newList.addLast(item);
        } 
        return newList.concat(after);
    }
    

    /**
     * Combines elements of this collection with one or more iterables into tuples, 
     * stopping when the shortest input is exhausted.
     * @param other - other collections to combine with
     */
    zip<U>(other: ListInput<U>): LinkedList<[T, U]>;
    zip<U, V>(other: ListInput<U>, other2: ListInput<V>): LinkedList<[T, U, V]>;
    zip(...collections: Array<ListInput<unknown>>): LinkedList<unknown>;
    zip<U, V>(...other: (ListInput<U> | ListInput<unknown> | ListInput<V>)[]): LinkedList<unknown> {
        return super.zip(...other) as LinkedList<unknown>;
    }

     /**
     * Combines elements of this collection with one or more iterables into tuples, 
     * continuing until the longest input is exhausted.
     * @param other - other collections to combine with
     */
    // zipAll: (<U>(other: Collection<U>) => Collection<[T, U]>) 
    //         & (<U, V>(other: Collection<U>, other2: Collection<V>) 
    // => LinkedList<[T, U, V]>);
    zipAll<U>(other: ListInput<U>): LinkedList<[T, U]>;
    zipAll<U, V>(other: ListInput<U>, other2: ListInput<V>): LinkedList<[T, U, V]>;
    zipAll(...collections: Array<ListInput<unknown>>): LinkedList<unknown>;
    zipAll<U, V>(...other: (ListInput<U> | ListInput<unknown> | ListInput<V>)[]): LinkedList<unknown> {
        return super.zipAll(...other) as LinkedList<unknown>;
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
    ): LinkedList<Z>;
    zipWith<U, V, Z>(
        zipper: (value: T, otherValue: U, thirdValue: V) => Z,
        otherCollection: ListInput<U>,
        thirdCollection: ListInput<V>
    ): LinkedList<Z>;
    zipWith<Z>(
        zipper: (...values: unknown[]) => Z,
        ...collections: Array<ListInput<unknown>>
    ): LinkedList<Z>;
    zipWith<U, V, Z>(
        zipper: any,
        ...otherCollection: (ListInput<U> | ListInput<unknown> | ListInput<V>)[]
    ): LinkedList<Z> {
        return super.zipWith(zipper, ...otherCollection) as LinkedList<Z>;
    }

    /**
     * Retrieves the first item in the linked list.
     * @returns The first item in the linked list.
     */
    element(): T {
        if (this.head === null) {
            throw new Error("NoSuchElementException - tried to retrieve the head of the Linked List but it is empty");
        }
        return this.head;
    }

    /**
     * Add element to the linked list.
     * @param item - The item to be added to the linked list.
     * @returns A new linked list with the item added to the end.
     */
    offer(item: T): LinkedList<T> {
        return this.addLast(item);
    }
    

    /**
     * Retrieves the first item in the linked list without removing it.
     * @returns The first item in the linked list or undefined if the linked list is empty.
     */
    peek(): T | undefined {
        if (this.isEmpty()) return undefined;
        return this.head!;
    }

    /**
     * Retrieves and removes the head of the queue. 
     * Returns undefined if the linked list is empty.
     * @returns The first item in the linked list or undefined if the linked list is empty.
     */
    poll(): { value: T | undefined; newQueue: LinkedList<T> } {
        if (this.isEmpty()) return {value: undefined, newQueue: new LinkedList<T>()};

        return {value: this.head!, newQueue: this.tail ?? new LinkedList<T>()};
    }
    

    /**
     * Convert to an array using the iterator.
     */
    toArray(): T[] {
        return Array.from(this);
    }

    /**
     * Compare this linked list with another object.
     * @param o - The object to be compared with.
     * @returns true if the two objects are equal, false otherwise.
     */
    equals(o: Object): boolean {
        if (this === o) return true;
        if (!(o instanceof LinkedList)) return false;
        if (this.size() !== o.size()) return false;

        const arr1 = this.toArray();
        const arr2 = (o as LinkedList<T>).toArray();

        return arr1.every((value, index) => value === arr2[index]);
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
     * Computes the hash code of the linked list.
     * @returns The hash code of the linked list.
     */
    hashCode(): number {
        if (this._hashCode === null) {
            this._hashCode = HashCode.hashCodeArray(this.toArray());
        }
        return this._hashCode;
    }

    /**
     * Returns a string representation of the linked list.
     * @returns A string representation of the linked list.
     */
    toString(): string {
        return "[" + this.toArray().join(", ") + "]";
    }
}