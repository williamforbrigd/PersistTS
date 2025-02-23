import Collection from '../Interfaces/Collection';
import { Comparator } from '../Interfaces/Comparator';

export default abstract class AbstractCollection<T> implements Collection<T> {
    abstract [Symbol.iterator](): Iterator<T>;

    protected constructor() {

    }

    abstract add(e: T): Collection<T>;

    abstract addAll(c: Iterable<T>): Collection<T>;

    abstract clear(): Collection<T>;

    contains(o: T): boolean {
        for (const item of this) {
            if (item === o) {
                return true;
            }
        }
        return false;
    }

    containsAll(c: Iterable<T>): boolean {
        for (const item of c) {
            if (!this.contains(item)) {
                return false;
            }
        }
        return true;
    }

    abstract equals(o: Object): boolean;

    abstract get(index: number): T | undefined;
    abstract get(index: number, notSetValue?: any): any;

    abstract hashCode(): number;

    isEmpty(): boolean {
        return this.size() === 0;
    }

    abstract remove(e: T): Collection<T>;

    abstract removeAll(c: Iterable<T>): Collection<T>;

    abstract removeIf(filter: (item: T) => boolean): Collection<T>;

    abstract retainAll(c: Iterable<T>): Collection<T>;

    abstract size(): number;

    toArray(): T[];
    toArray(generator: (size: number) => T[]): T[];
    toArray(generator?: (size: number) => T[]): T[] {
        const result = generator ? generator(this.size()) : new Array<T>(this.size());
        let i =0;
        for (const item of this) {
            result[i++] = item;
        }
        return result;
    }

    abstract concat<C extends T>(...valuesOrCollections: Array<Iterable<C> | C>): Collection<T | C>;
    abstract merge<C extends T>(...collections: Array<Iterable<C>>): Collection<T | C>;

    abstract map<M>(
        mapper: (value: T, key: number, collection: this) => M,
        thisArg?: any
    ): Collection<M>;

    abstract flatMap<M>(
        mapper: (value: T, key: number, iter: this) => Iterable<M>,
        thisArg?: any
    ): Collection<M>;

    abstract filter<F extends T>(
        predicate: (value: T, index: number, iter: this) => value is F,
        thisArg?: any
    ): Collection<F>;
    abstract filter(
        predicate: (value: T, index: number, iter: this) => unknown,
        thisArg?: any
    ): this;

    abstract partition<F extends T, C>(
        predicate: (this: C, value: T, index: number, iter: this) => value is F,
        thisArg?: C
    ): [Collection<T>, Collection<F>];
    abstract partition<C>(
        predicate: (this: C, value: T, index: number, iter: this) => unknown,
        thisArg?: C
    ): [this, this];

    abstract zip<U>(other: Collection<U>): Collection<[T, U]>;
    abstract zip<U, V>(
        other: Collection<U>,
        other2: Collection<V>
    ): Collection<[T, U, V]>;
    abstract zip(...collections: Array<Collection<unknown>>): Collection<unknown>;

    abstract zipAll<U>(other: Collection<U>): Collection<[T, U]>;
    abstract zipAll<U, V>(
        other: Collection<U>,
        other2: Collection<V>
    ): Collection<[T, U, V]>;
    abstract zipAll(...collections: Array<Collection<unknown>>): Collection<unknown>;

    abstract zipWith<U, Z>(
        zipper: (value: T, otherValue: U) => Z,
        otherCollection: Collection<U>
    ): Collection<Z>;
    abstract zipWith<U, V, Z>(
        zipper: (value: T, otherValue: U, thirdValue: V) => Z,
        otherCollection: Collection<U>,
        thirdCollection: Collection<V>
    ): Collection<Z>;
    abstract zipWith<Z>(
        zipper: (...values: Array<unknown>) => Z,
        ...collections: Array<Collection<unknown>>
    ): Collection<Z>;


    abstract distinct(): Collection<T>;
    join(separator?: string): string {
        return Array.from(this).join(separator ?? ",");
    }
    
    every<S extends T>(callback: (value: T, index: number, collection: this) => value is S, thisArg?: any): this is Collection<S>;
    every(callback: (value: T, index: number, collection: this) => unknown, thisArg?: any): boolean;
    every(callback: (value: T, index: number, collection: this) => unknown, thisArg?: any): any {
        let i=0;
        for (const item of this) {
            if (!callback.call(thisArg, item, i++, this)) {
                return false;
            }
        }
        return true;
    }

    some(callback: (value: T, index: number, collection: this) => unknown, thisArg?: any): boolean {
        let i=0;
        for (const item of this) {
            if (callback.call(thisArg, item, i++, this)) {
                return true;
            }
        }
        return false;
    }

    abstract sort(compareFn?: Comparator<T>): Collection<T>;
    abstract sortedBy<U>(keySelector: (value: T) => U, compareFn?: (a: U, b: U) => number): Collection<T>;

    forEach(callback: (value: T, index: number, collection: this) => void, thisArg?: any): void {
        let i=0;
        for (const item of this) {
            callback.call(thisArg, item, i++, this);
        }
    }

    find(predicate: (value: T, index: number, collection: this) => boolean, thisArg?: any): T | undefined {
        let i=0;
        for (const item of this) {
            if (predicate.call(thisArg, item, i, this)) {
                return item;
            }
            i++;
        }
        return undefined;
    }

    abstract reduce(callback: (previousValue: T, currentValue: T, currentIndex: number, collection: this) => T): T;
    abstract reduce<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, collection: this) => U, initialValue: U): U;
    abstract reduceRight(callback: (previousValue: T, currentValue: T, currentIndex: number, collection: this) => T): T;
    abstract reduceRight(callback: (previousValue: T, currentValue: T, currentIndex: number, collection: this) => T, initialValue: T): T;
    abstract reduceRight<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, collection: this) => U, initialValue: U): U;

}