import Collection from '../Interfaces/Collection';
import { Comparator } from '../Interfaces/Comparator';
import Sorting from '../Sorting/Sorting';

export default abstract class AbstractCollection<T> implements Collection<T> {
    abstract [Symbol.iterator](): Iterator<T>;

    protected constructor() {

    }

    abstract add(e: T): Collection<T>;

    abstract addAll(c: Iterable<T>): Collection<T>;

    abstract clear(): Collection<T>;

    has(o: T): boolean {
        for (const item of this) {
            if (item === o) {
                return true;
            }
        }
        return false;
    }

    hasAll(c: Iterable<T>): boolean {
        for (const item of c) {
            if (!this.has(item)) {
                return false;
            }
        }
        return true;
    }

    abstract equals(o: Object): boolean;

    abstract get(index: number): T | undefined;
    abstract get(index: number, notSetValue?: any): any;

    abstract hashCode(): number;

    isEmpty(): boolean {
        return this.size() === 0;
    }

    abstract empty(): Collection<T>;

    abstract removeItem(e: T): Collection<T>;

    abstract removeAll(c: Iterable<T>): Collection<T>;

    abstract removeIf(filter: (item: T) => boolean): Collection<T>;

    abstract retainAll(c: Iterable<T>): Collection<T>;

    abstract size(): number;

    toArray(): T[];
    toArray(generator: (size: number) => T[]): T[];
    toArray(generator?: (size: number) => T[]): T[] {
        const result = generator ? generator(this.size()) : new Array<T>(this.size());
        let i =0;
        for (const item of this) {
            result[i++] = item;
        }
        return result;
    }

    /**
     * Concat the collection with the given values or collections.
     * @param valuesOrCollections - values or collections to be concatenated
     * @returns A new collection with the values or collections concatenated.
     */
    concat<C extends T>(...valuesOrCollections: Array<Iterable<C> | C>): Collection<T | C> {
        let res = this as unknown as Collection<T | C>;

        for (const elem of valuesOrCollections) {
            if (elem !== null && (elem as any)[Symbol.iterator]) {
                res = res.addAll(elem as Iterable<C>)
            } else {
                res = res.add(elem as C);
            }
        }
        return res;
    }

    /**
     * Merges with the given collections.
     * 
     * @param collections - collections to be merged
     * @returns A new collection with the collections merged.
     */
    merge<C extends T>(...collections: Array<Iterable<C>>): Collection<T | C> {
        let res = this as Collection<T | C>;
        for (const collection of collections) {
            res = res.addAll(collection);
        }
        return res;
    }

    /**
     * Traverses and applies the given function to each element.
     * @param mapper - function to map the elements of the collection
     * @param thisArg - context for the mapper function
     */
    map<M>(
        mapper: (value: T, key: number, collection: this) => M,
        thisArg?: any
    ): Collection<M> {
        const newItems = this.toArray().map((value, index) => mapper.call(thisArg, value, index, this));
        return (this.empty() as unknown as Collection<M>).addAll(newItems);
    }

    /**
     * Applies the mapper function to each element and flattens the result.
     * @param mapper - function to map the elements of the collection
     * @param thisArg - context for the mapper function
     */
    flatMap<M>(
        mapper: (value: T, key: number, iter: this) => Iterable<M>,
        thisArg?: any
    ): Collection<M> {
        let res = this.empty() as unknown as Collection<M>;
        let i=0;
        for (const value of this) {
            const iter = mapper.call(thisArg, value, i++, this);
            res = res.addAll(iter);
        }
        return res;
    }

    /**
     * Filters and returns a new collection with the elements that pass the filter.
     * @param predicate - function to filter the elements
     * @param thisArg - context for the predicate function
     */
    filter<F extends T>(
        predicate: (value: T, index: number, iter: this) => value is F,
        thisArg?: any
    ): Collection<F>;
    filter(
        predicate: (value: T, index: number, iter: this) => unknown,
        thisArg?: any
    ): this;
    filter(predicate: any, thisArg?: any): any {
        const filtered = this.toArray().filter((value, index) => predicate.call(thisArg, value, index, this));
        return (this.empty() as unknown as Collection<T>).addAll(filtered);
    }

