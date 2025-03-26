import List from "../Interfaces/List";
import AbstractCollection from "./AbstractCollection";
import SequencedCollection from "../Interfaces/SequencedCollection";
import { Comparator } from "../Interfaces/Comparator";
import Collection from "../Interfaces/Collection";
import { Speed } from "../Enums/Speed";

export default abstract class AbstractList<T> extends AbstractCollection<T> implements List<T> {
    [index: number]: T | undefined;

    FIFO(): boolean {
        return true;
    }

    isReadOnly(): boolean {
        return false;
    }

    abstract add(item: T): List<T>;
    abstract add(index: number, item: T): List<T>;
    abstract addAll(items: Iterable<T>): List<T>;
    abstract addAll(index: number, items: Iterable<T>): List<T>;

    abstract remove(item: T): List<T>;
    abstract remove(index: number): List<T>;

    abstract set(index: number, item: T): List<T>;

    abstract replaceAll(items: Iterable<T>): List<T>;

    copyTo(array: T[], arrayIndex: number): void {
       for (const item of this) {
            array[arrayIndex++] = item;
       }
    }

    indexOf(item: T): number {
        let i=0;
        for (const value of this) {
            if (value === item) {
                return i;
            }
            i++;
        }
        return -1;
    }

    lastIndexOf(item: T): number {
        let i=0;
        let index = -1;
        for (const value of this) {
            if (value === item) {
                index = i;
            }
            i++;
        }
        return index;
    }

    abstract reversed(): SequencedCollection<T>;

    abstract addFirst(e: T): SequencedCollection<T>;

    abstract addLast(e: T): SequencedCollection<T>;

    getFirst(): T | undefined {
        return this.get(0);
    }

    getLast(): T | undefined {
        return this.get(this.size() - 1);
    }

    abstract removeFirst(): SequencedCollection<T>;

    abstract removeLast(): SequencedCollection<T>;


    // HOFs only relevant to List
    abstract splice(start: number, deleteCount?: number): Collection<T>;
    abstract splice(start: number, deleteCount: number, ...items: T[]): Collection<T>;

    abstract slice(start?: number, end?: number): Collection<T>;

    abstract shift(): Collection<T>;
    abstract unshift(...items: T[]): Collection<T>;

    abstract indexingSpeed(): Speed;
    abstract hasSpeed(): Speed;
    abstract addSpeed(): Speed;
    abstract removeSpeed(): Speed;

}