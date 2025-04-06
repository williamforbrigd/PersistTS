import AbstractSequentialList from '../AbstractClasses/AbstractSequentialList';
import List, {ListInput} from '../Interfaces/List';
import Queue from '../Interfaces/Queue';
import HashCode from '../Hashing/HashCode';
import { Comparator } from '../Interfaces/Comparator';
import { Speed } from '../Enums/Speed';
import Sorting from '../Sorting/Sorting';

// This class represents a singly linked list that is immutable.
// This list is recursively defined.
export default class LinkedList<T> extends AbstractSequentialList<T> implements List<T>, Queue<T> {
    private _hashCode: number | null = null;
    
    constructor(
        private readonly head: T | null = null,
        private readonly tail: LinkedList<T> | null = null
    ) {
        super();
    }

    static of<T>(items: Iterable<T>): LinkedList<T> {
        let list = new LinkedList<T>();
        for (const item of items) {
            list = list.addLast(item);
        }
        return list;
    }

    *[Symbol.iterator](): Iterator<T> {
        let current: LinkedList<T> | null = this;

        while(current && current.head !== null) {
            yield current.head;
            current = current.tail;
        }
    }

    isEmpty(): boolean {
        return this.head === null && this.tail === null;
    }

    size(): number {
        let s=0;
        for (const _ of this) {
            s++;
        }
        return s;
    }

    get(index: number): T | undefined {
        if (index < 0) return undefined;

        if (index === 0) return this.head as T;

        if (this.tail) {
            return this.tail.get(index - 1);
        } else {
            return undefined;
        }
    }

    add(e: T): LinkedList<T>;
    add(item: T): LinkedList<T>;
    add(index: number, item: T): LinkedList<T>;
    add(e: T): LinkedList<T>;
    add(arg1: T | number, item?: T): LinkedList<T> {
       if (typeof arg1 === 'number' && item !== undefined) {
            return this.addAtIndex(arg1, item!);
       } else {
            return this.addLast(arg1 as T);
       }
    }

    addFirst(item: T): LinkedList<T> {
        return new LinkedList(item, this.isEmpty() ? null : this);
    }

    addLast(item: T): LinkedList<T> {
        if (this.isEmpty()) {
            return new LinkedList(item, null);
        } else {
            return new LinkedList(this.head!, this.tail?.addLast(item) ?? new LinkedList(item, null));
        }
    }

    private addAtIndex(index: number, item: T): LinkedList<T> {
        if (index < 0) return this;

        if (index === 0) return this.addFirst(item);

        if (this.tail) {
            return new LinkedList(this.head!, this.tail.addAtIndex(index - 1, item) ?? new LinkedList(item, null));
        } else {
            return this;
        }
    } 

    addAll(c: Iterable<T>): LinkedList<T>;
    addAll(items: Iterable<T>): LinkedList<T>;
    addAll(index: number, items: Iterable<T>): LinkedList<T>;
    addAll(arg1: Iterable<T> | number, items?: Iterable<T>): LinkedList<T> {
        if (typeof arg1 === 'number') {
            return this.addAllAtIndex(arg1, items!);
        } else {
            return this.addAllAtEnd(arg1);
        }
    }
    private addAllAtEnd(items: Iterable<T>): LinkedList<T> {
        let newList: LinkedList<T> = this;
        for(const item of items) {
            newList = newList.addLast(item);
        }
        return newList;
    }

    private addAllAtIndex(index: number, items: Iterable<T>): LinkedList<T> {
        let newList: LinkedList<T> = this;
        for (const item of items) {
            newList = newList.add(index, item);
            index++;
        }
        return newList;
    }

    clear(): LinkedList<T> {
        return new LinkedList();
    }

    concat<C extends T>(...valuesOrCollections: Array<Iterable<C> | C>): LinkedList<T | C> {
        let newList = this as LinkedList<T | C>;
        for (const valueOrCollection of valuesOrCollections) {
            if (valueOrCollection && typeof (valueOrCollection as Iterable<C>)[Symbol.iterator] === 'function') {
                // if it is a collection
                newList = newList.addAll(valueOrCollection as Iterable<C>);
            } else {
                // if it is a single value
                newList = newList.addLast(valueOrCollection as C);
            }
        }
        return newList;
    }

    distinct(): LinkedList<T> {
        const set = new Set<T>();
        let newList = new LinkedList<T>();
        for (const item of this) {
            if (!set.has(item)) {
                set.add(item);
                newList = newList.addLast(item);
            }
        }
        return newList;
    }

    filter<F extends T>(predicate: (value: T, index: number, iter: this) => value is F, thisArg?: any): LinkedList<F>;
    filter(predicate: (value: T, index: number, iter: this) => unknown, thisArg?: any): this;
    filter(predicate: (value: T, index: number, iter: this) => unknown, thisArg?: any): any {
        let newList = new LinkedList<T>();
        let i=0;
        for (const item of this) {
            if (predicate.call(thisArg, item, i, this)) {
                newList = newList.addLast(item);
            }
        }
        return newList;
    }

