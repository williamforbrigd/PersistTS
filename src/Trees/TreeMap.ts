import { Speed } from "../Enums/Speed";
import HashCode from "../Hashing/HashCode";
import Map from "../Interfaces/Map";
import {Comparator} from "../Interfaces/Comparator";
import SortedMap from "../Interfaces/SortedMap"

import AbstractMap from "../AbstractClasses/AbstractMap";
import EqualityComparer from "../Interfaces/EqualityComparer";
import Sorting from "../Sorting/Sorting";

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
export default class TreeMap<K, V> extends AbstractMap<K, V> implements SortedMap<K, V> {
    // private static readonly EMPTY = new TreeMap<any, any>(TreeMap.defaultComparator, Color.B, null, null, null);
    private _hashCode: number | null = null; // cache the hashcode which is computed only once

    constructor(
        private readonly compare: Comparator<K> = TreeMap.defaultComparator<K>,
        private readonly color: Color = Color.B,
        private readonly leftTree: TreeMap<K, V> | null = null,
        private readonly root: [K, V] | null = null,
        private readonly rightTree: TreeMap<K, V> | null = null,
        ) {
        super();
    }
    
    //Iterator methods
    *[Symbol.iterator](): MapIterator<[K, V]> {
        yield* this.inOrderTraversal();
    }

    *inOrderTraversal(): MapIterator<[K, V]> {
        if (!this.isEmpty()) {
            yield* this.left().inOrderTraversal();
            yield this.keyValue();
            yield* this.right().inOrderTraversal();
        }
    }

    *preOrderTraversal(): MapIterator<[K, V]> {
        if (!this.isEmpty()) {
            yield this.keyValue();
            yield* this.left().preOrderTraversal();
            yield* this.right().preOrderTraversal();
        }
    }

    *postOrderTraversal(): MapIterator<[K, V]> {
        if (!this.isEmpty()) {
            yield* this.left().postOrderTraversal();
            yield* this.right().postOrderTraversal();
            yield this.keyValue();
        }
    }


    // Red-Black Tree methods
    from(color: Color, left: TreeMap<K, V>, root: [K, V], right: TreeMap<K, V>): TreeMap<K, V> {
        if (!left.isEmpty() && this.compare(left.key(), root[0]) >= 0) {
            throw new Error("left subtree value must be less than root value");
        }
        if (!right.isEmpty() && this.compare(right.key(), root[0]) <= 0) {
            throw new Error("right subtree value must be greater than root value");
        }
        return new TreeMap(this.compare, color, left, root, right);
    }

    isEmpty(): boolean {
        return this.root === null;
    }

