import { Comparator } from "./Comparator";

export default interface Collection<T> extends Iterable<T>  {
    [Symbol.iterator](): Iterator<T>;

    size(): number;
    isEmpty(): boolean;
    empty(): Collection<T>;
    has(o: T): boolean;
    toArray(): T[];
    toArray(generator: (size: number) => T[]): T[];
    add(e: T): Collection<T>;
    removeItem(item: T): Collection<T>;
    hasAll(c: Iterable<T>): boolean;
    addAll(c: Iterable<T>): Collection<T>;
    removeAll(c: Iterable<T>): Collection<T>;
    removeIf(filter: (item: T) => boolean): Collection<T>;
    retainAll(c: Iterable<T>): Collection<T>;
    clear(): Collection<T>;

    equals(o: Object): boolean;
    hashCode(): number;


    // this is some java.util.Collection methods
    //spliterator(): Spliterator<T>;
    //stream(): Stream<T>;
    //parallelStream(): Stream<T>;

    get(index: number): T | undefined;

    // HOFs

    concat<C extends T>(...valuesOrCollections: Array<Iterable<C> | C>): Collection<T | C>;
    merge<C extends T>(...collections: Array<Iterable<C>>): Collection<T | C>;

    map<M>(
        mapper: (value: T, key: number, collection: this) => M,
        thisArg?: any
    ): Collection<M>;

    flatMap<M>(
        mapper: (value: T, key: number, iter: this) => Iterable<M>,
        thisArg?: any
    ): Collection<M>;

    filter<F extends T>(
        predicate: (value: T, index: number, iter: this) => value is F,
        thisArg?: any
    ): Collection<F>;
    filter(
        predicate: (value: T, index: number, iter: this) => unknown,
        thisArg?: any
    ): this;

    partition<F extends T, C>(
        predicate: (this: C, value: T, index: number, iter: this) => value is F,
        thisArg?: C
    ): [Collection<T>, Collection<F>];
    partition<C>(
        predicate: (this: C, value: T, index: number, iter: this) => unknown,
        thisArg?: C
    ): [this, this];

    zip<U>(other: Collection<U>): Collection<[T, U]>;
    zip<U, V>(
        other: Collection<U>,
        other2: Collection<V>
    ): Collection<[T, U, V]>;
    zip(...collections: Array<Collection<unknown>>): Collection<unknown>;

    zipAll<U>(other: Collection<U>): Collection<[T, U]>;
    zipAll<U, V>(
        other: Collection<U>,
        other2: Collection<V>
    ): Collection<[T, U, V]>;
    zipAll(...collections: Array<Collection<unknown>>): Collection<unknown>;

    zipWith<U, Z>(
        zipper: (value: T, otherValue: U) => Z,
        otherCollection: Collection<U>
    ): Collection<Z>;
    zipWith<U, V, Z>(
        zipper: (value: T, otherValue: U, thirdValue: V) => Z,
        otherCollection: Collection<U>,
        thirdCollection: Collection<V>
    ): Collection<Z>;
    zipWith<Z>(
        zipper: (...values: Array<unknown>) => Z,
        ...collections: Array<Collection<unknown>>
    ): Collection<Z>;

    distinct(): Collection<T>;
    join(separator?: string): string;
    
    every<S extends T>(
        callback: (value: T, index: number, collection: this) => value is S,
        thisArg?: any
    ): this is Collection<S>;
    every(callback: (value: T, index: number, collection: this) => unknown, thisArg?: any): boolean;
    some(callback: (value: T, index: number, collection: this) => unknown, thisArg?: any): boolean;
    sort(compareFn?: Comparator<T>): Collection<T>;
    sortedBy<U>(keySelector: (value: T) => U, compareFn?: (a: U, b: U) => number): Collection<T>;
    forEach(callback: (value: T, index: number, collection: this) => void, thisArg?: any): void;
    find(predicate: (value: T, index: number, collection: this) => boolean, thisArg?: any): T | undefined;
    reduce(callback: (previousValue: T, currentValue: T, currentIndex: number, collection: this) => T): T;
    reduce<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, collection: this) => U, initialValue: U): U;
    reduceRight(callback: (previousValue: T, currentValue: T, currentIndex: number, collection: this) => T): T;
    reduceRight(callback: (previousValue: T, currentValue: T, currentIndex: number, collection: this) => T, initialValue: T): T;
    reduceRight<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, collection: this) => U, initialValue: U): U;
}