    flatMap<M>(mapper: (value: T, key: number, iter: this) => Iterable<M>, thisArg?: any): LinkedList<M> {
        let newList = new LinkedList<M>();
        let i=0;
        for (const item of this) {
            for (const mappedItem of mapper.call(thisArg, item, i++, this)) {
                newList = newList.addLast(mappedItem);
            }
        }
        return newList;
    }

    listIterator(index: number): Iterator<T> {
        return this[Symbol.iterator]();
    }

    map<M>(mapper: (value: T, key: number, collection: this) => M, thisArg?: any): LinkedList<M> {
        return this.flatMap((value, key, collection) => [mapper.call(thisArg, value, key, collection)]);
    }

    merge<C extends T>(...collections: Array<Iterable<C>>): LinkedList<T | C> {
        let newList = this as LinkedList<T | C>;
        for (const collection of collections) {
            newList = newList.addAll(collection);
        }
        return newList;
    }

    partition<F extends T, C>(predicate: (this: C, value: T, index: number, iter: this) => value is F, thisArg?: C): [LinkedList<T>, LinkedList<F>];
    partition<C>(predicate: (this: C, value: T, index: number, iter: this) => unknown, thisArg?: C): [this, this];
    partition<C>(predicate: (this: C, value: T, index: number, iter: this) => unknown, thisArg?: any): any {
        let trueList = new LinkedList<T>();
        let falseList = new LinkedList<T>();
        let index = 0;
        for (const value of this) {
            if (predicate.call(thisArg, value, index++, this)) {
                trueList = trueList.addLast(value);
            } else {
                falseList = falseList.addLast(value);
            }
        }
        return [trueList, falseList];
    }

