import {Speed} from "../Enums/Speed";
import EqualityComparer from "./EqualityComparer";

/**
 * Represents an unordered collection of unique elements.
 */
export default interface Set<T> extends Iterable<T>, EqualityComparer<T>  {
    [Symbol.iterator](): Iterator<T>;
    
    size(): number;
    isEmpty(): boolean;
    add(value: T): Set<T>;
    addAll(values: Iterable<T>): Set<T>;
    has(value: T): boolean;
    hasAll(values: Iterable<T>): boolean;
    delete(value: T): Set<T>;
    deleteAll(values: Iterable<T>): Set<T>;
    clear(): Set<T>;
    get(value: T): T | undefined;

    values(): Array<T>;
    toArray(): Array<T>;

    // Speed
    hasSpeed(): Speed;
    addSpeed(): Speed;
    removeSpeed(): Speed;

    // HOFs

    every(predicate: (value: T, key: T, set: this) => boolean, thisArg?: unknown): this is Set<T>;
    every(predicate: (value: T, key: T, set: this) => unknown, thisArg?: unknown): boolean;

    some(predicate: (value: T, key: T, set: this) => boolean, thisArg?: unknown): boolean;

    forEach(callback: (value: T, key: T, set: this) => void, thisArg?: unknown): void;
    find(predicate: (value: T, key: T, set: this) => boolean, thisArg?: unknown): T | undefined;
    reduce(callback: (accumulator: T, value: T, key: T, set: this) => T, initialValue?: T): T;
    reduce<R>(callback: (accumulator: R, value: T, key: T, set: this) => R, initialValue?: R): R;
    reduceRight(callback: (accumulator: T, value: T, key: T, set: this) => T, initialValue?: T): T;
    reduceRight<R>(callback: (accumulator: R, value: T, key: T, set: this) => R, initialValue?: R): R;

    union<C>(...collections: Array<Iterable<C>>): Set<T | C>;
    merge<C>(...collections: Array<Iterable<C>>): Set<T | C>;
    concat<C>(...collections: Array<Iterable<C>>): Set<T | C>;

    intersect(...collections: Array<Iterable<T>>): Set<T>;

    subtract(...collections: Array<Iterable<T>>): Set<T>;

    map<M>(
        mapper: (value: T, key: T, set: this) => M,
        thisArg?: unknown
    ): Set<M>;

    flatMap<M>(
        mapper: (value: T, key: T, set: this) => Iterable<M>,
        thisArg?: unknown
    ): Set<M>;

    filter<F extends T>(
        predicate: (value: T, key: T, set: this) => value is F,
        thisArg?: unknown
    ): Set<F>;
    filter(
        predicate: (value: T, key: T, set: this) => unknown,
        thisArg?: unknown
    ): Set<T>;


    partition<F extends T, C>(
        predicate: (this: C, value: T, key: T, set: this) => value is F,
        thisArg?: C
    ): [Set<T>, Set<F>];
    partition<C>(
        predicate: (this: C, value: T, key: T, set: this) => unknown,
        thisArg?: C
    ): [Set<T>, Set<T>];    
}