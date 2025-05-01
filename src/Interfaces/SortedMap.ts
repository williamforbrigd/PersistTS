import { Comparator } from "./Comparator";
import Map from "./Map";


/**
 * A SortedMap is a Map that maintains its key-value pairs in sorted order based in the comparator.
 * 
 * A SortedMap supports efficient retrieval of the minimum, maximum, predecessor and successor elements.
 * It also has range queries, allowing you to get a sub-map of the original map.
 * 
 * It also has methods for sorting the map, that all use the Timosort algorithm when implemented.
 */
export default interface SortedMap<K, V> extends Map<K, V> {
    /**
     * Gets the comparator used to order the map's keys.
     *
     * @returns The Comparator for keys of type K.
     */
    getComparator(): Comparator<K>;
    // keys(): K[];
    /**
     * Returns a new SortedMap sorted by the specified comparator.
     *
     * @param compare - Optional comparator to use; defaults to the map's comparator.
     * @returns A new SortedMap with keys sorted accordingly.
     */
    sort(compare?: Comparator<K>): SortedMap<K, V>;
    /**
     * Transforms values into keys for sorting and returns a new map sorted by those keys.
     *
     * @template C - The type of the computed sort key.
     * @param comparatorValueMapper - Function mapping each value and key to a sort key.
     * @param compare - Optional comparator for sort keys; defaults to natural order.
     * @returns A new SortedMap with entries sorted by the computed keys.
     */
    sortBy<C>(
        comparatorValueMapper: (value: V, key: K, map: this) => C,
        compare?: Comparator<C>
    ): SortedMap<K | C, V>;
    /**
     * Finds the entry with the smallest key greater than or equal to the specified key.
     *
     * @param key - Optional lower bound for the search.
     * @returns A tuple [key, value] of the minimum entry, or undefined if none exists.
     */
    findMin(key?: K): [K, V] | undefined;
    /**
     * Finds the entry with the largest key less than or equal to the specified key.
     *
     * @param key - Optional upper bound for the search.
     * @returns A tuple [key, value] of the maximum entry, or undefined if none exists.
     */
    findMax(key?: K): [K, V] | undefined;
    /**
     * Removes the entry with the minimum key.
     *
     * @returns A new SortedMap without the minimum entry.
     */
    deleteMin(): SortedMap<K, V>;
    /**
     * Removes the entry with the maximum key.
     *
     * @returns A new SortedMap without the maximum entry.
     */
    deleteMax(): SortedMap<K, V>;
    /**
     * Attempts to find the entry with the greatest key less than the specified key.
     *
     * @param key - The reference key.
     * @returns A tuple [true, [predKey, predValue]] if a predecessor exists; [false, undefined] otherwise.
     */
    tryPredecessor(key: K): [boolean, [K, V] | undefined];
    /**
     * Attempts to find the entry with the least key greater than the specified key.
     *
     * @param key - The reference key.
     * @returns A tuple [true, [succKey, succValue]] if a successor exists; [false, undefined] otherwise.
     */
    trySuccessor(key: K): [boolean, [K, V] | undefined];
    /**
     * Attempts to find the entry with the greatest key less than or equal to the specified key.
     *
     * @param key - The reference key.
     * @returns A tuple [true, [key, value]] if such an entry exists; [false, undefined] otherwise.
     */
    tryWeakPredecessor(key: K): [boolean, [K, V] | undefined];
    /**
     * Attempts to find the entry with the least key greater than or equal to the specified key.
     *
     * @param key - The reference key.
     * @returns A tuple [true, [key, value]] if such an entry exists; [false, undefined] otherwise.
     */
    tryWeakSuccessor(key: K): [boolean, [K, V] | undefined];
    /**
     * Gets the entry with the greatest key less than the specified key.
     *
     * @param key - The reference key.
     * @returns A tuple [key, value] of the predecessor, or undefined if none exists.
     */
    predecessor(key: K): [K, V] | undefined;
    /**
     * Gets the entry with the least key greater than the specified key.
     *
     * @param key - The reference key.
     * @returns A tuple [key, value] of the successor, or undefined if none exists.
     */
    successor(key: K): [K, V] | undefined;
    /**
     * Gets the entry with the least key greater than or equal to the specified key.
     *
     * @param key - The reference key.
     * @returns A tuple [key, value], or undefined if none exists.
     */
    weakSuccessor(key: K): [K, V] | undefined;
    /**
     * Gets the entry with the greatest key less than or equal to the specified key.
     *
     * @param key - The reference key.
     * @returns A tuple [key, value], or undefined if none exists.
     */
    weakPredecessor(key: K): [K, V] | undefined;
    /**
     * Returns a submap containing entries with keys between fromKey and toKey
     * based on a custom comparison function.
     *
     * @param cutFunction - Function to compare keys against bounds.
     * @param fromKey - Lower bound key.
     * @param toKey - Upper bound key.
     * @returns A new SortedMap with entries in the specified range.
     */
    cut(cutFunction: (compareToOther: K) => number, fromKey: K, toKey: K): SortedMap<K, V>;
    /**
     * Returns a view of the map with entries having keys greater than or equal to fromKey.
     *
     * @param fromKey - Lower bound key.
     * @returns A new SortedMap starting from the specified key.
     */
    rangeFrom(fromKey: K): SortedMap<K, V>;
    /**
     * Returns a view of the map with entries having keys less than or equal to toKey.
     *
     * @param toKey - Upper bound key.
     * @returns A new SortedMap up to the specified key.
     */
    rangeTo(toKey: K): SortedMap<K, V>;
    /**
     * Returns a view of the map with entries having keys between fromKey and toKey.
     *
     * @param fromKey - Lower bound key.
     * @param toKey - Upper bound key.
     * @returns A new SortedMap within the specified key range.
     */
    rangeFromTo(fromKey: K, toKey: K): SortedMap<K, V>;

    // rangeAll(): Collection<[K, V]>;

    /**
     * Removes all entries with keys greater than or equal to fromKey.
     *
     * @param fromKey - Lower bound key.
     * @returns A new SortedMap without entries from the specified key onward.
     */
    removeRangeFrom(fromKey: K): SortedMap<K, V>;
    /**
     * Removes all entries with keys less than or equal to toKey.
     *
     * @param toKey - Upper bound key.
     * @returns A new SortedMap without entries up to the specified key.
     */
    removeRangeTo(toKey: K): SortedMap<K, V>;
    /**
     * Removes entries with keys between fromKey and toKey (inclusive).
     *
     * @param fromKey - Lower bound key.
     * @param toKey - Upper bound key.
     * @returns A new SortedMap without entries in the specified range.
     */
    removeRangeFromTo(fromKey: K, toKey: K): SortedMap<K, V>;
}