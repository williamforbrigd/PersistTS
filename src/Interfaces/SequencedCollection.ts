import Collection from './Collection';

/**
 * An ordered extension of the Collection interface.
 * It supports head- and tail-oriented operations.
 */
export default interface SequencedCollection<T> extends Collection<T> {
    /**
     * Returns a new collection with the elements in reverse order.
     *
     * @returns A SequencedCollection containing the elements of this collection in reverse sequence.
     */
    reversed(): SequencedCollection<T>;
    /**
     * Adds an element to the front (head) of the collection.
     *
     * @param e - The element to add at the beginning of the sequence.
     * @returns A new SequencedCollection including the added element at the front.
     */
    addFirst(e: T): SequencedCollection<T>;
    /**
     * Adds an element to the end (tail) of the collection.
     *
     * @param e - The element to add at the end of the sequence.
     * @returns A new SequencedCollection including the added element at the back.
     */
    addLast(e: T): SequencedCollection<T>;
    /**
     * Retrieves, without removing, the first element (head) of the collection.
     *
     * @returns The first element, or undefined if the collection is empty.
     */
    getFirst(): T | undefined;
    /**
     * Retrieves, without removing, the last element (tail) of the collection.
     *
     * @returns The last element, or undefined if the collection is empty.
     */
    getLast(): T | undefined;
    /**
     * Removes the first element (head) of the collection.
     *
     * @returns A new SequencedCollection with the first element removed.
     */
    removeFirst(): SequencedCollection<T>;
    /**
     * Removes the last element (tail) of the collection.
     *
     * @returns A new SequencedCollection with the last element removed.
     */
    removeLast(): SequencedCollection<T>;
}