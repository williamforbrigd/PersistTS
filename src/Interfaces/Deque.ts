import SequencedCollection from "./SequencedCollection";
import Queue from "./Queue";
import Collection from "./Collection";

/**
 * A double-ended queue (deque) is a linear collection that supports insertion and removal of elements from both ends.
 * Extends the Queue interface (which supports FIFO operations) and SequencedCollection interface (which supports efficient head/tail operations).
 * 
 */
export default interface Deque<T> extends Queue<T>, SequencedCollection<T> {
    addFirst(e: T): Deque<T>;
    addLast(e: T): Deque<T>;
    offerFirst(e: T): Deque<T>;
    offerLast(e: T): Deque<T>;
    removeFirst(): Deque<T>;
    removeLast(): Deque<T>;
    pollFirst(): {value: T | undefined, newDeque: Deque<T>};
    pollLast(): {value: T | undefined, newDeque: Deque<T>};
    getFirst(): T | undefined;
    getLast(): T | undefined;
    peekFirst(): T | undefined;
    peekLast(): T | undefined;
    removeFirstOccurrence(e: T): Deque<T>;
    removeLastOccurrence(e: T): Deque<T>;
    add(e: T): Deque<T>;
    offer(e: T): Deque<T>;
    remove(): Deque<T>;
    poll(): {value: T | undefined, newQueue: Deque<T>};
    element(): T;
    peek(): T | undefined;
    addAll(c: Collection<T>): Deque<T>;
    push(e: T): Deque<T>;
    pop(): {value: T | undefined, newDeque: Deque<T>};
    remove(item: T): Deque<T>;
    has(item: T): boolean;
    size(): number;
    reversed(): Deque<T>;
}