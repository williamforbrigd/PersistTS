const BRANCHING = 32; // 2^5
const SHIFT = 5; // because 2^5 = 32
const MASK = BRANCHING - 1; // 0x01f = 31


/**
 * Interface to represent a leaf node within the persistent vector.
 */
interface Leaf<T> {
    values: T[];
}


/**
 * Interface to represent a branch node within the persistent vector.
 */
interface Branch<T> {
    children: (Node<T> | null)[];
}

/**
 * Node can either be a leaf or a branch.
 */
type Node<T> = Leaf<T> | Branch<T>;

/**
 * Method to return an empty leaf.
 * @returns an empty leaf
 */
function newLeaf<T>(): Leaf<T> {
    return {values: new Array(BRANCHING).fill(null)}
}

/**
 * Method to return an empty branch
 * @returns an empty branch
 */
function newBranch<T>(): Branch<T> {
    return {children: new Array(BRANCHING).fill(null)}
}

/**
 * Checks whether a node is a leaf node.
 * @param node to check whether leaf or not
 * @returns true if the node is a leaf or false otherwise.
 */
function isLeaf<T>(node: Node<T>): node is Leaf<T> {
    return 'values' in node;
}

/**
 * Copies the elements of a node.
 * @param node to be copied
 * @returns a new node with the elements copied
 */
function copyNode<T>(node: Node<T>): Node<T> {
    if (isLeaf(node)) {
        return { values: [...node.values] };
    } else {
        return { children: [...node.children] };
    }
}

/**
 * Checks whether the size of the persistent vector fills a complete tree level.
 * 
 * The persistent's vector underlying tree is built in levels (or tries).
 * It starts from the SHIFT (5) and increments with SHIFT up to 32. When the current size equals the threshold of 
 * 1 << i (left shifting with the i), it means that the tree is full.
 * 
 * @param size to check for.
 * @returns true if the size matches one of the fully capacity thresholds, false otherwise. 
 */
function isFull(size: number) {
    for (let i=SHIFT; i < 32; i+=SHIFT) {
        if (size === (1 << i)) return true;
    }
    return false;
}


export default class PersistentVector<T> {
    private constructor(
        private readonly _size: number,
        private readonly _shift: number,
        private readonly _root: Node<T>,
    ) {
    }

    /**
     * Returna an empty vector
     * @returns an empty vector
     */
    public static empty<T>(): PersistentVector<T> {
        return new PersistentVector<T>(0, 0, {
            values: []
        });
    }


    /**
     * Static method to initialize a vector of the given elements.
     * @param elements to create the persistent vector from.
     * @returns a new persistent vector with the given elements. 
     */
    public static of<T>(...elements: T[]): PersistentVector<T> {
        let vec = PersistentVector.empty<T>();
        for (const elem of elements) {
            vec = vec.add(elem);
        }
        return vec;
    }

    /**
     * Return the size of the persistent vector.
     * @returns the size of the persistent vector.
     */
    size(): number {
        return this._size;
    }

    /**
     * Retrieves the element at a specified index from the persistent vector
     * 
     * It traverses the underlyng tree structure (or trie) where each level is indexed using bitwise operations. Each level uses a fixed 
     * branching factor defined by SHIFT and MASK.
     * 
     * If the index is negative or above the size, it will return undefined.
     * 
     * In the for loop, it extracts the appropriate child index (or subtree index) by performing a right shift on the index
     * to find the bits relevant to the current level. Then it applies a mask to extract the specific child index to follow at that level (bitwise and).
     * 
     * One the traversal accesses a leaf node (level 0), then the method gets the element using a remainder of the index. 
     * 
     * * Complexity O(log_32(n))
     * 
     * @param index to find the element at.
     * @returns the value at the specified index or undefined if the index is not in then persistent vector.
     */
    get(index: number): T | undefined {
        if (index < 0 || index >= this._size) return undefined;
        let node = this._root;
        for (let level = this._shift; level > 0; level -= SHIFT) {
            const idx = (index >>> level) & MASK;
            node = (node as Branch<T>).children[idx] as Node<T>;
        }
        return (node as Leaf<T>).values[index & MASK];
    }



