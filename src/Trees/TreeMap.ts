import { Speed } from "../Enums/Speed";
import HashCode from "../Hashing/HashCode";
import Map from "../Interfaces/Map";
import KeyValuePair from "../Interfaces/KeyValuePair";
import {Comparator} from "../Interfaces/Comparator";

import AbstractMap from "../AbstractClasses/AbstractMap";
import EqualityComparer from "../Interfaces/EqualityComparer";

enum Color {
    R, // Red
    B, // Black
    BB, // Double Black
    NB // Negative Black
}

/**
 * This TreeMap represents a Persistent Red-Black tree and is therefore immutable.
 * It follows these invariants:
 * 1. Red invariant: no red node can have a red child
 * 2. Black invariant: every path from root to an empty leaf must contain the same 
 *    number of black nodes, which is the height of the tree.
 * 3. Is a binary search tree so that the left child is less than the 
 *    parent and the right child is greater than the parent.
 * 
 * It is using balancing techniques to make sure that these invariants are always met. 
 * 
 */
export default class TreeMap<K, V> extends AbstractMap<K, V> implements Map<K, V> {
    // private static readonly EMPTY = new TreeMap<any, any>(TreeMap.defaultComparator, Color.B, null, null, null);
    private _hashCode: number | null = null; // cache the hashcode which is computed only once
    private iterator: Iterator<KeyValuePair<K, V>> | null = null;

    equalityComparer: EqualityComparer<K>;

    constructor(
        private readonly compare: Comparator<K> = TreeMap.defaultComparator<K>,
        private readonly color: Color = Color.B,
        private readonly leftTree: TreeMap<K, V> | null = null,
        private readonly root: KeyValuePair<K, V> | null = null,
        private readonly rightTree: TreeMap<K, V> | null = null,
        ) {
        super();

        // this.root = root;
        // this.compare = compare;

        this.equalityComparer = {
            equals: (a: K, b: K) => this.compare(a, b) === 0,
            hashCode: (a: K) => HashCode.hashCode(a)
        }
    }
    
    //Iterator methods
    *[Symbol.iterator](): MapIterator<KeyValuePair<K, V>> {
        yield* this.inOrderTraversal();
    }

    *inOrderTraversal(): MapIterator<KeyValuePair<K, V>> {
        if (!this.isEmpty()) {
            yield* this.left().inOrderTraversal();
            yield this.keyValue();
            yield* this.right().inOrderTraversal();
        }
    }

    *preOrderTraversal(node: KeyValuePair<K, V> | null): MapIterator<KeyValuePair<K, V>> {
        if (!this.isEmpty()) {
            yield this.keyValue();
            yield* this.left().inOrderTraversal();
            yield* this.right().inOrderTraversal();
        }
    }

    *postOrderTraversal(node: KeyValuePair<K, V> | null): MapIterator<KeyValuePair<K, V>> {
        if (!this.isEmpty()) {
            yield* this.left().inOrderTraversal();
            yield* this.right().inOrderTraversal();
            yield this.keyValue();
        }
    }

    
    next(...[value]: [] | [unknown]): IteratorResult<KeyValuePair<K, V>, BuiltinIteratorReturn> {
        if (this.iterator === null) {
            this.iterator = this[Symbol.iterator]();
        }

        const result = this.iterator.next(value);
        if (result.done) {
            this.iterator = null;
        }
        return result;
    }
    throw(e?: any): IteratorResult<KeyValuePair<K, V>, BuiltinIteratorReturn> {
        if (this.iterator !== null && typeof this.iterator.throw === 'function') {
            return this.iterator.throw(e);
        }
        return e;
    }
    return(value?: BuiltinIteratorReturn): IteratorResult<KeyValuePair<K, V>, BuiltinIteratorReturn> {
        if (this.iterator !== null && typeof this.iterator.return === 'function') {
            return this.iterator.return(value);
        }
        return {done: true, value: value as BuiltinIteratorReturn};
    }
    // end iterator methods


    // Red-Black Tree methods
    from(color: Color, left: TreeMap<K, V>, root: KeyValuePair<K, V>, right: TreeMap<K, V>): TreeMap<K, V> {
        // if (!left.isEmpty() && this.compare(left.key(), root.key) >= 0) {
        //     throw new Error("left subtree value must be less than root value");
        // }
        // if (!right.isEmpty() && this.compare(right.key(), root.key) <= 0) {
        //     throw new Error("right subtree value must be greater than root value");
        // }
        return new TreeMap(this.compare, color, left, root, right);
    }

    isEmpty(): boolean {
        return this.root === null;
    }

    isDoubleBlackLeaf(): boolean {
        return this.root === null && this.color === Color.BB;
    }

    // static empty<K, V>(): TreeMap<K, V> {
    //     return this.EMPTY as TreeMap<K, V>;
    // }

    empty(): TreeMap<K, V> {
        return new TreeMap<K, V>(this.compare);
    }

    doubleBlackLeaf(): TreeMap<K, V> {
        return new TreeMap<K, V>(this.compare, Color.BB, null, null, null);
    }

    keyValue(): KeyValuePair<K, V> {
        if (this.isEmpty()) throw new Error("Tree is empty. Cannot get the root key value pair");
        return this.root!;
    }

    key(): K {
        return this.keyValue().key;
    }

    value(): V {
        return this.keyValue().value;
    }

    left(): TreeMap<K, V> {
        if (!this.leftTree) return this.empty();
        return this.leftTree;
    }

    right(): TreeMap<K, V> {
        if (!this.rightTree) return this.empty();
        return this.rightTree;
    }

    isB(): boolean {
        return !this.isEmpty() && this.color === Color.B;
    }

    isR(): boolean {
        return !this.isEmpty() && this.color === Color.R;
    }

