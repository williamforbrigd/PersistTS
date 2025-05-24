import { Comparator } from "../Interfaces/Comparator";
import SortedMap from "../Interfaces/SortedMap";
import AbstractMap from "./AbstractMap";

export default abstract class AbstractSortedMap<K, V> extends AbstractMap<K, V> implements SortedMap<K, V> {
    protected abstract createEmpty<KM, VM>(compare?: Comparator<KM>): SortedMap<KM, VM>;
    /**
     * Gets the comparator used to order the map's keys.
     *
     * @returns The Comparator for keys of type K.
     */
    abstract getComparator(): Comparator<K>;
    // keys(): K[];
    /**
     * Returns a new SortedMap sorted by the specified comparator.
     *
     * @param compare - Optional comparator to use; defaults to the map's comparator.
     * @returns A new SortedMap with keys sorted accordingly.
     */
    abstract sort(compare?: Comparator<K>): SortedMap<K, V>;
    /**
     * Transforms values into keys for sorting and returns a new map sorted by those keys.
     *
     * @template C - The type of the computed sort key.
     * @param comparatorValueMapper - Function mapping each value and key to a sort key.
     * @param compare - Optional comparator for sort keys; defaults to natural order.
     * @returns A new SortedMap with entries sorted by the computed keys.
     */
    abstract sortBy<C>(
        comparatorValueMapper: (value: V, key: K, map: this) => C,
        compare?: Comparator<C>
    ): SortedMap<K | C, V>;
    /**
     * Finds the entry with the smallest key greater than or equal to the specified key.
     *
     * @param key - Optional lower bound for the search.
     * @returns A tuple [key, value] of the minimum entry, or undefined if none exists.
     */
    abstract findMin(key?: K): [K, V] | undefined;
    /**
     * Finds the entry with the largest key less than or equal to the specified key.
     *
     * @param key - Optional upper bound for the search.
     * @returns A tuple [key, value] of the maximum entry, or undefined if none exists.
     */
    abstract findMax(key?: K): [K, V] | undefined;
    /**
     * Removes the entry with the minimum key.
     *
     * @returns A new SortedMap without the minimum entry.
     */
    abstract deleteMin(): SortedMap<K, V>;
    /**
     * Removes the entry with the maximum key.
     *
     * @returns A new SortedMap without the maximum entry.
     */
    abstract deleteMax(): SortedMap<K, V>;
    /**
     * Attempts to find the entry with the greatest key less than the specified key.
     *
     * @param key - The reference key.
     * @returns A tuple [true, [predKey, predValue]] if a predecessor exists; [false, undefined] otherwise.
     */
    abstract tryPredecessor(key: K): [boolean, [K, V] | undefined];
    /**
     * Attempts to find the entry with the least key greater than the specified key.
     *
     * @param key - The reference key.
     * @returns A tuple [true, [succKey, succValue]] if a successor exists; [false, undefined] otherwise.
     */
    abstract trySuccessor(key: K): [boolean, [K, V] | undefined];
    /**
     * Attempts to find the entry with the greatest key less than or equal to the specified key.
     *
     * @param key - The reference key.
     * @returns A tuple [true, [key, value]] if such an entry exists; [false, undefined] otherwise.
     */
    abstract tryWeakPredecessor(key: K): [boolean, [K, V] | undefined];
    /**
     * Attempts to find the entry with the least key greater than or equal to the specified key.
     *
     * @param key - The reference key.
     * @returns A tuple [true, [key, value]] if such an entry exists; [false, undefined] otherwise.
     */
    abstract tryWeakSuccessor(key: K): [boolean, [K, V] | undefined];
    /**
     * Gets the entry with the greatest key less than the specified key.
     *
     * @param key - The reference key.
     * @returns A tuple [key, value] of the predecessor, or undefined if none exists.
     */
    abstract predecessor(key: K): [K, V] | undefined;
    /**
     * Gets the entry with the least key greater than the specified key.
     *
     * @param key - The reference key.
     * @returns A tuple [key, value] of the successor, or undefined if none exists.
     */
    abstract successor(key: K): [K, V] | undefined;
    /**
     * Gets the entry with the least key greater than or equal to the specified key.
     *
     * @param key - The reference key.
     * @returns A tuple [key, value], or undefined if none exists.
     */
    abstract weakSuccessor(key: K): [K, V] | undefined;
    /**
     * Gets the entry with the greatest key less than or equal to the specified key.
     *
     * @param key - The reference key.
     * @returns A tuple [key, value], or undefined if none exists.
     */
    abstract weakPredecessor(key: K): [K, V] | undefined;
    /**
     * Returns a submap containing entries with keys between fromKey and toKey
     * based on a custom comparison function.
     *
     * @param cutFunction - Function to compare keys against bounds.
     * @param fromKey - Lower bound key.
     * @param toKey - Upper bound key.
     * @returns A new SortedMap with entries in the specified range.
     */
    cut(cutFunction: (compareToOther: K) => number, fromKey: K, toKey: K): SortedMap<K, V> {
        const lower = cutFunction(fromKey);
        const upper = cutFunction(toKey);
        const compare = this.getComparator();
        let newTree = this.createEmpty<K, V>(compare);
        // let newTree = new TreeMap<K, V>(this.compare);

        for (const [k, v] of this) {
            const cutValue = cutFunction(k);
            if (cutValue >= lower && cutValue < upper) {
                newTree = newTree.set(k, v) as SortedMap<K, V>;
            }
        }
        return newTree;
    }
    /**
     * Returns a view of the map with entries having keys greater than or equal to fromKey.
     *
     * @param fromKey - Lower bound key.
     * @returns A new SortedMap starting from the specified key.
     */
    abstract rangeFrom(fromKey: K): SortedMap<K, V>;
    /**
     * Returns a view of the map with entries having keys less than or equal to toKey.
     *
     * @param toKey - Upper bound key.
     * @returns A new SortedMap up to the specified key.
     */
    abstract rangeTo(toKey: K): SortedMap<K, V>;
    /**
     * Returns a view of the map with entries having keys between fromKey and toKey.
     *
     * @param fromKey - Lower bound key.
     * @param toKey - Upper bound key.
     * @returns A new SortedMap within the specified key range.
     */
    abstract rangeFromTo(fromKey: K, toKey: K): SortedMap<K, V>;

    // rangeAll(): Collection<[K, V]>;

    /**
     * Removes all entries with keys greater than or equal to fromKey.
     *
     * @param fromKey - Lower bound key.
     * @returns A new SortedMap without entries from the specified key onward.
     */
    abstract removeRangeFrom(fromKey: K): SortedMap<K, V>;
    /**
     * Removes all entries with keys less than or equal to toKey.
     *
     * @param toKey - Upper bound key.
     * @returns A new SortedMap without entries up to the specified key.
     */
    abstract removeRangeTo(toKey: K): SortedMap<K, V>;
    /**
     * Removes entries with keys between fromKey and toKey (inclusive).
     *
     * @param fromKey - Lower bound key.
     * @param toKey - Upper bound key.
     * @returns A new SortedMap without entries in the specified range.
     */
    abstract removeRangeFromTo(fromKey: K, toKey: K): SortedMap<K, V>;
}