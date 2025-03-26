import List, {ListInput} from "../Interfaces/List";
import {Comparator} from "../Interfaces/Comparator";
import HashCode from "../Hashing/HashCode";
import AbstractList from "../AbstractClasses/AbstractList";
import Collection from "../Interfaces/Collection";

class ArrayList<T> extends AbstractList<T> implements List<T> {
    private _hashCode: number | null = null;
    readonly items: T[];
    readonly length: number;

    constructor(items: ArrayList<T> | T[] = []) {
        super();
        //this.items = items;
        this.items = items instanceof ArrayList ? items.items : items;
        this.length = this.items.length;

        // Proxy to allow for array-like access
        return new Proxy(this, {
            get(target, prop) {
                if (typeof prop === "string") {
                    const index = Number(prop);
                    if (!isNaN(index)) return target.get(index); // calls the get() method
                }
                return (target as any)[prop]; // default property access
            }
        });
    }

    static from<T>(items: Iterable<T> | T[]): ArrayList<T> {
        return new ArrayList(Array.from(items));
    }

    static of<T>(items: Iterable<T>): ArrayList<T> {
        return new ArrayList<T>(Array.from(items));
    }

    static isList = true;

    [index: number]: T | undefined;
    get(index: number): T | undefined {
        return this.items[index];
    }



    FIFO(): boolean {
        return false;
    }

    *[Symbol.iterator](): IterableIterator<T> {
        for (const item of this.items) {
            yield item;
        }
    }

    add(item: T): ArrayList<T>;
    add(index: number, item: T): ArrayList<T>;
    add(pointer: ArrayList<T>, item: T): ArrayList<T>;
    add(arg1: T | number | ArrayList<T>, arg2?: T): ArrayList<T> {
        if (typeof arg1 === 'number' && arg2 !== undefined) {
            const index = arg1;
            const item = arg2;
            const newItems = this.items.slice();
            newItems.splice(index, 0, item);
            return new ArrayList(newItems);
        } else if (arg1 instanceof ArrayList) {
            const newItems = this.items.slice();
            newItems.push(...arg1.items);
            return new ArrayList(newItems);
        } else {
            const item = arg1 as T;
            const newItems = this.items.slice();
            newItems.push(item);
            return new ArrayList(newItems);
        }
    }

    addAll(items: Iterable<T>): ArrayList<T>;
    addAll(index: number, items: Iterable<T>): ArrayList<T>;
    addAll(arg1: Iterable<T> | number, arg2?: Iterable<T>): ArrayList<T> {
        if (typeof arg1 === 'number' && arg2 !== undefined) {
            const index = arg1;
            const items = Array.from(arg2);
            const newItems = this.items.slice();
            newItems.splice(index, 0, ...items);
            return new ArrayList(newItems);
        } else {
            const items = Array.from(arg1 as Iterable<T>);
            const newItems = this.items.slice();
            newItems.push(...items);
            return new ArrayList(newItems);
        }
    }

    addFirst(item: T): ArrayList<T> {
        return this.add(0, item);
    }

    addLast(item: T): ArrayList<T> {
        return this.add(this.length-1, item)
    }

    clear(): ArrayList<T> {
        return new ArrayList<T>();
    }

    concat<C extends T>(...valuesOrCollections: Array<Iterable<C> | C>): ArrayList<T | C> {
        const newItems = this.items.slice();
        for (const valueOrCollection of valuesOrCollections) {
            if (typeof (valueOrCollection as Iterable<C>)[Symbol.iterator] === 'function') {
                newItems.push(...Array.from(valueOrCollection as Iterable<C>));
            } else {
                newItems.push(valueOrCollection as C);
            }
        }
        return new ArrayList(newItems);
    }

    contains(item: T): boolean {
        return super.contains(item);
    }

    containsAll(items: Iterable<T>): boolean {
        return super.containsAll(items);
    }

    toArray(): T[];
    toArray(generator: (size: number) => T[]): T[];
    toArray(generator?: (size: number) => T[]): T[] {
        return generator ? generator(this.size()) : this.items.slice();
    }

