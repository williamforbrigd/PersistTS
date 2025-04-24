import Map from '../Interfaces/Map';
import {Comparator} from "../Interfaces/Comparator";
import {Speed} from "../Enums/Speed";
import {Utils} from "../Utils/Utils";


export default abstract class AbstractMap<K, V> implements Map<K, V> {
    abstract getRoot(): [K, V] | null;

    abstract [Symbol.iterator](): MapIterator<[K, V]>;

    abstract size(): number;

    [k: number]: V | undefined;
    abstract get(key: K): V | undefined;

    keys(): K[] {
        return Array.from(this, ([k, _]) => k);
    }
    values(): V[] {
        return Array.from(this, ([_, v]) => v);
    }

    entries(): [K, V][] {
        return Array.from(this);
    }

    abstract set(key: K, value: V): Map<K, V>;
    abstract setAll(entries: Iterable<[K, V]>): Map<K, V>;

    has(key: K): boolean {
        return this.get(key) !== undefined;
    }
    hasValue(value: V): boolean {
        for (const [_, v] of this) {
            if (Utils.equals(value, v)) {
                return true;
            }
        }
        return false;
    }
    hasAll<H extends K>(keys: Iterable<H>): boolean {
        for (const key of keys) {
            if (!this.has(key)) {
                return false;
            }
        }
        return true;
    }

    abstract delete(key: K): Map<K, V>;
    abstract deleteAll(keys: Iterable<K>): Map<K, V>;

    isEmpty(): boolean {
        return this.size() === 0;
    }

    abstract clear(): Map<K, V>;

    /**
     * Compute the value for a key using the function.
     * @param key
     * @param func
     */
    compute(key: K, func: (key: K, value: (V | undefined)) => V): [Map<K, V>, V] {
        const value = this.get(key);
        const newValue = func(key, value);
        const newTree = this.set(key, newValue);
        return [newTree, newValue];
    }
    /**
     * If a key-value pair is absent in the map, compute it using the function.
     * Else just return the key-value pair.
     * @param key
     * @param func
     */
    computeIfAbsent(key: K, func: (key: K) => V): [Map<K, V>, V] {
        const value = this.get(key);
        if (value === undefined) {
            const newValue = func(key);
            const newTree = this.set(key, newValue);
            return [newTree, newValue];
        }
        return [this, value!];
    }
    /**
     * If a key-value pair is present in the map, compute it using the function.
     * Else just return the key-value pair.
     * @param key
     * @param func
     */
    computeIfPresent(key: K, func: (key: K, value: V) => V): [Map<K, V>, V] {
        const value = this.get(key);
        if (value !== undefined) {
            const newValue = func(key, value);
            const newTree = this.set(key, newValue);
            return [newTree, newValue];
        }
        return [this, value!];
    }

    abstract copyOf(map: Map<K, V>): Map<K, V>;

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

    find(predicate: (value: V, key: K, map: this) => boolean, thisArg?: any): V | undefined {
        for (const [k, v] of this) {
            if (predicate.call(thisArg, v, k, this)) {
                return v;
            }
        }
        return undefined;
    }

    forEach(callback: (value: V, key: K, map: this) => void, thisArg?: any): void {
        for (const [k, v] of this) {
            callback.call(thisArg, v, k, this);
        }
    }

    getOrDefault(key: K, defaultValue: V): V {
        const value = this.get(key);
        return value ?? defaultValue;
    }

    abstract hasSpeed(): Speed;
    abstract addSpeed(): Speed;
    abstract removeSpeed(): Speed;

    abstract hashCode(): number;
    abstract equals(o: Object): boolean;


    reduce(callback: (accumulator: V, value: V, key: K, map: this) => V, initialValue?: V): V;
    reduce<R>(callback: (accumulator: R, value: V, key: K, map: this) => R, initialValue?: R): R;
    reduce<R>(callback: (accumulator: R, value: V, key: K, map: this) => R, initialValue?: R): R {
        let acc: R = initialValue as R;
        for (const [k, v] of this) {
            acc = callback(acc, v, k, this);
        }
        return acc;
    }

    reduceRight(callback: (accumulator: V, value: V, key: K, map: this) => V, initialValue?: V): V;
    reduceRight<R>(callback: (accumulator: R, value: V, key: K, map: this) => R, initialValue?: R): R;
    reduceRight<R>(callback: (accumulator: R, value: V, key: K, map: this) => R, initialValue?: R): R {
        let acc: R = initialValue as R;
        const entries = [...this.entries()];
        for (let i = entries.length - 1; i >= 0; i--) {
            acc = callback(acc, entries[i][1], entries[i][0], this);
        }
        return acc;
    }


    some(predicate: (value: V, key: K, map: this) => boolean, thisArg?: any): boolean {
        for (const [k, v] of this) {
            if (predicate(v, k, this)) {
                return true;
            }
        }
        return false;
    }

