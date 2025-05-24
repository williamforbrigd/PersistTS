import { Speed } from "../Enums/Speed";
import HashCode from "../Hashing/HashCode";
import HashMap from "../Maps/HashMap";
import { Utils } from "../Utils/Utils";
import Set from "../Interfaces/Set";
import AbstractSet from "../AbstractClasses/AbstractSet";

export default class HashSet<T> extends AbstractSet<T> implements Set<T> {
    private _hashCode: number|null = null;

    readonly _map: HashMap<T, undefined>;

    constructor(
        _map?: HashMap<T, undefined>,
    ) {
        super();
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

    createEmpty<TT>(): HashSet<TT> {
        return new HashSet<TT>();
    }

    add(value: T): HashSet<T> {
        return new HashSet<T>(this._map.set(value, undefined));
    }

    addAll(values: Iterable<T>): HashSet<T> {
        return super.addAll(values) as HashSet<T>;
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
            let hash = 0;
            for (const value of this) {
                hash += HashCode.hashCode(value);
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
        return super.find(predicate, thisArg);
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
        return super.union(...collections) as HashSet<T | C>;
    }

    merge<C>(...collections: Array<Iterable<C>>): HashSet<T | C> {
        return this.union(...collections);
    }

    concat<C>(...collections: Array<Iterable<C>>): HashSet<T | C> {
        return this.union(...collections);
    }

    intersect(...collections: Array<Iterable<T>>): HashSet<T> {
        let result: HashSet<T> = this.empty();

        outer: for (const v1 of this) {
            for (const collection of collections) {
                let found = false;
                for (const v2 of collection) {
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
        return super.subtract(...collections) as HashSet<T>;
    }

    map<M>(
        mapper: (value: T, key: T, set: this) => M,
        thisArg?: unknown,
    ): HashSet<M> {
        return super.map(mapper, thisArg) as HashSet<M>;
    }

    flatMap<M>(
        mapper: (value: T, key: T, set: this) => Iterable<M>,
        thisArg?: unknown,
    ): HashSet<M> {
        return super.flatMap(mapper, thisArg) as HashSet<M>;
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
        return super.filter(predicate, thisArg) as HashSet<any>;
    }

    partition<F extends T, C>(
        predicate: (this: C, value: T, key: T, set: this) => value is F,
        thisArg?: C
      ): [HashSet<F>, HashSet<Exclude<T, F>>];
    partition<C>(
        predicate: (this: C, value: T, key: T, set: this) => unknown,
        thisArg?: C
    ): [HashSet<T>, HashSet<T>];
    partition(
        predicate: (value: T, key: T, set: this) => unknown,
        thisArg?: unknown
    ): [HashSet<any>, HashSet<any>] {
        let trueSet: HashSet<any> = this.empty();
        let falseSet: HashSet<any> = this.empty();
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