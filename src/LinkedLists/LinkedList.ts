import List, {ListInput} from '../Interfaces/List';
import Queue from '../Interfaces/Queue';
import HashCode from '../Hashing/HashCode';
import { Comparator } from '../Interfaces/Comparator';
import { Speed } from '../Enums/Speed';
import AbstractList from '../AbstractClasses/AbstractList';

// This class represents a singly linked list that is immutable.
// This list is recursively defined.
export default class LinkedList<T> extends AbstractList<T> 
                                    implements List<T>, Queue<T> {
    private _hashCode: number | null = null;
    
    constructor(
        private readonly head: T | null = null,
        private readonly tail: LinkedList<T> | null = null
    ) {
        super();
    }

    static of<T>(...items: T[]): LinkedList<T> {
        let list = new LinkedList<T>();
        for (const item of items) {
            list = list.addLast(item);
        }
        return list;
    }

    of(...values: T[]): LinkedList<T> {
        let list = this.empty();
        for (const value of values) {
            list = list.addLast(value);
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

    empty(): LinkedList<T> {
        return new LinkedList<T>();
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

    addAll(items: Iterable<T>): LinkedList<T>;
    addAll(items: Iterable<T>, index: number): LinkedList<T>;
    addAll(items: Iterable<T>, index?: number): LinkedList<T> {
        if (index !== undefined) {
            return this.addAllAtIndex(index!, items);
        } else {
            return this.addAllAtEnd(items);
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
        return super.concat(...valuesOrCollections) as LinkedList<T | C>;
    }

    distinct(): LinkedList<T> {
        return super.distinct() as LinkedList<T>;
    }

    filter<F extends T>(predicate: (value: T, index: number, iter: this) => value is F, thisArg?: any): LinkedList<F>;
    filter(predicate: (value: T, index: number, iter: this) => unknown, thisArg?: any): this;
    filter(predicate: (value: T, index: number, iter: this) => unknown, thisArg?: any): any {
        return super.filter(predicate, thisArg) as LinkedList<T>;
    }

    flatMap<M>(mapper: (value: T, key: number, iter: this) => Iterable<M>, thisArg?: any): LinkedList<M> {
        return super.flatMap(mapper, thisArg) as LinkedList<M>;
    }

    listIterator(index: number): Iterator<T> {
        return this[Symbol.iterator]();
    }

    map<M>(mapper: (value: T, key: number, collection: this) => M, thisArg?: any): LinkedList<M> {
        return super.map(mapper, thisArg) as LinkedList<M>;
    }

    merge<C extends T>(...collections: Array<Iterable<C>>): LinkedList<T | C> {
        return super.merge(...collections) as LinkedList<T | C>;
    }

    partition<F extends T, C>(predicate: (this: C, value: T, index: number, iter: this) => value is F, thisArg?: C): [LinkedList<T>, LinkedList<F>];
    partition<C>(predicate: (this: C, value: T, index: number, iter: this) => unknown, thisArg?: C): [this, this];
    partition<C>(predicate: (this: C, value: T, index: number, iter: this) => unknown, thisArg?: any): any {
        return super.partition(predicate, thisArg) as [LinkedList<T>, LinkedList<T>];
    }

    reduce(callback: (previousValue: T, currentValue: T, currentIndex: number, collection: this) => T): T;
    reduce<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, collection: this) => U, initialValue: U): U;
    reduce(callback: any, initialValue?: any): any {
        return super.reduce(callback, initialValue) as any;
    }
    

    reduceRight(callback: (previousValue: T, currentValue: T, currentIndex: number, collection: this) => T): T;
    reduceRight(callback: (previousValue: T, currentValue: T, currentIndex: number, collection: this) => T, initialValue: T): T;
    reduceRight<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, collection: this) => U, initialValue: U): U;
    reduceRight(callback: any, initialValue?: any): any {
        return super.reduceRight(callback, initialValue) as any;
    }
    

    // remove(e: T): LinkedList<T>;
    // remove(item: T): LinkedList<T>;
    // remove(index: number): LinkedList<T>;
    // remove(): LinkedList<T>;
    // remove(arg1?: T | number): LinkedList<T> {
    //     if (typeof arg1 === 'number') {
    //         return this.removeAt(arg1);
    //     } else {
    //         return this.removeItem(arg1 as T);
    //     }
    // }

    removeItem(item: T): LinkedList<T> {
        if (this.isEmpty()) {
            return this;
        }
        if (this.head === item) {
            return this.tail ?? new LinkedList<T>();
        }
        const newTail = this.tail?.removeItem(item) ?? null;
        return new LinkedList(this.head, newTail);
    }

    remove(): LinkedList<T>;
    remove(index: number): LinkedList<T>;
    remove(index?: number): LinkedList<T> {
        if (index === undefined) {
            return this.removeFirst();
        }
        return this.removeAt(index);
    }

    removeAt(index: number): LinkedList<T> {
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

    pop(): LinkedList<T> {
        if (this.isEmpty()) throw new RangeError("Cannot pop from an empty list");
        const res = this.popHelper();
        return res ?? new LinkedList<T>();
    }

    popHelper(): LinkedList<T> | null {
        if (this.tail === null) return null;

        const newTail = this.tail.popHelper();
        return new LinkedList(this.head!, newTail);
    }

    shift(): LinkedList<T> {
        return this.tail ?? new LinkedList<T>();
    }

    unshift(...items: T[]): LinkedList<T> {
        return super.unshift(...items) as LinkedList<T>;
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
        return super.sort(compare) as LinkedList<T>;
    }

    sortedBy<U>(keySelector: (value: T) => U, compareFn?: ((a: U, b: U) => number)): LinkedList<T> {
        return super.sortedBy(keySelector, compareFn) as LinkedList<T>;
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
        return super.zip(...other) as LinkedList<unknown>;
    }

    // zipAll: (<U>(other: Collection<U>) => Collection<[T, U]>) 
    //         & (<U, V>(other: Collection<U>, other2: Collection<V>) 
    // => LinkedList<[T, U, V]>);
    zipAll<U>(other: ListInput<U>): LinkedList<[T, U]>;
    zipAll<U, V>(other: ListInput<U>, other2: ListInput<V>): LinkedList<[T, U, V]>;
    zipAll(...collections: Array<ListInput<unknown>>): LinkedList<unknown>;
    zipAll<U, V>(...other: (ListInput<U> | ListInput<unknown> | ListInput<V>)[]): LinkedList<unknown> {
        return super.zipAll(...other) as LinkedList<unknown>;
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
        return super.zipWith(zipper, ...otherCollection) as LinkedList<Z>;
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
        return Array.from(this);
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