    isBB(): boolean {
        if (this.isDoubleBlackLeaf()) return true;
        return !this.isEmpty() && this.color === Color.BB;
    }

    isNB(): boolean {
        return !this.isEmpty() && this.color === Color.NB;
    }

    getNode(x: K): KeyValuePair<K, V> | null {
        if (this.isEmpty()) return null;
        const y = this.key();
        const cmp = this.compare(x, y);
        if (cmp < 0) return this.left().getNode(x);
        if (cmp > 0) return this.right().getNode(x);
        return this.keyValue();
    }

    redden(): TreeMap<K, V> {
        if (this.isEmpty()) throw new Error("cannto redden empty tree");
        else if (this.isDoubleBlackLeaf()) throw new Error("cannot redden double black tree");
        return this.paint(Color.R);
    }

    blacken(): TreeMap<K, V> {
        if (this.isEmpty()) return this.empty();
        else if (this.isDoubleBlackLeaf()) this.empty();
        return this.paint(Color.B);
    }

    blacker(c: Color): Color {
        switch (c) {
            case Color.B: return Color.BB;
            case Color.R: return Color.B;
            case Color.NB: return Color.R;
            case Color.BB: throw new Error("Cannot blacken double black");
        }
    }

    redder(c: Color): Color {
        switch (c) {
            case Color.BB: return Color.B;
            case Color.B: return Color.R;
            case Color.R: return Color.NB;
            case Color.NB: throw new Error("cannot lighten negative black");
        }
    }

    blackerTree(): TreeMap<K, V> {
        if (this.isEmpty()) return this.doubleBlackLeaf();
        return this.from(this.blacker(this.color), this.left(), this.keyValue(), this.right());
    }

    redderTree(): TreeMap<K, V> {
        if (this.isDoubleBlackLeaf()) return this.empty();
        return this.from(this.redder(this.color), this.left(), this.keyValue(), this.right())
    }

    /**
     * Adds a new element with a specified key and value to the Map. If an element with the same key already exists, the element will be updated.
     * @param key
     * @param value
     */
    set(key: K, value: V): TreeMap<K, V> {
        return this.ins(this.keyValuePair(key, value)).paint(Color.B);
    }

    private ins(x: KeyValuePair<K, V>): TreeMap<K, V> {
        if (this.isEmpty()) return this.from(Color.R, this.empty(), x, this.empty());
        const y = this.keyValue();
        const c = this.color;

        const cmp = this.compare(x.key, y.key);
        if (cmp < 0) {
            return this.bubble(c, this.left().ins(x), y, this.right());
        } else if (cmp > 0) {
            return this.bubble(c, this.left(), y, this.right().ins(x));
        } else {
            return this;
        }
    }

    // TODO: should you be able to pass value here?
    delete(key: K, value?: V): TreeMap<K, V> {
        return this.del(this.keyValuePair(key, value as any)).paint(Color.B);
    }

    private del(x: KeyValuePair<K, V>): TreeMap<K, V> {
        if (this.isEmpty()) return this.empty();

        const y = this.keyValue();
        const c = this.color;
        const cmp = this.compare(x.key, y.key);

        if (cmp < 0) {
            return this.bubble(c, this.left().del(x), y, this.right());
        } else if (cmp > 0) {
            return this.bubble(c, this.left(), y, this.right().del(x));
        } else  {
            // node found remove it
            return this.remove();
        }
    }

    private bubble(c: Color, left: TreeMap<K, V>, y: KeyValuePair<K, V>, right: TreeMap<K, V>): TreeMap<K, V> {
        if ((left.isBB()) || (right.isBB())) {
            return this.balance(this.blacker(c), left.redderTree(), y, right.redderTree());
        } else {
            return this.balance(c, left, y, right);
        }
    }

    private balance(c: Color, left: TreeMap<K, V>, x: KeyValuePair<K, V>, right: TreeMap<K, V>): TreeMap<K, V> {
        // Okasaki's insertion cases
        if (c === Color.B) {
            if (left.doubledLeft()) {
                const newLeft = left.left().paint(Color.B);
                const rootKeyValue = left.keyValue();
                const newRight = this.from(Color.B, left.right(), x, right);
                return this.from(Color.R, newLeft, rootKeyValue, newRight);
            } else if (left.doubledRight()) {
                const newLeft = this.from(Color.B, left.left(), left.keyValue(), left.right().left());
                const rootKeyValue = left.right().keyValue();
                const newRight = this.from(Color.B, left.right().right(), x, right);
                return this.from(Color.R, newLeft, rootKeyValue, newRight);
            } else if (right.doubledLeft()) {
                const newLeft = this.from(Color.B, left, x, right.left().left());
                const rootKeyValue = right.left().keyValue();
                const newRight = this.from(Color.B, right.left().right(), right.keyValue(), right.right());
                return this.from(Color.R, newLeft, rootKeyValue, newRight);
            } else if (right.doubledRight()) {
                const newLeft = this.from(Color.B, left, x, right.left());
                const rootKeyValue = right.keyValue();
                const newRight = right.right().paint(Color.B);
                return this.from(Color.R, newLeft, rootKeyValue, newRight);
            } else {
                return this.from(c, left, x, right);
            }
        }

        if (c === Color.BB) {
            // Matt Might's deletion cases for double black
            if (left.doubledLeft()) {
                const newLeft = this.from(Color.B, left.left().left(), left.left().keyValue(), left.left().right());
                const rootKeyValue = left.keyValue();
                const newRight = this.from(Color.B, left.right(), x, right);
                return this.from(Color.B, newLeft, rootKeyValue, newRight)
            } else if (left.doubledRight()) {
                const newLeft = this.from(Color.B, left.left(), left.keyValue(), left.right().left());
                const rootKeyValue = left.right().keyValue();
                const newRight = this.from(Color.B, left.right().right(), x, right);
                return this.from(Color.B, newLeft, rootKeyValue, newRight);
            } else if (right.doubledLeft()) {
                const newLeft = this.from(Color.B, left, x, right.left().left());
                const rootKeyValue = right.left().keyValue();
                const newRight = this.from(Color.B, right.left().right(), right.keyValue(), right.right());
                return this.from(Color.B, newLeft, rootKeyValue, newRight);
            } else if (right.doubledRight()) {
                const newLeft = this.from(Color.B, left, x, right.left());
                const rootKeyValue = right.keyValue();
                const newRight = right.right().paint(Color.B);
                return this.from(Color.B, newLeft, rootKeyValue, newRight);
            // end Matt Might's deletion cases

            // Matt Might's negative black cases
            } else if (right.isNB()) {
                if (right.left().isB() && right.right().isB()) {
                    const newLeft = this.from(Color.B, left, x, right.left().left());
                    const rootKeyValue = right.left().keyValue();
                    const newRight = this.balance(
                                            Color.B,
                                            right.left().right(),
                                            right.keyValue(),
                                            right.right().redden(),
                    );
                    return this.from(Color.B, newLeft, rootKeyValue, newRight);
                } else {
                    return this.from(c, left, x, right);
                }
            } else if (left.isNB()) {
                if (left.left().isB() && left.right().isB()) {
                    const newLeft = this.balance(
                                        Color.B,
                                        left.left().redden(),
                                        left.keyValue(),
                                        left.right().left(),
                        
                    );
                    const rootKeyValue = left.right().keyValue();
                    const newRight = this.from(Color.B, left.right().right(), x, right);
                    return this.from(Color.B, newLeft, rootKeyValue, newRight);
                } else {
                    return this.from(c, left, x, right);
                }
            } else {
                return this.from(c, left, x, right);
            }
        }

        return this.from(c, left, x, right);
    }