    copyTo(array: T[], arrayIndex: number): void {
        return super.copyTo(array, arrayIndex);
    }

    every<S extends T>(callback: (value: T, index: number, array: ArrayList<T>) => value is S, thisArg?: any): this is ArrayList<S>;
    every(callback: (value: T, index: number, array: ArrayList<T>) => unknown, thisArg?: any): boolean;
    every(callback: (value: T, index: number, array: ArrayList<T>) => unknown, thisArg?: any): any {
        return super.every(callback, thisArg);
    }

    filter<F extends T>(predicate: (value: T, index: number, iter: this) => value is F, context?: any): ArrayList<F>;
    filter(predicate: (value: T, index: number, iter: this) => unknown, context?: any): this;
    filter(predicate: (value: T, index: number, iter: this) => unknown, context?: any): any {
        const newItems = this.items.filter((item, index) => predicate.call(context, item, index, this));
        return new ArrayList(newItems);
    }

    findAll(filter: (item: T) => boolean): ArrayList<T> {
        const newList = this.items.filter(filter);
        return new ArrayList(newList);
    }

    flatMap<M>(mapper: (value: T, key: number, iter: this) => Iterable<M>, context?: any): ArrayList<M> {
        const newItems = [];
        for (let i=0; i < this.size(); i++) {
            const mapped = mapper.call(context, this.items[i], i, this);
            newItems.push(...mapped);
        }
        return new ArrayList(newItems);
    }

    forEach(callback: (value: T, index: number, array: this) => void, thisArg?: any): void {
        super.forEach(callback, thisArg);
    }

    getFirst(): T | undefined {
        return super.getFirst();
    }

    getLast(): T | undefined {
        return super.getLast();
    }

    indexOf(item: T): number {
        return super.indexOf(item);
    }

    isEmpty(): boolean {
        return super.isEmpty();
    }

    isReadOnly(): boolean {
        return false;
    }

    join(separator?: string): string {
        return super.join(separator);
    }

    lastIndexOf(item: T): number {
        return super.lastIndexOf(item);
    }

    map<M>(mapper: (value: T, key: number, iter: this) => M, context?: any): ArrayList<M> {
        const newItems = this.items.map((item, index) => mapper.call(context, item, index, this));
        return new ArrayList(newItems);
    }

    merge<C extends T>(...collections: Array<Iterable<C>>): ArrayList<T | C> {
        const newItems = this.items.slice();
        for (const collection of collections) {
            newItems.push(...Array.from(collection));
        }
        return new ArrayList(newItems);
    }

    partition<F extends T, C>(predicate: (this: C, value: T, index: number, iter: this) => value is F, context?: C): [ArrayList<T>, ArrayList<F>];
    partition<C>(predicate: (this: C, value: T, index: number, iter: this) => unknown, context?: C): [this, this];
    partition<C>(predicate: (this: C, value: T, index: number, iter: this) => unknown, context?: any): any {
        const trueItems: T[] = [];
        const falseItems: T[] = [];
        for (let i=0; i < this.size(); i++) {
            if (predicate.call(context, this.items[i], i, this)) {
                trueItems.push(this.items[i]);
            } else {
                falseItems.push(this.items[i]);
            }
        }
        return [new ArrayList(trueItems), new ArrayList(falseItems)];
    }