    /**
     * Returns a new vector with the value added to the end of the vector.
     * 
     * Checks first if the vector is full. If that is the case, then it adds a new branch node with the root as its first children.
     * Otherwise it copies the node to ensure immutability. 
     * 
     * Then it traverses from the root down each level to the leaf. It checks whether the child exists using bitwise shift and AND. 
     * If it exists, then it is copied to ensure immutability, or otherwise it is created a new leaf or branch (based on the level).
     * 
     * Finally, once the traversal reaches a leaf node, it is inserted.
     * 
     * Complexity O(log_32(n))
     * 
     * @param value 
     * @returns 
     */
    add(value: T): PersistentVector<T> {
        let newShift = this._shift;
        let newRoot : Node<T>;

        // if the current tree is full, we must create a new root
        if (isFull(this._size)) {
            newRoot = newBranch<T>();
            (newRoot as Branch<T>).children[0] = this._root;
            newShift += SHIFT;
        } else {
            newRoot = copyNode(this._root);
        }

        let node = newRoot;
        let idx = this._size;

        for (let level=newShift; level > 0; level-=SHIFT) {
            const branch = node as Branch<T>;
            const childIndex = (idx >>> level) & MASK;
            let child = branch.children[childIndex];
            if (child !== null) {
                // copy the existing child node for persistence
                child = copyNode(child);
            } else {
                child = level === SHIFT ? newLeaf<T>() : newBranch<T>();
            }
            branch.children[childIndex] = child;
            node = child;
        }
        // node as leaf, insert the new element
        (node as Leaf<T>).values[idx & MASK] = value;
        return new PersistentVector<T>(this._size + 1, newShift, newRoot);
    }

    /**
     * Set the value at at specified index
     * 
     * If the index is negative or above the size of the vector, the original vector is returned.
     * 
     * In the for loop, it traverses each level and clones each node along the path to the leaf node. 
     * 
     * Once the target is reached, it updates it to the appropriate position. 
     * 
     * Complexity O(log_32(n))
     * 
     * @param index the index to set the value at
     * @param value the value to be est
     * @returns a new persistent vector with the value set at the specified index
     */
    set(index: number, value: T): PersistentVector<T> {
        if (index < 0 || index >= this._size) return this;
        const newRoot = copyNode(this._root);
        let node = newRoot;
        // go down the tree and clone each node down the path
        for (let level = this._shift; level > 0; level -= SHIFT) {
            const branch = node as Branch<T>;
            const childIndex = (index >>> level) & MASK;
            // Clone the child node
            const child = copyNode(branch.children[childIndex] as Node<T>);
            branch.children[childIndex] = child;
            node = child;
        }
        // At the leaf, update the value
        (node as Leaf<T>).values[index & MASK] = value;
        return new PersistentVector<T>(this._size, this._shift, newRoot);
    }

    /**
     * Remove the last element from the vector returning a new vector with the last element removed.
     * 
     * If the vector is empty, return itself.
     * 
     * The method calls the helper function _popNode(...) to recursively traverse the tree and update nodes along the
     * path to the last element. This method only clones the necessary nodes.
     * 
     * After the removal, it checks whether the height of the tree can be reduced. 
     * That is if the removed node is a branch where the 2nd child is null.
     * 
     * @returns a new vector with the last element removed, or itself if empty.
     */
    pop(): PersistentVector<T> {
        if (this._size === 0) return this;
        // if (this._root.leaf) return new PersistentVector(this._size - 1, this._shift, this._root);

        let newRoot = this._popNode(this._root, this._shift, this._size - 1) as Node<T>;

        let newShift = this._shift;
        // If after popping, the tree shrinks in height, adjust the root
        // while (newShift > SHIFT && !newRoot.leaf) {
        while (newShift > SHIFT) {
            const branch = newRoot as Branch<T>;
            // if the only child exists in the 0 index
            if (branch.children[1] === null) {
                newRoot = branch.children[0] as Node<T>;
                newShift -= SHIFT;
            } else {
                break;
            }
        }
        return new PersistentVector(this._size - 1, newShift, newRoot);
    }

    /**
     * Helper function to remove the element at given index from the given subtree.
     * Returns a new subtree (or null if empty).
     * 
     * If the recursion reaches a leaf node (level 0), the leaf node is returned unchanged, becuase pop does not remove leaf contents
     * immediately.
     * 
     * When the recursive call returns, it checks that the child is empty (null) and that the child index is 0. In the case,
     * the branch has no remaining elements, and the function returns null. 
     * 
     * Otherwise, the branch node is copied, and the corresponding child is updated, and the copied branch node is returned. 
     * 
     * @param node The current node (branch or leaf) from which the element should be removed
     * @param level The current level in the tree (in multiples of SHIFT). A level of 0 indicates a leaf node.
     * @param index The index of the element to be removed from the vector.
     * @returns A new node with the element removed, or null if the subtree is empty. 
     */
    private _popNode(node: Node<T>, level: number, index: number): Node<T> | null {
        // we are at a leaf node
        if (level === 0) return node;
        
        const branch = node as Branch<T>;
        const childIndex = (index >>> level) & MASK;
        // recursively pop the other level
        const child = this._popNode(branch.children[childIndex] as Node<T>, level - SHIFT, index);
        if (child === null && childIndex === 0) {
            return null as any;
        } else {
            // otherwise copy the branch and update the corresponding child
            const newBranch = copyNode(branch) as Branch<T>;
            newBranch.children[childIndex] = child;
            return newBranch;
        }
    }

    /**
     * Method to print the contents of the vector
     */
    public printContents(): void {
        console.log("PersistentVector contents:");
        for (let i = 0; i < this._size; i++) {
            console.log(`[${i}] = ${this.get(i)}`);
        }
    }
}