    private remove(): TreeMap<K, V> {
        if (this.isEmpty()) return this.empty();
        else if (this.isR() && this.left().isEmpty() && this.right().isEmpty()) return this.empty();
        // deletion of double black leaf
        else if (this.isB() && this.left().isEmpty() && this.right().isEmpty()) return this.doubleBlackLeaf();
        else if (this.isB() && this.left().isEmpty() && this.right().isR()) return this.right().paint(Color.B);
        else if (this.isB() && this.left().isR() && this.right().isEmpty()) return this.left().paint(Color.B);
        else {
            // find max in the left subtree and move it to the root
            const maxTreeValue = this.left().maxSubTreeKeyValue();
            // remove max in the left subtree from the left subtree
            const rmMax = this.left().removeMax();
            return this.bubble(this.color, rmMax, maxTreeValue, this.right());
        }
    }

    private removeMax(): TreeMap<K, V> {
        if (this.isEmpty()) throw new Error("cannot remove max from empty tree");
        else if (this.right().isEmpty()) {
            return this.remove();
        } else {
            return this.bubble(this.color, this.left(), this.keyValue(), this.right().removeMax())
        }
    }

    private doubledLeft(): boolean {
        const res = !this.isEmpty()
            && this.isR()
            && this.left().isR();
        return res ?? false;
    }

    private doubledRight(): boolean {
        const res = !this.isEmpty()
            && this.isR()
            && this.right().isR();
        return res ?? false;
    }

    private paint(color: Color): TreeMap<K, V> {
        if (this.isEmpty()) return this.empty();
        return new TreeMap(this.compare, color, this.leftTree, this.root, this.rightTree);
    }

    minSubTree(): TreeMap<K, V> {
        if (this.isEmpty()) throw new Error("cannot get min value from empty tree");
        return this.left().isEmpty() ? this : this.left().minSubTree();
    }

    maxSubTree(): TreeMap<K, V>  {
        if (this.isEmpty()) throw new Error("cannot get max value from empty tree");
        return this.right().isEmpty() ? this : this.right().maxSubTree();
    }

    minSubTreeKeyValue(): KeyValuePair<K, V> {
        if (this.isEmpty()) throw new Error("cannot get min value from empty tree");
        return this.left().isEmpty() ? this.keyValue() : this.left().minSubTreeKeyValue();
    }

    maxSubTreeKeyValue(): KeyValuePair<K, V> {
        if (this.isEmpty()) throw new Error("cannot get max value from empty tree");
        return this.right().isEmpty() ? this.keyValue() : this.right().maxSubTreeKeyValue();
    }

    private update(key: K, newValue: V): TreeMap<K, V> {
        if (this.isEmpty()) return this;

        const y = this.keyValue();
        const cmp = this.compare(key, y.key);

        if (cmp < 0) {
            return this.from(this.color, this.left().update(key, newValue), y, this.right())
        } else if (cmp > 0) {
            return this.from(this.color, this.left(), y, this.right().update(key, newValue));
        } else {
            // key found, update it
            return this.from(this.color, this.left(), this.keyValuePair(key, newValue), this.right());
        }
    }

    private keyValuePair(key: K, value: V): KeyValuePair<K, V> {
        return { key, value };
    }
    
    successorTree(): TreeMap<K, V> | null {
        if (this.right().isEmpty()) return null;
        return this.right().minSubTree();
    }

    predecessorTree(): TreeMap<K, V> | null {
        if (this.left().isEmpty()) return null;
        return this.left().maxSubTree();
    }

    // methods for printing
    private printTreeHelper(space: number): void {
        if (!this.isEmpty()) {
            space += 10;
            this.right().printTreeHelper(space);

            const color = this.color === Color.R ? 'R' : 'B';
            const rootString = this.key() + color;
            console.log(' '.repeat(space) + rootString);

            this.left().printTreeHelper(space);
        }
    }

