import List from "../Interfaces/List";
import AbstractCollection from "./AbstractCollection";
import SequencedCollection from "../Interfaces/SequencedCollection";
import { Comparator } from "../Interfaces/Comparator";
import Collection from "../Interfaces/Collection";

export default abstract class AbstractList<T> extends AbstractCollection<T> implements List<T> {
    [index: number]: T | undefined;

    protected constructor() {
        super();
    }

    FIFO(): boolean {
        return false;
    }

    abstract add(item: T): List<T>;
    abstract add(index: number, item: T): List<T>;
    abstract add(pointer: List<T>, item: T): List<T>; // insert item at end of compatible view
    abstract addAll(items: Iterable<T>): List<T>;
    abstract addAll(index: number, items: Iterable<T>): List<T>;
    abstract addFirst(e: T): List<T>;
    abstract addLast(e: T): SequencedCollection<T>;

    abstract remove(item: T): List<T>;
    abstract remove(): List<T>;
    abstract removeFirst(): List<T>;
    abstract removeLast(): List<T>;
    abstract removeAll(items: Iterable<T>): List<T>;
    abstract removeAt(index: number): List<T>;
    abstract removeAt(index: number): List<T>;

    abstract concat<C extends T>(...valuesOrCollections: Array<Iterable<C> | C>): List<T | C>;

    copyTo(array: T[], arrayIndex: number): void {
        let index = arrayIndex;
        for (const item of this) {
            array[index++] = item;
        }
    }

    every<S extends T>(callback: (value: T, index: number, array: List<T>) => value is S, thisArg?: any): this is List<S>;
    every(callback: (value: T, index: number, array: List<T>) => unknown, thisArg?: any): boolean;
    every(callback: (value: T, index: number, array: List<T>) => unknown, thisArg?: any): any {
        let i=0;
        for (const item of this) {
            if (!callback.call(thisArg, item, i++, this)) {
                return false;
            }
        }
        return true;
    }

    abstract filter<F extends T>(predicate: (value: T, index: number, iter: this) => value is F, context?: any): List<F>;
    abstract filter(predicate: (value: T, index: number, iter: this) => unknown, context?: any): this;
    abstract filter(predicate: (value: T, index: number, iter: this) => unknown, context?: any): any;

    abstract findAll(filter: (item: T) => boolean): List<T>;

    abstract flatMap<M>(mapper: (value: T, key: number, iter: this) => Iterable<M>, context?: any): List<M>;

    forEach(callback: (value: T, index: number, array: List<T>) => void, thisArg?: any): void {
        let i=0;
        for (const item of this) {
            callback.call(thisArg, item, i++, this);
        }
    }

    getFirst(): T | undefined {
        return this.get(0);
    }

    getLast(): T | undefined {
        return this.get(this.size() - 1);
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

    abstract isReadOnly(): boolean;

    join(separator?: string): string {
        return Array.from(this).join(separator ?? ",");
    }

    lastIndexOf(item: T): number {
        let i=this.size();
        for (const value of this.reversed()) {
            i--;
            if (value === item) {
                return i;
            }
        }
        return -1;
    }

    abstract map<M>(mapper: (value: T, key: number, iter: this) => M, context?: any): List<M>;

    abstract merge<C extends T>(...collections: Array<Iterable<C>>): List<T | C>;

    abstract partition<F extends T, C>(predicate: (this: C, value: T, index: number, iter: this) => value is F, context?: C): [List<T>, List<F>];
    abstract partition<C>(predicate: (this: C, value: T, index: number, iter: this) => unknown, context?: C): [this, this];
    abstract partition<C>(predicate: (this: C, value: T, index: number, iter: this) => unknown, context?: C): any;

    abstract reduce(callback: (previousValue: T, currentValue: T, currentIndex: number, array: List<T>) => T): T;
    abstract reduce<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, array: List<T>) => U, initialValue: U): U;
    abstract reduce<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, array: List<T>) => U, initialValue?: U): U;
    

    abstract reduceRight(callback: (previousValue: T, currentValue: T, currentIndex: number, array: List<T>) => T): T;
    abstract reduceRight(callback: (previousValue: T, currentValue: T, currentIndex: number, array: List<T>) => T, initialValue: T): T;
    abstract reduceRight<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, array: List<T>) => U, initialValue: U): U;


    abstract replaceAll(items: Iterable<T>): List<T>;

    abstract reversed(): SequencedCollection<T>;

    abstract set(index: number, item: T): List<T>;

    abstract shift(): List<T>;

    abstract slice(start?: number, end?: number): List<T>;

    some(callback: (value: T, index: number, array: List<T>) => unknown, thisArg?: any): boolean {
        let i=0;
        for (const item of this) {
            if (callback.call(thisArg, item, i++, this)) {
                return true;
            }
        }
        return false;
    }

    abstract sort(comparator: Comparator<T>): List<T>;

    abstract splice(start: number, deleteCount?: number): List<T>;
    abstract splice(start: number, deleteCount: number, ...items: T[]): List<T>;
    abstract splice(start: number, deleteCount?: number, ...items: T[]): List<T>;

    abstract unshift(...items: T[]): List<T>;

    abstract zip<U>(other: Collection<U>): List<[T, U]>;
    abstract zip<U, V>(other: Collection<U>, other2: Collection<V>): List<[T, U, V]>;
    abstract zip(...collections: Array<Collection<unknown>>): List<unknown>;
    abstract zip<U, V>(...other: (Collection<U> | Collection<unknown> | Collection<V>)[]): any;

    abstract zipAll<U>(other: Collection<U>): List<[T, U]>;
    abstract zipAll<U, V>(other: Collection<U>, other2: Collection<V>): List<[T, U, V]>;
    abstract zipAll(...collections: Array<Collection<unknown>>): List<unknown>;
    abstract zipAll<U, V>(...other: (Collection<U> | Collection<unknown> | Collection<V>)[]): any;

    abstract zipWith<U, Z>(zipper: (value: T, otherValue: U) => Z, otherCollection: Collection<U>): List<Z>;
    abstract zipWith<U, V, Z>(zipper: (value: T, otherValue: U, thirdValue: V) => Z, otherCollection: Collection<U>, thirdCollection: Collection<V>): List<Z>;
    abstract zipWith<Z>(zipper: (...values: unknown[]) => Z, ...collections: Array<Collection<unknown>>): List<Z>;
    abstract zipWith<U, V, Z>(zipper: any, ...otherCollection: (Collection<U> | Collection<unknown> | Collection<V>)[]): List<Z>;
}