    /**
     * Partitions into a true collection for the elements that pass the predicate function.
     * The rest of the elements will go into the false collection. 
     * @param predicate - To apply to the elements.
     * @param thisArg - context for the predicate function.
     */
    partition<F extends T, C>(
        predicate: (this: C, value: T, index: number, iter: this) => value is F,
        thisArg?: C
    ): [Collection<T>, Collection<F>];
    partition<C>(
        predicate: (this: C, value: T, index: number, iter: this) => unknown,
        thisArg?: C
    ): [this, this];
    partition<C>(predicate: (this: C, value: T, index: number, iter: this) => unknown, thisArg?: any): any {
        const trueItems: T[] = [];
        const falseItems: T[] = [];
        let i = 0;
        for (const value of this) {
            if (predicate.call(thisArg, value, i, this)) {
                trueItems.push(value);
            } else {
                falseItems.push(value);
            }
            i++;
        }
        const trueCollection = (this.empty() as unknown as Collection<T>).addAll(trueItems);
        const falseCollection = (this.empty() as unknown as Collection<T>).addAll(falseItems);
        return [trueCollection, falseCollection];
    }

    abstract zip<U>(other: Collection<U>): Collection<[T, U]>;
    abstract zip<U, V>(
        other: Collection<U>,
        other2: Collection<V>
    ): Collection<[T, U, V]>;
    abstract zip(...collections: Array<Collection<unknown>>): Collection<unknown>;

    abstract zipAll<U>(other: Collection<U>): Collection<[T, U]>;
    abstract zipAll<U, V>(
        other: Collection<U>,
        other2: Collection<V>
    ): Collection<[T, U, V]>;
    abstract zipAll(...collections: Array<Collection<unknown>>): Collection<unknown>;

    abstract zipWith<U, Z>(
        zipper: (value: T, otherValue: U) => Z,
        otherCollection: Collection<U>
    ): Collection<Z>;
    abstract zipWith<U, V, Z>(
        zipper: (value: T, otherValue: U, thirdValue: V) => Z,
        otherCollection: Collection<U>,
        thirdCollection: Collection<V>
    ): Collection<Z>;
    abstract zipWith<Z>(
        zipper: (...values: Array<unknown>) => Z,
        ...collections: Array<Collection<unknown>>
    ): Collection<Z>;


    /**
     * Returns a new collection with only unique elements.
     */
    distinct(): Collection<T> {
        let res = this.empty() as unknown as Collection<T>;
        const set = new Set<T>(this.toArray());
        res = res.addAll(set as Iterable<T>);
        return res;
    }

    /**
     * Concatenates the collection into a string
     * @param separator - The separator to use between elements. Defaults to "," if not provided.
     * @returns A string representation of the collection.
     */
    join(separator?: string): string {
        return this.toArray().join(separator);
    }
    
