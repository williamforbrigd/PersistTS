import {Comparator} from "./Comparator";
import Set from "./Set";

/**
 * Defines a sorted set maintaining unique elements in order defined by a comparator.
 *
 * A SortedSet supports retrieval of minimum, maximum, predecessor, and successor elements,
 * range views, and custom sorting operations.
 *
 */
export default interface SortedSet<T> extends Set<T> {
    /**
     * Gets the comparator used to order the set's elements.
     *
     * @returns The Comparator for elements of type T.
     */
    getComparator(): Comparator<T>;

    /**
     * Sorts the elements of the set using the provided comparator.
     * 
     * @param comparator - The comparator used to order the set's elements.
     * @returns A new SortedSet with the order defined by the comparator.
     */
    sort(comparator?: Comparator<T>): Set<T>;

    /**
     * Sorts the elements of the set using a custom comparator value mapper.
     * 
     * @param comparatorValueMapper - Function to map the value to a comparable value.
     * @param comparator - Optional comparator for the mapped values.
     * @returns A new SortedSet with the order defined by the comparator.
     */
    sortBy<C>(
        comparatorValueMapper: (value: T, key: T, set: this) => C,
        comparator?: (valueA: C, valueB: C) => number
    ): Set<T | C>;

    /**
     * Retrieves the smallest element in the set.
     *
     * @returns The minimum element, or undefined if the set is empty.
     */
    findMin(): T | undefined;

    /**
     * Retrieves the largest element in the set.
     *
     * @returns The maximum element, or undefined if the set is empty.
     */
    findMax(): T | undefined;

    /**
     * Removes the smallest element from the set.
     *
     * @returns A new SortedSet without the minimum element.
     */
    deleteMin(): SortedSet<T>;

    /**
     * Removes the largest element from the set.
     *
     * @returns A new SortedSet without the maximum element.
     */
    deleteMax(): SortedSet<T>;

    /**
     * Attempts to find the element immediately less than the specified value.
     *
     * @param value - The reference element.
     * @returns A tuple [true, predecessor] if found; [false, undefined] otherwise.
     */
    tryPredecessor(value: T): [boolean, T | undefined];

    /**
     * Attempts to find the element immediately greater than the specified value.
     *
     * @param value - The reference element.
     * @returns A tuple [true, successor] if found; [false, undefined] otherwise.
     */
    trySuccessor(value: T): [boolean, T | undefined];

    /**
     * Attempts to find the greatest element less than or equal to the specified value.
     *
     * @param value - The reference element.
     * @returns A tuple [true, element] if found; [false, undefined] otherwise.
     */
    tryWeakPredecessor(value: T): [boolean, T | undefined];

    /**
     * Attempts to find the least element greater than or equal to the specified value.
     *
     * @param value - The reference element.
     * @returns A tuple [true, element] if found; [false, undefined] otherwise.
     */
    tryWeakSuccessor(value: T): [boolean, T | undefined];

    /**
     * Gets the element immediately less than the specified value.
     *
     * @param value - The reference element.
     * @returns The predecessor element, or undefined if none exists.
     */
    predecessor(value: T): T | undefined;

    /**
     * Gets the element immediately greater than the specified value.
     *
     * @param value - The reference element.
     * @returns The successor element, or undefined if none exists.
     */
    successor(value: T): T | undefined;

    /**
     * Gets the least element greater than or equal to the specified value.
     *
     * @param value - The reference element.
     * @returns The element, or undefined if none exists.
     */
    weakSuccessor(value: T): T | undefined;

    /**
     * Gets the greatest element less than or equal to the specified value.
     *
     * @param value - The reference element.
     * @returns The element, or undefined if none exists.
     */
    weakPredecessor(value: T): T | undefined;

    /**
     * Returns a subset containing elements between fromValue and toValue based on a custom comparison function.
     *
     * @param cutFunction - Function to compare values against bounds.
     * @param fromValue - Lower bound value.
     * @param toValue - Upper bound value.
     * @returns A new SortedSet with elements in the specified range.
     */
    cut(cutFunction: (compareToOther: T) => number, fromValue: T, toValue: T): SortedSet<T>;

    /**
     * Returns a view of the set with elements greater than or equal to fromValue.
     *
     * @param fromValue - Lower bound value.
     * @returns A new SortedSet starting from the specified value.
     */
    rangeFrom(fromValue: T): SortedSet<T>;

    /**
     * Returns a view of the set with elements less than or equal to toValue.
     *
     * @param toValue - Upper bound value.
     * @returns A new SortedSet up to the specified value.
     */
    rangeTo(toValue: T): SortedSet<T>;

    /**
     * Returns a view of the set with elements between fromValue and toValue.
     *
     * @param fromValue - Lower bound value.
     * @param toValue - Upper bound value.
     * @returns A new SortedSet within the specified value range.
     */
    rangeFromTo(fromValue: T, toValue: T): SortedSet<T>;
    // rangeAll(): Collection<[K, V]>;

    /**
     * Removes all elements greater than or equal to fromValue.
     *
     * @param fromValue - Lower bound value.
     * @returns A new SortedSet without elements from the specified value onward.
     */
    removeRangeFrom(fromValue: T): SortedSet<T>;

    /**
     * Removes all elements less than or equal to toValue.
     *
     * @param toValue - Upper bound value.
     * @returns A new SortedSet without elements up to the specified value.
     */
    removeRangeTo(toValue: T): SortedSet<T>;

    /**
     * Removes elements between fromValue and toValue (inclusive).
     *
     * @param fromValue - Lower bound value.
     * @param toValue - Upper bound value.
     * @returns A new SortedSet without elements in the specified range.
     */
    removeRangeFromTo(fromValue: T, toValue: T): SortedSet<T>;
}