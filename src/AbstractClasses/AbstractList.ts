import List, {ListInput} from "../Interfaces/List";
import AbstractCollection from "./AbstractCollection";
import SequencedCollection from "../Interfaces/SequencedCollection";
import { Comparator } from "../Interfaces/Comparator";
import Collection from "../Interfaces/Collection";
import { Speed } from "../Enums/Speed";

export default abstract class AbstractList<T> extends AbstractCollection<T> implements List<T> {
    [index: number]: T | undefined;

    FIFO(): boolean {
        return true;
    }

    isReadOnly(): boolean {
        return false;
    }

    abstract empty(): List<T>;

    of(...values: T[]): List<T> {
        return this.empty().addAll(values);
    }

    abstract add(item: T): List<T>;
    abstract add(index: number, item: T): List<T>;

    addAll(items: Iterable<T>): List<T>;
    addAll(items: Iterable<T>, index: number, ): List<T>;
    addAll(items: Iterable<T>, index?: number): List<T> {
        if (index !== undefined) {
            let res = this as List<T>;
            let i = index;
            for (const value of items) {
                // res = res.add(i, value);
                res = res.set(i, value);
                i++;
            }
            return res;
        } else {
            let res = this as List<T>;
            for (const value of items) {
                res = res.add(value);
            }
            return res;
        }
    }

    // abstract remove(item: T): List<T>;
    abstract remove(index: number): List<T>;
    abstract removeItem(item: T): List<T>;

    abstract set(index: number, item: T): List<T>;
    abstract pop(): List<T>;

    abstract replaceAll(items: Iterable<T>): List<T>;

    copyTo(array: T[], arrayIndex: number): void {
       for (const item of this) {
            array[arrayIndex++] = item;
       }
    }

    indexOf(item: T): number {
        let i=0;
        for (const value of this) {
            if (value === item) {
                return i;
            }
            i++;
        }
        return -1;
    }

    lastIndexOf(item: T): number {
        let i=0;
        let index = -1;
        for (const value of this) {
            if (value === item) {
                index = i;
            }
            i++;
        }
        return index;
    }

    abstract reversed(): SequencedCollection<T>;

    abstract addFirst(e: T): SequencedCollection<T>;

    abstract addLast(e: T): SequencedCollection<T>;

    getFirst(): T | undefined {
        return this.get(0);
    }

    getLast(): T | undefined {
        return this.get(this.size() - 1);
    }

    abstract removeFirst(): SequencedCollection<T>;

    abstract removeLast(): SequencedCollection<T>;


    // HOFs only relevant to List
    abstract splice(start: number, deleteCount?: number): Collection<T>;
    abstract splice(start: number, deleteCount: number, ...items: T[]): Collection<T>;

    abstract slice(start?: number, end?: number): Collection<T>;

    abstract indexingSpeed(): Speed;
    abstract hasSpeed(): Speed;
    abstract addSpeed(): Speed;
    abstract removeSpeed(): Speed;


    // HOFs

    /**
     * Removes the first element of the collection.
     */
    shift(): SequencedCollection<T> {
        return this.removeFirst();
    }

    /**
     * Prepend the given items to the collection.
     * @param items
     */
    unshift(...items: T[]): List<T> {
        return this.addAll(items, 0);
    }

    /**
     * Concat the collection with the given values or collections.
     * @param valuesOrCollections - values or collections to be concatenated
     * @returns A new collection with the values or collections concatenated.
     */
    concat<C extends T>(...valuesOrCollections: Array<Iterable<C> | C>): List<T | C> {
        let res = this as unknown as List<T | C>;

        for (const elem of valuesOrCollections) {
            if (elem !== null && (elem as any)[Symbol.iterator]) {
                res = res.addAll(elem as Iterable<C>)
            } else {
                res = res.add(elem as C);
            }
        }
        return res;
    }

    /**
     * Merges with the given collections.
     * 
     * @param collections - collections to be merged
     * @returns A new collection with the collections merged.
     */
    merge<C extends T>(...collections: Array<Iterable<C>>): List<T | C> {
        let res = this as List<T | C>;
        for (const collection of collections) {
            res = res.addAll(collection);
        }
        return res;
    }

    /**
     * Traverses and applies the given function to each element.
     * @param mapper - function to map the elements of the collection
     * @param thisArg - context for the mapper function
     */
    map<M>(
        mapper: (value: T, key: number, collection: this) => M,
        thisArg?: any
    ): List<M> {
        const newItems = this.toArray().map((value, index) => mapper.call(thisArg, value, index, this));
        return (this.empty() as unknown as List<M>).addAll(newItems);
    }

    /**
     * Applies the mapper function to each element and flattens the result.
     * @param mapper - function to map the elements of the collection
     * @param thisArg - context for the mapper function
     */
    flatMap<M>(
        mapper: (value: T, key: number, iter: this) => Iterable<M>,
        thisArg?: any
    ): List<M> {
        // let res = Vector.empty<M>();
        let res = this.empty() as unknown as List<M>;
        let i=0;
        for (const value of this) {
            const iter = mapper.call(thisArg, value, i++, this);
            res = res.addAll(iter);
        }
        return res;
    }

