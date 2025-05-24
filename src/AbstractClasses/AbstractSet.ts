import { Comparator } from '../Interfaces/Comparator';
import { Speed } from '../Enums/Speed';
import Set from '../Interfaces/Set';
import { Utils } from '../Utils/Utils';

/**
 * Abstract base class for Set implementations.
 * Provides common functionality and structure for Set operations.
 */
export default abstract class AbstractSet<T> implements Set<T> {
    abstract [Symbol.iterator](): Iterator<T>;

    /**
     * Returns the number of elements in the set.
     */
    abstract size(): number;

    /**
     * Checks if the set is empty.
     * @returns true if the set is empty, false otherwise.
     */
    isEmpty(): boolean {
        return this.size() === 0;
    }

    /**
     * 
     * @param compare - The comparator function to use for comparing elements. This
     * is used only if the set is an ordered set.
     * @returns a new empty set with the specified comparator.
     */
    protected abstract createEmpty<TT>(compare?: Comparator<TT>): Set<TT>;
    /**
     * Defines the default equality check for elements in the set.
     * This can be overridden by subclasses to provide custom equality logic.
     * @returns 
     */
    protected equalsElement(a: T, b: T): boolean {
        return Utils.equals(a,b);
    } 

    /**
     * Adds a value to the set. 
     * @param value - The value to add to the set.
     */
    abstract add(value: T): Set<T>;

    /**
     * Adds all the values from an iterable to the set.
     * @param values - An iterable of values to add to the set.
     * @returns A new set with the added values.
     */
    addAll(values: Iterable<T>): Set<T> {
        let result: Set<T> = this;
        for (const value of values) {
            result = result.add(value);
        }
        return result;
    }

    /**
     * Checks if the set contains a specific value.
     * @param value - The value to check for existence in the set.
     */
    abstract has(value: T): boolean;
    