    public printTree(): void {
        this.printTreeHelper(0);
    }

    // Methods to check invariants
    isBST(): boolean {
        return this.isBSTHelper();
    }

    private isBSTHelper(): boolean {
        if (this.isEmpty()) return true;

        if (!this.left().isEmpty() && this.compare(this.left().key(), this.key()) >= 0) return false;

        if (!this.right().isEmpty() && this.compare(this.right().key(), this.key()) >= 0) return false;

        return this.left().isBSTHelper() && this.right().isBSTHelper();
    }

    redInvariant(): boolean {
        return this.redInvariantHelper();
    }

    private redInvariantHelper(): boolean {
        if (this.isEmpty()) return true;

        if (this.isR()) {
            if (this.left().isR()   || this.right().isR()) {
                return false;
            }
        }

        return this.left().redInvariantHelper() && this.right().redInvariantHelper();
    }

    /**
     * Validate every path in the tree has the same black height.
     * This is the black height invariant.
     * @returns true if the black height invariant is maintained.
     */
    public blackBalancedInvariant(): boolean {
        return this.blackBalancedHelper() !== -1;
      }
      
    private blackBalancedHelper(): number {
        // empty leaf nodes are black
        if (this.isEmpty()) {
            return 1;
        }
        
        const lh = this.left().blackBalancedHelper();
        if (lh === -1) return -1;
        
        const rh = this.right().blackBalancedHelper();
        if (rh === -1) return -1;
        
        if (lh !== rh) return -1;
        
        // If this node is black, increment black height by 1
        return lh + (this.isB() ? 1 : 0);
    }

    /**
     * Validates if the red-black tree is a binary search tree.
     * Then it validates that there are no consecutive red nodes.
     * Lastly, it validates that the black height invariant is maintained.
     * 
     * All of this is done in a single traversal of the tree. 
     * @returns true if the tree is a valid red-black tree.
     */
    validateRedBlackTree(): boolean {
        return this.validateRedBlackTreeHelper() !== -1;
    }

    private validateRedBlackTreeHelper(): number {
        if (this.isEmpty()) return 1;

        // Validate BST properties

        if (!this.left().isEmpty() && this.compare(this.left().key(), this.key()) >= 0) return -1;
        if (!this.right().isEmpty() && this.compare(this.key(), this.right().key()) >= 0) return -1;

        // Check for consecutive red nodes
        if (this.isR()) {
            if (this.left().isR() || this.right().isR()) {
                return -1;
            }
        }

        const lh = this.left().validateRedBlackTreeHelper();
        if (lh === -1) return -1;

        const rh = this.right().validateRedBlackTreeHelper();
        if (rh === -1) return -1;

        if (lh !== rh) return -1;

        return lh + (this.isB() ? 1 : 0);
    }


    // end Red-Black Tree methods 

    static defaultComparator<T>(a: T, b: T): number {
        return a < b ? -1 : a > b ? 1 : 0;
    }

    getRoot(): KeyValuePair<K, V> | null {
        return this.root;
    }

    size(): number {
        let count = 0;
        for (const _ of this){
            count++;
        }
        return count;
    }

    get(key: K): V | undefined {
        return this.getNode(key)?.value;
    }

    /**
     * First key is the leftmost key in the tree.
     * @returns the first key in the tree or undefined if the tree is empty
     */
    firstKey(): K | undefined {
        const min = this.findMin();
        return min?.key;
    }

    lastKey(): K | undefined {
        const max = this.findMax();
        return max?.key;
    }

    setFirst(): TreeMap<K, V> {
        throw new Error("Unsupported operand")
    }

    setLast(): TreeMap<K, V> {
        throw new Error("Unsupported operand")
    }

    setAll(entries: Iterable<KeyValuePair<K, V>>): TreeMap<K, V> {
        let newTree: TreeMap<K, V> = this;

        for (const entry of entries) {
            newTree = newTree.set(entry.key, entry.value);
        }
        return newTree;
    }


    entries(): KeyValuePair<K, V>[] {
        // need to do this mapping because it is calling super which is using the symbol iterator which maps over the nodes. 
        return super.entries().map(entry => ({ key: entry.key, value: entry.value }));
    }

    keys(): K[] {
        return super.keys();
    }

    values(): V[] {
        return super.values();
    }

    has(key: K): boolean {
        return this.get(key) !== undefined;
    }

    hasValue(value: V): boolean {
        for (const entry of this) {
            if (entry.value === value) {
                return true;
            }
        }
        return false;
    }

    hasAll<H extends K>(keys: Iterable<H>): boolean {
        for (const key of keys) {
            if (!this.has(key)) {
                return false;
            }
        }
        return true
    }

    public containsSpeed(): Speed {
        return Speed.Log;
    }


    deleteAll(keys: Iterable<K>): TreeMap<K, V> {
        let newTree: TreeMap<K, V> = this;
        for (const key of keys) {
            newTree = newTree.delete(key);
        }
        return newTree;
    }

    clear(): TreeMap<K, V> {
        return this.empty();
    }

    equals(o: Object): boolean {
        if (this === o) return true;
        if (!(o instanceof TreeMap)) return false;
        if (this.size() !== o.size()) return false;

        const other = o as TreeMap<K, V>;

        return this.every((value, key) => {
            const otherValue = other.get(key);
            return otherValue !== undefined && value === otherValue;
        });

    }

    hashCode(): number {
        if (this._hashCode === null) {
            let hash = 0;
            for (const entry of this) {
                const entryKeyHash = HashCode.hashCode(entry.key);
                const entryValueHash = HashCode.hashCode(entry.value);
                hash += entryKeyHash ^ entryValueHash;
            }
            this._hashCode = hash;
        }
        return this._hashCode;
    }

