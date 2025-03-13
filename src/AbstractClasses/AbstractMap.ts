import Map from '../Interfaces/Map';
import KeyValuePair from "../Interfaces/KeyValuePair";
import EqualityComparer from "../Interfaces/EqualityComparer";
import {Comparator} from "../Interfaces/Comparator";
import {Speed} from "../Enums/Speed";


export default abstract class AbstractMap<K, V> implements Map<K, V> {
    abstract getRoot(): KeyValuePair<K, V> | null;

    abstract equalityComparer: EqualityComparer<K>;
    abstract [Symbol.iterator](): MapIterator<KeyValuePair<K, V>>;
    abstract next(...[value]: [] | [unknown]): IteratorResult<KeyValuePair<K, V>, BuiltinIteratorReturn>;
    abstract return(value?: BuiltinIteratorReturn): IteratorResult<KeyValuePair<K, V>, BuiltinIteratorReturn>;
    abstract throw(e?: any): IteratorResult<KeyValuePair<K, V>, BuiltinIteratorReturn>;

    abstract size(): number;

    [k: number]: V | undefined;
    abstract get(key: K): V | undefined;

    keys(): K[] {
        const keys = [];
        for (const entry of this) {
            keys.push(entry.key);
        }
        return keys;
    }
    values(): V[] {
        const values = [];
        for (const entry of this) {
            values.push(entry.value);
        }
        return values;
    }

    entries(): KeyValuePair<K, V>[] {
        const entries = [];
        for (const entry of this) {
            entries.push(entry);
        }
        return entries;
    }

    abstract set(key: K, value: V): Map<K, V>;
    abstract setAll(entries: Iterable<KeyValuePair<K, V>>): Map<K, V>;

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

    abstract entry(k: K, v: V): KeyValuePair<K, V>;

    every(predicate: (value: V, key: K, map: this) => boolean, thisArg?: any): this is Map<K, V>;
    every(predicate: (value: V, key: K, map: this) => unknown, thisArg?: any): boolean;
    every(predicate: ((value: V, key: K, map: this) => boolean) | ((value: V, key: K, map: this) => unknown), thisArg?: any): any {
        for (const entry of this) {
            if (!predicate(entry.value, entry.key, this)) {
                return false;
            }
        }
        return true;
    }

    abstract find(predicate: (value: V, key: K, map: this) => boolean, thisArg?: any): V | undefined;

    abstract forEach(callback: (value: V, key: K, map: this) => void, thisArg?: any): void;

    abstract getOrDefault(key: K, defaultValue: V): V;

    abstract hashCode(): number;
    abstract equals(o: Object): boolean;


    // abstract of(k: K, v: V): Map<K, V>;
    //abstract of(k1: K, v1: V, k2: K, v2: V): Map<K, V>;
    //abstract of(k1: K, v1: V, k2: K, v2: V, k3: K, v3: V): Map<K, V>;
    //abstract of(k: K, v: V, k2?: K, v2?: V, k3?: K, v3?: V): Map<K, V>;

    abstract ofEntries(...entries: KeyValuePair<K, V>[]): Map<K, V>;

    abstract reduce(callback: (accumulator: V, value: V, key: K, map: this) => V, initialValue?: V): V;
    abstract reduce<R>(callback: (accumulator: R, value: V, key: K, map: this) => R, initialValue?: R): R;
    abstract reduce(callback: any, initialValue?: any): any;

    abstract reduceRight(callback: (accumulator: V, value: V, key: K, map: this) => V, initialValue?: V): V;
    abstract reduceRight<R>(callback: (accumulator: R, value: V, key: K, map: this) => R, initialValue?: R): R;
    abstract reduceRight(callback: any, initialValue?: any): any;


    some(predicate: (value: V, key: K, map: this) => boolean, thisArg?: any): boolean {
        for (const entry of this) {
            if (predicate(entry.value, entry.key, this)) {
                return true;
            }
        }
        return false;
    }
    abstract sort(compare?: Comparator<K>): Map<K, V>;
    abstract sortBy<C>(comparatorValueMapper: (value: V, key: K, map: this) => C, compare?: Comparator<C>): Map<K | C, V>;

    abstract containsSpeed(): Speed;

    /*
    abstract merge<KC, VC>(
        ...collections: Array<Iterable<[KC, VC]>>
    ): Map<K | KC, Exclude<V, VC> | VC>;
    abstract merge<C>(
        ...collections: Array<{ [key: string]: C }>
    ): Map<K | string, Exclude<V, C> | C>;


     */
    //abstract merge<KC, VC>(other: Map<KC, VC>): Map<K | KC, V | VC>;

}