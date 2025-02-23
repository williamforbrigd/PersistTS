import Collection from '../Interfaces/Collection';

export default abstract class AbstractCollection<T> implements Collection<T> {
    abstract [Symbol.iterator](): Iterator<T>;

    protected constructor() {

    }

    abstract add(e: T): Collection<T>;

    abstract addAll(c: Iterable<T>): Collection<T>;

    abstract clear(): Collection<T>;

    contains(o: T): boolean {
        for (const item of this) {
            if (item === o) {
                return true;
            }
        }
        return false;
    }

    containsAll(c: Iterable<T>): boolean {
        for (const item of c) {
            if (!this.contains(item)) {
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

    abstract remove(e: T): Collection<T>;

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

}