    toString(): string {
        let res = "{";
        for (const entry of this) {
            res += entry.toString() + ", ";
        }
        return res + "}";
    }

    getOrDefault(key: K, defaultValue: V): V {
        const value = this.get(key);
        return value !== undefined ? value : defaultValue;
    }

    /**
     * If the specified key is not already associated with a value (or is mapped to null)
     * computes its value using the given mapping function and enters it into this map unless null.
     * @param key
     * @param func
     */
    computeIfAbsent(key: K, func: (key: K) => V): [TreeMap<K, V>, V] {
        const value = this.get(key);
        if (value === undefined) {
            const newValue = func(key);
            const newTree = this.set(key, newValue);
            return [newTree, newValue];
        }
        return [this, value!];
    }

    /**
     * If the value for the specified key is present and non-null, attempts to compute
     * a new mapping given the key and its current mapped value.
     * @param key
     * @param func
     */

    computeIfPresent(key: K, func: (key: K, value: V) => V): [TreeMap<K, V>, V] {
        const value = this.get(key);
        if (value !== undefined) {
            const newValue = func(key, value);
            const newTree = this.set(key, newValue);
            return [newTree, newValue];
        }
        return [this, value!];
    }

    /**
     * Attempts to compute a mapping for the specified key and its current
     * mapped value (or null if there is no current mapping).
     * @param key
     * @param func
     */
    compute(key: K, func: (key: K, value: (V | undefined)) => V): [TreeMap<K, V>, V] {
        const value = this.get(key);
        const newValue = func(key, value);
        const newTree = this.set(key, newValue);
        return [newTree, newValue];
    }

    ofEntries(...entries: KeyValuePair<K, V>[]): TreeMap<K, V> {
        let newTree = new TreeMap<K, V>(this.compare);
        for (const entry of entries) {
            newTree = newTree.set(entry.key, entry.value);
        }
        return newTree;
    }

    static of<K, V>(comparer: Comparator<K>, ...entries: KeyValuePair<K, V>[]): TreeMap<K, V> {
        let newTree = new TreeMap<K, V>(comparer);
        for (const entry of entries) {
            newTree = newTree.set(entry.key, entry.value);
        }
        return newTree;
    }

    entry(k: K, v: V): KeyValuePair<K, V> {
        return { key: k, value: v };
    }

    copyOf(map: Map<K, V>): TreeMap<K, V> {
        let newTree = new TreeMap<K, V>(this.compare);
        for (const entry of map.entries()) {
            newTree = newTree.set(entry.key, entry.value);
        }
        return newTree;
    }

    // Higher Order Functions
    every(predicate: (value: V, key: K, map: this) => boolean, thisArg?: any): this is Map<K, V>;
    every(predicate: (value: V, key: K, map: this) => unknown, thisArg?: any): boolean;
    every(predicate: (value: V, key: K, map: this) => unknown, thisArg?: any): unknown {
        return super.every(predicate, thisArg);
    }

    some(predicate: (value: V, key: K, map: this) => boolean, thisArg?: any): boolean {
        return super.some(predicate, thisArg);
    }

    /**
     * Sort will use the old comparer if a new one is not defined.
     * @param compare
     */
    sort(compare?: Comparator<K>): TreeMap<K, V> {
        let newTreeMap = new TreeMap<K, V>(compare ?? this.compare);
        for (const entry of this) {
            newTreeMap = newTreeMap.set(entry.key, entry.value);
        }
        return newTreeMap;
    }

    sortBy<C>(
        comparatorValueMapper: (value: V, key: K, map: this) => C,
        compare?: Comparator<C>
      ): TreeMap<K | C, V> {
        // Map each entry to a new key using the provided comparatorValueMapper
        const mappedEntries: { key: K | C, value: V }[] = [];
        for (const entry of this.entries()) {
          const newKey = comparatorValueMapper(entry.value, entry.key, this);
          mappedEntries.push({ key: newKey, value: entry.value });
        }
      
        // Sort the mapped entries using the provided comparator if given,
        // otherwise use a default comparator that can compare values of type K | C.
        mappedEntries.sort((a, b) => {
          if (compare) {
            return compare(a.key as C, b.key as C);
          } else {
            // Default comparator assuming the new key supports < and >
            return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
          }
        });
      
        // Build a new TreeMap using a comparator for keys of type K | C.
        const newComparator: Comparator<K | C> = compare
          ? ((a, b) => compare(a as C, b as C))
          : ((a, b) => a < b ? -1 : a > b ? 1 : 0);
      
        let newTree = new TreeMap<K | C, V>(newComparator);
        for (const entry of mappedEntries) {
          newTree = newTree.set(entry.key, entry.value);
        }
        return newTree;
      }

    forEach(callback: (value: V, key: K, map: this) => void, thisArg?: any) {
        for (const entry of this) {
            callback.call(thisArg, entry.value, entry.key, this);
        }
    }

    find(predicate: (value: V, key: K, map: this) => boolean, thisArg?: any): V | undefined {
        for (const entry of this) {
            if (predicate(entry.value, entry.key, this)) {
                return entry.value;
            }
        }
        return undefined;
    }

    reduce(callback: (accumulator: V, value: V, key: K, map: this) => V, initialValue?: V): V;
    reduce<R>(callback: (accumulator: R, value: V, key: K, map: this) => R, initialValue?: R): R;
    reduce<R>(callback: (accumulator: R, value: V, key: K, map: this) => R, initialValue?: R): R {
        let acc: R = initialValue as R;
        for (const entry of this) {
            acc = callback(acc, entry.value, entry.key, this);
        }
        return acc;
    }

