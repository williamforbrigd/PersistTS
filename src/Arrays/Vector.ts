import AbstractList from "../AbstractClasses/AbstractList";
import { Speed } from "../Enums/Speed";
import HashCode from "../Hashing/HashCode";
import { Comparator } from "../Interfaces/Comparator";
import List, {ListInput} from "../Interfaces/List";
import Sorting from "../Sorting/Sorting";
import { Utils } from "../Utils/Utils";

const MASK = 0x1f; // 011111 = 0b11111 = 32 - 1
const SHIFT = 5; // log2(32) = 5
const BRANCHING = 1 << SHIFT; // 32

// Node interface
interface INode<T> {
    readonly array: (T | Node<T>)[];
}

// Leaf class
class Leaf<T> implements INode<T> {
    constructor(readonly array: T[]) {}
}

// Branch class
class Branch<T> implements INode<T> {
    constructor(readonly array: Node<T>[]) {}
} 

// Node can either be a Leaf or a Branch
type Node<T> = Leaf<T> | Branch<T>;

/**
 * Index of the first element that lives in the tail array.
 * @param count - number of elements in the vector 
 * @returns 
 */
function tailOffset(count: number): number {
    return count < BRANCHING ? 0 : ((count - 1) >>> SHIFT) << SHIFT;
}


/**
 * Returns a **5-bit slice** of the `index i` that begins at position `shift`.
 * 
 * In a hash-array-mapped-trie (HAMT) each level consumes 5-bits of the hash, because 2**5 = 32.
 * This is the maximum branching factor of 32 children.
 * level 0 to 5 where the rightmost bits are used for the root.
 * [00][00000][00000][00000][00000][00000][00000]
 *
 * When you want to obtain some bits corresponding to a level n. You obtain this number by first moving those bits
 * to the right until it is the right-most block (right shift). Then you null out the other bits (mask).
 *
 * `mask` isolates those 5 bits so that they can be used as an index into the node's child array.
 * 
 * @param i - index of the element to mask
 * @param shift How many bits to shift to the right before doing the masking.
 * @returns 
 */
function mask(i: number, shift: number): number {
    return (i >>> shift) & MASK;
}



/**
 * **Persistent Vector** - a fully immutable, bit-mapped vector trie (BVT) based on the vector implementation in Clojure.
 * 
 * It preserves structural sharing where most of the data can be re-used between updates.
 * 
 * **Complexity**:
 * Most operations are O(log_32(N)) where N is the number of elements in the vector.
 * Some operations are O(1) amortised, because they have to traverse less than log_32(N) nodes.
 * 
 * @see https://github.com/clojure/clojure/blob/master/src/jvm/clojure/lang/PersistentVector.java
 * @see https://blog.higher-order.net/2009/02/01/understanding-clojures-persistentvector-implementation
 */
