import HashCode from "../Hashing/HashCode";
import {Utils} from "../Utils/Utils";
import AbstractMap from "../AbstractClasses/AbstractMap";
import Map from "../Interfaces/Map";
import {Speed} from "../Enums/Speed";
import {Comparator} from "../Interfaces/Comparator";
import Sorting from "../Sorting/Sorting";


const SK5 = 0x55555555, SK3 = 0x33333333;
const SKF0=0xF0F0F0F//,SKFF=0xFF00FF;

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
 * [00][00000][00000][00000][00000][00000][00000]
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
 *
 * It is a persistent implementation of Phil Bagwell's Hash Array Mapped Trie (HAMT).
 * This preserves structural sharing where most of the data can be re-used between updates.
 *
 * **Complexity**:
 * Operations such as `set`, `delete`, and `get` are O(log_32 N) where N is the number of elements in the map.
 * This is because the Hash Array Mapped Trie (HAMT) has a branching factor of 32 (where each level consumes 5 bits).
 * Each node can have 32 distinct slots, and we know that log_2 32 = 5 bits of the key's hash to decide which child to follow. 
 * Using fewer bits (e.g log_2 16 = 4 bits) would deepen the tree, while using more bits (e.g. log_2 64 = 6) would double 
 * the bitmap to two words and leave most entries empty. 5 bits strikes a balance betweeen, wasted space and deepness. 
 * It works well also on 64-bit machines, since you have one word per node. 
 *
 * @see Phil Bagwell, "Ideal Hash Trees", EPFL, 2000.
 * @see https://github.com/clojure/clojure/blob/master/src/jvm/clojure/lang/PersistentHashMap.java
 * @see https://blog.higher-order.net/2009/09/08/understanding-clojures-persistenthashmap-deftwice
 */