    /**
     * reduceRight method to reduce the map from right to left
     * @param callback
     * @param initialValue
     */
    reduceRight(callback: (accumulator: V, value: V, key: K, map: this) => V, initialValue?: V): V;
    reduceRight<R>(callback: (accumulator: R, value: V, key: K, map: this) => R, initialValue?: R): R;
    reduceRight<R>(callback: (accumulator: R, value: V, key: K, map: this) => R, initialValue?: R): R {
        let acc: R = initialValue as R;
        const entries = [...this.entries()];
        for (let i = entries.length - 1; i >= 0; i--) {
            acc = callback(acc, entries[i].value, entries[i].key, this);
        }
        return acc;
    }

    updateOrAdd(key: K, callback: (value: V) => V): TreeMap<K, V>;
    updateOrAdd(key: K, callback: (value: V | undefined) => V | undefined): TreeMap<K, V | undefined>;
    updateOrAdd(key: K, newValue: V): TreeMap<K, V>;
    updateOrAdd(key: K, callbackOrValue: ((value: any) => any) | V): TreeMap<K, any> {
        if (typeof callbackOrValue === 'function') {
            const callback = callbackOrValue as (value: V) => V;
            if (this.has(key)) {
                return this.update(key, callback(this.get(key)!));
            } else {
                return this.set(key, callback(this.get(key) as any))
            }
        } else {
            const newValue = callbackOrValue as V;
            if (this.has(key)) {
                return this.update(key, newValue);
            } else {
                return this.set(key, newValue);
            }
        }
    }



    isCustomMap(obj: any): obj is Map<any, any> {
        return obj && typeof obj.set === "function" && typeof obj.entries === "function";
    }

    merge<KC, VC>(
        ...collections: Array<Iterable<KeyValuePair<KC, VC>>>
    ): TreeMap<K | KC, Exclude<V, VC> | VC>;
    merge<C>(
        ...collections: Array<{ [key: string]: C }>
    ): TreeMap<K | string, Exclude<V, C> | C>;
    merge<KC, VC>(other: Map<KC, VC>): TreeMap<K | KC, V | VC>;
    merge(...collections: any[]): TreeMap<any, any> {
        let newTree = this as TreeMap<any, any>;

        for (const collection of collections) {
            if (this.isCustomMap(collection)) {
                for (const {key, value} of collection.entries()) {
                    newTree = newTree.set(key, value);
                }
            } else if (Array.isArray(collection)) {
                for (const {key, value} of collection) {
                    newTree = newTree.set(key, value);
                }
            } else if (typeof collection === 'object' && collection !== null) {
                for (const key in collection) {
                    if (collection.hasOwnProperty(key)) {
                        newTree = newTree.set(key as any, collection[key]);
                    }
                }
            }
        }

        return newTree;
    }

    concat<KC, VC>(
        ...collections: Array<Iterable<KeyValuePair<KC, VC>>>
    ): TreeMap<K | KC, Exclude<V, VC> | VC>;    
    concat<C>(
        ...collections: Array<{ [key: string]: C }>
    ): TreeMap<K | string, Exclude<V, C> | C>;
    concat(...collections: any[]): TreeMap<any, any> {
        let newTree = this as TreeMap<any, any>;

        for (const collection of collections) {
            if (Array.isArray(collection)) {
                for (const {key, value} of collection) {
                    newTree = newTree.set(key, value);
                }
            } else if (typeof collection === 'object' && collection !== null) {
                for (const key in collection) {
                    if (collection.hasOwnProperty(key)) {
                        newTree = newTree.set(key as any, collection[key]);
                    }
                }
            }
        }

        return newTree;
    }

    mergeWith<KC, VC, VCC>(
        callback: (oldVal: V, newVal: VC, key: K) => VCC,
        ...collections: Array<Iterable<KeyValuePair<KC, VC>>>
    ): TreeMap<K | KC, V | VC | VCC>;
    mergeWith<C, CC>(
        callback: (oldVal: V, newVal: C, key: string) => CC,
        ...collections: Array<{ [key: string]: C }>
    ): TreeMap<K | string, V | C | CC>;
    mergeWith(
        callback: (oldVal: V, newVal: any, key: any) => any,
        ...collections: any[]
    ): TreeMap<any, any> {
        let newTree = this as TreeMap<any, any>;

        for (const collection of collections) {
            if (Array.isArray(collection)) {
                for (const { key, value } of collection) {
                    if (newTree.has(key)) {
                        newTree = newTree.update(key, callback(newTree.get(key)!, value, key));
                    } else {
                        newTree = newTree.set(key, value);
                    }
                }
            } else if (typeof collection === 'object' && collection !== null) {
                for (const key in collection) {
                    if (newTree.has(key)) {
                        newTree = newTree.update(key, callback(newTree.get(key)!, collection[key], key));
                    } else {
                        newTree = newTree.set(key, collection[key]);
                    }
                }
            }
        }
        return newTree;
    }

    // mergeDeep<KC, VC>(
    //     ...collections: Array<Iterable<[KC, VC]>>
    // ): TreeMap<K | KC, V | VC>;
    // mergeDeep<C>(
    // ...collections: Array<{ [key: string]: C }>
    // ): TreeMap<K | string, V | C>;
    // mergeDeep<KC, VC>(other: TreeMap<KC, VC>): TreeMap<K | KC, V | VC>;
    // mergeDeep(...collections: any[]): TreeMap<any, any> {
    //     let newTree = this as TreeMap<any, any>;
        
