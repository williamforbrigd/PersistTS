import SequencedCollection from "../Interfaces/SequencedCollection";
import AbstractCollection from "./AbstractCollection";

export default abstract class AbstractSequencedCollection<T> 
                        extends AbstractCollection<T>
                        implements SequencedCollection<T> {

    abstract reversed(): SequencedCollection<T>;
    abstract addFirst(e: T): SequencedCollection<T>;
    abstract addLast(e: T): SequencedCollection<T>;
    /**
     * Get the item at the given index.
     * @returns - the first item in the list, or undefined if the list is empty
     */
    getFirst(): T | undefined {
        return this.get(0);
    }
    /**
     * Get the last item in the list.
     * @returns - the last item in the list, or undefined if the list is empty
     */
    getLast(): T | undefined {
        return this.get(this.size() - 1);
    }
    abstract removeFirst(): SequencedCollection<T>;
    abstract removeLast(): SequencedCollection<T>;

}