import { Speed } from "../Enums/Speed";
import HashCode from "../Hashing/HashCode";
import HashMap from "../Maps/HashMap";
import { Utils } from "../Utils/Utils";
import Set from "../Interfaces/Set";

export default class HashSet<T> implements Set<T> {
    private _hashCode: number|null = null;

    private readonly _map: HashMap<T, undefined>;

    constructor(
        _map?: HashMap<T, undefined>,
    ) {
        this._map = _map ?? HashMap.empty<T, undefined>();
    }

    *[Symbol.iterator](): IterableIterator<T> {
        for (const [key] of this._map) {
            yield key;
        }
    }

    static of<T>(...values: Array<T>): HashSet<T> {
        let hashSet = new HashSet<T>();
        for (const value of values) {
            hashSet = hashSet.add(value);
        }
        return hashSet;
    }

    size(): number {
        return this._map.size();
    }

    isEmpty(): boolean {
        return this.size() === 0;
    }

    empty(): HashSet<T> {
        return new HashSet<T>(this._map.empty());
    }

    add(value: T): HashSet<T> {
        return new HashSet<T>(this._map.set(value, undefined));
    }

    addAll(values: Iterable<T>): HashSet<T> {
        let hashSet: HashSet<T> = this;
        for (const value of values) {
            hashSet = hashSet.add(value);
        }
        return hashSet;
    }

    has(value: T): boolean {
        return this._map.has(value);
    }

    hasAll(values: Iterable<T>): boolean {
        for (const value of values) {
            if (!this.has(value)) return false;
        }
        return true;
    }

    delete(value: T): HashSet<T> {
        return new HashSet<T>(this._map.delete(value));
    }

    deleteAll(values: Iterable<T>): HashSet<T> {
        let hashSet: HashSet<T> = this;
        for (const value of values) {
            hashSet = hashSet.delete(value);
        }
        return hashSet;
    }

    clear(): HashSet<T> {
        return new HashSet<T>(this._map.clear());
    }

    get(value: T): T | undefined {
        for (const _value of this) {
            if (Utils.equals(value, _value)) return value;
        }
        return undefined;
    }

    values(): Array<T> {
        return Array.from(this);
    }

    toArray(): Array<T> {
        return Array.from(this);
    }

    equals(o: Object): boolean {
        if (this === o) return true;
        if (!(o instanceof HashSet)) return false;
        if (this.size() !== o.size()) return false;

        const other = o as HashSet<T>;
        const iter1 = this[Symbol.iterator]();
        const iter2 = other[Symbol.iterator]();

        while (true) {
            const a = iter1.next();
            const b = iter2.next();
            if (a.done && b.done) break;
            if (a.done || b.done) return false;
            if (!Utils.equals(a.value, b.value)) return false;
        }
        return true;
    }

    compareTo(o: HashSet<T>): number {
        if (this === o) return 0;

        const sizeDiff = this.size() - o.size();
        if (sizeDiff !== 0) return sizeDiff;

        const valuesA = Array.from(this).sort();
        const valuesB = Array.from(o).sort();

        const len = valuesA.length;
        for (let i = 0; i < len; i++) {
            const a = valuesA[i];
            const b = valuesB[i];
            if (a < b) return -1;
            if (a > b) return 1;
        }
        return 0;
    }

    hasSpeed(): Speed {
        return Speed.Constant;
    }

    addSpeed(): Speed {
        return Speed.Constant;
    }

    removeSpeed(): Speed {
        return Speed.Constant;
    }

    hashCode(): number {
        if (this._hashCode === null) {
            let hash = 1;
            for (const value of this) {
                hash = 31 * hash + HashCode.hashCode(value);
            }
            this._hashCode = hash;
        }
        return this._hashCode;
    }

    toString(): string {
        const values = Array.from(this).map(v => String(v));
        return `{${values.join(", ")}}`;
    }

    every(
        predicate: (value: T, key: T, set: this) => boolean,
        thisArg?: unknown
    ): this is HashSet<T>;
    every(
        predicate: (value: T, key: T, set: this) => unknown,
        thisArg?: unknown
    ): boolean;
    every(
        predicate: (value: T, key: T, set: this) => unknown,
        thisArg?: unknown
    ): unknown {
        return this._map.every((_, key) => predicate.call(thisArg, key, key, this));
    }

    some(predicate: (value: T, key: T, map: this) => boolean, thisArg?: unknown): boolean {
        return this._map.some((_, key) => predicate.call(thisArg, key, key, this));
    }

    forEach(callback: (value: T, key: T, set: this) => void, thisArg?: unknown): void {
        return this._map.forEach((_, key) => callback.call(thisArg, key, key, this));
    }

    find(predicate: (value: T, key: T, set: this) => boolean, thisArg?: unknown): T | undefined {
        // return this.tree.find((_, key) => predicate.call(thisArg, key, key, this));
        for (const value of this) {
            if (predicate.call(thisArg, value, value, this)) {
                return value;
            }
        }
        return undefined;
    }