    //     for (const collection of collections) {
    //         if (this.isCustomMap(collection)) {
    //             for (const {key, value} of collection.entries()) {
    //                 newTree = newTree.setDeep(key, value);
    //             }
    //         } else if (Array.isArray(collection)) {
    //             for (const {key, value} of collection) {
    //                 newTree = newTree.setDeep(key, value);
    //             }
    //         } else if (typeof collection === 'object' && collection !== null) {
    //             for (const key in collection) {
    //                 if (collection.hasOwnProperty(key)) {
    //                     newTree = newTree.setDeep(key as any, collection[key]);
    //                 }
    //             }
    //         }
    //     }

    //     return newTree;
    // }

    // private setDeep(key: any, value: any): TreeMap<any, any> {
    //     if (this.has(key)) {
    //         const existingValue = this.get(key);
    //         if (typeof existingValue === 'object' && existingValue !== null && typeof value === 'object' && value !== null) {
    //             const mergedValue = this.mergeDeepObjects(existingValue, value);
    //             return this.set(key, mergedValue);
    //         }
    //     }
    //     return this.set(key, value);
    // }
    
    // private mergeDeepObjects(obj1: any, obj2: any): any {
    //     const result = { ...obj1 };
    //     for (const key in obj2) {
    //         if (obj2.hasOwnProperty(key)) {
    //             if (typeof obj2[key] === 'object' && obj2[key] !== null && typeof obj1[key] === 'object' && obj1[key] !== null) {
    //                 result[key] = this.mergeDeepObjects(obj1[key], obj2[key]);
    //             } else {
    //                 result[key] = obj2[key];
    //             }
    //         }
    //     }
    //     return result;
    // }

    map<M>(
        callback: (value: V, key: K, map: this) => M,
        thisArg?: unknown
    ): TreeMap<K, M> {
        let newTree = new TreeMap<K, M>(this.compare);
        for (const {key, value} of this.entries()) {
            newTree = newTree.set(key, callback.call(thisArg, value, key, this));
        }
        return newTree;
    }

    mapKeys<M>(
        callback: (key: K, value: V, map: this) => M,
        thisArg?: unknown,
        compare?: Comparator<M>
    ): TreeMap<M, V> {
        const keyComparator = compare ?? TreeMap.defaultComparator<M>;
        let newTree = new TreeMap<M, V>(compare);
        for (const {key, value} of this.entries()) {
            newTree = newTree.set(callback.call(thisArg, key, value, this), value);
        }
        return newTree;
    }

    mapEntries<KM, VM>(
        mapper: (
          entry: KeyValuePair<K, V>,
          index: number,
          map: this
        ) => KeyValuePair<KM, VM> | undefined,
        thisArg?: unknown,
        compare?: Comparator<KM>
      ): TreeMap<KM, VM> {
        const newCompare = compare ?? TreeMap.defaultComparator<KM>;
        let newTree = new TreeMap<KM, VM>(newCompare);
        let index = 0;
        for (const entry of this.entries()) {
          const newEntry = mapper.call(thisArg, entry, index++, this);
          if (newEntry) {
            newTree = newTree.set(newEntry.key, newEntry.value);
          }
        }
        return newTree;
      }

    flatMap<KM, VM>(
        callback: (value: V, key: K, map: this) => Iterable<KeyValuePair<KM, VM>>,
        thisArg?: unknown,
        compare?: Comparator<KM>
    ): TreeMap<KM, VM> {
        const newCompare = compare ?? TreeMap.defaultComparator<KM>;
        let newTree = new TreeMap<KM, VM>(newCompare);

        for (const {key, value} of this.entries()) {
            for (const {key: newKey, value: newValue} of callback.call(thisArg, value, key, this)) {
                newTree = newTree.set(newKey, newValue);
            }
        }
        return newTree;
    }

    filter<F extends V>(
        predicate: (value: V, key: K, map: this) => value is F,
        thisArg?: unknown,
      ): TreeMap<K, F>;
    filter(
        predicate: (value: V, key: K, map: this) => unknown,
        thisArg?: unknown
    ): TreeMap<K, V>;
    filter(
        predicate: (value: V, key: K, map: this) => unknown,
        thisArg?: unknown
    ): TreeMap<any, any> {
        let newTree = new TreeMap<any, any>(this.compare);
        for (const {key, value} of this.entries()) {
            if (predicate.call(thisArg, value, key, this)) {
                newTree = newTree.set(key, value);
            }
        }
        return newTree;
    }

    partition<F extends V, C>(
        predicate: (this: C, value: V, key: K, map: this) => value is F,
        thisArg?: C
      ): [TreeMap<K, V>, TreeMap<K, F>];
    partition<C>(
        predicate: (this: C, value: V, key: K, map: this) => unknown,
        thisArg?: C
    ): [TreeMap<K, V>, TreeMap<K, V>];
    partition(
        predicate: (value: V, key: K, map: this) => unknown,
        thisArg?: unknown
    ): [TreeMap<K, V>, TreeMap<K, V>] {
        let trueTree = new TreeMap<K, V>(this.compare);
        let falseTree = new TreeMap<K, V>(this.compare);
        for (const {key, value} of this.entries()) {
            if (predicate.call(thisArg, value, key, this)) {
                trueTree = trueTree.set(key, value);
            } else {
                falseTree = falseTree.set(key, value);
            }
        }
        return [trueTree, falseTree];
    }

    flip(): TreeMap<V, K> {
        let newTree = new TreeMap<V, K>(TreeMap.defaultComparator);
        for (const {key, value} of this.entries()) {
            newTree = newTree.set(value, key);
        }
        return newTree;
    }


    // end HOFs

    findMin(key?: K): KeyValuePair<K, V> | undefined {
        if (key === undefined) {
            if (this.isEmpty()) return undefined;
            return this.minSubTreeKeyValue();
        }

        let current: TreeMap<K, V> = this;
        while (!current.isEmpty()) {
            const cmp = this.compare(key, current.key());
            if (cmp < 0) {
                current = current.left();
            } else if (cmp > 0) {
                current = current.right();
            } else {
                return current.minSubTreeKeyValue();
            }
        }
        return undefined;
    }

