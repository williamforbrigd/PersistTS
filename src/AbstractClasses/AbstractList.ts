import List, {ListInput} from "../Interfaces/List";
import SequencedCollection from "../Interfaces/SequencedCollection";
import Collection from "../Interfaces/Collection";
import { Speed } from "../Enums/Speed";
import AbstractSequencedCollection from "./AbstractSequencedCollection";
import { Utils } from "../Utils/Utils";

/**
 * Abstract class representation for the List interface.
 * 
 * Provides default implementations for methods that are common to lists,
 * while leaving core mutation methods abstract for subclasses to implement.
 * These core methods are for instance, add, set, remove, and slice.
 * 
 * Many of the higher-order functions (HOFs) can be generalized, since they use many of the core
 * methods that are implemented in the subclasses.
 */
export default abstract class AbstractList<T> extends AbstractSequencedCollection<T> implements List<T> {
    [index: number]: T | undefined;

    abstract empty(): List<T>;

    /**
     * Method to create an empty instance of the collection, based on the generic parameter.
     */
    protected abstract createEmpty<E>(): List<E>;

    of(...values: T[]): List<T> {
        return this.empty().addAll(values);
    }

    abstract add(item: T): List<T>;
    abstract add(index: number, item: T): List<T>;

    /**
     * Adds all items to the list.
     * If the index is not provided, the items are added to the end of the list.
     * Providing an index will insert the items starting from a specified index.
     * 
     * @param items - items to add to the list
     */
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

    /**
     * Remove an item from the list.
     * @param item - item to remove from the list
     * @returns - a new list with the item removed
     */
    removeItem(item: T): List<T> {
        const index = this.indexOf(item);
        if (index === -1) {
            return this;
        }
        return this.remove(index);
    }

    abstract set(index: number, item: T): List<T>;
    abstract pop(): List<T>;

    abstract replaceAll(items: Iterable<T>): List<T>;

    /**
     * Copy the items of the list to the given array.
     * @param array - array to copy the items to
     * @param arrayIndex - index to start copying to
     */
    copyTo(array: T[], arrayIndex: number): void {
       for (const item of this) {
            array[arrayIndex++] = item;
       }
    }

    /**
     * Return the index of an item in the list.
     * Will use the provided iterator to loop over the items
     * that is defined in the subclass.
     * 
     * @param item - item to find in the list
     * @returns - the index of the item in the list, or -1 if not found
     */
    indexOf(item: T): number {
        let i=0;
        for (const value of this) {
            if (Utils.equals(value, item)) {
                return i;
            }
            i++;
        }
        return -1;
    }

    /**
     * Get the last index of an item in the list, meaning the index of the 
     * last occurence of the item in the list.
     * @param item - item to find in the list
     * @returns - the index of the last occurrence of the item in the list, or -1 if not found
     */
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
    shift(): List<T> {
        return this.removeFirst() as List<T>;
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
        return this.createEmpty<unknown>().addAll(newItems);
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
        return this.createEmpty<unknown>().addAll(newItems);
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
        return this.createEmpty<Z>().addAll(newItems);
    }
}