    /**
     * Filters and returns a new collection with the elements that pass the filter.
     * @param predicate - function to filter the elements
     * @param thisArg - context for the predicate function
     */
    filter<F extends T>(
        predicate: (value: T, index: number, iter: this) => value is F,
        thisArg?: any
    ): List<F>;
    filter(
        predicate: (value: T, index: number, iter: this) => unknown,
        thisArg?: any
    ): this;
    filter(predicate: any, thisArg?: any): any {
        const filtered = this.toArray().filter((value, index) => predicate.call(thisArg, value, index, this));
        return (this.empty() as unknown as List<T>).addAll(filtered);
    }

    /**
     * Partitions into a true collection for the elements that pass the predicate function.
     * The rest of the elements will go into the false collection. 
     * @param predicate - To apply to the elements.
     * @param thisArg - context for the predicate function.
     */
    partition<F extends T, C>(
        predicate: (this: C, value: T, index: number, iter: this) => value is F,
        thisArg?: C
    ): [List<T>, List<F>];
    partition<C>(
        predicate: (this: C, value: T, index: number, iter: this) => unknown,
        thisArg?: C
    ): [this, this];
    partition<C>(predicate: (this: C, value: T, index: number, iter: this) => unknown, thisArg?: any): any {
        const trueItems: T[] = [];
        const falseItems: T[] = [];
        let i = 0;
        for (const value of this) {
            if (predicate.call(thisArg, value, i, this)) {
                trueItems.push(value);
            } else {
                falseItems.push(value);
            }
            i++;
        }
        const trueCollection = (this.empty() as unknown as List<T>).addAll(trueItems);
        const falseCollection = (this.empty() as unknown as List<T>).addAll(falseItems);
        return [trueCollection, falseCollection];
    }

    /**
     * Combines elements of this collection with one or more iterables into tuples, 
     * stopping when the shortest input is exhausted.
     * @param other - other collections to combine with
     */
    zip<U>(other: ListInput<T>): List<[T, U]>;
    zip<U, V>(
        other: ListInput<T>,
        other2: ListInput<T>
    ): List<[T, U, V]>;
    zip(...collections: Array<ListInput<unknown>>): List<unknown>;
    zip<U, V>(...other: (ListInput<U> | ListInput<unknown> | ListInput<V>)[]): List<unknown> {
        const minLength = Math.min(this.size(), ...other.map(c => Array.isArray(c) ? c.length : c.size()));
        const newItems: unknown[] = [];
        for (let i = 0; i < minLength; i++) {
            newItems.push([this.get(i), ...other.map(c => Array.isArray(c) ? c[i] : c.get(i))]);
        }
        return (this.empty() as unknown as List<unknown>).addAll(newItems);
    }

    /**
     * Combines elements of this collection with one or more iterables into tuples, 
     * continuing until the longest input is exhausted.
     * @param other - other collections to combine with
     */
    zipAll<U>(other: ListInput<U>): List<[T, U]>;
    zipAll<U, V>(other: ListInput<U>, other2: ListInput<V>): List<[T, U, V]>;
    zipAll(...collections: Array<ListInput<unknown>>): List<unknown>;
    zipAll<U, V>(...other: (ListInput<U> | ListInput<unknown> | ListInput<V>)[]): List<unknown> {
        const maxLength = Math.max(this.size(), ...other.map(c => Array.isArray(c) ? c.length : c.size()));
        const newItems = [];
        for (let i = 0; i < maxLength; i++) {
            const firstValue = i < this.size() ? this.get(i) : undefined;
            const secondValue = other.map(c => Array.isArray(c) ? (i < c.length ? c[i] : undefined) : (i < c.size() ? c.get(i) : undefined));
            const zipped = [firstValue, ...secondValue];
            newItems.push(zipped);
        }
        return (this.empty() as unknown as List<unknown>).addAll(newItems);
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
    ): List<Z>;
    zipWith<U, V, Z>(
        zipper: (value: T, otherValue: U, thirdValue: V) => Z,
        otherCollection: ListInput<U>,
        thirdCollection: ListInput<V>
    ): List<Z>;
    zipWith<Z>(
        zipper: (...values: unknown[]) => Z,
        ...collections: Array<ListInput<unknown>>
    ): List<Z>;
    zipWith<U, V, Z>(
        zipper: any,
        ...otherCollection: (ListInput<U> | ListInput<unknown> | ListInput<V>)[]
    ): List<Z> {
        const minLength = Math.min(this.size(), ...otherCollection.map(c => Array.isArray(c) ? c.length : c.size()));
        const newItems: Z[] = [];
        for (let i = 0; i < minLength; i++) {
            const values = [this.get(i), ...otherCollection.map(c => Array.isArray(c) ? c[i] : c.get(i))];
            newItems.push(zipper(...values));
        }
        return (this.empty() as unknown as List<Z>).addAll(newItems);
    }

    /**
     * Returns a new collection with only unique elements.
     */
    distinct(): List<T> {
        let res = this.empty() as unknown as List<T>;
        const set = new Set<T>(this.toArray());
        res = res.addAll(set as Iterable<T>);
        return res;
    }

    /**
     * Concatenates the collection into a string
     * @param separator - The separator to use between elements. Defaults to "," if not provided.
     * @returns A string representation of the collection.
     */
    join(separator?: string): string {
        return this.toArray().join(separator);
    }

    every<S extends T>(
        callback: (value: T, index: number, collection: this) => value is S,
        thisArg?: any
    ): this is List<S>;
    every(callback: (value: T, index: number, collection: this) => unknown, thisArg?: any): boolean;
    every(predicate: any, thisArg?: any): any {
        this.toArray().every((value, index) => predicate.call(thisArg, value, index, this));
    }
}