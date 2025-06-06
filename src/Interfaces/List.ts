import { Speed } from "../Enums/Speed";
import Collection from "./Collection";
import SequencedCollection from "./SequencedCollection";

/**
 * This represents an indexed collection of elements, supporting ordered access and modification.
 * Any modification will return a new instance of the list.
 * 
 * Elements can be accessed, inserted, and removed by index. 
 */
interface List<T> extends SequencedCollection<T>  {
    [index: number]: T | undefined; // this is the get method
    get(index: number): T | undefined;
    set(index: number, item: T): List<T>;
    pop(): List<T>;

    // add
    add(item: T): List<T>;
    add(index: number, item: T): List<T>;
    addAll(items: Iterable<T>): List<T>;
    addAll(items: Iterable<T>, index?: number): List<T>;

    // remove
    // remove(item: T): List<T>;
    // remove(index: number): List<T>;
    remove(index: number): List<T>;
    removeItem(item: T): List<T>;

    replaceAll(items: Iterable<T>): List<T>;
    copyTo(array: T[], arrayIndex: number): void;
    indexOf(item: T): number;
    lastIndexOf(item: T): number;

    // HOFs only relevant to List
    splice(start: number, deleteCount?: number): Collection<T>;
    splice(start: number, deleteCount: number, ...items: T[]): Collection<T>;
    slice(start?: number, end?: number): Collection<T>;

    shift(): List<T>;
    unshift(...items: T[]): List<T>;

    // Speed
    indexingSpeed(): Speed;
    hasSpeed(): Speed;
    addSpeed(): Speed;
    removeSpeed(): Speed;

    // List view methods and fields
    /*
    add(pointer: List<T>, item: T): List<T>; // insert item at end of compatible view
    view(start: number, count: number): List<T> | undefined;
    viewOf(item: T): List<T> | undefined;
    lastViewOf(item: T): List<T> | undefined;
    underlying: List<T> | undefined; // undefined if this list is not a view
    offset: number; // offset for this list view or 0 for an underlying list
     */
}

// export interface ListConstructor {
//     new (arrayLength?: number): List<any>;
//     new <T>(arrayLength: number): List<T>;
//     new <T>(items?: Iterable<T>): List<T>;
//     (arrayLength?: number): List<any>;
//     <T>(arrayLength: number): List<T>;
//     <T>(items?: Iterable<T>): List<T>;
//     isList(arg: any): arg is List<any>;
//     readonly prototype: any[];

//     of<T>(...items: T[]): List<T>;
//     from<T>(items: Iterable<T>): List<T>;
// }

// declare const List: ListConstructor;

/**
 * General input type used for many of the higher-order functions.
 * This was we can for instance `merge` and ArrayList with a LinkedList.
 */
export type ListInput<T> = T[] | Array<T> | Collection<T> | List<T>;

//function List<T>(collection?: Iterable<T> | ArrayLike<T>): List<T>;


export default List;