    reduce(callback: (accumulator: T, value: T, key: T, set: this) => T, initialValue?: T): T;
    reduce<R>(callback: (accumulator: R, value: T, key: T, set: this) => R, initialValue?: R): R;
    reduce<R>(callback: (accumulator: R, value: T, key: T, set: this) => R, initialValue?: R): R {
        return this._map.reduce((acc, _, key) => callback(acc, key, key, this), initialValue);
    }

    reduceRight(callback: (accumulator: T, value: T, key: T, set: this) => T, initialValue?: T): T;
    reduceRight<R>(callback: (accumulator: R, value: T, key: T, set: this) => R, initialValue?: R): R;
    reduceRight<R>(callback: (accumulator: R, value: T, key: T, set: this) => R, initialValue?: R): R {
        return this._map.reduceRight((acc, _, key) => callback(acc, key, key, this), initialValue);
    }

    union<C>(...collections: Array<Iterable<C>>): HashSet<T | C> {
        // let treeSet = new TreeSet<T | C>(this.compare as unknown as (a: T | C, b: T | C) => number);
        let hashSet: HashSet<T | C> = this;
        for (const value of this) {
            hashSet = hashSet.add(value);
        }
        for (const collection of collections) {
            for (const value of collection) {
                hashSet = hashSet.add(value);
            }
        }
        return hashSet;
    }

    merge<C>(...collections: Array<Iterable<C>>): HashSet<T | C> {
        return this.union(...collections);
    }

    concat<C>(...collections: Array<Iterable<C>>): HashSet<T | C> {
        return this.union(...collections);
    }

    intersect(...collections: Array<Iterable<T>>): HashSet<T> {
        // let result = new TreeSet<T>(this.compare);
        let result: HashSet<T> = this.empty();

        outer: for (const v1 of this) {
            for (const collection of collections) {
                let found = false;
                for (const v2 of collection) {
                    // if (this.compare(v1, v2) === 0) {
                    if (Utils.equals(v1, v2)) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    continue outer;
                }
            }
            result = result.add(v1);
        }
        return result;
    }

    subtract(...collections: Array<Iterable<T>>): HashSet<T> {
        // let result = new TreeSet<T>(this.compare, this.tree);
        let result: HashSet<T> = this.empty();

        for (const collection of collections) {
            for (const value of collection) {
                result = result.delete(value);
            }
        }
        return result;
    }

    map<M>(
        mapper: (value: T, key: T, set: this) => M,
        thisArg?: unknown,
    ): HashSet<M> {
        // const comp = compare ?? TreeSet.defaultComparator<M>;
        let result = new HashSet<M>();
        // let result = new TreeSet<M>(comp);
        for (const value of this) {
            result = result.add(mapper.call(thisArg, value, value, this));
        }
        return result;
    }

    flatMap<M>(
        mapper: (value: T, key: T, set: this) => Iterable<M>,
        thisArg?: unknown,
    ): HashSet<M> {
        // const comp = compare ?? TreeSet.defaultComparator<M>;
        // let result = new TreeSet<M>(comp);
        let result = new HashSet<M>();
        for (const value of this) {
            const iterable = mapper.call(thisArg, value, value, this);
            for (const mappedValue of iterable) {
                result = result.add(mappedValue);
            }
        }
        return result;
    }

    filter<F extends T>(
        predicate: (value: T, key: T, set: this) => value is F,
        thisArg?: unknown
    ): HashSet<F>;
    filter(
        predicate: (value: T, key: T, set: this) => unknown,
        thisArg?: unknown
    ): HashSet<T>;
    filter(
        predicate: (value: T, key: T, set: this) => unknown,
        thisArg?: unknown
    ): HashSet<any> {
        // let result = new TreeSet<T>(this.compare);
        let result: HashSet<T> = this.empty();
        for (const value of this) {
            if (predicate.call(thisArg, value, value, this)) {
                result = result.add(value);
            }
        }
        return result;
    }

    partition<F extends T, C>(
        predicate: (this: C, value: T, key: T, set: this) => value is F,
        thisArg?: C
      ): [HashSet<T>, HashSet<F>];
    partition<C>(
        predicate: (this: C, value: T, key: T, set: this) => unknown,
        thisArg?: C
    ): [HashSet<T>, HashSet<T>];
    partition(
        predicate: (value: T, key: T, set: this) => unknown,
        thisArg?: unknown
    ): [HashSet<T>, HashSet<T>] {
        // let trueTree = new TreeSet<T>(this.compare);
        // let falseTree = new TreeSet<T>(this.compare);
        let trueSet: HashSet<T> = this.empty();
        let falseSet: HashSet<T> = this.empty();
        for (const value of this) {
            if (predicate.call(thisArg, value, value, this)) {
                trueSet = trueSet.add(value);
            } else {
                falseSet = falseSet.add(value);
            }
        }
        return [trueSet, falseSet];
    }  
}