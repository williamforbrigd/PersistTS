import Collection from './Collection';

export default interface SequencedCollection<T> extends Collection<T> {
    reversed(): SequencedCollection<T>;
    addFirst(e: T): SequencedCollection<T>;
    addLast(e: T): SequencedCollection<T>;
    getFirst(): T | undefined;
    getLast(): T | undefined;
    removeFirst(): SequencedCollection<T>;
    removeLast(): SequencedCollection<T>;
}