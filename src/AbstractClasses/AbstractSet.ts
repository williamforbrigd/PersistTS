import { Speed } from '../Enums/Speed';
import Set from '../Interfaces/Set';

export default abstract class AbstractSet<T> implements Set<T> {
    abstract [Symbol.iterator](): Iterator<T>;

    abstract size(): number;
    isEmpty(): boolean {
        return this.size() === 0;
    }
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

    abstract every(predicate: (value: T, key: T, set: this) => boolean, thisArg?: unknown): this is Set<T>;
    abstract every(predicate: (value: T, key: T, set: this) => unknown, thisArg?: unknown): boolean;

    abstract some(predicate: (value: T, key: T, set: this) => boolean, thisArg?: unknown): boolean;

    abstract forEach(callback: (value: T, key: T, set: this) => void, thisArg?: unknown): void;
    abstract find(predicate: (value: T, key: T, set: this) => boolean, thisArg?: unknown): T | undefined;
    abstract reduce(callback: (accumulator: T, value: T, key: T, set: this) => T, initialValue?: T): T;
    abstract reduce<R>(callback: (accumulator: R, value: T, key: T, set: this) => R, initialValue?: R): R;
    abstract reduceRight(callback: (accumulator: T, value: T, key: T, set: this) => T, initialValue?: T): T;
    abstract reduceRight<R>(callback: (accumulator: R, value: T, key: T, set: this) => R, initialValue?: R): R;

    union<C>(...collections: Array<Iterable<C>>): Set<T | C> {
        let result: Set<T | C> = this;
        for (const collection of collections) {
            for (const value of collection) {
                result = result.add(value);
            }
        }
        return result;
    }
    abstract merge<C>(...collections: Array<Iterable<C>>): Set<T | C>;
    abstract concat<C>(...collections: Array<Iterable<C>>): Set<T | C>;

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

    abstract map<M>(
        mapper: (value: T, key: T, set: this) => M,
        thisArg?: unknown
    ): Set<M>;

    abstract flatMap<M>(
        mapper: (value: T, key: T, set: this) => Iterable<M>,
        thisArg?: unknown
    ): Set<M>;

    abstract filter<F extends T>(
        predicate: (value: T, key: T, set: this) => value is F,
        thisArg?: unknown
    ): Set<F>;
    abstract filter(
        predicate: (value: T, key: T, set: this) => unknown,
        thisArg?: unknown
    ): Set<T>;


    abstract partition<F extends T, C>(
        predicate: (this: C, value: T, key: T, set: this) => value is F,
        thisArg?: C
    ): [Set<T>, Set<F>];
    abstract partition<C>(
        predicate: (this: C, value: T, key: T, set: this) => unknown,
        thisArg?: C
    ): [Set<T>, Set<T>];
}