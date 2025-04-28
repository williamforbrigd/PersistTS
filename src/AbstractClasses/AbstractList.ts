import List, {ListInput} from "../Interfaces/List";
import AbstractCollection from "./AbstractCollection";
import SequencedCollection from "../Interfaces/SequencedCollection";
import { Comparator } from "../Interfaces/Comparator";
import Collection from "../Interfaces/Collection";
import { Speed } from "../Enums/Speed";
import AbstractSequencedCollection from "./AbstractSequentialCollection";

export default abstract class AbstractList<T> extends AbstractSequencedCollection<T> implements List<T> {
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


    getFirst(): T | undefined {
        return this.get(0);
    }

    getLast(): T | undefined {
        return this.get(this.size() - 1);
    }


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
}