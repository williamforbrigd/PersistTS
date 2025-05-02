import { Speed } from "../Enums/Speed";
import {Comparator} from "./Comparator";
import EqualityComparer from "./EqualityComparer";

// this is a dictionary (map) interface
/**
 * A Map (dictionary) is a collection of key-value pairs, where each key is unique and maps to a single value.
 * Every key is associated with a value, and you can retrieve the value using the key.
 * Contains only distinct keys, but can have duplicate values.
 * 
 * Extends the Iterable interface, and this allows you to define an iteration order of the key-value pairs.
 *
 * Many of the higher-order functions (HOFs) are inspired by the Immutable.js library.
 * 
 * Methods such as `computeIfAbsent`, `compute` etc are inspired by the Java Collections Framework.
 * 
 * @see https://immutable-js.com/
 */
export default interface Map<K, V> extends Iterable<[K, V]>, EqualityComparer<[K, V]> {
    // Iterable<T>
    [Symbol.iterator](): MapIterator<[K, V]>;

    [k: number]: V | undefined;
    get(key: K): V | undefined;
    keys(): K[];
    values(): V[];
    entries(): [K, V][];
    // set method adds or updates an entry in this map
    set(key: K, value: V): Map<K, V>;
    setAll(entries: Iterable<[K, V]>): Map<K, V>;
    has(key: K): boolean;
    hasValue(value: V): boolean;
    hasAll<H extends K>(keys: Iterable<H>): boolean;
    delete(key: K): Map<K, V>;
    deleteAll(keys: Iterable<K>):  Map<K,V>;
    isEmpty(): boolean;
    clear(): Map<K, V>;

    // Speed
    hasSpeed(): Speed;
    addSpeed(): Speed;
    removeSpeed(): Speed;

    size(): number;
    compareTo(o: Object): number;
    getOrDefault(key: K, defaultValue: V): V;
    computeIfAbsent(key: K, func: (key: K) => V): [Map<K, V>, V];
    computeIfPresent(key: K, func: (key: K, value: V) => V): [Map<K, V>, V];
    compute(key: K, func: (key: K, value: V | undefined) => V): [Map<K, V>, V];
    copyOf(map: Map<K, V>): Map<K, V>;

    // higher order functions HOFs

    every(predicate: (value: V, key: K, map: this) => boolean, thisArg?: any): this is Map<K, V>;
    every(predicate: (value: V, key: K, map: this) => unknown, thisArg?: any): boolean;
    some(predicate: (value: V, key: K, map: this) => boolean, thisArg?: any): boolean;
    forEach(callback: (value: V, key: K, map: this) => void, thisArg?: any): void;
    find(predicate: (value: V, key: K, map: this) => boolean, thisArg?: any): V | undefined;
    reduce(callback: (accumulator: V, value: V, key: K, map: this) => V, initialValue?: V): V;
    reduce<R>(callback: (accumulator: R, value: V, key: K, map: this) => R, initialValue?: R): R;
    reduceRight(callback: (accumulator: V, value: V, key: K, map: this) => V, initialValue?: V): V
    reduceRight<R>(callback: (accumulator: R, value: V, key: K, map: this) => R, initialValue?: R): R;

    // HOFs inspired by immutable.js
    updateOrAdd(key: K, callback: (value: V) => V): Map<K, V>;
    updateOrAdd(key: K, callback: (value: V | undefined) => V | undefined): Map<K, V | undefined>;
    updateOrAdd(key: K, newValue: V): Map<K, V>;

    merge<KC, VC>(
            ...collections: Array<Iterable<[KC, VC]>>
        ): Map<K | KC, Exclude<V, VC> | VC>;
    merge<C>(
        ...collections: Array<{ [key: string]: C }>
    ): Map<K | string, Exclude<V, C> | C>;
    merge<KC, VC>(other: Map<KC, VC>): Map<K | KC, V | VC>;

    concat<KC, VC>(
            ...collections: Array<Iterable<[KC, VC]>>
    ): Map<K | KC, Exclude<V, VC> | VC>;    
    concat<C>(
        ...collections: Array<{ [key: string]: C }>
    ): Map<K | string, Exclude<V, C> | C>;

    mergeWith<KC, VC, VCC>(
        callback: (oldVal: V, newVal: VC, key: K) => VCC,
        ...collections: Array<Iterable<[KC, VC]>>
    ): Map<K | KC, V | VC | VCC>;
    mergeWith<C, CC>(
        callback: (oldVal: V, newVal: C, key: string) => CC,
        ...collections: Array<{ [key: string]: C }>
    ): Map<K | string, V | C | CC>;
   
    map<M>(
        callback: (value: V, key: K, map: this) => M,
        thisArg?: unknown
    ): Map<K, M>;

    mapKeys<M>(
        callback: (key: K, value: V, map: this) => M,
        thisArg?: unknown,
        compare?: Comparator<M>
    ): Map<M, V>;

    mapEntries<KM, VM>(
        mapper: (
            entry: [K, V],
            index: number,
            map: this
        ) => [KM, VM] | undefined,
        thisArg?: unknown,
        compare?: Comparator<KM>
    ): Map<KM, VM>;

    flatMap<KM, VM>(
        callback: (value: V, key: K, map: this) => Iterable<[KM, VM]>,
        thisArg?: unknown,
        compare?: Comparator<KM>
    ): Map<KM, VM>;

    filter<F extends V>(
        predicate: (value: V, key: K, map: this) => value is F,
        thisArg?: unknown,
      ): Map<K, F>;
    filter(
        predicate: (value: V, key: K, map: this) => unknown,
        thisArg?: unknown
    ): Map<K, V>;

    partition<F extends V, C>(
        predicate: (this: C, value: V, key: K, map: this) => value is F,
        thisArg?: C
      ): [Map<K, V>, Map<K, F>];
    partition<C>(
        predicate: (this: C, value: V, key: K, map: this) => unknown,
        thisArg?: C
    ): [Map<K, V>, Map<K, V>];

    flip(): Map<V, K>;
}


