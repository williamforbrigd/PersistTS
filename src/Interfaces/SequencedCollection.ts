import Collection from './Collection';

/**
 * An ordered extension of the Collection interface.
 * It supports head- and tail-oriented operations.
 */
export default interface SequencedCollection<T> extends Collection<T> {
    reversed(): SequencedCollection<T>;
    addFirst(e: T): SequencedCollection<T>;
    addLast(e: T): SequencedCollection<T>;
    getFirst(): T | undefined;
    getLast(): T | undefined;
    removeFirst(): SequencedCollection<T>;
    removeLast(): SequencedCollection<T>;
}