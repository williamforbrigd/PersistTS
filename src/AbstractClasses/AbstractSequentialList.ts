import AbstractList from "./AbstractList";

export default abstract class AbstractSequentialList<T> extends AbstractList<T> {
    protected constructor() {
        super();
    }
    abstract [Symbol.iterator](): Iterator<T>;
    public iterator(): Iterator<T> {
        return this[Symbol.iterator]();
    }
    abstract listIterator(index: number): Iterator<T>;
    get(index: number): T | undefined {
        let i = 0;
         for (const item of this) {
             if (i === index) {
                 return item;
             }
             i++;
         }
         return undefined;
    }
    // abstract set(index: number, item: T): AbstractSequentialList<T>;
    // abstract add(index: number, item: T): AbstractSequentialList<T>;
    // abstract remove(index: number): AbstractSequentialList<T>;
    // abstract addAll(index: number, items: Iterable<T>): AbstractSequentialList<T>;
}