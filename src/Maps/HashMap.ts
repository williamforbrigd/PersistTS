import HashCode from "../Hashing/HashCode";
import {Utils, createRandomIntArray, shuffleArray} from "../Utils/Utils";
import AbstractMap from "../AbstractClasses/AbstractMap";


const SK5 = 0x55555555, SK3 = 0x33333333;
const SKF0=0xF0F0F0F,SKFF=0xFF00FF;

/**
 * Counts the number of set bits (Hamming weight) in a 32‑bit integer.
 * Implementation taken from "Hacker's Delight".
 */
function popcount(x: number): number {
    x = x - ((x >>> 1) & SK5);
    x = (x & SK3) + ((x >>> 2) & SK3);
    return (((x + (x >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24;
}

/**
 * CTPOP (count population) is available on most modern computer architectures.
 * It counts the selected bits (number of 1's) in a bit map.
 *
 * @param map The map to count the bits from
 *
 * @see Phil Bagwell, "Ideal Hash Trees", EPFL, 2000.
 */
export function ctpop(map: number): number {
    map -= ((map >>> 1) & SK5);
    map = (map & SK3) + ((map >>> 2) & SK3);
    map = (map & SKF0) + ((map >>> 4) & SKF0);
    map += map >>> 8;
    return (map + (map >>> 16)) & 0x3F;
}

/**
 * Returns the **5-bit slice** of `hash` that begins at position `shift`.
 *
 * In a hash-array-mapped-trie (HAMT) each level consumes 5-bits of the hash, because 2**5 = 32.
 * This is the maximum branching factor of 32 children.
 * level 0 to 5 where the rightmost bits are used for the root.
 * [00][00000][00000][00000][00000]
 *
 * When you want to obtain some bits corresponding to a level n. You obtain this number by first moving those bits
 * to the right until it is the right-most block (right shift). Then you null out the other bits (mask).
 *
 * `mask` isolates those 5 bits so that they can be used as an index into the node's child array.
 *
 * @param hash 32-bit unsigned hashcode.
 * @param shift How many bits to shift to the right before doing the masking. For level 0 it is 0, for level 1 it is 5,
 * for level 2 it is 10, and so on.
 */
function mask(hash: number, shift: number): number {
    return (hash >>> shift) & 0x01f;
}

/**
 * Function to map numbers in the range [0, 31] to numbers in the range [0, N) where N is the number of children.
 *
 * This method maps numbers in the range [0, 31] to powers of 2. That is numbers that have binary representation
 * of the form: {10**N | N >= 0}
 *
 * This method is used by the BitmapIndexedNode class to check if a child exists for a certain hash code. BitmapIndexedNode
 * maintains a field `bitmap` which tells us how many children a node has, and what their indexes are in the child
 * array. To check if a child exists for a certain hash code:
 * 1. first compute `mask(hash, level)` to get a number in the range [0, 31]
 * 2. Then compute `bitpos` of this to get a number in the range [0, N) which is a number in the form 10**N.
 * 3. Match that with `bitmap` field to check whether there is a 1 in the n'th position. This match is simply
 * bitwise AND with the bitmap.
 *
 * @param hash
 * @param shift
 */
function bitpos(hash: number, shift: number): number {
    return 1 << mask(hash, shift);
}

/**
 * Index of a child is the number if 1's to the right of the child's `bitpos` in the `bitmap`.
 *
 * Use the `ctpop` to count the 1's.
 * If we subtract 1 from the `bitpos` 10^N, we get 01^N, and then binary AND with the `bitmap` gives us the same
 * `bitmap`, but where only the 1's to the right of the `bitpos` are set.
 *
 * @param bitmap The number of children that a node has, and their indexes in the child array.
 * @param bit The bit position of the child in the bitmap.
 */
function index(bitmap: number, bit: number) {
    return ctpop(bitmap & (bit - 1));
}

/**
 * Interface to represent a node in the hash array mapped trie (HAMT).
 */
interface INode<K, V> {
    /**
     * Associates a key with a value. This adds a pair to the HashMap.
     *
     * Key-value pairs are only added as leaf nodes.
     *
     * @param shift The shift corresponding to the level. Shift is a multiple of 5.
     * @param hash The hash code of the key.
     * @param key The key itself.
     * @param value The value to associate with a key.
     * @param addedLeaf An **out-parameter** must be set to the new leaf node. If the key already existed,
     * it will be present in the out variable.
     */
    assoc(shift: number, hash: number, key: K, value: V, addedLeaf: Box<LeafNode<K, V>>): Node<K, V> | null;

    /**
     * Remove key (and its value) from the sub‑trie rooted at this
     * node, returning **either**:
     *
     * * this – nothing changed
     * * a **new node – structure changed for immutability
     * * null – node became empty and can be pruned
     *
     * Implementations **must not** mutate existing nodes; they create and
     * return new nodes when necessary, preserving structural sharing.
     *
     * @param hash 32‑bit hash of {@code key}.
     * @param key - Key to remove.
     * @returns - A replacement node or null if the subtree is now empty
     * (or this if the key was absent).
     */
    without(hash: number, key: K): Node<K, V> | null;

    /**
     * Retrieve a leaf that holds key if it exists in the subtree.
     *
     * The search follows: at each level we mask the hash, choose the child and continue until we hold a LeafNode
     * which holds the key or empty slot (null).
     *
     * @param hash The has code of the key.
     * @param key The key itself.
     */
    find(hash: number, key: K): LeafNode<K, V> | null;

    /**
     * Returns the hash code of the node.
     */
    getHash(): number;
}

/**
 * A node in the hash array mapped trie (HAMT).
 *
 * This is a union type of all possible nodes in the HAMT.
 * The nodes are:
 * 1. EmptyNode - empty node
 * 2. LeafNode - a leaf node that holds a key-value pair
 * 3. FullNode - a full node that holds children nodes
 * 4. HashCollisionNode - a node that holds multiple leaves with the same hash code
 * 5. BitmapIndexedNode - a node that holds children nodes and a bitmap to represent their indexes.
 */
type Node<K, V> = EmptyNode<K, V> | LeafNode<K, V> | FullNode<K, V> | HashCollisionNode<K, V> | BitmapIndexedNode<K, V>;

/**
 * Out variable to keep track of whether a leaf was added or not.
 */
interface Box<T> {val: T  | null}

/**
 * Empty node in the hash array mapped trie (HAMT).
 * The root is initially empty.
 */
class EmptyNode<K, V> implements INode<K, V> {

    constructor(
        readonly _hash: number,
    ) {}

    static empty<K, V>() {
        return new EmptyNode<K, V>(0);
    }

    /**
     * `assoc` of empty node yields a LeafNode.
     */
    assoc(shift: number, hash: number, key: K, value: V, addedLeaf: Box<LeafNode<K, V>>): Node<K, V> | null {
        const leaf = new LeafNode(hash, key, value);
        addedLeaf.val = leaf;
        return leaf; 
    }

    /**
     * Nothing to return from an empty node, always returns null.
     */
    without(hash: number, key: K): Node<K, V> | null {
        return null;
    }

    find(hash: number, key: K): LeafNode<K, V> | null {
        return null;
    }

    getHash(): number {
        return this._hash;
    }
}

/**
 * Leaf node holds the key-value pairs.
 */
class LeafNode<K, V> implements INode<K, V> {

    constructor(
        readonly _hash: number,
        readonly _key: K,
        readonly _value: V
    ) {}

    static empty<K, V>() {
        return new LeafNode(0, 0, 0);
    }

    /**
     * We have the following cases:
     *
     * Same hash and equal key. And if the value is the same then return this, or update the value.
     *
     * Same hash but unequal keys. Then we have a hash collision and we create HashCollisionNode that contains
     * both leaves. Set the boxed value to the new leaf.
     *
     * Different hash - keys diverge higher in the trie. Create a BitmapIndexedNode shared by the two leaves.
     *
     */
    assoc(shift: number, hash: number, key: K, value: V, addedLeaf: Box<LeafNode<K, V>>): Node<K, V> | null {
        if (hash === this._hash) {
            if (Utils.equals(this._key, key)) {
                if (Utils.equals(this._value, value)) return this;

                // note do not set added leaf since we are replacing
                return new LeafNode(hash, key, value);
            }
            // hash collision - same hash different keys
            const newLeaf = new LeafNode(hash, key, value);
            addedLeaf.val = newLeaf;
            return new HashCollisionNode(hash, [this, newLeaf]);
        }
        return BitmapIndexedNode.create2<K, V>(shift, this, hash, key, value, addedLeaf);
    }

    /**
     * Opposite of the `find` method. So if the hash is the same and the keys are equal, then we return
     * null for the node. Otherwise return this,
     *
     * @param hash The hash of the key.
     * @param key The key to be removed.
     */
    without(hash: number, key: K): Node<K, V> | null {
        if (hash === this._hash && Utils.equals(this._key, key)) {
            return null;
        }
        return this;
    }

    /**
     * If the hash is the same and the keys are equal, then the key exists.
     * Or else return null.
     *
     * @param hash
     * @param key
     */
    find(hash: number, key: K): LeafNode<K, V> | null {
        if (hash === this._hash && Utils.equals(this._key, key)) {
            return this;
        }
        return null;
    }

    getHash(): number {
        return this._hash;
    }
}

/**
 * FullNode holds 32 children.
 */
class FullNode<K, V> implements INode<K, V> {
    _hash: number;
    constructor(
        readonly _nodes: Node<K, V>[],
        readonly _shift: number,
    ) {
        this._hash = this._nodes[0].getHash();
    }

    /**
     * Associate a key with a value for a FullNode that already has 32 children.
     *
     * If it is the same, then return this.
     * Else it has changed, so assign that new node to the child at the index and return a new FullNode.
     */
    assoc(levelShift: number, hash: number, key: K, value: V, addedLeaf: Box<LeafNode<K, V>>): Node<K, V> | null {
        const idx = mask(hash, this._shift);

        const n = this._nodes[idx].assoc(this._shift + 5, hash, key, value, addedLeaf);
        if (n === null || n === this._nodes[idx]) {
            return this;
        } else {
            const newNodes = [...this._nodes];
            newNodes[idx] = n;
            return new FullNode(newNodes, levelShift);
        }
    }

    /**
     * Remove key and its value from the sub-trie rooted at this node.
     * This will either return:
     * * this if nothing has changed.
     * * a new node structure changed for immutability
     * * Node is removed and is null.
     *
     * @param hash 32-bit hash of the key.
     * @param key Key to remove
     * @returns Replacement node or null if the subtree is now empty or this if the key was absent.
     */
    without(hash: number, key: K): Node<K, V> | null {
        const idx = mask(hash, this._shift);

        const n = this._nodes[idx].without(hash, key);

        if (!Utils.equals(n, this._nodes[idx])) {
            if (n === null) {
                // copy every element of the array except nodes[idx]
                const newNodes: Node<K, V>[] = [
                    ...this._nodes.slice(0, idx),
                    ...this._nodes.slice(idx + 1)
                ];
                // clear the bit that marked the removed child
                return new BitmapIndexedNode(~bitpos(hash, this._shift), newNodes, this._shift);
            }
        }
        return this;
    }

    /**
     * Recursively call the find to get the leaf node.
     */
    find(hash: number, key: K): LeafNode<K, V> | null {
        return this._nodes[mask(hash, this._shift)].find(hash, key);
    }

    getHash(): number {
        return this._hash;
    }
}


/**
 * HashCollisionNode holds multiple leaves with the same hash code, but different keys (which is a rare case).
 *
 * It stores an array of leaf nodes that have the same hash code.
 */
class HashCollisionNode<K, V> implements INode<K, V> {
    constructor(
        readonly _hash: number,
        readonly _leaves: LeafNode<K, V>[],
    ) {}

    /**
     * Associates a key with a value for a HashCollisionNode that already has multiple leaves with the same hash code.
     */
    assoc(shift: number, hash: number, key: K, value: V, addedLeaf: Box<LeafNode<K, V>>): Node<K, V> | null {
        if (hash === this._hash) {
            const idx = this.findIndex(hash, key);
            if (idx !== -1) {
                //if (this._leaves[idx]._value === value) {
                if (Utils.equals(this._leaves[idx]._value, value)) {
                    return this;
                }
                const newLeaves = [...this._leaves];
                newLeaves[idx] = new LeafNode(hash, key, value);
                return new HashCollisionNode(hash, newLeaves);
            }
            const newLeaves: LeafNode<K, V>[] = [...this._leaves];
            //const leaf = new LeafNode(hash, key, value);
            //newLeaves[newLeaves.length] = leaf;
            //addedLeaf.val = leaf;
            addedLeaf.val = newLeaves[newLeaves.length] = new LeafNode(hash, key, value);
            return new HashCollisionNode(hash, newLeaves);
        }

        return BitmapIndexedNode.create2<K, V>(shift, this, hash, key, value, addedLeaf);
    }

    /**
     * Remove key from HashCollisionNode
     *
     * * Scan `_leaves` for the key.
     * * If absent -> return this.
     * * If present ->
     *      size === 1 -> return null
     *      size === 2 -> return the *other* leaf
     *      else       -> copy array, `splice(idx, 1)`, return the new bucket node.
     * @param hash
     * @param key
     */
    without(hash: number, key: K): Node<K, V> | null {
        const idx = this.findIndex(hash, key);
        if (idx === -1) {
            return this;
        }
        if (this._leaves.length === 2) {
            return idx === 0 ? this._leaves[1] : this._leaves[0];
        }
        // copy the leaves without the node itself
        const newLeaves = [
            ...this._leaves.slice(0, idx),
            ...this._leaves.slice(idx + 1)
        ]
        return new HashCollisionNode(hash, newLeaves);
    }

    /**
     * Liner scan the leaf nodes to check if the key exists.
     * @param hash
     * @param key
     */
    find(hash: number, key: K): LeafNode<K, V> | null {
        const idx = this.findIndex(hash, key);
        if (idx !== -1) {
            return this._leaves[idx];
        }
        return null;
    }

    /**
     * Helper method to find the index of the LeafNode in the leaves array.
     * @param hash
     * @param key
     */
    findIndex(hash: number, key: K): number {
        for (let i=0; i < this._leaves.length; i++) {
            if (this._leaves[i].find(hash, key) !== null) {
                return i;
            }
        }
        return -1;
    }

    getHash(): number {
        return this._hash;
    }
}

/**
 * BitmapIndexedNode holds children nodes and a bitmap to represent their indexes.
 *
 * The bitmap is a 32-bit integer that tells us how many children a node has, and what their indexes are in the child array.
 */
class BitmapIndexedNode<K, V> implements INode<K, V> {
    // field bitmap tells us how many children this node has, also what their indexes are in the child array.
    // the number of childre is the number of 1's in the binary representation.
    private readonly _bitmap: number;
    private readonly _nodes: Node<K, V>[];
    private readonly _shift: number;
    private readonly _hash: number;


    constructor(bitmap: number, nodes: Node<K, V>[], shift: number) {
        this._bitmap = bitmap;
        this._nodes = nodes;
        this._shift = shift;
        this._hash = nodes.length === 0 ? 0 : nodes[0].getHash();
    }

    static create1<K, V>(bitmap: number, nodes: Node<K, V>[], shift: number): Node<K, V> | null {
        if (bitmap === -1) {
            return new FullNode(nodes, shift);
        }
        return new BitmapIndexedNode(bitmap, nodes, shift);
    }

    static create2<K, V>(shift: number, branch: Node<K, V>, hash: number, key: K, value: V, addedLeaf: Box<LeafNode<K, V>>): Node<K, V> | null {
        return (new BitmapIndexedNode(bitpos(branch.getHash(), shift), [branch], shift))
            .assoc(shift, hash, key, value, addedLeaf);
    }

    /**
     * Associates a key with a value for a BitmapIndexedNode that already has children.
     *
     * First computes the `mask(hash, shift)` to get the number in range [0, 31].
     * Then computes the bit position of this with `bitpos(hash, shift)` to get the number in range [0, N).
     * Gets the index of this using the bitwise and with the bitmap, and count the number of 1's to the right.
     *
     * If the node already exists (bitwise AND on the bit position and the bitmap), it checks if the nodes are identical,
     * and if that is the case then return same node.
     * Else it will create a new BitmapIndexedNode with the new node.
     *
     * If the node does not exist, it will assign that new LeafNode to the child at the index and return a new
     * BitmapIndexedNode where the bitmap is updated with the bit position (bitmap | bit).
     *
     * @param shift
     * @param hash
     * @param key
     * @param value
     * @param addedLeaf
     */
    assoc(shift: number, hash: number, key: K, value: V, addedLeaf: Box<LeafNode<K, V>>): Node<K, V> | null {
        const bit = bitpos(hash, shift);
        const idx = index(this._bitmap, bit);
        if ((this._bitmap & bit) !== 0) {
            const n = this._nodes[idx].assoc(shift + 5, hash, key, value, addedLeaf);
            if (n === null || Utils.equals(n, this._nodes[idx])) {
                return this;
            } else {
                const newNodes = [...this._nodes];
                newNodes[idx] = n;
                return new BitmapIndexedNode(this._bitmap, newNodes, shift);
            }
        } else {
            const newNodes = [...this._nodes];
            newNodes.splice(idx, 0, new LeafNode(hash, key, value));
            addedLeaf.val = newNodes[idx] as LeafNode<K, V>;
            //newNodes[idx] = new LeafNode(hash, key, value);
            return BitmapIndexedNode.create1(this._bitmap | bit, newNodes, shift);
        }
    }

    /**
     * Remove key from BitmapIndexedNode
     *
     * * **Bit not set** - key absent -> return this
     * * **Bit set**     - recurse into child:
     *      * Child unchanged -> return this
     *      * Child became null -> clone nodes and remove child,
     *          clear `bit` in `bitmap`:
     *          * if the resulting bitmap has one bit left, then collapse the node to that single child
     *          * else return a new BitmapIndexedNode with the new bitmap and nodes.
     *      * Child replaced -> clone nodes, overwrite the slot index, and return new node.
     * @param hash
     * @param key
     */
    without(hash: number, key: K): Node<K, V> | null {
        const bit = bitpos(hash, this._shift);

        if ((this._bitmap & bit) !== 0) {
            const idx = index(this._bitmap, bit);
            const n = this._nodes[idx].without(hash, key);
            if (!Utils.equals(n, this._nodes[idx])) {
                if (n === null) {
                    if (this._bitmap === bit) {
                        return null;
                    }
                    // copy every element of the array except nodes[idx]
                    const newNodes = [
                        ...this._nodes.slice(0, idx),
                        ...this._nodes.slice(idx + 1)
                    ];
                    // clear the bit that marked the removed child
                    return new BitmapIndexedNode(this._bitmap & ~bit, newNodes, this._shift);
                }
                const newNodes = [...this._nodes];
                newNodes[idx] = n;
                return new BitmapIndexedNode(this._bitmap, newNodes, this._shift);
            }
        }
        return this;
    }

    /**
     * Recursively call the find to get the leaf node.
     *
     * The method will continue until it finds the bit position of the has in the bitmap (bitwise AND).
     *
     * @param hash
     * @param key
     */
    public find(hash: number, key: K): LeafNode<K, V> | null {
        const bit = bitpos(hash, this._shift);
        if ((this._bitmap & bit) !== 0) {
            return this._nodes[index(this._bitmap, bit)].find(hash, key);
        } else {
            return null;
        }
    }

    getHash(): number {
        return this._hash;
    }
}

/**
 * **Persistent HashMap** - a fully immutable, Hash Array Mapped Trie (HAMT). adapted from Clojure's implementation.
 * Link to Clojure implementation:
 *
 * It is a persistent implementation of Phil Bagwell's Hash Array Mapped Trie (HAMT).
 * This preserves structural sharing where most of the data can be re-used between updates.
 *
 * Most operations have the complexity of O(log32 N) where N is the number of elements in the map.
 *
 * @see Phil Bagwell, "Ideal Hash Trees", EPFL, 2000.
 * @see https://github.com/clojure/clojure/blob/master/src/jvm/clojure/lang/PersistentHashMap.java
 */
export default class HashMap<K, V> {
    private readonly _size: number;
    private readonly _shift: number;
    private readonly _root: Node<K, V>;

    private _hash: number | null = null;

    private constructor(size: number, shift: number, root: Node<K, V>) {
        this._size = size;
        this._shift = shift;
        this._root = root;
    }

    static empty<K, V>(): HashMap<K, V> {
        return new HashMap<K, V>(0, 0, EmptyNode.empty<K, V>());
    }

    static of<K, V>(...entries: [K, V][]): HashMap<K, V> {
        let map: HashMap<K, V> = HashMap.empty<K, V>();
        for (const [key, value] of entries) {
            map = map.assoc(key, value);
        }
        return map;
    }

    /**
     * Helper method to recursively get the entries of the map.
     * @param node
     */
    *entriesKeyValue(node: Node<K, V>): IterableIterator<[K, V]> {
        if (node instanceof LeafNode) {
            yield [node._key, node._value];
        } else if (node instanceof HashCollisionNode) {
            for (const leaf of node._leaves) {
                yield [leaf._key, leaf._value];
            }
        } else if (node instanceof BitmapIndexedNode || node instanceof FullNode) {
            for (const child of (node as any)._nodes as Node<K, V>[]) {
                yield* this.entriesKeyValue(child);
            }
        }
    }

    /**
     * Get the entries of the map as nodes
     * @param node
     */
    *entriesNodeHelper(node: Node<K, V>): IterableIterator<Node<K, V>> {
        if (node instanceof LeafNode) {
            yield node;
        } else if (node instanceof HashCollisionNode) {
            for (const leaf of node._leaves) {
                yield leaf;
            }
        } else if (node instanceof BitmapIndexedNode || node instanceof FullNode) {
            for (const child of (node as any)._nodes as Node<K, V>[]) {
                yield* this.entriesNodeHelper(child);
            }
        }
    }

    /**
     * How the HashMap is iterated.
     */
    *[Symbol.iterator](): IterableIterator<[K, V]> {
        yield* this.entriesKeyValue(this._root);
    }

    /**
     * Get the entries of the HashMap
     */
    entries(): [K, V][] {
        return Array.from(this);
    }

    entriesNode(): Node<K, V>[] {
        return Array.from(this.entriesNodeHelper(this._root));
    }

    /**
     * Extracting the keys from the iterator.
     */
    keys(): K[] {
        return Array.from(this, ([k]) => k);
    }

    /**
     * Extracting the values from the iterator.
     */
    values(): V[] {
        return Array.from(this, ([_, v]) => v);
    }

    /**
     * Get the size of the HashMap.
     */
    size(): number {
        return this._size;
    }

    /**
     * Method to associate a key with a value.
     * Calls the appropriate `assoc` method for the root.
     *
     * Also hashes the key to get the hash code using the `HashCode` class.
     *
     * @param key The key be added to the map
     * @param value The value to be associated with the key
     * @private because helper method used within the class.
     */
    private assoc(key: K, value: V): HashMap<K, V> {
        const addedLeaf: Box<LeafNode<K, V>> = {val: null};
        const newRoot = this._root.assoc(this._shift, HashCode.hashCode(key), key, value, addedLeaf);
        if (newRoot === null || newRoot === this._root) {
            return this;
        }
        return new HashMap(addedLeaf.val === null ? this._size : this._size + 1, this._shift, newRoot);
    }

    /**
     * Method to put a key-value pair in the HashMap.
     * This is a helper method to call the `assoc` method.
     *
     * @param key The key to be added to the map
     * @param value The value to be associated with the key
     */
    put(key: K, value: V): HashMap<K, V> {
        return this.assoc(key, value);
    }

    /**
     * Method to remove a key from the HashMap.
     * This calls the `without` method of the root node.
     *
     * If the root did not change after the key has been removed, return this.
     * Else if the root is null, return an empty HashMap.
     * Else return a new HashMap with the size decremented by 1.
     *
     * @param key To be removed from the HashMap
     * @private
     */
    private without(key: K): HashMap<K, V> {
        const newRoot = this._root.without(HashCode.hashCode(key), key);
        if (Utils.equals(newRoot, this._root)) {
            return this;
        }
        if (newRoot === null) {
            return HashMap.empty<K, V>();
        }
        return new HashMap<K, V>(this._size - 1, this._shift, newRoot);
    }

    /**
     * Method to remove a key from the HashMap.
     * @param key The key to be removed from the map
     */
    delete(key: K): HashMap<K, V> {
        return this.without(key);
    }

    /**
     * Method to find a key in the HashMap.
     * This calls the `find` method of the root node.
     *
     * @param hash The hash code of the key.
     * @param key The key to be found in the map.
     * @private
     */
    private find(hash: number, key: K): LeafNode<K, V> | null {
        return this._root.find(HashCode.hashCode(key), key);
    }

    /**
     * Method to get a value from the HashMap.
     * This calls the `find` method of the root node.
     * @param key The key to get the value from.
     */
    get(key: K): V | null {
        const find = this.find(HashCode.hashCode(key), key);
        if (find !== null) {
            return find._value;
        }
        return null;
    }

    /**
     * Method to get the hash code of the entries in the HashMap.
     */
    hashCode(): number {
        if (this._hash === null) {
            let hash = 0;
            for (const [key, value] of this.entries()) {
                hash ^= HashCode.hashCode(key) ^ HashCode.hashCode(value);
            }
            this._hash = hash;
        }
        return this._hash;
    }

    /**
     * Helper method to print the contents of the HashMap.
     */
    printContents(): void {
        for (const [key, value] of this.entries()) {
            console.log(`${key}: ${value}`);
        }
    }
}