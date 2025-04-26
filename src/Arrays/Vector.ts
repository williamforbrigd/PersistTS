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
export default class Vector<T> {
    private constructor(
        private readonly _size: number,
        private readonly _shift: number,
        private readonly _root: Node<T>,
        private readonly _tail: T[],
    ) {}

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

    /**
     * Converts the vector to an array using the iterator method.
     */
    toArray(): T[] {
        return Array.from(this);
    }

}