    /**
     * Checks if all values in the iterable are present in the set.
     * @param values - An iterable of values to check for existence in the set.
     * @returns True if all values are present in the set, false otherwise.
     */
    hasAll(values: Iterable<T>): boolean {
        for (const value of values) {
            if (!this.has(value)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Delete a specific value from the set.
     * @param value - The value to delete from the set.
     */
    abstract delete(value: T): Set<T>;
    /**
     * Delete all the values in the iterable from the set.
     * @param values - An iterable of values to delete from the set.
     * @returns A new set with the specified values removed.
     */
    deleteAll(values: Iterable<T>): Set<T> {
        let result: Set<T> = this;
        for (const v of values) {
            result = result.delete(v);
        }
        return result;
    }

    /**
     * Clears the set, removing all elements.
     */
    abstract clear(): Set<T>;
    /**
     * 
     * @param value - The value to retrieve from the set.
     */
    abstract get(value: T): T | undefined;

    /**
     * Returns an array of all values in the set.
     * @returns An array containing all the values in the set.
     */
    values(): Array<T> {
        return Array.from(this);
    }

    /**
     * Returns an array of all values in the set.
     * @returns An array containing all the values in the set.
     */
    toArray(): Array<T> {
        return Array.from(this);
    }

    // Speed
    /**
     * Returns the speed of the set operations.
     */
    abstract hasSpeed(): Speed;
    abstract addSpeed(): Speed;
    abstract removeSpeed(): Speed;

    /**
     * Checks if the set is equal to another object.
     * @param o - The object to compare with this set.
     */
    abstract equals(o: Object): boolean;

    /**
     * Returns the hash code of the set.
     */
    abstract hashCode(): number;

    // HOFs

    /**
     * Checks if all elements in the set satisfy the provided predicate.
     * @param predicate - A function that tests each element of the set.
     * @param thisArg - An optional value to use as `this` when executing the predicate.
     */
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

    /**
     * Checks if at least one element in the set satisfies the provided predicate.
     * @param predicate - A function that tests each element of the set.
     * @param thisArg - allows you to set the context for the predicate function.
     * @returns true if at least one element satisfies the predicate, false otherwise.
     */
    some(predicate: (value: T, key: T, set: this) => boolean, thisArg?: unknown): boolean {
        for (const value of this) {
            if (predicate.call(thisArg, value, value, this)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Executes a provided function once for each value in the set.
     * @param callback - A function that is called for each value in the set.
     * @param thisArg - An optional value to use as `this` when executing the callback.
     * @returns void
     */
    forEach(callback: (value: T, key: T, set: this) => void, thisArg?: unknown): void {
        for (const value of this) {
            callback.call(thisArg, value, value, this);
        }
    }

    /**
     * Returns the first value in the set that satisfies the provided predicate.
     * @param predicate - A function that tests each element of the set.
     * @param thisArg - An optional value to use as `this` when executing the predicate.
     * @returns The first value that satisfies the predicate, or undefined if no such value exists.
     */
    find(predicate: (value: T, key: T, set: this) => boolean, thisArg?: unknown): T | undefined {
        for (const value of this) {
            if (predicate.call(thisArg, value, value, this)) {
                return value;
            }
        }
        return undefined;
    }

    /**
     * Reduces the set to a single value by applying a callback function to each element.
     * @param callback - A function that is called for each value in the set.
     * @param initialValue - An optional initial value to use as the first argument to the first call of the callback.
     * @returns The final value after applying the callback to all elements in the set.
     */
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

    /**
     * Reduces the set to a single value by applying a callback function to each element, starting from the last element.
     * @param callback - A function that is called for each value in the set, starting from the last element.
     * @param initialValue - An optional initial value to use as the first argument to the first call of the callback.
     */
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
        
    /**
     * Combines multiple collections into a new set, including elements from the current set.
     * @param collections - An array of collections to union with this set.
     * @returns A new set that is the union of this set and the provided collections.
     */
    union<C>(...collections: Array<Iterable<C>>): Set<T | C> {
        let result: Set<T | C> = this;
        for (const collection of collections) {
            for (const value of collection) {
                result = result.add(value);
            }
        }
        return result;
    }
    /**
     * Combines multiple collections into a new set, including elements from the current set.
     * @param collections - An array of collections to merge with this set.
     * @returns A new set that is the union of this set and the provided collections.
     */
    merge<C>(...collections: Array<Iterable<C>>): Set<T | C> {
        return this.union(...collections);
    }
    /**
     * Combines multiple collections into a new set, including elements from the current set.
     * @param collections - An array of collections to concatenate with this set.
     * @returns A new set that is the union of this set and the provided collections.
     */
    concat<C>(...collections: Array<Iterable<C>>): Set<T | C> {
        return this.union(...collections);
    }

    /**
     * Returns a new set containing elements that are present in all provided collections.
     * @param collections - An array of collections to intersect with this set.
     * @returns A new set that contains only the elements that are present in all collections.
     */
    intersect(...collections: Array<Iterable<T>>): Set<T> {
        let result: Set<T> = this.createEmpty();

        outer: for (const v1 of this) {
            for (const collection of collections) {
                let found = false;
                for (const v2 of collection) {
                    if (this.equalsElement(v1,v2)) {
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

    /**
     * Returns a new set containing elements from this set that are not present in any of the provided collections.
     * @param collections - An array of collections to subtract from this set.
     * @returns A new set that contains elements from this set that are not present in any of the provided collections.
     */
    subtract(...collections: Array<Iterable<T>>): Set<T> {
        let result: Set<T> = this;
        for (const collection of collections) {
            for (const value of collection) {
                result = result.delete(value);
            }
        }
        return result;
    }

    /**
     * Maps each value in the set to a new value using the provided mapper function.
     * @param mapper - A function that maps each value in the set to a new value.
     * @param thisArg - An optional value to use as `this` when executing the mapper function.
     * @param compare - An optional comparator function to use for comparing mapped values.
     * @returns A new set containing the mapped values.
     */
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

    /**
     * Maps each value in the set to an iterable of new values, and flattens the result into a new set.
     * @param mapper - A function that maps each value in the set to an iterable of new values.
     * @param thisArg - An optional value to use as `this` when executing the mapper function.
     * @param compare - An optional comparator function to use for comparing mapped values.
     * @returns A new set containing the flattened mapped values.
     */
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

    /**
     * Filters the set based on a predicate function, returning a new set with elements that satisfy the predicate.
     * @param predicate - A function that tests each element of the set.
     * @param thisArg - An optional value to use as `this` when executing the predicate.
     */
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


    /**
     * Partitions the set into two sets based on a predicate function.
     * The first set contains elements that satisfy the predicate, and the second set contains elements that do not.
     * @param predicate - A function that tests each element of the set.
     * @param thisArg - An optional value to use as `this` when executing the predicate.
     */
    abstract partition<F extends T, C>(
        predicate: (this: C, value: T, key: T, set: this) => value is F,
        thisArg?: C
    ): [Set<T>, Set<F>];
    abstract partition<C>(
        predicate: (this: C, value: T, key: T, set: this) => unknown,
        thisArg?: C
    ): [Set<T>, Set<T>];
}