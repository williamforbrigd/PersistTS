import Collection from "./Collection";

/**
 * Defines a first-in first-out (FIFO) collection of elements.
 * A queue supports adding elements to the end of the queue and removing
 * elements from the front of the queue.
 */
export default interface Queue<T> extends Collection<T> {
    /**
     * Adds an element to the back of the queue.
     *
     * @param e - The element to add.
     * @returns A new Queue including the added element.
     */
    add(e: T): Queue<T>;

    /**
     * Offers an element into the queue.
     *
     * This is synonymous with add.
     *
     * @param e - The element to offer.
     * @returns A new Queue including the offered element.
     */
    offer(e: T): Queue<T>;

    /**
     * Removes the head element of the queue.
     *
     * @throws {Error} If the queue is empty.
     * @returns A new Queue with the head removed.
     */
    remove(): Queue<T>;

    /**
     * Retrieves and removes the head of the queue.
     *
     * @returns An object containing the head value (or undefined if empty)
     * and the new Queue with the head removed.
     */
    poll(): {value: T | undefined, newQueue: Queue<T>};

    /**
     * Retrieves, but does not remove, the head of the queue.
     *
     * @throws {Error} If the queue is empty.
     * @returns The head element.
     */
    element(): T; // throws error if empty. That is the only difference from peek()

    /**
     * Retrieves, but does not remove, the head of the queue.
     *
     * @returns The head element, or undefined if the queue is empty.
     */
    peek(): T | undefined;
}