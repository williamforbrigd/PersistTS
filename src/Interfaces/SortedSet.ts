import {Comparator} from "./Comparator";
import Set from "./Set";

export default interface SortedSet<T> extends Set<T> {
    getComparator(): Comparator<T>;
    findMin(): T | undefined;
    findMax(): T | undefined;
    deleteMin(): SortedSet<T>;
    deleteMax(): SortedSet<T>;
    // tryPredecessor(value: T, out: T): boolean;
    // trySuccessor(value: T, out: T): boolean;
    // tryWeakSuccessor(value: T, out: T): boolean;
    // tryWeakPredecessor(value: T, out: T): boolean;
    predecessor(value: T): T | undefined;
    successor(value: T): T | undefined;
    weakSuccessor(value: T): T | undefined;
    weakPredecessor(value: T): T | undefined;
    cut(cutFunction: (compareToOther: T) => number, fromValue: T, toValue: T): SortedSet<T>;
    rangeFrom(fromValue: T): SortedSet<T>;
    rangeTo(toValue: T): SortedSet<T>;
    rangeFromTo(fromValue: T, toValue: T): SortedSet<T>;
    // rangeAll(): Collection<[K, V]>;
    removeRangeFrom(fromValue: T): SortedSet<T>;
    removeRangeTo(toValue: T): SortedSet<T>;
    removeRangeFromTo(fromValue: T, toValue: T): SortedSet<T>;
}