    updateOrAdd(key: K, callback: (value: V) => V): Map<K, V>;
    updateOrAdd(key: K, callback: (value: V | undefined) => V | undefined): Map<K, V | undefined>;
    updateOrAdd(key: K, newValue: V): Map<K, V>;
    updateOrAdd(key: K, callbackOrValue: ((value: any) => any) | V): Map<K, any> {
        if (typeof callbackOrValue === 'function') {
            const callback = callbackOrValue as (value: V) => V;
            return this.set(key, callback(this.get(key) as any))
        } else {
            const newValue = callbackOrValue as V;
            return this.set(key, newValue);
        }
    }

    isCustomMap(obj: any): obj is Map<any, any> {
        return obj && typeof obj.set === "function" && typeof obj.entries === "function";
    }

    merge<KC, VC>(
        ...collections: Array<Iterable<[KC, VC]>>
    ): Map<K | KC, Exclude<V, VC> | VC>;
    merge<C>(
        ...collections: Array<{ [key: string]: C }>
    ): Map<K | string, Exclude<V, C> | C>;
    merge<KC, VC>(other: Map<KC, VC>): Map<K | KC, V | VC>;
    merge(...collections: any[]): Map<any, any> {
        let newMap = this as Map<any, any>;

        for (const collection of collections) {
            if (this.isCustomMap(collection)) {
                for (const [key, value] of collection.entries()) {
                    newMap = newMap.set(key, value);
                }
            } else if (Array.isArray(collection)) {
                for (const [key, value] of collection) {
                    newMap = newMap.set(key, value);
                }
            } else if (typeof collection === 'object' && collection !== null) {
                for (const key in collection) {
                    if (collection.hasOwnProperty(key)) {
                        newMap = newMap.set(key as any, collection[key]);
                    }
                }
            }
        }

        return newMap;
    }

    concat<KC, VC>(
        ...collections: Array<Iterable<[KC, VC]>>
    ): Map<K | KC, Exclude<V, VC> | VC>;
    concat<C>(
        ...collections: Array<{ [key: string]: C }>
    ): Map<K | string, Exclude<V, C> | C>;
    concat(...collections: any[]): Map<any, any> {
        return this.merge(...collections);
    }

    /**
     * Merge entries from a plain object into the map, coercing
     * string keys to numbers when the numeric form already exists.
     */
    private mergeWithObject<C>(
        newMap: Map<any, any>,
        collection: Record<string, C>,
        callback: (oldVal: V, newVal: C, key: any) => any
    ): Map<any, any> {
        const objEntries: [any, C][] = Object.entries(collection).map(([k, v]) => {
            const num = Number(k);
            const actualKey = !Number.isNaN(num) ? num : k;
            return [actualKey, v];
        });

        for (const [key, value] of objEntries) {
            if (newMap.has(key)) {
                const merged = callback(newMap.get(key)!, value, key);
                newMap = newMap.set(key, merged);
            } else {
                newMap = newMap.set(key as any, value);
            }
        }

        return newMap;
    }

    mergeWith<KC, VC, VCC>(
        callback: (oldVal: V, newVal: VC, key: K) => VCC,
        ...collections: Array<Iterable<[KC, VC]>>
    ): Map<K | KC, V | VC | VCC>;
    mergeWith<C, CC>(
        callback: (oldVal: V, newVal: C, key: string) => CC,
        ...collections: Array<{ [key: string]: C }>
    ): Map<K | string, V | C | CC>;
    mergeWith(
        callback: (oldVal: V, newVal: any, key: any) => any,
        ...collections: any[]
    ): Map<any, any> {
        let newMap = this as Map<any, any>;
        for (const collection of collections) {
            if (this.isCustomMap(collection)) {
                for (const [key, value] of collection.entries()) {
                    if (newMap.has(key)) {
                        const merged = callback(newMap.get(key)!, value, key);
                        newMap = newMap.set(key, merged);
                    } else {
                        newMap = newMap.set(key as any, value);
                    }
                }
            } else if (Array.isArray(collection)) {
                for (const [key, value] of collection) {
                    if (newMap.has(key)) {
                        const merged = callback(newMap.get(key)!, value, key);
                        newMap = newMap.set(key, merged);
                    } else {
                        newMap = newMap.set(key as any, value);
                    }
                }
            } else if (typeof collection === 'object' && collection !== null) {
                newMap = this.mergeWithObject(newMap, collection, callback);
            }
        }
        return newMap;
    }

    map<M>(
        callback: (value: V, key: K, map: this) => M,
        thisArg?: unknown
    ): Map<K, M> {
        let newMap: Map<K, M> = this as unknown as Map<K, M>;
        for (const [k, v] of this) {
            newMap = newMap.set(k, callback.call(thisArg, v, k, this));
        }
        return newMap;
    }

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