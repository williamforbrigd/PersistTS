import Map from '../Interfaces/Map';
import EqualityComparer from "../Interfaces/EqualityComparer";
import {Comparator} from "../Interfaces/Comparator";
import {Speed} from "../Enums/Speed";


export default abstract class AbstractMap<K, V> implements Map<K, V> {
    abstract getRoot(): [K, V] | null;

    abstract equalityComparer: EqualityComparer<K>;
    abstract [Symbol.iterator](): MapIterator<[K, V]>;
    abstract next(...[value]: [] | [unknown]): IteratorResult<[K, V], BuiltinIteratorReturn>;
    abstract return(value?: BuiltinIteratorReturn): IteratorResult<[K, V], BuiltinIteratorReturn>;
    abstract throw(e?: any): IteratorResult<[K, V], BuiltinIteratorReturn>;

    abstract size(): number;

    [k: number]: V | undefined;
    abstract get(key: K): V | undefined;

    keys(): K[] {
        const keys = [];
        for (const [k, _] of this) {
            keys.push(k);
        }
        return keys;
    }
    values(): V[] {
        const values = [];
        for (const [_, v] of this) {
            values.push(v);
        }
        return values;
    }

    entries(): [K, V][] {
        const entries = [];
        for (const entry of this) {
            entries.push(entry);
        }
        return entries;
    }

    abstract set(key: K, value: V): Map<K, V>;
    abstract setAll(entries: Iterable<[K, V]>): Map<K, V>;

    abstract has(key: K): boolean;
    abstract hasValue(value: V): boolean;
    abstract hasAll<H extends K>(keys: Iterable<H>): boolean;

    abstract delete(key: K, value?: V): Map<K, V>;
    abstract deleteAll(keys: Iterable<K>): Map<K, V>;

    isEmpty(): boolean {
        return this.size() === 0;
    }

    abstract clear(): Map<K, V>;

    abstract compute(key: K, func: (key: K, value: (V | undefined)) => V): [Map<K, V>, V];
    abstract computeIfAbsent(key: K, func: (key: K) => V): [Map<K, V>, V];
    abstract computeIfPresent(key: K, func: (key: K, value: V) => V): [Map<K, V>, V];

    abstract copyOf(map: Map<K, V>): Map<K, V>;

    abstract entry(k: K, v: V): [K, V];

    every(predicate: (value: V, key: K, map: this) => boolean, thisArg?: any): this is Map<K, V>;
    every(predicate: (value: V, key: K, map: this) => unknown, thisArg?: any): boolean;
    every(predicate: ((value: V, key: K, map: this) => boolean) | ((value: V, key: K, map: this) => unknown), thisArg?: any): any {
        for (const [k, v] of this) {
            if (!predicate(v, k, this)) {
                return false;
            }
        }
        return true;
    }

    abstract find(predicate: (value: V, key: K, map: this) => boolean, thisArg?: any): V | undefined;

    abstract forEach(callback: (value: V, key: K, map: this) => void, thisArg?: any): void;

    abstract getOrDefault(key: K, defaultValue: V): V;

    abstract hasSpeed(): Speed;
    abstract addSpeed(): Speed;
    abstract removeSpeed(): Speed;

    abstract hashCode(): number;
    abstract equals(o: Object): boolean;


    abstract of(k: K, v: V): Map<K, V>;
    abstract ofEntries(...entries: [K, V][]): Map<K, V>;

    abstract reduce(callback: (accumulator: V, value: V, key: K, map: this) => V, initialValue?: V): V;
    abstract reduce<R>(callback: (accumulator: R, value: V, key: K, map: this) => R, initialValue?: R): R;
    abstract reduce(callback: any, initialValue?: any): any;

    abstract reduceRight(callback: (accumulator: V, value: V, key: K, map: this) => V, initialValue?: V): V;
    abstract reduceRight<R>(callback: (accumulator: R, value: V, key: K, map: this) => R, initialValue?: R): R;
    abstract reduceRight(callback: any, initialValue?: any): any;


    some(predicate: (value: V, key: K, map: this) => boolean, thisArg?: any): boolean {
        for (const [k, v] of this) {
            if (predicate(v, k, this)) {
                return true;
            }
        }
        return false;
    }
    abstract sort(compare?: Comparator<K>): Map<K, V>;
    abstract sortBy<C>(comparatorValueMapper: (value: V, key: K, map: this) => C, compare?: Comparator<C>): Map<K | C, V>;

    abstract updateOrAdd(key: K, callback: (value: V) => V): Map<K, V>;
    abstract updateOrAdd(key: K, callback: (value: V | undefined) => V | undefined): Map<K, V | undefined>;
    abstract updateOrAdd(key: K, newValue: V): Map<K, V>;

    abstract merge<KC, VC>(
            ...collections: Array<Iterable<[KC, VC]>>
        ): Map<K | KC, Exclude<V, VC> | VC>;
    abstract merge<C>(
        ...collections: Array<{ [key: string]: C }>
    ): Map<K | string, Exclude<V, C> | C>;
    abstract merge<KC, VC>(other: Map<KC, VC>): Map<K | KC, V | VC>;

    abstract concat<KC, VC>(
            ...collections: Array<Iterable<[KC, VC]>>
    ): Map<K | KC, Exclude<V, VC> | VC>;    
    abstract concat<C>(
        ...collections: Array<{ [key: string]: C }>
    ): Map<K | string, Exclude<V, C> | C>;

    abstract mergeWith<KC, VC, VCC>(
        callback: (oldVal: V, newVal: VC, key: K) => VCC,
        ...collections: Array<Iterable<[KC, VC]>>
    ): Map<K | KC, V | VC | VCC>;
    abstract mergeWith<C, CC>(
        callback: (oldVal: V, newVal: C, key: string) => CC,
        ...collections: Array<{ [key: string]: C }>
    ): Map<K | string, V | C | CC>;
   
    abstract map<M>(
        callback: (value: V, key: K, map: this) => M,
        thisArg?: unknown
    ): Map<K, M>;

    abstract mapKeys<M>(
        callback: (key: K, value: V, map: this) => M,
        thisArg?: unknown,
        compare?: Comparator<M>
    ): Map<M, V>;

    abstract mapEntries<KM, VM>(
        mapper: (
            entry: [K, V],
            index: number,
            map: this
        ) => [KM, VM] | undefined,
        thisArg?: unknown,
        compare?: Comparator<KM>
    ): Map<KM, VM>;

    abstract flatMap<KM, VM>(
        callback: (value: V, key: K, map: this) => Iterable<[KM, VM]>,
        thisArg?: unknown,
        compare?: Comparator<KM>
    ): Map<KM, VM>;

    abstract filter<F extends V>(
        predicate: (value: V, key: K, map: this) => value is F,
        thisArg?: unknown,
      ): Map<K, F>;
    abstract filter(
        predicate: (value: V, key: K, map: this) => unknown,
        thisArg?: unknown
    ): Map<K, V>;

    abstract partition<F extends V, C>(
        predicate: (this: C, value: V, key: K, map: this) => value is F,
        thisArg?: C
      ): [Map<K, V>, Map<K, F>];
    abstract partition<C>(
        predicate: (this: C, value: V, key: K, map: this) => unknown,
        thisArg?: C
    ): [Map<K, V>, Map<K, V>];

    abstract flip(): Map<V, K>;
}