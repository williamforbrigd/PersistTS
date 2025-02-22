export default interface Collection<T> extends Iterable<T>  {
    [Symbol.iterator](): Iterator<T>;

    size(): number;
    isEmpty(): boolean;
    contains(o: Object): boolean;
    toArray(): T[];
    toArray(generator: (size: number) => T[]): T[];
    add(e: T): Collection<T>;
    remove(e: T): Collection<T>;
    containsAll(c: Iterable<T>): boolean;
    addAll(c: Iterable<T>): Collection<T>;
    removeAll(c: Iterable<T>): Collection<T>;
    removeIf(filter: (item: T) => boolean): Collection<T>;
    retainAll(c: Iterable<T>): Collection<T>;
    clear(): Collection<T>;

    equals(o: Object): boolean;
    hashCode(): number;


    // this is some java.util.Collection methods
    //spliterator(): Spliterator<T>;
    //stream(): Stream<T>;
    //parallelStream(): Stream<T>;

    get<NSV>(index: number, notSetValue: NSV): T | NSV;
    get(index: number): T | undefined;
}
