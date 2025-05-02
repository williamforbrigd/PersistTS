import SequencedCollection from "../Interfaces/SequencedCollection";
import AbstractCollection from "./AbstractCollection";

export default abstract class AbstractSequentialCollection<T> 
                        extends AbstractCollection<T>
                        implements SequencedCollection<T> {

    abstract reversed(): SequencedCollection<T>;
    abstract addFirst(e: T): SequencedCollection<T>;
    abstract addLast(e: T): SequencedCollection<T>;
    abstract getFirst(): T | undefined;
    abstract getLast(): T | undefined;
    abstract removeFirst(): SequencedCollection<T>;
    abstract removeLast(): SequencedCollection<T>;

}