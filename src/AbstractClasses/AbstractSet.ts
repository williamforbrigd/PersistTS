import { Comparator } from '../Interfaces/Comparator';
import { Speed } from '../Enums/Speed';
import Set from '../Interfaces/Set';

export default abstract class AbstractSet<T> implements Set<T> {
    abstract [Symbol.iterator](): Iterator<T>;

    abstract size(): number;
    isEmpty(): boolean {
        return this.size() === 0;
    }

    protected abstract createEmpty<TT>(compare?: Comparator<TT>): Set<TT>;

    abstract add(value: T): Set<T>;
    addAll(values: Iterable<T>): Set<T> {
        let result: Set<T> = this;
        for (const value of values) {
            result = result.add(value);
        }
        return result;
    }
    abstract has(value: T): boolean;
    hasAll(values: Iterable<T>): boolean {
        for (const value of values) {
            if (!this.has(value)) {
                return false;
            }
        }
        return true;
    }
    abstract delete(value: T): Set<T>;
    deleteAll(values: Iterable<T>): Set<T> {
        let result: Set<T> = this;
        for (const v of values) {
            result = result.delete(v);
        }
        return result;
    }
    abstract clear(): Set<T>;
    abstract get(value: T): T | undefined;

    values(): Array<T> {
        return Array.from(this);
    }
    toArray(): Array<T> {
        return Array.from(this);
    }

    // Speed
    abstract hasSpeed(): Speed;
    abstract addSpeed(): Speed;
    abstract removeSpeed(): Speed;

    abstract equals(o: Object): boolean;
    abstract hashCode(): number;

    // HOFs

    every(predicate: (value: T, key: T, set: this) => boolean, thisArg?: unknown): this is Set<T>;
    every(predicate: (value: T, key: T, set: this) => unknown, thisArg?: unknown): boolean;
    every(
        predicate: (value: T, key: T, set: this) => unknown,
        thisArg?: unknown
    ): unknown {
        for (const value of this) {
            if (!predicate.call(thisArg, value, value, this)) {
                return false;
            }
        }
        return true;
    }

    some(predicate: (value: T, key: T, set: this) => boolean, thisArg?: unknown): boolean {
        for (const value of this) {
            if (predicate.call(thisArg, value, value, this)) {
                return true;
            }
        }
        return false;
    }

    forEach(callback: (value: T, key: T, set: this) => void, thisArg?: unknown): void {
        for (const value of this) {
            callback.call(thisArg, value, value, this);
        }
    }
    find(predicate: (value: T, key: T, set: this) => boolean, thisArg?: unknown): T | undefined {
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
        let accumulator = initialValue as R;
        let initialized = initialValue !== undefined;

        for (const value of this) {
            if (!initialized) {
                accumulator = value as unknown as R;
                initialized = true;
            } else {
                accumulator = callback(accumulator, value, value, this);
            }
        }

        if (!initialized) {
            throw new TypeError("Reduce of empty set with no initial value");
        }

        return accumulator;
    }

    reduceRight(callback: (accumulator: T, value: T, key: T, set: this) => T, initialValue?: T): T;
    reduceRight<R>(callback: (accumulator: R, value: T, key: T, set: this) => R, initialValue?: R): R;
    reduceRight<R>(callback: (accumulator: R, value: T, key: T, set: this) => R, initialValue?: R): R {
        const reversed = Array.from(this).reverse();
        let accumulator = initialValue as R;
        let initialized = initialValue !== undefined;

        for (const value of reversed) {
            if (!initialized) {
                accumulator = value as unknown as R;
                initialized = true;
            } else {
                accumulator = callback(accumulator, value, value, this);
            }
        }

        if (!initialized) {
            throw new TypeError("Reduce of empty set with no initial value");
        }

        return accumulator;
    }
        

    union<C>(...collections: Array<Iterable<C>>): Set<T | C> {
        let result: Set<T | C> = this;
        for (const collection of collections) {
            for (const value of collection) {
                result = result.add(value);
            }
        }
        return result;
    }
    merge<C>(...collections: Array<Iterable<C>>): Set<T | C> {
        return this.union(...collections);
    }
    concat<C>(...collections: Array<Iterable<C>>): Set<T | C> {
        return this.union(...collections);
    }

    abstract intersect(...collections: Array<Iterable<T>>): Set<T>;

    subtract(...collections: Array<Iterable<T>>): Set<T> {
        let result: Set<T> = this;
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
        compare?: Comparator<M>
    ): Set<M> {
        let result = this.createEmpty<M>(compare);
        for (const value of this) {
            result = result.add(mapper.call(thisArg, value, value, this));
        }
        return result;
    }

    flatMap<M>(
        mapper: (value: T, key: T, set: this) => Iterable<M>,
        thisArg?: unknown,
        compare?: Comparator<M>
    ): Set<M> {
        let result = this.createEmpty<M>(compare);
        for (const value of this) {
            const mappedValues = mapper.call(thisArg, value, value, this);
            for (const mappedValue of mappedValues) {
                result = result.add(mappedValue);
            }
        }
        return result;
    }

    filter<F extends T>(
        predicate: (value: T, key: T, set: this) => value is F,
        thisArg?: unknown
    ): Set<F>;
    filter(
        predicate: (value: T, key: T, set: this) => unknown,
        thisArg?: unknown
    ): Set<T>;
    filter(
        predicate: (value: T, key: T, set: this) => unknown,
        thisArg?: unknown
    ): Set<any> {
        let result = this.createEmpty<any>();
        for (const value of this) {
            if (predicate.call(thisArg, value, value, this)) {
                result = result.add(value);
            }
        }
        return result;
    }


    abstract partition<F extends T, C>(
        predicate: (this: C, value: T, key: T, set: this) => value is F,
        thisArg?: C
    ): [Set<T>, Set<F>];
    abstract partition<C>(
        predicate: (this: C, value: T, key: T, set: this) => unknown,
        thisArg?: C
    ): [Set<T>, Set<T>];
}