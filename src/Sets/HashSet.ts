import HashMap from "../Maps/HashMap";
import { Utils } from "../Utils/Utils";

export default class HashSet<T> {
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

    add(value: T): HashSet<T> {
        // return new TreeSet(this.compare, this.tree.set(value, undefined));
        return new HashSet<T>(this._map.set(value, undefined));
    }

    get(value: T): T | undefined {
        for (const _value of this) {
            if (value === _value) return value;
        }
        return undefined;
    }

    delete(value: T): HashSet<T> {
        return new HashSet<T>(this._map.delete(value));
    }

    toArray(): T[] {
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
}

const set = HashSet.of(1, 2, 3, 4, 5).add(6).add(7).add(123123).delete(3);
console.log(set.toArray());