export default class Vector<T> extends AbstractList<T>
    implements List<T> {

    private _hashCode: number | null = null;

    constructor(
        readonly _size: number,
        readonly _shift: number,
        readonly _root: Node<T>,
        readonly _tail: T[],
    ) {
        super();

        // Proxy to allow for array-like access
        return new Proxy(this, {
            get(target, prop) {
                if (typeof prop === "string") {
                    const index = Number(prop);
                    if (!isNaN(index)) return target.get(index); // calls the get() method
                }
                return (target as any)[prop]; // default property access
            }
        });
    }

    /**
     * Creates a new empty vector.
     * @returns A new empty vector.
     */
    static empty<T>(): Vector<T> {
        return new Vector(0, SHIFT, new Branch<T>([]), []);
    }

    /**
     * Creates a new vector with the given values.
     * @param values - values to be added to the vector
     * @returns a new vector with the values added.
     */
    static of<T>(...values: T[]): Vector<T> {
        let v = Vector.empty<T>();
        for (const e of values) v = v.push(e);
        return v;
    }

    /**
     * Iteration ove the vector.
     * Complexity: O(N)
     */
    *[Symbol.iterator](): IterableIterator<T> {
        for (let i = 0; i < this._size; i++) {
            yield this.get(i);
        }
    }

    size(): number { return this._size;}
    isEmpty(): boolean { return this._size === 0; }

    of(...values: T[]): Vector<T> {
        return Vector.of(...values);
    }

    empty(): List<T> {
        return Vector.empty<T>();
    }

    /**
     * Locate leaf array for index i.
     * @param i - index of the element to locate array for
     */
    private _tailArrayFor(i: number): T[] {
        if (i < 0 || i >= this._size) throw new RangeError(`Index ${i} out of bounds`);

        if (i >= tailOffset(this._size)) return this._tail;

        let node: Node<T> = this._root;
        for (let level = this._shift; level > 0; level -= SHIFT) {
            const idx = mask(i, level);
            node = (node as Branch<T>).array[idx];
        }
        return (node as Leaf<T>).array;
    }

    /**
     * Method to get the element at index i.
     * 
     * First locates the leaf array for the index i, then returns the element at that index.
     * 
     * Complexity: O(log_32(N)). This is because we have to walk one pointer per level until you hit the leaf that holds the element at index i.
     * 
     * @param i - index of the element to get
     * @returns the element at index i 
     */
    get(i: number): T {
        const leafArray = this._tailArrayFor(i);
        return leafArray[i & MASK];
    }

    /**
     * Method to set the element at index i.
     * 
     * Complexity: O(log_32(N)). Same as get() because we have to walk one pointer per level until you hit the leaf that holds the element at index i.
     * Also, we have to rebuild the nodes on the path with the `doSet()` method.
     * 
     * @param i - index of the element to set
     * @param value - value to set
     * @returns a new vector with the element at index i set to value
     */
    set(i: number, value: T): Vector<T> {
        if (i === this._size) return this.push(value);
        if (i < 0 || i >= this._size) throw new RangeError(`Index ${i} out of bounds`);

        if (i >= tailOffset(this._size)) {
            const newTail = [...this._tail];
            newTail[i & MASK] = value;
            return new Vector(this._size, this._shift, this._root, newTail);
        }

        const newRoot = this._doSet(this._shift, this._root, i, value);
        return new Vector(this._size, this._shift, newRoot, this._tail);
    }

    /**
     * Recursively rebuild the branch path that leads to the element at index i.
     * 
     * Algorithm works top-down:
     *      1. Clone the current node's `array` to avoid mutation.
     *      2. If we are at the leaf level (level === 0), overwrite the slot with the new value. 
     *         Otherwise, use `mask(i, level)` to find the child slot, and recurse one level deeper.
     *      3. Return a new `Branch` node with the updated array.
     * 
     * Complexity: O(log_32(N)). Only the nodes from the path from the root to the modified leaf are copied;
     * and everything else is shared with the original vector. It allocates one new node per level.
     *       
     * @param level - Current shift (multiple of 5) that encodes the depth in the trie.
     * @param node - Sub-trie node we are cloning at this level.
     * @param i - Index being updated.
     * @param value - New value to set at index i.
     * @returns - A fresh node that is the root of the updated subtree. 
     */
    private _doSet(level: number, node: Node<T>, i: number, value: T): Node<T> {
        const arr = [...node.array];
        if (level === 0) {
            arr[i & MASK] = value;
        } else {
            const idx = mask(i, level);
            arr[idx] = this._doSet(level - SHIFT, arr[idx] as Node<T>, i, value);
        }
        return new Branch(arr as Node<T>[]);
    }

    /**
     * Append a value to the end of the vector.
     * 
     * There are the following cases:
     * 
     * Fast path - tail insert.
     * If the current tail still has room (less than 32 elements), we can directly append to the tail.
     * 
     * Slow path - tail promotion.
     * When the tail is full, we need to promote it into the trie.
     * 1. Wrap the full tail in a leaf node.
     * 2. **If the root has room**, add the leaf into the existing trie.
     * 3. **If the root is full (overflow)**, allocate a fresh root one level higher.
     * 
     * Complexity: **amortised O(1)**. 
     * The slow path visits at most log_32(N) nodes, while the fast path is O(1).
     * 
     * @param value - value to be added to the vector
     * @returns a new vector with the value added.
     */
    push(value: T): Vector<T> {
        // Fast path: append directly to the tail because it is not full
        if (this._tail.length < BRANCHING) {
            const newTail = [...this._tail, value];
            return new Vector(this._size + 1, this._shift, this._root, newTail);
        }

        const tailLeaf = new Leaf(this._tail);
        let newShift = this._shift;
        let newRoot: Node<T>;

        const rootOverflow = (this._size >>> SHIFT) > (1 << this._shift);

        if (rootOverflow) {
            // creates a new root one level higher
            newRoot = new Branch([
                this._root,
                this._newPath(this._shift, tailLeaf)
            ]);
            newShift += SHIFT;
        } else {
            // push into existing trie
            newRoot = this._pushTail(this._shift, this._root, this._tail);
        }

        return new Vector(this._size + 1, newShift, newRoot, [value]);
    }

    /**
     * Helper for the `push` method to push the tail into the trie path that corresponds to
     * the index (size - 1) cloning only the nodes along the path for structural sharing.
     * 
     * Algorithm top-down:
     * 1. Compute the index of the child slot within the parent.
     * 2. Clone the parent node's array to avoid mutation.
     * 2. **Leaf level**: When the level is 0, store the leaf array.
     * 3. **Branch level**: 
     *      - if the child exists at index, call `_pushTail` 
     *      - if not, build a fresh path of nodes down to the leaf. 
     * 4. Return a new `Branch` node with the updated array.
     * 
     * Complexity: O(log_32(N)).
     * Each recursion step copies exactly one branch node. 
     * @param level - Current shift (multiple of 5) that encodes the depth in the trie.
     * @param parent - Branch node to clone at this level.
     * @param tailArr - The 32-element tail buffer. 
     * @returns - A new node that is the updated branch.
     */
    private _pushTail(level: number, parent: Node<T>, tailArr: T[]): Node<T> {
        const idx = mask(this._size - 1, level);
        const arr = [...(parent as Branch<T>).array];
        let node: Node<T>;

        if (level === SHIFT) {
            node = new Leaf(tailArr);
        } else {
            const child = arr[idx] as Node<T> | undefined;
            node = child 
                ? this._pushTail(level - SHIFT, child, tailArr)
                : this._newPath(level - SHIFT, new Leaf(tailArr));
        }
        arr[idx] = node;
        return new Branch(arr as Node<T>[]);
    }
    
    /**
     * Create a path of branch nodes to the level wrapping node.
     */
    private _newPath(level: number, node: Node<T>): Node<T> {
        let ret: Node<T> = node;
        while (level > 0) {
            ret = new Branch([ret]);
            level -= SHIFT;
        }
        return ret;
    }

    /**
     * Removes the last element from the Vector.
     * 
     * Some bases cases that checks the sizes of the vector.
     * 
     * **Fast path** - tail remove.
     * If the tail buffer has elements, we can just remove the last element from it
     * and return a new vector.
     * 
     * **Slow path** - tail collapse.
     * When the tail contains only one element, we need to:
     * 1. Get the tail array for the element before the last one (size - 2).
     * 2. Then we need to pop the last element and trim the branch path, cloning one node
     * per visited level.
     * 3. If the root now consits of a single child, collapse the height by one level.
     * 
     * Complexity: Amortised O(1).
     * The slow path visits at most log_32(N) nodes, while the fast path is O(1).
     * 
     * @returns A new vector with the last element removed.
     */
    pop(): Vector<T> {
        if (this._size === 0) throw new RangeError("Can't pop empty vector");
        if (this._size === 1) return Vector.empty<T>();

        // fast path
        if (this._tail.length > 1) {
            const newTail = this._tail.slice(0, -1);
            return new Vector(this._size - 1, this._shift, this._root, newTail);
        }

        // slow path
        const newTailArr = this._tailArrayFor(this._size - 2);
        const newRoot = this._popTail(this._shift, this._root);
        let newShift = this._shift;
        let root2 = newRoot as Branch<T>;

        if (newShift > SHIFT && root2.array.length === 1) {
            root2 = root2.array[0] as Branch<T>;
            newShift -= SHIFT;
        }

        return new Vector(this._size - 1, newShift, root2, newTailArr.slice());
    }

    /**
     * Trim the trie after a `pop`.
     * 
     * Walks down the branch that held the last leaf, cloning the nodes along the way,
     * and removes empty branches. 
     * 
     * Complexity: Amortised O(1).
     * This is because it touches less than log_32(N) nodes, and the rest of the tree is shared.
     * @param level - Current shift (multiple of 5).
     * @param node - Branch being cloned at this level.
     * @returns - Updated branch node.
     */
    private _popTail(level: number, node: Node<T>): Node<T> {
        const idx = mask(this._size - 2, level);
        if (level > SHIFT) {
            const child = (node as Branch<T>).array[idx] as Node<T>;
            const newChild = this._popTail(level - SHIFT, child);
            if ((newChild as Branch<T>).array.length === 0 && idx === 0) {
                return new Branch([]);
            }
            const arr = [...(node as Branch<T>).array];
            arr[idx] = newChild;
            return new Branch(arr as Node<T>[]);
        }
        // dropping last leaf
        if (idx === 0) return new Branch([]);
        return new Branch((node as Branch<T>).array.slice(0, idx) as Node<T>[]);
    }

    // Methods from the List interface

    /**
     * Adds an item to the end of the vector.
     * Same as the `push` method.
     */
    add(item: T): Vector<T>;
    add(index: number, item: T): Vector<T>;
    add(arg1: T | number, arg2?: T): Vector<T> {
        if (typeof arg1 === "number" && arg2 !== undefined) {
            return this.set(arg1, arg2 as T);
        } else {
            return this.push(arg1 as T);
        }
    }

    /**
     * Add all the items to the Vector
     * 
     * Need to check if the calling instance is a VectorSlice or not.
     * Then we slice all the items to the left and to the right of the index, excluding the index itself. 
     * 
     * @param items - to be added
     * @param index - optional parameter which is where to add the items from.
     * @returns - Vector with the items added. 
     */
    addAll(items: Iterable<T>, index?: number): Vector<T> {
        const elems = Array.from(items);
        if (elems.length === 0) return this;

        const insertAt = index === undefined ? this._size : index;

        const makeBase = (v: Vector<T>): Vector<T> =>
            v instanceof (VectorView) ? Vector.of(...v) : v;

        const left = this.slice(0, insertAt);
        let res = makeBase(left);

        for (const e of elems) res = res.push(e);

        const right = this.slice(insertAt);
        for (const e of right) res = res.push(e);

        return res;
    }


    /**
     * Removes the elemen at the given index.
     * 
     * First checks if the index is valid.
     * 
     * Then it calls the `slice` method to get the left view of the vector and the right view of the vector.
     * This excludes the element at the index.
     * 
     * Then it calls the `addAll` method to create a new vector with the left and right views.
     * 
     * @param index - index of the element to be removed
     * @returns A new vector with the element at index removed.
     */
    remove(index: number) {
        if (index < 0 || index >= this._size) throw new RangeError(`Index ${index} is out of range`);

        if (index === this._size - 1) return this.pop();

        const left = this.slice(0, index);
        const right = this.slice(index + 1);
        return (left as Vector<T>).addAll(right);
    }

    /**
     * Removes the item from the vector.
     * 
     * First gets the index of the item.
     * If the index is -1, it means the item is not in the vector.
     * If the item is in the vector, then it calls the `remove` method to remove the item.
     * 
     * @param item - item to be removed from the vector
     * @returns a new vector with the item removed. 
     */
    removeItem(item: T): Vector<T> {
        return super.removeItem(item) as Vector<T>;
    }

    /**
     * Removes all the items from the vector.
     * 
     * If an item appears more times in the vector, all the instances will be removed.
     * 
     * @param c - collection of items to be removed from the vector
     * @returns A new vector with the items removed.
     */
    removeAll(c: Iterable<T>): Vector<T> {
        const toRemove = new Set(c);
        if (toRemove.size === 0) return this;

        let res = Vector.empty<T>();
        let changed = false;
        for (const value of this) {
            if (toRemove.has(value)) {
                changed = true;
                continue;
            }
            res = res.push(value);
        }
        return changed ? res : this;
    }

    /**
     * Empties the vector and adds all the items to it.
     * @param items - items to be added to the vector
     * @returns A new vector with the items added.
     */
    replaceAll(items: Iterable<T>): Vector<T> {
        return Vector.empty<T>().addAll(items);
    }

    /**
     * Copies the vector to the given array.
     * @param array - array to copy the elements to
     * @param arrayIndex 
     */
    copyTo(array: T[], arrayIndex: number): void {
        if (arrayIndex < 0 || arrayIndex > array.length) {
            throw new RangeError(`arrayIndex ${arrayIndex} out of bounds`);
        }
        if (arrayIndex + this._size > array.length) {
            throw new RangeError("Destination array is not large enough to accommodate all elements");
        }
        for (let i = 0; i < this._size; i++) {
            array[arrayIndex + i] = this.get(i);
        }
    }
    /**
     * Get the index of the item in the vector.
     * @param item - item to be searched in the vector
     * @returns the index of the item in the vector or -1 if not found.
     */
    indexOf(item: T): number {
        for (let i = 0; i < this._size; i++) {
            if (this.get(i) === item) return i;
        }
        return -1;
    }
    /**
     * Get the last index of the item in the vector.
     * @param item - item to be searched in the vector
     * @returns the last index of the item in the vector or -1 if not found.
     */
    lastIndexOf(item: T): number {
        for (let i = this._size - 1; i >= 0; i--) {
            if (this.get(i) === item) return i;
        }
        return -1;
    }

    // methods from the SequencedCollection interface
    /**
     * Reverse the vector.
     * @returns a new vector with the elements in reverse order.
     */
    reversed(): Vector<T> {
        const arr = this.toArray().reverse();
        return Vector.of(...arr);
    }
    /**
     * Adds an element to the beginning of the vector.
     * @param e - element to be added to the vector
     * @returns a new vector with the element added to the beginning.
     */
    addFirst(e: T): Vector<T> {
        return this.addAll([e], 0);
    }
    /**
     * Adds element to the end of the vector.
     * @param e - element to be added to the end of the vector
     * @returns a new vector with the element added to the end.
     */
    addLast(e: T): Vector<T> {
        return this.addAll([e], this._size);
    }
    /**
     * Get the first element of the vector.
     */
    getFirst(): T | undefined {
        return super.getFirst();
    }
    /**
     * Get the last element of the vector.
     */
    getLast(): T | undefined {
        return super.getLast();
    }
    /**
     * Removes the first element of the vector.
     */
    removeFirst(): Vector<T> {
        if (this._size === 0) throw new RangeError("Can't remove first element from empty vector");
        return this.remove(0);
    }
    /**
     * Removes the last element of the vector.
     */
    removeLast(): Vector<T> {
        if (this._size === 0) throw new RangeError("Can't remove last element from empty vector");
        return this.pop();
    }

    // Speed
    indexingSpeed(): Speed {
        return Speed.Log;
    }
    hasSpeed(): Speed {
        return Speed.Log;
    }
    addSpeed(): Speed {
        return Speed.Constant;
    }
    removeSpeed(): Speed {
        return Speed.Log;
    }

    // Methods from Collection.ts
    /**
     * Checks if the vector has a given element
     * @param o - element to be checked
     * @returns true if the element is in the vector, false otherwise.
     */
    has(o: T): boolean {
        for (const value of this) {
            if (Utils.equals(value, o)) return true;
        }
        return false;
    }

    /**
     * Checks if the vector has all the elemnts of the iterable.
     * @param c - iterable to be checked
     * @returns true if the vector has all the elements of the iterable, false otherwise.
     */
    hasAll(c: Iterable<T>): boolean {
        for (const value of c) {
            if (!this.has(value)) return false;
        }
        return true;
    }

    /**
     * Removes all the elements that pass the filter.
     * @param filter - function to filter the elements of the vector
     * @returns a new vector with the elements that pass the filter.
     */
    removeIf(filter: (item: T) => boolean): Vector<T> {
        return super.removeIf(filter) as Vector<T>; 
    }

    /**
     * 
     * @param c - iterable to be retained
     * @returns a new vector with the elements that are in the iterable.
     */
    retainAll(c: Iterable<T>): Vector<T> {
        const retainSet = new Set(c);
        const arr = this.toArray();
        const kept = [];
        for (let i = 0; i < arr.length; ++i) {
            if (retainSet.has(arr[i])) {
                kept.push(arr[i]);
            }
        }
        return Vector.of(...kept);
    }

    /**
     * Return an empty instance of the vector.
     */
    clear(): Vector<T> {
        return Vector.empty<T>();
    }

    /**
     * Checks if the vector is equal to another object.
     * 
     * First checks the references of the objects.
     * Then checks if the object is an instance of the vector.
     * Then checks if the size of the vector is equal to the size of the object.
     * 
     * Lastly, it checks if all the elements of the vector are equal to the elements of the object.
     * 
     * @param o - object to be compared
     * @returns true if the object is equal to the vector, false otherwise.
     */
    equals(o: Object): boolean {
        if (this === o) return true;
        if (!(o instanceof Vector)) return false;

        if (this._size !== o._size) return false;

        const vec = o as Vector<T>;
        for (let i = 0; i < this._size; i++) {
            if (!Utils.equals(this.get(i), vec.get(i))) return false;
        }
        return true;
    }

    /**
     * Computes the hash code of the vector.
     * 
     * The hash code is lazily computer and cached. 
     * 
     * It is computed by summing the hash codes of all the elements in the vector.
     * 
     * @returns a hash code for the vector.
     */
    hashCode(): number {
        if (this._hashCode === null) {
            let hash = 0;
            for (const value of this) {
                hash += HashCode.hashCode(value);
            }
            this._hashCode = hash;
        }
        return this._hashCode;
    }


    // HOFs
    /**
     * Returns a new vector with the section removed and optional items inserted, without modifying the original vector.
     * 
     * @param start - index to start from. Negative index starts from the end.
     * @param deleteCount - how many elements to delete from the given start index. Negative values are treated as 0. Values
     * exceeding the size of the vector are clamped.
     * @param items - optional items to be added to the vector
     */
    splice(start: number, deleteCount?: number): Vector<T>;
    splice(start: number, deleteCount: number, ...items: T[]): Vector<T>;
    splice(start: number, deleteCount?: number, ...items: T[]): Vector<T> {
        const size = this._size;
        let actualStart = start < 0 ? size + start : start;
        if (actualStart < 0 || actualStart > size) {
            throw new RangeError(`Index (${start}, ${deleteCount}) out of bounds`);
        }
        const dc = deleteCount === undefined
            ? size - actualStart
            : Math.min(Math.max(deleteCount, 0), size - actualStart);

        const left = this.slice(0, actualStart);
        let res = left;
        if (items.length > 0) {
            res = res.addAll(items);
        }
        const right = this.slice(actualStart + dc);
        return res.addAll(right);
    }

    /**
     * Returns a new vector containing the elements from the start index (inclusive) to the end index (exclusive).
     * 
     * Returns a new VectorView of the original vector that contains an offset from the start of the original vector.
     * It also contains the length of the new vector.
     * 
     * @param start - start index (inclusive). Negative index starts from the end.
     * @param end - end index (exclusive). Negative index starts from the end.
     * @returns - A new vector with the selected items.
     */
    slice(start: number = 0, end: number = this._size): Vector<T> {
        if (start < 0) start = this._size + start;
        if (end < 0) end = this._size + end;

        if (start < 0 || end > this._size || start > end) {
            throw new RangeError(`slice(${start}, ${end}) out of bounds`);
        }

        const len = end - start;
        if (len === 0) return Vector.empty<T>();
        if (len === this._size) return this;

        if (this instanceof VectorView) {
            return new VectorView(
                (this as any)._vector,
                (this as any)._offset + start,
                len
            );
        }
        return new VectorView(this, start, len);
    }

    /**
     * Removes the first element of the vector.
     */
    shift(): Vector<T> {
        return this.removeFirst();
    }
    /**
     * Prepend the given items to the vector.
     * @param items
     */
    unshift(...items: T[]): Vector<T> {
        return this.addAll(items, 0);
    }

    /**
     * Concat the vector with the given values or collections.
     * @param valuesOrCollections - values or collections to be concatenated
     * @returns A new vector with the values or collections concatenated.
     */
    concat<C extends T>(...valuesOrCollections: Array<Iterable<C> | C>): Vector<T | C> {
        return super.concat(...valuesOrCollections) as Vector<T | C>;
    }

    /**
     * Merges the vector with the given collections.
     * 
     * @param collections - collections to be merged
     * @returns A new vector with the collections merged.
     */
    merge<C extends T>(...collections: Array<Iterable<C>>): Vector<T | C> {
        return super.merge(...collections) as Vector<T | C>;
    }

    /**
     * Traverses the vector and applies the given function to each element.
     * @param mapper - function to map the elements of the vector
     * @param thisArg - context for the mapper function
     */
    map<M>(
        mapper: (value: T, key: number, collection: this) => M,
        thisArg?: any
    ): Vector<M> {
        return super.map(mapper, thisArg) as Vector<M>;
    }

    /**
     * Applies the mapper function to each element of the vector and flattens the result.
     * @param mapper - function to map the elements of the vector
     * @param thisArg - context for the mapper function
     */
    flatMap<M>(
        mapper: (value: T, key: number, iter: this) => Iterable<M>,
        thisArg?: any
    ): Vector<M> {
        return super.flatMap(mapper, thisArg) as Vector<M>;
    }

    /**
     * Filters the vector and returns a new vector with the elements that pass the filter.
     * @param predicate - function to filter the elements of the vector
     * @param thisArg - context for the predicate function
     */
    filter<F extends T>(
        predicate: (value: T, index: number, iter: this) => value is F,
        thisArg?: any
    ): Vector<F>;
    filter(
        predicate: (value: T, index: number, iter: this) => unknown,
        thisArg?: any
    ): this;
    filter(predicate: any, thisArg?: any): any {
        return super.filter(predicate, thisArg) as any;
    }

    /**
     * Partitions the vector into true vector if they satisfy the predicate.
     * The rest of the elements will go into the false vector. 
     * @param predicate - To apply to the vectors.
     * @param thisArg - context for the predicate function.
     */
    partition<F extends T, C>(
        predicate: (this: C, value: T, index: number, iter: this) => value is F,
        thisArg?: C
    ): [Vector<T>, Vector<F>];
    partition<C>(
        predicate: (this: C, value: T, index: number, iter: this) => unknown,
        thisArg?: C
    ): [this, this];
    partition<C>(predicate: (this: C, value: T, index: number, iter: this) => unknown, thisArg?: any): any {
        return super.partition(predicate, thisArg) as any;
    }

    /**
     * Combines elements of this collection with one or more iterables into tuples, 
     * stopping when the shortest input is exhausted.
     * @param other - other collections to combine with
     */
    zip<U>(other: ListInput<U>): Vector<[T, U]>;
    zip<U, V>(
        other: ListInput<U>,
        other2: ListInput<V>
    ): Vector<[T, U, V]>;
    zip(...collections: Array<ListInput<unknown>>): Vector<unknown>;
    zip<U, V>(...other: (ListInput<U> | ListInput<unknown> | ListInput<V>)[]): Vector<unknown> {
        return super.zip(...other) as Vector<unknown>;
    }

    /**
     * Combines elements of this collection with one or more iterables into tuples, 
     * continuing until the longest input is exhausted.
     * @param other - other collections to combine with
     */
    zipAll<U>(other: ListInput<U>): Vector<[T, U]>;
    zipAll<U, V>(
        other: ListInput<U>,
        other2: ListInput<V>
    ): Vector<[T, U, V]>;
    zipAll(...collections: Array<ListInput<unknown>>): Vector<unknown>;
    zipAll<U, V>(...other: (ListInput<U> | ListInput<unknown> | ListInput<V>)[]): Vector<unknown> {
        return super.zipAll(...other) as Vector<unknown>;
    }

    /**
     * Combines elements of this collection with one or more iterables by applying a zipper function
     * to the elements.
     * @param zipper - Function that takes one element from this collection and one from other collections
     * to produce a result value.
     * @param collections - Collections to zip with.
     */
    zipWith<U, Z>(
        zipper: (value: T, otherValue: U) => Z,
        otherCollection: ListInput<U>
    ): Vector<Z>;
    zipWith<U, V, Z>(
        zipper: (value: T, otherValue: U, thirdValue: V) => Z,
        otherCollection: ListInput<U>,
        thirdCollection: ListInput<V>
    ): Vector<Z>;
    zipWith<Z>(
        zipper: (...values: Array<unknown>) => Z,
        ...collections: Array<ListInput<unknown>>
    ): Vector<Z>;
    zipWith<U, V, Z>(
        zipper: any,
        ...otherCollection: (ListInput<U> | ListInput<unknown> | ListInput<V>)[]
    ): Vector<Z> {
        return super.zipWith(zipper, ...otherCollection) as Vector<Z>;
    }

    /**
     * Returns a new vector with only unique elements.
     */
    distinct(): Vector<T> {
        return super.distinct() as Vector<T>;
    }

    /**
     * Concatenates the collection into a string
     * @param separator - separator to join the elements of the vector
     */
    join(separator?: string): string {
        return super.join(separator);
    }

    /**
     * Checks that every element in the vector passes the callback function.
     * @param callback - function to test each element
     * @param thisArg - context for the callback function
     */
    every<S extends T>(
        callback: (value: T, index: number, collection: this) => value is S,
        thisArg?: any
    ): this is Vector<S>;
    every(callback: (value: T, index: number, collection: this) => unknown, thisArg?: any): boolean;
    every(predicate: any, thisArg?: any): any {
        return super.every(predicate, thisArg) as any;
    }

    /**
     * Check that some element in the vector passes the callback function.
     * @param callback - function to test each element
     * @param thisArg - context for the callback function
     */
    some(callback: (value: T, index: number, collection: this) => unknown, thisArg?: any): boolean {
        return super.some(callback, thisArg) as boolean;
    }

    /**
     * Sorts the vector using the given comparator function.
     * @param compareFn - function to compare the elements of the vector
     * @returns a new vector with the elements sorted.
     */
    sort(compare: Comparator<T>): Vector<T> {
        const mutableArray = this.toArray();
        Sorting.timSort(mutableArray, compare);
        // return Vector.of(...mutableArray);
        return Vector.empty<T>().addAll(mutableArray);
        // return super.sort(compare) as Vector<T>;
    }

    /**
     * Sorts the vector by the given key selector and comparator function.
     * 
     * Sorts using the Timsort algorithm.
     * 
     * @param keySelector - function to select the key to sort by
     * @param compareFn - function to compare the keys
     * @returns A new vector with the elements sorted by the key.
     */
    sortBy<U>(
        keySelector: (value: T) => U,
        compareFn?: (a: U, b: U) => number
    ): Vector<T> {
        return super.sortBy(keySelector, compareFn) as Vector<T>;
    }

    /**
     * Applies the given function to each element of the vector.
     * @param callback - function to apply to each element
     * @param thisArg - context for the callback function
     */
    forEach(callback: (value: T, index: number, collection: this) => void, thisArg?: any): void {
        super.forEach(callback, thisArg) as void;
    }

    /**
     * Finds the first element that satisfies the predicate function.
     * @param predicate - function to test each element
     * @param thisArg - context for the predicate function
     */
    find(predicate: (value: T, index: number, collection: this) => boolean, thisArg?: any): T | undefined {
        return super.find(predicate, thisArg) as T | undefined;
    }

    /**
     * Accumulates the values of the vector using the given callback function.
     * @param callback - function to accumulate the values
     */
    reduce(callback: (previousValue: T, currentValue: T, currentIndex: number, collection: this) => T): T;
    reduce<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, collection: this) => U, initialValue: U): U;
    reduce(callback: any, initialValue?: any): any {
        return super.reduce(callback, initialValue) as any;
    }

    /**
     * Accumulates the values in the collection using the provided callback function, starting from the end.
     * @param callback - The function to apply to each element.
     */
    reduceRight(callback: (previousValue: T, currentValue: T, currentIndex: number, collection: this) => T): T;
    reduceRight(callback: (previousValue: T, currentValue: T, currentIndex: number, collection: this) => T, initialValue: T): T;
    reduceRight<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, collection: this) => U, initialValue: U): U;
    reduceRight(callback: any, initialValue?: any): any {
        return super.reduceRight(callback, initialValue) as any;
    }

    /**
     * Converts the vector to an array using the iterator method.
     */
    toArray(): T[] {
        return Array.from(this);
    }

}


/**
 * Represents an immutable view of a contiguous slice of another Vector.
 * Shares the underlying data structure and avoid copying data for efficient slicing.
 * 
 * Has an `_offset` to the original vector and a `_size` to represent the size of the slice.
 */
class VectorView<T> extends Vector<T> {
    constructor(
        private readonly _vector: Vector<T>,
        private readonly _offset: number, 
        readonly _size: number,
    ) {
        super(_size, _vector._shift, _vector._root, _vector._tail);
    }

    size(): number { return this._size; }
    isEmpty(): boolean { return this.size() === 0; }

    override get(i: number): T {
        if (i < 0 || i >= this._size)
            throw new RangeError(`Index ${i} out of bounds`);
        return this._vector.get(this._offset + i);
    }

    override set(i: number, value: T): Vector<T> {
        if (i < 0 || i >= this._size) throw new RangeError(`Index ${i} out of bounds`);
        return this._vector.set(this._offset + i, value)
                            .slice(this._offset, this._offset + this._size) as Vector<T>;
    }

    override slice(start: number = 0, end: number = this._size): Vector<T> {
        return this._vector.slice(this._offset + start, this._offset + end);
    }
}