    reduce(callback: (previousValue: T, currentValue: T, currentIndex: number, array: this) => T): T;
    reduce<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, array: this) => U, initialValue: U): U;
    reduce<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, array: this) => U, initialValue?: U): U {
        let accumulator: U;
        let startIndex: number;

        if (initialValue === undefined) {
            if (this.size() === 0) {
                throw new TypeError("Reduce of empty array with no initial value");
            }
            accumulator = this.getFirst() as unknown as U;
            startIndex = 1;
        } else {
            accumulator = initialValue;
            startIndex = 0;
        }

        let i = startIndex;
        for (const item of this) {
            accumulator = callback(accumulator, item, i, this);
            i++;
        }
        return accumulator;
    }

    reduceRight(callback: (previousValue: T, currentValue: T, currentIndex: number, array: this) => T): T;
    reduceRight(callback: (previousValue: T, currentValue: T, currentIndex: number, array: this) => T, initialValue: T): T;
    reduceRight<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, array: this) => U, initialValue: U): U;
    reduceRight<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, array: this) => U, initialValue?: U): U {
        let accumulator: U;
        let startIndex: number;

        if (initialValue === undefined) {
            if (this.items.length === 0) {
                throw new TypeError("Reduce of empty array with no initial value");
            }
            accumulator = this.items[this.items.length - 1] as unknown as U;
            startIndex = this.items.length - 2;
        } else {
            accumulator = initialValue;
            startIndex = this.items.length - 1;
        }

        for (let i = startIndex; i >= 0; i--) {
            accumulator = callback(accumulator, this.items[i], i, this);
        }
        return accumulator;
    }

    remove(item: T): ArrayList<T>;
    remove(): ArrayList<T>;
    remove(item?: T): ArrayList<T> {
        if (item === undefined) {
            if (this.FIFO()) {
                return this.removeFirst();
            } else {
                return this.removeLast();
            }
        } else {
            const index = this.indexOf(item);
            if (index === -1) {
                return this;
            } else {
                const newItems = this.items.slice();
                newItems.splice(index, 1);
                return new ArrayList(newItems);
            }
        }
    }

    removeAll(items: Iterable<T>): ArrayList<T> {
        const itemsToRemove = new Set(items);
        const newItems = this.items.filter(item => !itemsToRemove.has(item));
        return new ArrayList(newItems);
    }

    removeAt(index: number): ArrayList<T> {
        const newItems = this.items.slice();
        newItems.splice(index, 1);
        return new ArrayList(newItems);
    }

    removeFirst(): ArrayList<T> {
        return this.removeAt(0);
    }

    removeLast(): ArrayList<T> {
        return this.removeAt(this.length - 1);
    }

    removeIf(filter: (item: T) => boolean): ArrayList<T> {
        const newItems = this.items.filter(item => !filter(item));
        return new ArrayList(newItems);
    }

    replaceAll(items: Iterable<T>): ArrayList<T> {
        const newItems = Array.from(items);
        return new ArrayList(newItems);
    }

    retainAll(items: Iterable<T>): ArrayList<T> {
        const itemsToRetain = new Set(items);
        const newItems = this.items.filter(item => itemsToRetain.has(item));
        return new ArrayList(newItems);
    }

    reversed(): ArrayList<T> {
        const newItems = this.items.slice().reverse();
        return new ArrayList(newItems);
    }

    set(index: number, item: T): ArrayList<T> {
        const newItems = this.items.slice();
        newItems[index] = item;
        return new ArrayList(newItems);
    }

    shift(): ArrayList<T> {
        if (this.size() == 0) {
            return this;
        }
        return this.removeFirst();
    }

    size(): number {
        return this.length;
    }

    slice(start?: number, end?: number): ArrayList<T> {
        return new ArrayList(this.items.slice(start, end));
    }

    some(callback: (value: T, index: number, array: this) => unknown, thisArg?: any): boolean {
        return super.some(callback, thisArg);
    }

    sort(comparator: Comparator<T>): Collection<T> {
        const newItems = this.items.slice().sort(comparator);
        return new ArrayList(newItems);
    }

    sortedBy<U>(keySelector: (value: T) => U, compareFn?: ((a: U, b: U) => number) | undefined): ArrayList<T> {
        const newItems = this.items.slice().sort((a, b) => {
            const keyA = keySelector(a);
            const keyB = keySelector(b);
            return compareFn ? compareFn(keyA, keyB) : keyA < keyB ? -1 : keyA > keyB ? 1 : 0;
        });
        return new ArrayList(newItems);
    }

    distinct(): ArrayList<T> {
        const uniqueItems = Array.from(new Set(this.items));
        return new ArrayList(uniqueItems);
    }

    splice(start: number, deleteCount?: number): ArrayList<T>;
    splice(start: number, deleteCount: number, ...items: T[]): ArrayList<T>;
    splice(start: number, deleteCount?: number, ...items: T[]): ArrayList<T> {
        const newItems = this.items.slice();
        if (deleteCount === undefined) {
            newItems.splice(start);
        } else {
            newItems.splice(start, deleteCount, ...items);
        }
        return new ArrayList<T>(newItems);
    }


    unshift(...items: T[]): ArrayList<T> {
        const newItems = this.items.slice();
        newItems.unshift(...items);
        return new ArrayList(newItems);
    }

    // zip stops when the shorter collection runs out of elements
    zip<U>(other: ListInput<T>): ArrayList<[T, U]>;
    zip<U, V>(
        other: ListInput<T>,
        other2: ListInput<T>
    ): ArrayList<[T, U, V]>;
    zip(...collections: Array<ListInput<unknown>>): ArrayList<unknown>;
    zip<U, V>(...other: (ListInput<U> | ListInput<unknown> | ListInput<V>)[]): ArrayList<unknown> {
        const minLength = Math.min(this.size(), ...other.map(c => Array.isArray(c) ? c.length : c.size()));
        const newItems: unknown[] = [];
        for (let i = 0; i < minLength; i++) {
            newItems.push([this.items[i], ...other.map(c => Array.isArray(c) ? c[i] : c.get(i))]);
        }
        return new ArrayList<unknown>(newItems);
    }

    // zipAll continues until the longest collection runs out of elements
    zipAll<U>(other: ListInput<U>): ArrayList<[T, U]>;
    zipAll<U, V>(other: ListInput<U>, other2: ListInput<V>): ArrayList<[T, U, V]>;
    zipAll(...collections: Array<ListInput<unknown>>): ArrayList<unknown>;
    zipAll<U, V>(...other: (ListInput<U> | ListInput<unknown> | ListInput<V>)[]): ArrayList<unknown> {
        const maxLength = Math.max(this.size(), ...other.map(c => Array.isArray(c) ? c.length : c.size()));
        const newItems = [];
        for (let i = 0; i < maxLength; i++) {
            const firstValue = i < this.size() ? this.get(i) : undefined;
            const secondValue = other.map(c => Array.isArray(c) ? (i < c.length ? c[i] : undefined) : (i < c.size() ? c.get(i) : undefined));
            const zipped = [firstValue, ...secondValue];
            newItems.push(zipped);
        }
        return new ArrayList<unknown>(newItems);
    }

    zipWith<U, Z>(
        zipper: (value: T, otherValue: U) => Z,
        otherCollection: ListInput<U>
    ): ArrayList<Z>;
    zipWith<U, V, Z>(
        zipper: (value: T, otherValue: U, thirdValue: V) => Z,
        otherCollection: ListInput<U>,
        thirdCollection: ListInput<V>
    ): ArrayList<Z>;
    zipWith<Z>(
        zipper: (...values: unknown[]) => Z,
        ...collections: Array<ListInput<unknown>>
    ): ArrayList<Z>;
    zipWith<U, V, Z>(
        zipper: any,
        ...otherCollection: (ListInput<U> | ListInput<unknown> | ListInput<V>)[]
    ): ArrayList<Z> {
        const minLength = Math.min(this.size(), ...otherCollection.map(c => Array.isArray(c) ? c.length : c.size()));
        const newItems: Z[] = [];
        for (let i = 0; i < minLength; i++) {
            const values = [this.items[i], ...otherCollection.map(c => Array.isArray(c) ? c[i] : c.get(i))];
            newItems.push(zipper(...values));
        }
        return new ArrayList<Z>(newItems);
    }

    hashCode(): number {
        if (this._hashCode === null) {
            this._hashCode = HashCode.hashCodeArray(this.items);
        }
        return this._hashCode;
    }

    equals(o: Object): boolean {
        if (this === o) return true;
        if (!(o instanceof ArrayList)) return false;
        if (this.items.length !== o.items.length) return false;

        return this.every((value, index) => Object.is(value, o.items[index]));
    }


    toString(): string {
        return `[${this.items.map(item => Array.isArray(item) ? `[${item.join(', ')}]` : item).join(', ')}]`;
    }
}


export default ArrayList;