export default class HashMap<K, V> extends AbstractMap<K, V>
                                    implements Map<K, V> {
    private readonly _size: number;
    private readonly _shift: number;
    private readonly _root: Node<K, V>;

    private _hash: number | null = null;

    private constructor(size: number, shift: number, root: Node<K, V>) {
        super();
        this._size = size;
        this._shift = shift;
        this._root = root;
    }

    static empty<K, V>(): HashMap<K, V> {
        return new HashMap<K, V>(0, 0, EmptyNode.empty<K, V>());
    }

    empty(): HashMap<K, V> {
        return HashMap.empty<K, V>();
    }

    protected createEmpty<KM, VM>(): HashMap<KM, VM> {
        return HashMap.empty<KM, VM>();
    }

    static of<K, V>(...entries: [K, V][]): HashMap<K, V> {
        let map: HashMap<K, V> = HashMap.empty<K, V>();
        for (const [key, value] of entries) {
            map = map.assoc(key, value);
        }
        return map;
    }

    getRoot(): [K, V] | null {
        return null;
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
        return super.entries();
    }

    entriesNode(): Node<K, V>[] {
        return Array.from(this.entriesNodeHelper(this._root));
    }

    /**
     * Extracting the keys from the iterator.
     */
    keys(): K[] {
        return super.keys();
    }

    /**
     * Extracting the values from the iterator.
     */
    values(): V[] {
        return super.values();
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
     * Complexity O(log_32 N)
     *
     * @param key The key to be added to the map
     * @param value The value to be associated with the key
     */
    set(key: K, value: V): HashMap<K, V> {
        return this.assoc(key, value);
    }

    /**
     * Set multiple key-value pairs in the map
     * @param entries
     */
    setAll(entries: Iterable<[K, V]>): HashMap<K, V> {
        let map: HashMap<K, V> = this;
        for (const [key, value] of entries) {
            map = map.set(key, value);
        }
        return map;
    }

    /**
     * Method to remove a key from the HashMap.
     * This calls the `without` method of the root node.
     *
     * If the root did not change after the key has been removed, return this.
     * Else if the root is null, return an empty HashMap.
     * Else return a new HashMap with the size decremented by 1.
     *
     * Complexity: O(log_32 N)
     *
     * @param key To be removed from the HashMap
     * @private
     */
    delete(key: K): HashMap<K, V> {
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
     * Method to remove all keys from the HashMap.
     * @param keys
     */
    deleteAll(keys: Iterable<K>): HashMap<K, V> {
        return super.deleteAll(keys) as HashMap<K, V>;
    }

    /**
     * Method to find a key in the HashMap.
     * This calls the `find` method of the root node.
     *
     * @param hash The hash code of the key.
     * @param key The key to be found in the map.
     * @private
     */
    private findLeafNode(hash: number, key: K): LeafNode<K, V> | null {
        return this._root.find(hash, key);
    }

    /**
     * Method to get a value from the HashMap.
     * This calls the `find` method of the root node.
     *
     * Complexity O(log_32 N)
     *
     * @param key The key to get the value from.
     */
    get(key: K): V | undefined {
        const find = this.findLeafNode(HashCode.hashCode(key), key);
        if (find !== null) {
            return find._value;
        }
        return undefined;
    }

    /**
     * Check if the map has a key.
     * @param key
     */
    has(key: K): boolean {
        return this.findLeafNode(HashCode.hashCode(key), key) !== null;
    }

    /**
     * Check if the map has a value.
     * @param value
     */
    hasValue(value: V): boolean {
        return super.hasValue(value);
    }

    /**
     * Check if the map has all the keys.
     * @param keys
     */
    hasAll<H extends K>(keys: Iterable<H>): boolean {
        return super.hasAll(keys);
    }

    /**
     * Check if the map is empty.
     */
    isEmpty(): boolean {
        return super.isEmpty();
    }

    /**
     * Clear the map. Return an empty instance.
     */
    clear(): HashMap<K, V> {
        return HashMap.empty<K, V>();
    }

    // Speed methods
    /**
     * Complexity O(log_32 N) where N is the number of elements in the map
     */
    hasSpeed(): Speed {
        return Speed.Log;
    }

    /**
     * Complexity O(log_32 N) where N is the number of elements in the map
     */
    addSpeed(): Speed {
        return Speed.Log;
    }

    /**
     * Complexity O(log_32 N) where N is the number of elements in the map
     */
    removeSpeed(): Speed {
        return Speed.Log;
    }

    /**
     * Check whether an object instance is the same as the current hash map instance.
     * @param o
     */
    equals(o: Object): boolean {
        if (o === this) return true;
        if (!(o instanceof HashMap)) return false;

        const other = o as HashMap<K, V>;
        if (this.size() !== other.size()) return false;
        for (const [key, value] of this) {
            const otherValue = other.get(key as any);

            if(otherValue === undefined && !other.has(key as any)) return false;
            if (!Utils.equals(value, otherValue)) return false;
        }
        return true;
    }


    /**
     * Compare the map to another map.
     * 
     * First compare the reference, if that is the same then return 0.
     * 
     * Then compare the sizes, if they are different then return the size difference.
     * 
     * Then sort then `entries()` of both HashMaps and compare the hash codes of the keys.
     * 
     * @param o the HashMap to compareTo()
     * @returns:
     *      0 -> equal
     *     <0 -> this < 0
     *     >0 -> this > 0
     */
    compareTo(o: HashMap<K, V>): number {
        // reference is the same
        if (this === o) return 0;

        const sizeDiff = this.size() - o.size();
        if (sizeDiff !== 0) return sizeDiff;

        const entriesA = this.entries();
        const entriesB = o.entries();

        const entryCmp = ([ka]: [K, V], [kb]: [K, V]): number => {
            const ha = HashCode.hashCode(ka);
            const hb = HashCode.hashCode(kb);
            if (ha !== hb) return ha - hb;

            if (ka < kb) return -1;
            if (ka > kb) return 1;
            return 0;
        }

        Sorting.timSort(entriesA, entryCmp);
        Sorting.timSort(entriesB, entryCmp);

        for (let i = 0; i < entriesA.length; i++) {
            const [ka, va] = entriesA[i];
            const [kb, vb] = entriesB[i];
    
            const kCmp = entryCmp([ka, va], [kb, vb]);
            if (kCmp !== 0) return kCmp;
    
            if (va < vb) return -1;
            if (va > vb) return 1;
        }

        return 0;
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
     * Get a value from the map or return a default value.
     * @param key
     * @param defaultValue
     */
    getOrDefault(key: K, defaultValue: V): V {
        return super.getOrDefault(key, defaultValue);
    }

    /**
     * If a key-value pair is absent in the map, compute it using the function.
     * Else just return the key-value pair.
     * @param key
     * @param func
     */
    computeIfAbsent(key: K, func: (key: K) => V): [HashMap<K, V>, V] {
        return super.computeIfAbsent(key, func) as [HashMap<K, V>, V];
    }

    /**
     * If a key-value pair is present in the map, compute it using the function.
     * Else just return the key-value pair.
     * @param key
     * @param func
     */
    computeIfPresent(key: K, func: (key: K, value: V) => V): [HashMap<K, V>, V] {
        return super.computeIfPresent(key, func) as [HashMap<K, V>, V];
    }

    /**
     * Compute the value for a key using the function.
     * @param key
     * @param func
     */
    compute(key: K, func: (key: K, value: V | undefined) => V): [HashMap<K, V>, V] {
        return super.compute(key, func) as [HashMap<K, V>, V];
    }

    /**
     * Copy the map to a new HashMap.
     * @param map
     */
    copyOf(map: Map<K, V>): HashMap<K, V> {
        return HashMap.of(...map.entries());
    }

    // HOFs defined in Map.ts
    /**
     * Check that all elements in the map satisfy the predicate.
     * @param predicate
     * @param thisArg
     */
    every(predicate: (value: V, key: K, map: this) => boolean, thisArg?: unknown): this is HashMap<K, V>;
    every(predicate: (value: V, key: K, map: this) => unknown, thisArg?: unknown): boolean;
    every(predicate: (value: V, key: K, map: this) => unknown, thisArg?: unknown): unknown {
        return super.every(predicate, thisArg);
    }

    /**
     * Check that at least one element in the map satisfies the predicate.
     * @param predicate
     * @param thisArg
     */
    some(predicate: (value: V, key: K, map: this) => boolean, thisArg?: any): boolean {
        return super.some(predicate, thisArg);
    }

    /**
     * Iterate over the map and call the callback for each element.
     * @param callback
     * @param thisArg
     */
    forEach(callback: (value: V, key: K, map: this) => void, thisArg?: any): void {
        super.forEach(callback, thisArg);
    }

    /**
     * Find the first element that satisfies the predicate.
     * @param predicate
     * @param thisArg
     */
    find(predicate: (value: V, key: K, map: this) => boolean, thisArg?: any): V | undefined {
        return super.find(predicate, thisArg);
    }

    /**
     * Fold the map's values from left to right, calling `callback` for every entry and accumulate the result.
     * @param callback
     * @param initialValue
     */
    reduce(callback: (accumulator: V, value: V, key: K, map: this) => V, initialValue?: V): V;
    reduce<R>(callback: (accumulator: R, value: V, key: K, map: this) => R, initialValue?: R): R;
    reduce<R>(callback: (accumulator: R, value: V, key: K, map: this) => R, initialValue?: R): R {
        return super.reduce(callback, initialValue);
    }


    /**
     * Fold the map's values from right to left, calling `callback` for every entry and accumulate the result.
     * @param callback
     * @param initialValue
     */
    reduceRight(callback: (accumulator: V, value: V, key: K, map: this) => V, initialValue?: V): V;
    reduceRight<R>(callback: (accumulator: R, value: V, key: K, map: this) => R, initialValue?: R): R;
    reduceRight<R>(callback: (accumulator: R, value: V, key: K, map: this) => R, initialValue?: R): R {
        return super.reduceRight(callback, initialValue);
    }


    // HOFs inspired by immutable.js
    /**
    * Update an existing entry or add a new one in a single call.
    * If given a function, it is called with the current value (or `undefined`)
    * and its result becomes the new value. If given a direct value, that
    * value is set (replacing or inserting).
    *
    * @returns a new HashMap with the updated or added entry
    */
    updateOrAdd(key: K, callback: (value: V) => V): HashMap<K, V>;
    updateOrAdd(key: K, callback: (value: V | undefined) => V | undefined): HashMap<K, V | undefined>;
    updateOrAdd(key: K, newValue: V): HashMap<K, V>;
    updateOrAdd(key: K, callbackOrValue: any): HashMap<K, any> {
        return super.updateOrAdd(key, callbackOrValue) as HashMap<K, any>;
    }

    /**
     * Merge multiple maps into this map.
     * The other collections can either be iterables or a map.
     * @param collections
     */
    merge<KC, VC>(
        ...collections: Array<Iterable<[KC, VC]>>
    ): HashMap<K | KC, Exclude<V, VC> | VC>;
    merge<C>(
        ...collections: Array<{ [key: string]: C }>
    ): HashMap<K | string, Exclude<V, C> | C>;
    merge<KC, VC>(other: Map<KC, VC>): HashMap<K | KC, V | VC>;
    merge(...collections: any[]): HashMap<any, any> {
        return super.merge(...collections) as HashMap<any, any>;
    }

    /**
     * Concatenate multiple maps into this map.
     * The other collections can either be iterables or a map.
     * @param collections
     */
    concat<KC, VC>(
        ...collections: Array<Iterable<[KC, VC]>>
    ): HashMap<K | KC, Exclude<V, VC> | VC>;
    concat<C>(
        ...collections: Array<{ [key: string]: C }>
    ): HashMap<K | string, Exclude<V, C> | C>;
    concat(...collections: any[]): HashMap<any, any> {
        return super.concat(...collections) as HashMap<any, any>;
    }


    /**
     * Merge multiple collections into this map, combining values with `callback` when keys collide.
     * Later collections override earlier ones, but if a key exists in both, `callback(oldVal, newVal, key)`
     * is used to compute the new value.
     *
     * @param callback – function(oldValue, newValue, key) ⇒ mergedValue
     * @param collections – one or more iterables or objects of [key, value] entries
     * @returns a new HashMap with the merged results
    */
    mergeWith<KC, VC, VCC>(
        callback: (oldVal: V, newVal: VC, key: K) => VCC,
        ...collections: Array<Iterable<[KC, VC]>>
    ): HashMap<K | KC, V | VC | VCC>;
    mergeWith<C, CC>(
        callback: (oldVal: V, newVal: C, key: string) => CC,
        ...collections: Array<{ [key: string]: C }>
    ): HashMap<K | string, V | C | CC>;
    mergeWith(
        callback: (oldVal: V, newVal: any, key: any) => any,
        ...collections: any[]
    ): HashMap<any, any> {
        return super.mergeWith(callback, ...collections) as HashMap<any, any>;
    }

    /**
     * Map over the entries in the map and apply the callback function to each entry.
     * @param callback
     * @param thisArg
     */
    map<M>(
        callback: (value: V, key: K, map: this) => M,
        thisArg?: unknown
    ): HashMap<K, M> {
        return super.map(callback, thisArg) as HashMap<K, M>;
    }

    /**
     * Transform each key in the map by applying `callback`, producing a new map
     * with the transformed keys and the same values. If multiple original entries
     * map to the same new key, later entries overwrite earlier ones.
     *
     * @param callback – function(key, value, map) ⇒ newKey
     * @param thisArg – context to be used against the predicate function
     * @param compare
     * @returns a new HashMap with transformed keys
     */
    mapKeys<M>(
        callback: (key: K, value: V, map: this) => M,
        thisArg?: unknown,
        compare?: Comparator<M>
    ): HashMap<M, V> {
        return super.mapKeys(callback, thisArg, compare) as HashMap<M, V>;
    }

    /**
     * Transform each entry in the map by applying `callback`, producing a new map with the transformed entries.
     * @param mapper
     * @param thisArg
     * @param compare
     */
    mapEntries<KM, VM>(
        mapper: (
            entry: [K, V],
            index: number,
            map: this
        ) => [KM, VM] | undefined,
        thisArg?: unknown,
        compare?: Comparator<KM>
    ): HashMap<KM, VM> {
        return super.mapEntries(mapper, thisArg, compare) as HashMap<KM, VM>;
    }

    /**
     * Transforms each element of the HashMap into an iterable of new values and flattens the result into a new HashMap.
     *
     * The mapper should return an iterable of values of type M.
     * All values from each returned iterable are added to the set.
     *
     * @param callback A function that transforms an element of type T into an element of type M.
     * @param thisArg Optional. An object to use as `this` context when executing the mapper function.
     * @param compare Optional. A comparator function for the mapped values of type M. If not provided, the default comparator for M is used.
     * @returns A new HashMap containing all the values produced by the mapper function, flattened into a single set.
     */
    flatMap<KM, VM>(
        callback: (value: V, key: K, map: this) => Iterable<[KM, VM]>,
        thisArg?: unknown,
        compare?: Comparator<KM>
    ): HashMap<KM, VM> {
        return super.flatMap(callback, thisArg, compare) as HashMap<KM, VM>;
    }

    /**
     * Filters out all the elements in the map that does not satisfy the predicate.
     * @param predicate Function that returns true if the element should be included in the new set.
     * @param thisArg Optional. An object to use as `this` context when executing the predicate function.
     * @returns A new HashMap containing only the elements that satisfy the predicate.
     */
    filter<F extends V>(
        predicate: (value: V, key: K, map: this) => value is F,
        thisArg?: unknown,
    ): HashMap<K, F>;
    filter(
        predicate: (value: V, key: K, map: this) => unknown,
        thisArg?: unknown
    ): HashMap<K, V>;
    filter(
        predicate: (value: V, key: K, map: this) => unknown,
        thisArg?: unknown
    ): HashMap<K, any> {
        return super.filter(predicate, thisArg) as HashMap<K, any>;
    }

    /**
     * Partitions the map into two map based on the predicate.
     * All the values that satisfy the predicate are added to the true map, and the rest are added to the false map.
     *
     * @param predicate Function that returns true if the element should be included in the first map
     * or false if the elements should be included in the second map.
     * @param thisArg Optional. An object to use as `this` context when executing the predicate function.
     * @returns An array with two map. The first map contains the values that satisfy the predicate, and the second map contains the rest.
     */
    partition<F extends V, C>(
        predicate: (this: C, value: V, key: K, map: this) => value is F,
        thisArg?: C
    ): [HashMap<K, V>, HashMap<K, F>];
    partition<C>(
        predicate: (this: C, value: V, key: K, map: this) => unknown,
        thisArg?: C
    ): [HashMap<K, V>, HashMap<K, V>];
    partition(
        predicate: (value: V, key: K, map: this) => unknown,
        thisArg?: unknown
    ): [HashMap<K, V>, HashMap<K, V>] {
        return super.partition(predicate, thisArg) as [HashMap<K, V>, HashMap<K, V>];
    }

    /**
     * Flips the keys and values of the HashMap.
     */
    flip(): HashMap<V, K> {
        return super.flip() as HashMap<V, K>;
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