    private isDoubleBlackLeaf(): boolean {
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

    private keyValue(): [K, V] {
        if (this.isEmpty()) throw new Error("Tree is empty. Cannot get the root key value pair");
        return this.root!;
    }

    private key(): K {
        return this.keyValue()[0];
    }

    private value(): V {
        return this.keyValue()[1];
    }

    private left(): TreeMap<K, V> {
        if (!this.leftTree) return this.empty();
        return this.leftTree;
    }

    private right(): TreeMap<K, V> {
        if (!this.rightTree) return this.empty();
        return this.rightTree;
    }

    private isB(): boolean {
        return !this.isEmpty() && this.color === Color.B;
    }

    private isR(): boolean {
        return !this.isEmpty() && this.color === Color.R;
    }

    private isBB(): boolean {
        if (this.isDoubleBlackLeaf()) return true;
        return !this.isEmpty() && this.color === Color.BB;
    }

    private isNB(): boolean {
        return !this.isEmpty() && this.color === Color.NB;
    }

    private getNode(x: K): [K, V] | null {
        if (this.isEmpty()) return null;
        const y = this.key();
        const cmp = this.compare(x, y);
        if (cmp < 0) return this.left().getNode(x);
        if (cmp > 0) return this.right().getNode(x);
        return this.keyValue();
    }

    private redden(): TreeMap<K, V> {
        if (this.isEmpty()) throw new Error("cannto redden empty tree");
        else if (this.isDoubleBlackLeaf()) throw new Error("cannot redden double black tree");
        return this.paint(Color.R);
    }

    private blacken(): TreeMap<K, V> {
        if (this.isEmpty()) return this.empty();
        else if (this.isDoubleBlackLeaf()) this.empty();
        return this.paint(Color.B);
    }

    private blacker(c: Color): Color {
        switch (c) {
            case Color.B: return Color.BB;
            case Color.R: return Color.B;
            case Color.NB: return Color.R;
            case Color.BB: throw new Error("Cannot blacken double black");
        }
    }

    private redder(c: Color): Color {
        switch (c) {
            case Color.BB: return Color.B;
            case Color.B: return Color.R;
            case Color.R: return Color.NB;
            case Color.NB: throw new Error("cannot lighten negative black");
        }
    }

    private blackerTree(): TreeMap<K, V> {
        if (this.isEmpty()) return this.doubleBlackLeaf();
        return this.from(this.blacker(this.color), this.left(), this.keyValue(), this.right());
    }

    private redderTree(): TreeMap<K, V> {
        if (this.isDoubleBlackLeaf()) return this.empty();
        return this.from(this.redder(this.color), this.left(), this.keyValue(), this.right())
    }

    /**
     * Adds a new element with a specified key and value to the Map. If an element with the same key already exists, the element will be updated.
     * @param key
     * @param value
     */
    set(key: K, value: V): TreeMap<K, V> {
        return this.ins([key, value]).paint(Color.B);
    }

    private ins(x: [K, V]): TreeMap<K, V> {
        if (this.isEmpty()) return this.from(Color.R, this.empty(), x, this.empty());
        const y = this.keyValue();
        const c = this.color;

        const cmp = this.compare(x[0], y[0]);
        if (cmp < 0) {
            return this.bubble(c, this.left().ins(x), y, this.right());
        } else if (cmp > 0) {
            return this.bubble(c, this.left(), y, this.right().ins(x));
        } else {
            return this;
        }
    }

    delete(key: K, value?: V): TreeMap<K, V> {
        return this.del([key, value as any]).paint(Color.B);
    }

    private del(x: [K, V]): TreeMap<K, V> {
        if (this.isEmpty()) return this.empty();

        const y = this.keyValue();
        const c = this.color;
        const cmp = this.compare(x[0], y[0]);

        if (cmp < 0) {
            return this.bubble(c, this.left().del(x), y, this.right());
        } else if (cmp > 0) {
            return this.bubble(c, this.left(), y, this.right().del(x));
        } else  {
            // node found remove it
            return this.remove();
        }
    }

    private bubble(c: Color, left: TreeMap<K, V>, y: [K, V], right: TreeMap<K, V>): TreeMap<K, V> {
        if ((left.isBB()) || (right.isBB())) {
            return this.balance(this.blacker(c), left.redderTree(), y, right.redderTree());
        } else {
            return this.balance(c, left, y, right);
        }
    }

    private balance(c: Color, left: TreeMap<K, V>, x: [K, V], right: TreeMap<K, V>): TreeMap<K, V> {
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

    minSubTreeKeyValue(): [K, V] {
        if (this.isEmpty()) throw new Error("cannot get min value from empty tree");
        return this.left().isEmpty() ? this.keyValue() : this.left().minSubTreeKeyValue();
    }

    maxSubTreeKeyValue(): [K, V] {
        if (this.isEmpty()) throw new Error("cannot get max value from empty tree");
        return this.right().isEmpty() ? this.keyValue() : this.right().maxSubTreeKeyValue();
    }

    private update(key: K, newValue: V): TreeMap<K, V> {
        if (this.isEmpty()) return this;

        const y = this.keyValue();
        const cmp = this.compare(key, y[0]);

        if (cmp < 0) {
            return this.from(this.color, this.left().update(key, newValue), y, this.right())
        } else if (cmp > 0) {
            return this.from(this.color, this.left(), y, this.right().update(key, newValue));
        } else {
            // key found, update it
            return this.from(this.color, this.left(), [key, newValue], this.right());
        }
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

    getRoot(): [K, V] | null {
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
        return this.getNode(key)?.[1];
    }

    /**
     * First key is the leftmost key in the tree.
     * @returns the first key in the tree or undefined if the tree is empty
     */
    firstKey(): K | undefined {
        const min = this.findMin();
        return min?.[0];
    }

    lastKey(): K | undefined {
        const max = this.findMax();
        return max?.[0];
    }

    setFirst(): TreeMap<K, V> {
        throw new Error("Unsupported operand")
    }

    setLast(): TreeMap<K, V> {
        throw new Error("Unsupported operand")
    }

    setAll(entries: Iterable<[K, V]>): TreeMap<K, V> {
        let newTree: TreeMap<K, V> = this;

        for (const [k, v] of entries) {
            newTree = newTree.set(k, v);
        }
        return newTree;
    }


    entries(): [K, V][] {
        return super.entries();
    }

    keys(): K[] {
        return super.keys();
    }

    values(): V[] {
        return super.values();
    }

    has(key: K): boolean {
        const node = this.getNode(key);
        return node !== null
    }

    hasValue(value: V): boolean {
        for (const [k, v] of this) {
            if (v === value) {
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

    compareTo(o: TreeMap<K, V>): number {
        if (this === o) return 0;

        const sizeDiff = this.size() - o.size();
        if (sizeDiff !== 0) return sizeDiff;

        const iter1 = this[Symbol.iterator]();
        const iter2 = o[Symbol.iterator]();
        while (true) {
            const a = iter1.next();
            const b = iter2.next();
            if (a.done && b.done) return 0;

            if (a.done) return -1;
            if (b.done) return 1;

            const [ak, av] = a.value;
            const [bk, bv] = b.value;
            const keyCompare = this.compare(ak, bk);
            if (keyCompare !== 0) return keyCompare;

            // If keys match, compare values with a naive “default” ordering
            // (You can improve this if you have a comparator for values.)
            const valCompare = av < bv ? -1 : av > bv ? 1 : 0;
            if (valCompare !== 0) {
                return valCompare;
            }
        }
    }   

    // Speed of different types of operations

    hasSpeed(): Speed {
        return Speed.Log;
    }

    addSpeed(): Speed {
        return Speed.Log;
    }

    removeSpeed(): Speed {
        return Speed.Log;
    }

    /**
     * The hashcode is computed lazily, which means that it is only computed once and then cached.
     * Hashcode accounts for the order of the elements in the TreeMap.
     * @returns the hash code of the TreeMap
     */
    hashCode(): number {
        if (this._hashCode === null) {
            let hash = 1;
            for (const [k, v] of this) {
                const entryHash = 31 * HashCode.hashCode(k) + HashCode.hashCode(v);
                hash = 31 * hash + entryHash;
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

    of(key: K, value: V): TreeMap<K, V> {
        return this.set(key, value);
    }
    ofEntries(...entries: [K, V][]): TreeMap<K, V> {
        let newTree = new TreeMap<K, V>(this.compare);
        for (const [k, v] of entries) {
            newTree = newTree.set(k, v);
        }
        return newTree;
    }

    static of<K, V>(comparer: Comparator<K>, ...entries: [K, V][]): TreeMap<K, V> {
        let newTree = new TreeMap<K, V>(comparer);
        for (const [k, v] of entries) {
            newTree = newTree.set(k, v);
        }
        return newTree;
    }

    entry(k: K, v: V): [K, V] {
        return [k, v];
    }

    copyOf(map: Map<K, V>): TreeMap<K, V> {
        let newTree = new TreeMap<K, V>(this.compare);
        for (const [k, v] of map.entries()) {
            newTree = newTree.set(k, v);
        }
        return newTree;
    }

    // Higher Order Functions
    every(predicate: (value: V, key: K, map: this) => boolean, thisArg?: unknown): this is Map<K, V>;
    every(predicate: (value: V, key: K, map: this) => unknown, thisArg?: unknown): boolean;
    every(predicate: (value: V, key: K, map: this) => unknown, thisArg?: unknown): unknown {
        return super.every(predicate, thisArg);
    }

    some(predicate: (value: V, key: K, map: this) => boolean, thisArg?: unknown): boolean {
        return super.some(predicate, thisArg);
    }

    /**
     * Sort will use the old comparer if a new one is not defined.
     * @param compare
     */
    sort(compare?: Comparator<K>): TreeMap<K, V> {
        let newTreeMap = new TreeMap<K, V>(compare ?? this.compare);
        for (const [k, v] of this) {
            newTreeMap = newTreeMap.set(k, v);
        }
        return newTreeMap;
    }

    sortBy<C>(
        comparatorValueMapper: (value: V, key: K, map: this) => C,
        compare?: Comparator<C>
      ): TreeMap<K | C, V> {
        // Map each entry to a new key using the provided comparatorValueMapper
        // const mappedEntries: { key: K | C, value: V }[] = [];
        const mappedEntries: [K|C, V][] = [];
        for (const [k, v] of this.entries()) {
          const newKey = comparatorValueMapper(v, k, this);
          mappedEntries.push([newKey, v]);
        }
      
        // Sort the mapped entries using the provided comparator if given,
        // otherwise use a default comparator that can compare values of type K | C.
        // mappedEntries.sort((a, b) => {
        Sorting.timSort(mappedEntries, (a,b) => {
          if (compare) {
            return compare(a[0] as C, b[0] as C);
          } else {
            // Default comparator assuming the new key supports < and >
            return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;
          }
        });
      
        // Build a new TreeMap using a comparator for keys of type K | C.
        const newComparator: Comparator<K | C> = compare
          ? ((a, b) => compare(a as C, b as C))
          : ((a, b) => a < b ? -1 : a > b ? 1 : 0);
      
        let newTree = new TreeMap<K | C, V>(newComparator);
        for (const [k, v] of mappedEntries) {
          newTree = newTree.set(k, v);
        }
        return newTree;
      }

    forEach(callback: (value: V, key: K, map: this) => void, thisArg?: unknown) {
        for (const [k, v] of this) {
            callback.call(thisArg, v, k, this);
        }
    }

    find(predicate: (value: V, key: K, map: this) => boolean, thisArg?: unknown): V | undefined {
        for (const [k, v] of this) {
            if (predicate.call(thisArg, v, k, this)) {
                return v;
            }
        }
        return undefined;
    }

    reduce(callback: (accumulator: V, value: V, key: K, map: this) => V, initialValue?: V): V;
    reduce<R>(callback: (accumulator: R, value: V, key: K, map: this) => R, initialValue?: R): R;
    reduce<R>(callback: (accumulator: R, value: V, key: K, map: this) => R, initialValue?: R): R {
        let acc: R = initialValue as R;
        for (const [k, v] of this) {
            acc = callback(acc, v, k, this);
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
            acc = callback(acc, entries[i][1], entries[i][0], this);
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
        ...collections: Array<Iterable<[KC, VC]>>
    ): TreeMap<K | KC, Exclude<V, VC> | VC>;
    merge<C>(
        ...collections: Array<{ [key: string]: C }>
    ): TreeMap<K | string, Exclude<V, C> | C>;
    merge<KC, VC>(other: Map<KC, VC>): TreeMap<K | KC, V | VC>;
    merge(...collections: any[]): TreeMap<any, any> {
        let newTree = this as TreeMap<any, any>;

        for (const collection of collections) {
            if (this.isCustomMap(collection)) {
                for (const [key, value] of collection.entries()) {
                    newTree = newTree.set(key, value);
                }
            } else if (Array.isArray(collection)) {
                for (const [key, value] of collection) {
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
        ...collections: Array<Iterable<[KC, VC]>>
    ): TreeMap<K | KC, Exclude<V, VC> | VC>;    
    concat<C>(
        ...collections: Array<{ [key: string]: C }>
    ): TreeMap<K | string, Exclude<V, C> | C>;
    concat(...collections: any[]): TreeMap<any, any> {
        let newTree = this as TreeMap<any, any>;

        for (const collection of collections) {
            if (Array.isArray(collection)) {
                for (const [key, value] of collection) {
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
        ...collections: Array<Iterable<[KC, VC]>>
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
                for (const [key, value] of collection) {
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

    // mergeDeep<KC, VC>(...collections: any[]): TreeMap<any, any> {
    //     let newTree = this as TreeMap<any, any>;
    //     for (const collection of collections) {
    //         if (newTree.isCustomMap(collection)) {
    //             for (const { key, value } of collection.entries()) {
    //                 newTree = newTree.setDeep(key, value);
    //             }
    //         } else if (Array.isArray(collection)) {
    //             for (const { key, value } of collection) {
    //                 newTree = newTree.setDeep(key, value);
    //             }
    //         } else if (typeof collection === 'object' && collection !== null) {
    //             for (const key in collection) {
    //                 if (Object.prototype.hasOwnProperty.call(collection, key)) {
    //                     newTree = newTree.setDeep(key, collection[key]);
    //                 }
    //             }
    //         }
    //     }
    //     return newTree;
    // }
    
    // private setDeep(key: any, value: any): TreeMap<any, any> {
    //     if (this.has(key)) {
    //         const existingValue = this.get(key);
    //         // If both values are TreeMaps, merge them recursively.
    //         if (existingValue instanceof TreeMap && value instanceof TreeMap) {
    //             const mergedValue = existingValue.mergeDeep(value);
    //             return this.set(key, mergedValue as V);
    //         }
    //         // Otherwise, if both are plain objects, merge them.
    //         else if (this.isObject(existingValue) && this.isObject(value)) {
    //             const mergedValue = this.mergeDeepObjects(existingValue, value);
    //             return this.set(key, mergedValue as V);
    //         } else {
    //             return this.set(key, value);
    //         }
    //     } else {
    //         return this.set(key, value);
    //     }
    // }
    
    // private mergeDeepObjects(obj1: any, obj2: any): any {
    //     const result = { ...obj1 };
    //     for (const key in obj2) {
    //         if (Object.prototype.hasOwnProperty.call(obj2, key)) {
    //             if (this.isObject(obj2[key]) && this.isObject(obj1[key])) {
    //                 result[key] = this.mergeDeepObjects(obj1[key], obj2[key]);
    //             } else {
    //                 result[key] = obj2[key];
    //             }
    //         }
    //     }
    //     return result;
    // }
    
    // private isObject(item: any): boolean {
    //     return item !== null && typeof item === 'object' && !Array.isArray(item);
    // }
    

    map<M>(
        callback: (value: V, key: K, map: this) => M,
        thisArg?: unknown
    ): TreeMap<K, M> {
        let newTree = new TreeMap<K, M>(this.compare);
        for (const [k, v] of this.entries()) {
            newTree = newTree.set(k, callback.call(thisArg, v, k, this));
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
        for (const [key, value] of this.entries()) {
            newTree = newTree.set(callback.call(thisArg, key, value, this), value);
        }
        return newTree;
    }

    mapEntries<KM, VM>(
        mapper: (
          entry: [K, V],
          index: number,
          map: this
        ) => [KM, VM] | undefined,
        thisArg?: unknown,
        compare?: Comparator<KM>
      ): TreeMap<KM, VM> {
        const newCompare = compare ?? TreeMap.defaultComparator<KM>;
        let newTree = new TreeMap<KM, VM>(newCompare);
        let index = 0;
        for (const entry of this.entries()) {
          const newEntry = mapper.call(thisArg, entry, index++, this);
          if (newEntry) {
            newTree = newTree.set(newEntry[0], newEntry[1]);
          }
        }
        return newTree;
      }

    flatMap<KM, VM>(
        callback: (value: V, key: K, map: this) => Iterable<[KM, VM]>,
        thisArg?: unknown,
        compare?: Comparator<KM>
    ): TreeMap<KM, VM> {
        const newCompare = compare ?? TreeMap.defaultComparator<KM>;
        let newTree = new TreeMap<KM, VM>(newCompare);

        for (const [key, value] of this.entries()) {
            for (const [newKey, newValue] of callback.call(thisArg, value, key, this)) {
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
        for (const [k, v] of this.entries()) {
            if (predicate.call(thisArg, v, k, this)) {
                newTree = newTree.set(k, v);
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
        for (const [k, v] of this.entries()) {
            if (predicate.call(thisArg, v, k, this)) {
                trueTree = trueTree.set(k, v);
            } else {
                falseTree = falseTree.set(k, v);
            }
        }
        return [trueTree, falseTree];
    }

    flip(): TreeMap<V, K> {
        let newTree = new TreeMap<V, K>(TreeMap.defaultComparator);
        for (const [k, v] of this.entries()) {
            newTree = newTree.set(v, k);
        }
        return newTree;
    }


    // end HOFs

    findMin(key?: K): [K, V] | undefined {
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

    // findMin(): [K, V] {
    //     if (this.isEmpty()) throw new Error("cannot get min value from empty tree");
    //     return this.minSubTreeKeyValue();
    // }

    deleteMin(): TreeMap<K, V> {
        if (this.isEmpty()) return this.empty();
        const min = this.findMin();
        if (min === undefined) return this;
        return this.delete(min[0]);
    }

    findMax(key?: K): [K, V] | undefined {
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
        return this.delete(max[0]);
    }

    /**
     * Try to get the predecessor of the given key
     * Predecessor is the largest element in the tree strictly less than the given key
     * If the predecessor is found, return true and the predecessor
     * If the predecessor is not found, return false and undefined
     * 
     * @param key to find the predecessor of
     * @returns true and the predecessor if found, false and undefined if not found
     */
    tryPredecessor(key: K): [boolean, [K, V] | undefined] {
        if (!this.has(key))  return [false, undefined];

        let pred: [K, V] | undefined = undefined;
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

        return [pred !== undefined, pred];
    }

    /**
     * Try to get the successor of the given key
     * Successor is the smallest element in the tree strictly greater than the given key
     * If the successor is found, return true and the successor
     * If the successor is not found, return false and undefined
     * 
     * @param key to find the successor of
     * @returns true and the successor if found, false and undefined if not found
     */
    trySuccessor(key: K): [boolean, [K, V] | undefined] {
        if (!this.has(key)) return [false, undefined];

        let succ: [K, V] | undefined = undefined;
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

        return [succ !== undefined, succ];
    }

    /**
     * Try to get the weak predecessor of the given key
     * Weak predecessor is the largest element in the tree less than or equal to the given key
     * If the weak predecessor is found, return true and the weak predecessor
     * If the weak predecessor is not found, return false and undefined
     * 
     * @param key to find weak predecessor of
     * @returns true and the weak predecessor if found, false and undefined if not found
     */
    tryWeakPredecessor(key: K): [boolean, [K, V] | undefined] {
        let pred: [K, V] | undefined = undefined;
        let current: TreeMap<K, V> = this;
        while (!current.isEmpty()) {
            const cmp = this.compare(key, current.key());
            if (cmp < 0) {
                current = current.left();
            } else {
                pred = current.keyValue();
                current = current.right();
            }
        }
        return [pred !== undefined, pred];
    }

    /**
     * Try to get the weak successor of the given key
     * Weak successor is the smallest element in the tree greater than or equal to the given key
     * If the weak successor is found, return true and the weak successor
     * If the weak successor is not found, return false and undefined
     * 
     * @param key to find weak successor of
     * @returns true and the weak successor if found, false and undefined if not found
     */
    tryWeakSuccessor(key: K): [boolean, [K, V] | undefined] {
        let succ: [K, V] | undefined = undefined;
        let current: TreeMap<K, V> = this;
        while (!current.isEmpty()) {
            const cmp = this.compare(key, current.key());
            if (cmp > 0) {
                current = current.right();
            } else {
                succ = current.keyValue();
                current = current.left();
            }
        }
        return [succ !== undefined, succ];
    }

    /**
     * Return the predecessor of given key
     * Predecessor is the largest element in the tree strictly less than the given
     * 
     * @param key to find the predecessor of
     * @returns the predecessor of the key in the tree or undefined if the key is not in the tree.
     */
    predecessor(key: K): [K, V] | undefined {
        const [found, result] = this.tryPredecessor(key);
        return found ? result : undefined;
    }

    /**
     * Return the weak predecessor of the given key
     * Weak predecessor is the largest element in the tree less than or equal to the given key
     * 
     * @param key to find the weak predecessor of
     * @returns the weak predecessor of the key in the tree or undefined if the key is not in the tree.
     */
    weakPredecessor(key: K): [K, V] | undefined {
        const [found, result] = this.tryWeakPredecessor(key);
        return found ? result : undefined;
    }

    /**
     * Return the successor of the given key
     * Successor is the smallest element in the tree strictly greater than the given key
     * 
     * @param key to find the successor of
     * @returns the successor of the given key or undefined if the key is the maximum key in the tree 
     */
    successor(key: K): [K, V] | undefined {
        const [found, result] = this.trySuccessor(key);
        return found ? result : undefined;
    }

    /**
     * Return the weak successor of the given key
     * Weak successor is the smallest element in the tree greater than or equal to the given key
     * If the weak successor is found, return true and the weak successor
     * If the weak successor is not found, return false and undefined
     * 
     * @param key to find the weak successor of
     * @returns the weak successor of the key in the tree or undefined if the key is the maximum key in the tree
     */
    weakSuccessor(key: K): [K, V] | undefined {
        const [found, result] = this.tryWeakSuccessor(key);
        return found ? result : undefined;
    }

    getComparator(): Comparator<K> {
        return this.compare;
    }

    cut(cutFunction: (compareToOther: K) => number, fromKey: K, toKey: K): TreeMap<K, V> {
        const lower = cutFunction(fromKey);
        const upper = cutFunction(toKey);
        let newTree = new TreeMap<K, V>(this.compare);

        for (const [k, v] of this) {
            const cutValue = cutFunction(k);
            if (cutValue >= lower && cutValue < upper) {
                newTree = newTree.set(k, v);
            }
        }
        return newTree;
    }
    rangeFrom(fromKey: K): TreeMap<K, V> {
        let newTree = new TreeMap<K, V>(this.compare);
        for (const [k, v] of this) {
            if (this.compare(k, fromKey) >= 0) {
                newTree = newTree.set(k, v);
            }
        }
        return newTree;
    }
    rangeTo(toKey: K): TreeMap<K, V> {
        let newTree = new TreeMap<K, V>(this.compare);
        for (const [k, v] of this) {
            if (this.compare(k, toKey) <= 0) {
                newTree = newTree.set(k, v);
            }
        }
        return newTree;
    }
    rangeFromTo(fromKey: K, toKey: K): TreeMap<K, V> {
        let newTree = new TreeMap<K, V>(this.compare);
        for (const [k, v] of this) {
            if (this.compare(k, fromKey) >= 0 && this.compare(k, toKey) < 0) {
                newTree = newTree.set(k, v);
            }
        }
        return newTree;
    }
    // rangeAll(): Collection<[K, V]>;
    removeRangeFrom(fromKey: K): TreeMap<K, V> {
        let newTree = new TreeMap<K, V>(this.compare);
        for (const [k, v] of this) {
            if (this.compare(k, fromKey) < 0) {
                newTree = newTree.set(k, v);
            }
        }
        return newTree;
    }
    removeRangeTo(toKey: K): TreeMap<K, V> {
        let newTree = new TreeMap<K, V>(this.compare);
        for (const [k, v] of this) {
            if (this.compare(k, toKey) >= 0) {
                newTree = newTree.set(k, v);
            }
        }
        return newTree;
    }
    removeRangeFromTo(fromKey: K, toKey: K): TreeMap<K, V> {
        let newTree = new TreeMap<K, V>(this.compare);
        for (const [k, v] of this) {
            if (!(this.compare(k, fromKey) >= 0 && this.compare(k, toKey) < 0)) {
                newTree = newTree.set(k, v);
            }
        }
        return newTree;
    }
}