    reduce(callback: (previousValue: T, currentValue: T, currentIndex: number, collection: this) => T): T;
    reduce<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, collection: this) => U, initialValue: U): U;
    reduce<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, collection: this) => U, initialValue?: U): U {
        let acc: U | T;
        let i: number;

        if (initialValue !== undefined) {
            acc = initialValue;
            i = 0;
        } else {
            if (this.isEmpty()) {
                throw new Error("Reduce of empty collection with no initial value");
            }
            acc = this.head!
            i = 1;
        }

        for (const item of this) {
            acc = callback(acc as unknown as U, item, i++, this);
        }
        return acc as U;
    }

    reduceRight(callback: (previousValue: T, currentValue: T, currentIndex: number, collection: this) => T): T;
    reduceRight(callback: (previousValue: T, currentValue: T, currentIndex: number, collection: this) => T, initialValue: T): T;
    reduceRight<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, collection: this) => U, initialValue: U): U;
    reduceRight<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, collection: this) => U, initialValue?: U): U {
        const array = this.toArray().reverse();

        let acc: U | T;
        let startIndex: number;

        if (initialValue !== undefined) {
            acc = initialValue;
            startIndex = 0;
        } else {
            if (this.isEmpty()) {
                throw new Error("ReduceRight of empty collection with no initial value");
            }
            acc = array[0] as unknown as U;
            startIndex = 1;
        }

        for (let i = startIndex; i < array.length; i++) {
            acc = callback(acc, array[i], i, this);
        }
        return acc;
    }

    remove(e: T): LinkedList<T>;
    remove(item: T): LinkedList<T>;
    remove(index: number): LinkedList<T>;
    remove(): LinkedList<T>;
    remove(arg1?: T | number): LinkedList<T> {
        if (typeof arg1 === 'number') {
            return this.removeAt(arg1);
        } else {
            return this.removeItem(arg1 as T);
        }
    }

    private removeItem(item: T): LinkedList<T> {
        if (this.isEmpty()) {
            return this;
        }
        if (this.head === item) {
            return this.tail ?? new LinkedList<T>();
        }
        const newTail = this.tail?.removeItem(item) ?? null;
        return new LinkedList(this.head, newTail);
    }

    private removeAt(index: number): LinkedList<T> {
        if (index < 0) {
            return this;
        }

        if (index === 0) {
            return this.tail ?? new LinkedList();
        }

        const newTail = this.tail?.removeAt(index - 1) ?? null;
        return new LinkedList(this.head, newTail);
    }

    removeAll(c: Iterable<T>): LinkedList<T> {
        let newList: LinkedList<T> | null = this;
        for (const item of c) {
            newList = newList.removeItem(item);
        }
        return newList;
    }

    removeFirst(): LinkedList<T> {
        return this.tail ?? new LinkedList();
    }

    removeIf(filter: (item: T) => boolean): LinkedList<T> {
        let newList: LinkedList<T> = new LinkedList();
        for (const item of this) {
            if (!filter(item)) {
                newList = newList.addLast(item);
            }
        }
        return newList;
        /*
        if (this.isEmpty()) return this;

        if (filter(this.head!)) {
            return this.tail ? this.tail.removeIf(filter) : new LinkedList();
        } else {
            const newTail = this.tail?.removeIf(filter) ?? null;
            return new LinkedList(this.head, newTail);
        }

         */
    }

    removeLast(): LinkedList<T> {
        if (this.isEmpty()) {
            return this;
        }
        if (!this.tail?.tail) {
            return new LinkedList<T>(this.head);
        }

        return new LinkedList(this.head, this.tail.removeLast());
    }

    replaceAll(items: Iterable<T>): LinkedList<T> {
        const newList = new LinkedList<T>();
        newList.addAll(items);
        return newList;
    }

    retainAll(items: Iterable<T>): LinkedList<T> {
        const itemsToRetain = new Set(items);
        const res = this.retainAllRecursive(itemsToRetain);
        return res ?? new LinkedList<T>();
    }

    private retainAllRecursive(itemsToRetain: Set<T>): LinkedList<T> | null{
        if (this.isEmpty()) {
            return null;
        }

        const newTail = this.tail?.retainAllRecursive(itemsToRetain) ?? null;
        if (itemsToRetain.has(this.head!)) {
            return new LinkedList(this.head!, newTail);
        } else {
            return null;
        }
    }

    reversed(): LinkedList<T> {
        let newList = new LinkedList<T>();
        for (const item of this) {
            newList = newList.addFirst(item);
        }
        return newList;
    }

    set(index: number, item: T): LinkedList<T> {
        if (index < 0) return this;

        if (index === 0 ) {
            return new LinkedList(item, this.tail);
        }

        if (this.tail === null) {
            return this;
        }

        const newTail = this.tail.set(index - 1, item);
        return new LinkedList(this.head, newTail);
    }

    shift(): LinkedList<T> {
        return this.tail ?? new LinkedList<T>();
    }

    unshift(...items: T[]): LinkedList<T> {
        let newList: LinkedList<T> = this;
        for (let i=items.length-1; i>=0; i--) {
            newList = newList.addFirst(items[i]);
        }
        return newList;
    }

    slice(start?: number, end?: number): LinkedList<T> {
        if (start === undefined) start = 0;
        if (end === undefined) end = this.size();
        if (start < 0) start = Math.max(0, this.size() + start);
        if (end < 0) end = Math.max(0, this.size() + end);

        return this.sliceHelper(start, end, 0) ?? new LinkedList<T>();
    }

    private sliceHelper(start: number, end: number, currentIndex: number = 0): LinkedList<T> | null {
        if (start >= end || this.isEmpty()) return null;

        if (currentIndex < start) {
            return this.tail ? this.tail.sliceHelper(start, end, currentIndex + 1) : null;
        }

        if (currentIndex >= end) {
            return null;
        }

        return new LinkedList(this.head, this.tail?.sliceHelper(start, end, currentIndex + 1) ?? null);

    }

    sort(compare?: Comparator<T>): LinkedList<T> {
        const array = this.toArray();
        // array.sort(compare);
        const defaultComparator = (a: T, b: T) => {
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        }
        Sorting.timSort(array, compare ?? defaultComparator);

        return new LinkedList<T>().addAll(array);
    }

    sortedBy<U>(keySelector: (value: T) => U, compareFn?: ((a: U, b: U) => number)): LinkedList<T> {
        const mutableArray = this.toArray();
        Sorting.timSort(mutableArray, (a,b) => {
            const keyA = keySelector(a);
            const keyB = keySelector(b);
            return compareFn ? compareFn(keyA, keyB) : (keyA < keyB ? -1 : keyA > keyB ? 1 : 0);
        })

        return new LinkedList<T>().addAll(mutableArray);
    }

    splice(start: number, deleteCount?: number): LinkedList<T>;
    splice(start: number, deleteCount: number, ...items: T[]): LinkedList<T>;
    splice(start: number, deleteCount?: number, ...items: T[]): LinkedList<T> {
        if (start < 0) start = Math.max(0, this.size() + start);
        if (deleteCount === undefined) deleteCount = this.size() - start;

        if (deleteCount < 0) deleteCount = 0;

        const before = this.slice(0, start);
        const after = this.slice(start + deleteCount);

        let newList = before;
        for(const item of items) {
            newList = newList.addLast(item);
        } 
        return newList.concat(after);
    }
    

    zip<U>(other: ListInput<U>): LinkedList<[T, U]>;
    zip<U, V>(other: ListInput<U>, other2: ListInput<V>): LinkedList<[T, U, V]>;
    zip(...collections: Array<ListInput<unknown>>): LinkedList<unknown>;
    zip<U, V>(...other: (ListInput<U> | ListInput<unknown> | ListInput<V>)[]): LinkedList<unknown> {
        const minLength = Math.min(this.size(), ...other.map(c => Array.isArray(c) ? c.length : c.size()));
        let newList = new LinkedList<unknown>();
        for (let i=0; i<minLength; i++) {
            const zipped = [this.get(i), ...other.map(c => Array.isArray(c) ? c[i] : c.get(i))];
            newList = newList.addLast(zipped as unknown as [T, U, V])
        }
        return newList;
    }

    // zipAll: (<U>(other: Collection<U>) => Collection<[T, U]>) 
    //         & (<U, V>(other: Collection<U>, other2: Collection<V>) 
    // => LinkedList<[T, U, V]>);
    zipAll<U>(other: ListInput<U>): LinkedList<[T, U]>;
    zipAll<U, V>(other: ListInput<U>, other2: ListInput<V>): LinkedList<[T, U, V]>;
    zipAll(...collections: Array<ListInput<unknown>>): LinkedList<unknown>;
    zipAll<U, V>(...other: (ListInput<U> | ListInput<unknown> | ListInput<V>)[]): LinkedList<unknown> {
        const maxLength = Math.max(this.size(), ...other.map(c => Array.isArray(c) ? c.length : c.size()));
        let newList = new LinkedList<unknown>();
        for (let i = 0; i < maxLength; i++) {
            const firstValue = i < this.size() ? this.get(i) : undefined;
            const secondValue = other.map(c => Array.isArray(c) ? (i < c.length ? c[i] : undefined) : (i < c.size() ? c.get(i) : undefined));
            const zipped = [firstValue, ...secondValue];
            newList = newList.addLast(zipped as unknown as [T, U, V]);
        }
        return newList;
    }

    zipWith<U, Z>(
            zipper: (value: T, otherValue: U) => Z,
            otherCollection: ListInput<U>
    ): LinkedList<Z>;
    zipWith<U, V, Z>(
        zipper: (value: T, otherValue: U, thirdValue: V) => Z,
        otherCollection: ListInput<U>,
        thirdCollection: ListInput<V>
    ): LinkedList<Z>;
    zipWith<Z>(
        zipper: (...values: unknown[]) => Z,
        ...collections: Array<ListInput<unknown>>
    ): LinkedList<Z>;
    zipWith<U, V, Z>(
        zipper: any,
        ...otherCollection: (ListInput<U> | ListInput<unknown> | ListInput<V>)[]
    ): LinkedList<Z> {
        const minLength = Math.min(this.size(), ...otherCollection.map(c => Array.isArray(c) ? c.length : c.size()));
        let newList = new LinkedList<Z>();
        for (let i = 0; i < minLength; i++) {
            const values = [this.get(i), ...otherCollection.map(c => Array.isArray(c) ? c[i] : c.get(i))];
            newList = newList.addLast(zipper(...values));
        }
        return newList;
    }

    element(): T {
        if (this.head === null) {
            throw new Error("NoSuchElementException - tried to retrieve the head of the Linked List but it is empty");
        }
        return this.head;
    }

    // Add element to the linkedlist
    offer(item: T): LinkedList<T> {
        return this.addLast(item);
    }
    

    peek(): T | undefined {
        if (this.isEmpty()) return undefined;
        return this.head!;
    }

    // retrieves and removes the head of the queue. Returns undefined if the queue or linkedlist is empty
    poll(): { value: T | undefined; newQueue: LinkedList<T> } {
        if (this.isEmpty()) return {value: undefined, newQueue: new LinkedList<T>()};

        return {value: this.head!, newQueue: this.tail ?? new LinkedList<T>()};
    }
    

    toArray(): T[] {
        const result: T[] = [];
        for (const item of this) {
            result.push(item);
        }
        return result;
    }


    equals(o: Object): boolean {
        if (this === o) return true;
        if (!(o instanceof LinkedList)) return false;
        if (this.size() !== o.size()) return false;

        const arr1 = this.toArray();
        const arr2 = (o as LinkedList<T>).toArray();

        return arr1.every((value, index) => value === arr2[index]);
    }

    // Speed for different types of operations

    indexingSpeed(): Speed {
        return Speed.Linear;
    }
    hasSpeed(): Speed {
        return Speed.Linear;
    }
    addSpeed(): Speed {
        return Speed.Linear;
    }
    removeSpeed(): Speed {
        return Speed.Linear;
    }

    hashCode(): number {
        if (this._hashCode === null) {
            this._hashCode = HashCode.hashCodeArray(this.toArray());
        }
        return this._hashCode;
    }

    toString(): string {
        return "[" + this.toArray().join(", ") + "]";
    }
}