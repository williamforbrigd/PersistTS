import { Comparator } from "../Interfaces/Comparator";
import SortedSet from "../Interfaces/SortedSet";
import AbstractSet from "./AbstractSet";

export default abstract class AbstractSortedSet<T> extends AbstractSet<T> implements SortedSet<T> {
    abstract empty(): SortedSet<T>;
    protected abstract createEmpty<TT>(compare?: Comparator<TT>): SortedSet<TT>;
    /**
     * Gets the comparator used to order the set's elements.
     *
     * @returns The Comparator for elements of type T.
     */
    abstract getComparator(): Comparator<T>;

    /**
     * Sorts the elements of the set using the provided comparator.
     * 
     * @param comparator - The comparator used to order the set's elements.
     * @returns A new SortedSet with the order defined by the comparator.
     */
    abstract sort(compare?: Comparator<T>): SortedSet<T>;

    /**
     * Sorts the elements of the set using a custom comparator value mapper.
     * 
     * @param comparatorValueMapper - Function to map the value to a comparable value.
     * @param comparator - Optional comparator for the mapped values.
     * @returns A new SortedSet with the order defined by the comparator.
     */
    abstract sortBy<C>(
        comparatorValueMapper: (value: T, key: T, set: this) => C,
        comparator?: (valueA: C, valueB: C) => number
    ): SortedSet<T | C>;

    /**
     * Retrieves the smallest element in the set.
     *
     * @returns The minimum element, or undefined if the set is empty.
     */
    abstract findMin(): T | undefined;

    /**
     * Retrieves the largest element in the set.
     *
     * @returns The maximum element, or undefined if the set is empty.
     */
    abstract findMax(): T | undefined;

    /**
     * Removes the smallest element from the set.
     *
     * @returns A new SortedSet without the minimum element.
     */
    abstract deleteMin(): SortedSet<T>;

    /**
     * Removes the largest element from the set.
     *
     * @returns A new SortedSet without the maximum element.
     */
    abstract deleteMax(): SortedSet<T>;

    /**
     * Attempts to find the element immediately less than the specified value.
     *
     * @param value - The reference element.
     * @returns A tuple [true, predecessor] if found; [false, undefined] otherwise.
     */
    abstract tryPredecessor(value: T): [boolean, T | undefined];

    /**
     * Attempts to find the element immediately greater than the specified value.
     *
     * @param value - The reference element.
     * @returns A tuple [true, successor] if found; [false, undefined] otherwise.
     */
    abstract trySuccessor(value: T): [boolean, T | undefined];

    /**
     * Attempts to find the greatest element less than or equal to the specified value.
     *
     * @param value - The reference element.
     * @returns A tuple [true, element] if found; [false, undefined] otherwise.
     */
    abstract tryWeakPredecessor(value: T): [boolean, T | undefined];

    /**
     * Attempts to find the least element greater than or equal to the specified value.
     *
     * @param value - The reference element.
     * @returns A tuple [true, element] if found; [false, undefined] otherwise.
     */
    abstract tryWeakSuccessor(value: T): [boolean, T | undefined];

    /**
     * Gets the element immediately less than the specified value.
     *
     * @param value - The reference element.
     * @returns The predecessor element, or undefined if none exists.
     */
    abstract predecessor(value: T): T | undefined;

    /**
     * Gets the element immediately greater than the specified value.
     *
     * @param value - The reference element.
     * @returns The successor element, or undefined if none exists.
     */
    abstract successor(value: T): T | undefined;

    /**
     * Gets the least element greater than or equal to the specified value.
     *
     * @param value - The reference element.
     * @returns The element, or undefined if none exists.
     */
    abstract weakSuccessor(value: T): T | undefined;

    /**
     * Gets the greatest element less than or equal to the specified value.
     *
     * @param value - The reference element.
     * @returns The element, or undefined if none exists.
     */
    abstract weakPredecessor(value: T): T | undefined;

    /**
     * Returns a subset containing elements between fromValue and toValue based on a custom comparison function.
     *
     * @param cutFunction - Function to compare values against bounds.
     * @param fromValue - Lower bound value.
     * @param toValue - Upper bound value.
     * @returns A new SortedSet with elements in the specified range.
     */
    cut(cutFunction: (compareToOther: T) => number, fromValue: T, toValue: T): SortedSet<T> {
        const lower = cutFunction(fromValue);
        const upper = cutFunction(toValue);
        let result = this.empty();

        for (const value of this as Iterable<T>) {
            const cutValue = cutFunction(value);
            if (cutValue >= lower && cutValue < upper) {
                result = result.add(value) as SortedSet<T>;
            }
        }

        return result;
    }

    /**
     * Returns a view of the set with elements greater than or equal to fromValue.
     *
     * @param fromValue - Lower bound value.
     * @returns A new SortedSet starting from the specified value.
     */
    abstract rangeFrom(fromValue: T): SortedSet<T>;

    /**
     * Returns a view of the set with elements less than or equal to toValue.
     *
     * @param toValue - Upper bound value.
     * @returns A new SortedSet up to the specified value.
     */
    abstract rangeTo(toValue: T): SortedSet<T>;

    /**
     * Returns a view of the set with elements between fromValue and toValue.
     *
     * @param fromValue - Lower bound value.
     * @param toValue - Upper bound value.
     * @returns A new SortedSet within the specified value range.
     */
    abstract rangeFromTo(fromValue: T, toValue: T): SortedSet<T>;
    // rangeAll(): Collection<[K, V]>;

    /**
     * Removes all elements greater than or equal to fromValue.
     *
     * @param fromValue - Lower bound value.
     * @returns A new SortedSet without elements from the specified value onward.
     */
    abstract removeRangeFrom(fromValue: T): SortedSet<T>;

    /**
     * Removes all elements less than or equal to toValue.
     *
     * @param toValue - Upper bound value.
     * @returns A new SortedSet without elements up to the specified value.
     */
    abstract removeRangeTo(toValue: T): SortedSet<T>;

    /**
     * Removes elements between fromValue and toValue (inclusive).
     *
     * @param fromValue - Lower bound value.
     * @param toValue - Upper bound value.
     * @returns A new SortedSet without elements in the specified range.
     */
    abstract removeRangeFromTo(fromValue: T, toValue: T): SortedSet<T>;
}