    /**
     * Checks that every element in the collection passes the callback function.
     * @param callback - The function to apply to each element.
     * @param thisArg - The context to bind the function to.
     */
    every<S extends T>(callback: (value: T, index: number, collection: this) => value is S, thisArg?: any): this is Collection<S>;
    every(callback: (value: T, index: number, collection: this) => unknown, thisArg?: any): boolean;
    every(callback: (value: T, index: number, collection: this) => unknown, thisArg?: any): any {
        let i=0;
        for (const item of this) {
            if (!callback.call(thisArg, item, i++, this)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Checks that some element in the collection passes the callback function.
     * @param callback - The function to apply to each element.
     * @param thisArg - The context to bind the function to.
     */
    some(callback: (value: T, index: number, collection: this) => unknown, thisArg?: any): boolean {
        let i=0;
        for (const item of this) {
            if (callback.call(thisArg, item, i++, this)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Sorts the collection using the provided comparator function.
     * @param compare - The function to compare two elements.
     * @returns A new collection with the elements sorted.
     */
    sort(compare: Comparator<T>): Collection<T> {
        const mutableArray = this.toArray();
        Sorting.timSort(mutableArray, compare);
        return (this.empty() as unknown as Collection<T>).addAll(mutableArray);
        // return new (this.constructor as any)(mutableArray);
    }

    /**
     * Sorts the collection by the selected key using the provided key selector function.
     * 
     * Uses the Timsort algorithm for sorting.
     * 
     * @param keySelector - The function to select the key for sorting.
     * @param compareFn - The function to compare two keys. If not provided, the default comparison will be used.
     * @returns A new collection with the elements sorted by the selected key.
     */
    sortedBy<U>(keySelector: (value: T) => U, compareFn?: ((a: U, b: U) => number) | undefined): Collection<T> {
        const mutableArray = this.toArray();
        Sorting.timSort(mutableArray, (a, b) => {
            const keyA = keySelector(a);
            const keyB = keySelector(b);
            return compareFn ? compareFn(keyA, keyB) : keyA < keyB ? -1 : keyA > keyB ? 1 : 0;
        });
        return (this.empty() as unknown as Collection<T>).addAll(mutableArray);
    }

    forEach(callback: (value: T, index: number, collection: this) => void, thisArg?: any): void {
        let i=0;
        for (const item of this) {
            callback.call(thisArg, item, i++, this);
        }
    }

    find(predicate: (value: T, index: number, collection: this) => boolean, thisArg?: any): T | undefined {
        let i=0;
        for (const item of this) {
            if (predicate.call(thisArg, item, i, this)) {
                return item;
            }
            i++;
        }
        return undefined;
    }

    /**
     * Accumulates the values in the collection using the provided callback function.
     * 
     * @param callback - The function to apply to each element.
     */
    reduce(callback: (previousValue: T, currentValue: T, currentIndex: number, collection: this) => T): T;
    reduce<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, collection: this) => U, initialValue: U): U;
    reduce<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, array: this) => U, initialValue?: U): U {
        let accumulator: U;
        let startIndex: number;

        if (initialValue === undefined) {
            if (this.size() === 0) {
                throw new TypeError("Reduce of empty collection with no initial value");
            }
            // get the first element as the initial value
            accumulator = this.get(0) as unknown as U;
            startIndex = 1;
        } else {
            accumulator = initialValue;
            startIndex = 0;
        }

        for (let i = startIndex; i < this.size(); i++) {
            const item = this.get(i)!;
            accumulator = callback(accumulator, item, i, this);
        }
        return accumulator;
    }


    /**
     * Accumulates the values in the collection using the provided callback function, starting from the end.
     * @param callback - The function to apply to each element.
     */
    reduceRight(callback: (previousValue: T, currentValue: T, currentIndex: number, array: this) => T): T;
    reduceRight(callback: (previousValue: T, currentValue: T, currentIndex: number, array: this) => T, initialValue: T): T;
    reduceRight<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, array: this) => U, initialValue: U): U;
    reduceRight<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, array: this) => U, initialValue?: U): U {
        let accumulator: U;
        let startIndex: number;

        if (initialValue === undefined) {
            if (this.size() === 0) {
                throw new TypeError("Reduce of empty array with no initial value");
            }
            accumulator = this.get(this.size() - 1) as unknown as U;
            startIndex = this.size() - 2;
        } else {
            accumulator = initialValue;
            startIndex = this.size() - 1;
        }

        for (let i = startIndex; i >= 0; i--) {
            accumulator = callback(accumulator, this.get(i)!, i, this);
        }
        return accumulator;
    }

}