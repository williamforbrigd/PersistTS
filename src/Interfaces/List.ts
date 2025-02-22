import Collection from "./Collection";
import {Comparator} from "./Comparator";
import SequencedCollection from "./SequencedCollection";

interface List<T>  {
    readonly length: number;

    //from<T>(items: Iterable<T>): List<T>;
    [Symbol.iterator](): Iterator<T>;
    FIFO(): boolean;
    [index: number]: T | undefined; // this is the get method
    get(index: number): T | undefined;
    set(index: number, item: T): List<T>;
    //count(): number;
    size(): number;
    isEmpty(): boolean;
    isReadOnly(): boolean;

    // add
    add(item: T): List<T>;
    add(index: number, item: T): List<T>;
    add(pointer: List<T>, item: T): List<T>; // insert item at end of compatible view
    addAll(items: Iterable<T>): List<T>;
    addAll(index: number, items: Iterable<T>): List<T>;

    // remove
    remove(item: T): List<T>;
    remove(): List<T>;
    removeFirst(): List<T>;
    removeLast(): List<T>;
    removeAll(items: Iterable<T>): List<T>;
    removeAt(index: number): List<T>;

    //retainAll(items: Iterable<T>): List<T>;
    replaceAll(items: Iterable<T>): List<T>;
    sort(comparator: Comparator<T>): List<T>;
    clear(): List<T>;
    contains(item: T): boolean;
    containsAll(items: Iterable<T>): boolean;
    copyTo(array: T[], arrayIndex: number): void;
    indexOf(item: T): number;
    lastIndexOf(item: T): number;
    getFirst(): T | undefined;
    getLast(): T | undefined;
    addFirst(item: T): List<T>;
    addLast(item: T): List<T>;
    removeFirst(): List<T>;
    removeLast(): List<T>;
    reversed(): List<T>;
    findAll(filter: (item: T) => boolean): List<T>;

    // TODO: these are the map functions from C5
    //map<V>(map: (item: T) => V): List<V>;
    //map<V>(map: (item: T) => V, equalityComparer: IEqualityComparer<T>): List<V>;

    // List view methods and fields
    /*
    view(start: number, count: number): List<T> | undefined;
    viewOf(item: T): List<T> | undefined;
    lastViewOf(item: T): List<T> | undefined;
    underlying: List<T> | undefined; // undefined if this list is not a view
    offset: number; // offset for this list view or 0 for an underlying list
     */

    // functional methods from immutable.js

    concat<C extends T>(...valuesOrCollections: Array<Iterable<C> | C>): List<T | C>;
    merge<C extends T>(...collections: Array<Iterable<C>>): List<T | C>;

    map<M>(
        mapper: (value: T, key: number, iter: this) => M,
        context?: any
    ): List<M>;

    flatMap<M>(
        mapper: (value: T, key: number, iter: this) => Iterable<M>,
        context?: any
    ): List<M>;

    filter<F extends T>(
        predicate: (value: T, index: number, iter: this) => value is F,
        context?: any
    ): List<F>;
    filter(
        predicate: (value: T, index: number, iter: this) => unknown,
        context?: any
    ): this;

    partition<F extends T, C>(
        predicate: (this: C, value: T, index: number, iter: this) => value is F,
        context?: C
    ): [List<T>, List<F>];
    partition<C>(
        predicate: (this: C, value: T, index: number, iter: this) => unknown,
        context?: C
    ): [this, this];

    zip<U>(other: Collection<U>): List<[T, U]>;
    zip<U, V>(
        other: Collection<U>,
        other2: Collection<V>
    ): List<[T, U, V]>;
    zip(...collections: Array<Collection<unknown>>): List<unknown>;

    zipAll<U>(other: Collection<U>): List<[T, U]>;
    zipAll<U, V>(
        other: Collection<U>,
        other2: Collection<V>
    ): List<[T, U, V]>;
    zipAll(...collections: Array<Collection<unknown>>): List<unknown>;

    zipWith<U, Z>(
        zipper: (value: T, otherValue: U) => Z,
        otherCollection: Collection<U>
    ): List<Z>;
    zipWith<U, V, Z>(
        zipper: (value: T, otherValue: U, thirdValue: V) => Z,
        otherCollection: Collection<U>,
        thirdCollection: Collection<V>
    ): List<Z>;
    zipWith<Z>(
        zipper: (...values: Array<unknown>) => Z,
        ...collections: Array<Collection<unknown>>
    ): List<Z>;


    // end functional methods from immutable.js

    // functional methods from Array<T>
    join(separator?: string): string;
    slice(start?: number, end?: number): List<T>;
    shift(): List<T>;
    slice(start?: number, end?: number): List<T>;
    splice(start: number, deleteCount?: number): List<T>;
    splice(start: number, deleteCount: number, ...items: T[]): List<T>;
    unshift(...items: T[]): List<T>;
    every<S extends T>(
        callback: (value: T, index: number, array: List<T>) => value is S,
        thisArg?: any
    ): this is List<S>;
    every(callback: (value: T, index: number, array: List<T>) => unknown, thisArg?: any): boolean;
    some(callback: (value: T, index: number, array: List<T>) => unknown, thisArg?: any): boolean;
    forEach(callback: (value: T, index: number, array: List<T>) => void, thisArg?: any): void;
    //map<U>(callback: (value: T, index: number, array: List<T>) => U, thisArg?: any): List<U>;
    /*
    filter<S extends T>(
        callback: (value: T, index: number, array: List<T>) => value is S,
        thisArg?: any
    ): List<S>;
    filter(callback: (value: T, index: number, array: List<T>) => unknown, thisArg?: any): List<T>;
     */
    reduce(callback: (previousValue: T, currentValue: T, currentIndex: number, array: List<T>) => T): T;
    reduce<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, array: List<T>) => U, initialValue: U): U;
    reduceRight(callback: (previousValue: T, currentValue: T, currentIndex: number, array: List<T>) => T): T;
    reduceRight(callback: (previousValue: T, currentValue: T, currentIndex: number, array: List<T>) => T, initialValue: T): T;
    reduceRight<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, array: List<T>) => U, initialValue: U): U;

    hashCode(): number;
    equals(o: Object): boolean;
    toString(): string;
}

export interface ListConstructor {
    new (arrayLength?: number): List<any>;
    new <T>(arrayLength: number): List<T>;
    new <T>(items?: Iterable<T>): List<T>;
    (arrayLength?: number): List<any>;
    <T>(arrayLength: number): List<T>;
    <T>(items?: Iterable<T>): List<T>;
    isList(arg: any): arg is List<any>;
    readonly prototype: any[];

    from<T>(items: Iterable<T>): List<T>;
}

declare const List: ListConstructor;

export type ListInput<T> = List<T> | T[] | Array<T> | Collection<T>;

//function List<T>(collection?: Iterable<T> | ArrayLike<T>): List<T>;


export default List;