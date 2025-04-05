import Collection from "./Collection";
import { Comparator } from "./Comparator";
import Map from "./Map";


export default interface SortedMap<K, V> extends Map<K, V> {
    getComparator(): Comparator<K>;
    // keys(): K[];
    findMin(key?: K): [K, V] | undefined;
    findMax(key?: K): [K, V] | undefined;
    deleteMin(): SortedMap<K, V>;
    deleteMax(): SortedMap<K, V>;
    tryPredecessor(key: K): [boolean, [K, V] | undefined];
    trySuccessor(key: K): [boolean, [K, V] | undefined];
    tryWeakPredecessor(key: K): [boolean, [K, V] | undefined];
    tryWeakSuccessor(key: K): [boolean, [K, V] | undefined];
    predecessor(key: K): [K, V] | undefined;
    successor(key: K): [K, V] | undefined;
    weakSuccessor(key: K): [K, V] | undefined;
    weakPredecessor(key: K): [K, V] | undefined;
    cut(cutFunction: (compareToOther: K) => number, fromKey: K, toKey: K): SortedMap<K, V>;
    rangeFrom(fromKey: K): SortedMap<K, V>;
    rangeTo(toKey: K): SortedMap<K, V>;
    rangeFromTo(fromKey: K, toKey: K): SortedMap<K, V>;
    // rangeAll(): Collection<[K, V]>;
    removeRangeFrom(fromKey: K): SortedMap<K, V>;
    removeRangeTo(toKey: K): SortedMap<K, V>;
    removeRangeFromTo(fromKey: K, toKey: K): SortedMap<K, V>;
}