    // findMin(): KeyValuePair<K, V> {
    //     if (this.isEmpty()) throw new Error("cannot get min value from empty tree");
    //     return this.minSubTreeKeyValue();
    // }

    deleteMin(): TreeMap<K, V> {
        if (this.isEmpty()) return this.empty();
        const min = this.findMin();
        if (min === undefined) return this;
        return this.delete(min.key);
    }

    findMax(key?: K): KeyValuePair<K, V> | undefined {
        if (key === undefined) {
            if (this.isEmpty()) return undefined;
            return this.maxSubTreeKeyValue();
        }

        let current: TreeMap<K, V> = this;
        while (!current.isEmpty()) {
            const cmp = this.compare(key, current.key());
            if (cmp < 0) {
                current = current.left();
            } else if (cmp > 0) {
                current = current.right();
            } else {
                return current.maxSubTreeKeyValue();
            }
        }
        return undefined;
    }
   

    deleteMax(): TreeMap<K, V> {
        if (this.isEmpty()) return this.empty();
        const max = this.findMax();
        if (max === undefined) return this;
        return this.delete(max.key);
    }

    tryPredecessor(key: K, out: KeyValuePair<K, V>): boolean {
        throw new Error("Method not implemented.");
    }

    trySuccessor(key: K, out: KeyValuePair<K, V>): boolean {
        throw new Error("Method not implemented.");
    }

    tryWeakPredecessor(key: K, out: KeyValuePair<K, V>): boolean {
        throw new Error("Method not implemented.");
    }

    tryWeakSuccessor(key: K, out: KeyValuePair<K, V>): boolean {
        throw new Error("Method not implemented.");
    }

    /**
     * Return the predecessor of given key
     * Predecessor is the largest element in the tree strictly less than the given
     * @param key 
     * @returns the predecessor of the key in the tree or undefined if the key is not in the tree.
     */
    predecessor(key: K): KeyValuePair<K, V> | undefined {
        if (!this.has(key)) return undefined;

        let pred: KeyValuePair<K, V> | undefined = undefined;
        let current: TreeMap<K, V> = this;

        while (!current.isEmpty()) {
            const cmp = this.compare(key, current.key());
            if (cmp <= 0) {
                current = current.left();
            } else {
                pred = current.keyValue();
                current = current.right();
            }
        }

        return pred;
    }


    /**
     * Return the successor of the given key
     * Successor is the smallest element in the tree strictly greater than the given key
     * @param key
     * @returns the successor of the given key or undefined if the key is the maximum key in the tree 
     */
    successor(key: K): KeyValuePair<K, V> | undefined {
        if (!this.has(key)) return undefined;

        let succ: KeyValuePair<K, V> | undefined = undefined;
        let current: TreeMap<K, V> = this;

        while (!current.isEmpty()) {
            const cmp = this.compare(key, current.key());
            if (cmp < 0) {
                succ = current.keyValue();
                current = current.left();
            } else {
                current = current.right();
            }
        }
        return succ;
    }
}


// function createRandomIntArray(size: number, min: number = 0, max: number = 100): number[] {
//     return Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);
// }

// function shuffleArray<T>(array: T[]): T[] {
//     for (let i = array.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [array[i], array[j]] = [array[j], array[i]];
//     }
//     return array;
// }

// const largeArray = createRandomIntArray(1_000_000, 1, 1000);
// let treemap = new TreeMap<number, string>();

// for (const elem of largeArray) {
//     treemap = treemap.set(elem, elem.toString());
//     if (!treemap.isBST()) {
//         console.log("Tree is not a valid BST after insertion");
//         treemap.printTree();
//     }
//     if (!treemap.redInvariant()) {
//         console.log("red invariant violated after insertion");
//         treemap.printTree();
//     }
//     if (!treemap.blackBalancedInvariant()) {
//         console.log("black balanced invariant violated after insertion");
//         treemap.printTree();
//     }
//     if (!treemap.validateRedBlackTree()) {
//         console.log("Tree is not a valid red-black tree after insertion");
//         treemap.printTree();
//     }
// }

// const elemsToDelete = shuffleArray(largeArray);
// for (const elem of elemsToDelete) {
//     treemap = treemap.delete(elem);
//     if (!treemap.isBST()) {
//         console.log("Tree is not a valid BST after deletion");
//         treemap.printTree();
//     }
//     if (!treemap.redInvariant()) {
//         console.log("red invariant violated after deletion");
//         treemap.printTree();
//     }
//     if (!treemap.blackBalancedInvariant()) {
//         console.log("black balanced invariant violated after deletion");
//         treemap.printTree();
//     }
//     if(!treemap.validateRedBlackTree()) {
//         console.log("Tree is not a valid red-black tree after deletion");
//         treemap.printTree();
//     }
// }


const arr = [50, 40, 30, 10, 20, 30, 100, 0, 45, 55, 25, 15];
// const arr = [1,3, 2, 6, 5, 4];
// const arr = [1,3,2]
const compareAscending = (a: number, b: number) => {
    return a-b;
}

const compareDescending = (a: number, b: number) => {
    return b-a;
}
let treemap = new TreeMap<number, string>(compareAscending);
let treemapReversed = new TreeMap<number, string>(compareDescending);

for (const elem of arr) {
    treemap = treemap.set(elem, elem.toString());
    treemapReversed = treemapReversed.set(elem, elem.toString());
}

treemap.printTree();
console.log("---------------------------------------------------------")
treemapReversed.printTree();

const keys1 = treemap.keys();
console.log(keys1);

const keys = treemapReversed.keys();
console.log(keys);
