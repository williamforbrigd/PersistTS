import { Speed } from "../Enums/Speed";
import HashCode from "../Hashing/HashCode";
import Map from "../Interfaces/Map";
import KeyValuePair from "../Interfaces/KeyValuePair";
import {Comparator} from "../Interfaces/Comparator";

import AbstractMap from "../AbstractClasses/AbstractMap";
import EqualityComparer from "../Interfaces/EqualityComparer";

enum Color {
    RED,
    BLACK,
}

export class Node<K, V> implements KeyValuePair<K, V> {
    constructor(
        public color: Color,
        public leftNode: Node<K, V> | null = null,
        public key: K,
        public value: V,
        public rightNode: Node<K, V> | null = null,
    ) {}

    isRed(): boolean {
        return this.color === Color.RED;
    }

    isBlack(): boolean {
        return this.color === Color.BLACK;
    }

    equals(o: Object): boolean {
        if (this === o) return true;
        if (!(o instanceof Node)) return false;

        const node = o as Node<K, V>;
        const keyValueEqual =  this.key === node.key && this.value === node.value;
        const left = !!o.leftNode?.equals(node.leftNode as Object);
        const right = !!o.rightNode?.equals(node.rightNode as Object);
        return keyValueEqual && left && right;
    }

    hashCode(): number {
        const keyHash: number = (this.key == null ? 0 : HashCode.hashCode(this.key));
        const valueHash: number = (this.value == null ? 0 : HashCode.hashCode(this.value));
        return keyHash ^ valueHash;
    }

    toString(): string {
        return `${this.key}${this.color === Color.RED ? "R" : "B"}`;
    }
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
    private _hashCode: number | null = null; // cache the hashcode which is computed only once

    equalityComparer: EqualityComparer<K>;

    constructor(
        private readonly root: Node<K,V> | null = null,
        private readonly compare: Comparator<K> = (a: K, b: K) => a < b ? -1 : a > b ? 1 : 0,
        ) {
        super();

        this.root = root;
        this.compare = compare;

        this.equalityComparer = {
            equals: (a: K, b: K) => this.compare(a, b) === 0,
            hashCode: (a: K) => HashCode.hashCode(a)
        }
    }

    
    //Iterator methods
    *[Symbol.iterator](): MapIterator<Node<K, V>> {
        yield* this.inOrderTraversal(this.root);
    }

    *inOrderTraversal(node: Node<K, V> | null): MapIterator<Node<K, V>> {
        if (node !== null) {
            yield* this.inOrderTraversal(node.leftNode);
            yield node;
            yield* this.inOrderTraversal(node.rightNode);
        }
    }

    *preOrderTraversal(node: Node<K, V> | null): MapIterator<Node<K, V>> {
        if (node !== null) {
            yield node;
            yield* this.preOrderTraversal(node.leftNode);
            yield* this.preOrderTraversal(node.rightNode);
        }
    }

    *postOrderTraversal(node: Node<K, V> | null): MapIterator<Node<K, V>> {
        if (node !== null) {
            yield* this.postOrderTraversal(node.leftNode);
            yield* this.postOrderTraversal(node.rightNode);
            yield node;
        }
    }

    next(...[value]: [] | [unknown]): IteratorResult<KeyValuePair<K, V>, BuiltinIteratorReturn> {
        throw new Error("not implemented yet");
    }
    throw(e?: any): IteratorResult<KeyValuePair<K, V>, BuiltinIteratorReturn> {
        throw new Error("not implemented yet");
    }
    return(value?: BuiltinIteratorReturn): IteratorResult<KeyValuePair<K, V>, BuiltinIteratorReturn> {
        throw new Error("method not implemented");
    }
    // end iterator methods


    // Red-Black Tree methods
    private from(color: Color, left: TreeMap<K, V>, x: KeyValuePair<K, V>, right: TreeMap<K, V>): TreeMap<K, V> {
        if (!left.isEmpty() && this.compare(left.rootKey(), x.key) >= 0) {
            throw new Error("left subtree value must be less than root value");
        }
        if (!right.isEmpty() && this.compare(right.rootKey(), x.key) <= 0) {
            throw new Error("right subtree value must be greater than root value");
        }
        return new TreeMap(new Node(color, left.root, x.key, x.value, right.root), this.compare);
    }

    isEmpty(): boolean {
        return this.root === null;
    }

    empty(): TreeMap<K, V> {
        return new TreeMap<K, V>();
    }

    rootKey(): K {
        if (this.isEmpty()) throw new Error("Tree is empty so cannot get the key of the root");
        return this.root!.key;
    }

    rootValue(): V {
        if (this.isEmpty()) throw new Error("Tree is empty so cannot get the value of the root");
        return this.root!.value
    }

    rootKeyValue(): KeyValuePair<K, V> {
        if (this.isEmpty()) throw new Error("Tree is empty so cannot get the key value pair of the root");
        return { key: this.root!.key, value: this.root!.value };
    }

    rootColor(): Color {
        if (this.isEmpty()) throw new Error("Tree is empty so cannot get the color of the root");
        return this.root!.color
    }

    left(): TreeMap<K, V> {
        if (this.isEmpty()) return this.empty();
        return new TreeMap<K, V>(this.root!.leftNode, this.compare);
    }

    right(): TreeMap<K, V> {
        if (this.isEmpty()) return this.empty();
        return new TreeMap<K, V>(this.root!.rightNode, this.compare);
    }

    /**
     * Adds a new element with a specified key and value to the Map. If an element with the same key already exists, the element will be updated.
     * @param key
     * @param value
     */
    set(key: K, value: V): TreeMap<K, V> {
        return this.insert(this.keyValuePair(key, value)).paint(Color.BLACK);
    }

    private insert(x: KeyValuePair<K, V>): TreeMap<K, V> {
        if (this.isEmpty()) {
            return this.from(Color.RED, this.empty(), x, this.empty());
        }

        const y = this.rootKeyValue();
        const c = this.rootColor();
        const cmp = this.compare(x.key, y.key);

        // only balance when the root color is black
        if (c === Color.BLACK) {
            if (cmp < 0) {
                return this.balance(this.left().insert(x), y, this.right());
            } else if (cmp > 0) {
                return this.balance(this.left(), y, this.right().insert(x));
            } else {
                // cannot have duplicates
                return this;
            }
        } else {
            if (cmp < 0) {
                return this.from(c, this.left().insert(x), y, this.right());
            } else if (cmp > 0) {
                return this.from(c, this.left(), y, this.right().insert(x));
            } else {
                // cannot have duplicates
                return this;
            }
        }
    }

    private keyValuePair(key: K, value: V): KeyValuePair<K, V> {
        return { key, value };
    }

    private balance(left: TreeMap<K, V>, x: KeyValuePair<K, V>, right: TreeMap<K, V>): TreeMap<K, V> {
        // rotate to the right
        if (left.doubledLeft()) {
            const newLeft = left.left().paint(Color.BLACK);
            const rootKeyValue = left.rootKeyValue();
            const newRight = this.from(Color.BLACK, left.right(), x, right);
            return this.from(Color.RED, newLeft, rootKeyValue, newRight);
        // rotate to the left and then to the right
        } else if (left.doubledRight()) {
            const newLeft = this.from(Color.BLACK, left.left(), left.rootKeyValue(), left.right().left());
            const rootKeyValue = left.right().rootKeyValue();
            const newRight = this.from(Color.BLACK, left.right().right(), x, right);
            return this.from(Color.RED, newLeft, rootKeyValue, newRight);
        // rotate to the right and then to the left
        } else if (right.doubledLeft()) {
            const newLeft = this.from(Color.BLACK, left, x, right.left().left());
            const rootKeyValue = right.left().rootKeyValue();
            const newRight = this.from(Color.BLACK, right.left().right(), right.rootKeyValue(), right.right());
            return this.from(Color.RED, newLeft, rootKeyValue, newRight);
        // rotate to the left
        } else if (right.doubledRight()) {
            const newLeft = this.from(Color.BLACK, left, x, right.left());
            const rootKeyValue = right.rootKeyValue();
            const newRight = right.right().paint(Color.BLACK);
            return this.from(Color.RED, newLeft, rootKeyValue, newRight);
        } else {
            // tree is already balanced
            return this.from(Color.BLACK, left, x, right);
        }
    }

    private doubledLeft(): boolean {
        const res = !this.isEmpty()
            && this.root!.isRed()
            && this.left().root?.isRed();
        return res ?? false;
    }

    private doubledRight(): boolean {
        const res = !this.isEmpty()
            && this.root!.isRed()
            && this.right().root?.isRed();
        return res ?? false;
    }

    private paint(color: Color): TreeMap<K, V> {
        if (this.isEmpty()) return this.empty();
        return this.from(color, this.left(), this.keyValuePair(this.rootKey(), this.rootValue()), this.right());
    }
    
    successorTree(): TreeMap<K, V> | null {
        if (this.right().isEmpty()) return null;
        return this.right().minSubTree();
    }

    predecessorTree(): TreeMap<K, V> | null {
        if (this.left().isEmpty()) return null;
        return this.left().maxSubTree();
    }

    maxSubTree(): TreeMap<K, V> | null {
        let current: TreeMap<K, V> = this;
        while (!current.right().isEmpty()) {
            current = current.right();
        }
        return current.isEmpty() ? null : current;
    }
    
    minSubTree(): TreeMap<K, V> | null {
        let current: TreeMap<K, V> = this;
        while (!current.left().isEmpty()) {
            current = current.left();
        }
        return current.isEmpty() ? null : current;
    }

    // methods for printing
    private printTreeHelper(root: Node<K, V> | null, space: number): void {
        if (root) {
            space += 10;
            this.printTreeHelper(root.rightNode, space);
            console.log(' '.repeat(space) + root.toString());
            this.printTreeHelper(root.leftNode, space);
        }
    }

    public printTree(): void {
        console.log("Tree Structure:");
        this.printTreeHelper(this.root, 0);
    }

    // Methods to check invariants
    isBST(): boolean {
        return this.isBSTHelper(this.root);
    }

    private isBSTHelper(x: Node<K, V> | null): boolean {
        if (x === null) return true;

        // if (x.leftNode !== null && x.value < x.leftNode.value) return false;
        if (x.leftNode !== null && this.compare(x.key, x.leftNode.key) <= 0) return false;

        // if (x.rightNode !== null && x.value > x.rightNode.value) return false;
        if (x.rightNode !== null && this.compare(x.key, x.rightNode.key) >= 0) return false;

        return this.isBSTHelper(x.leftNode) && this.isBSTHelper(x.rightNode);
    }

    redInvariant(): boolean {
        return this.redInvariantHelper(this.root);
    }

    private redInvariantHelper(x: Node<K, V> | null): boolean {
        if (x === null) return true;

        if (x.isRed()) {
            if (x.leftNode?.isRed() || x.rightNode?.isRed()) {
                return false;
            }
        }

        return this.redInvariantHelper(x.leftNode) && this.redInvariantHelper(x.rightNode);
    }

    /**
     * Validate that every path in the tree has the same number of black nodes. 
     * Path to the min node in a BST is obtained by following the left pointer from a node to a null node, so traversing the black nodes we encounter
     * while traversing the left most node will give the baseline.
     * @returns true if the black height invariant is maintained
     */
    blackBalancedInvariant(): boolean {
        let blackHeight = 0;
        let x = this.root;
        // Traverse leftmost path and count the black nodes
        while (x !== null) {
            if (x.isBlack()) blackHeight++;
            x = x.leftNode;
        }
        return this.blackBalancedHelper(this.root, blackHeight);
    }

    private blackBalancedHelper(x: Node<K, V> | null, currentBlackHeight: number): boolean {
        if (x === null) return currentBlackHeight === 0;
        if (x.isBlack()) currentBlackHeight--;
        return this.blackBalancedHelper(x.leftNode, currentBlackHeight) && this.blackBalancedHelper(x.rightNode, currentBlackHeight);
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
        let numBlack = 0;
        let x = this.root;

        // Traverse leftmost path and count the black nodes
        while (x != null) {
            if (x.isBlack()) numBlack++;
            x = x.leftNode;
        }

        return this.validateRedBlackTreeHelper(this.root, numBlack);
    }

    private validateRedBlackTreeHelper(x: Node<K, V> | null, bb: number): boolean {
        if (x === null) return bb === 0;

        let currentBlackHeight = bb;

        // Decrement black height if node is black
        if (x.isBlack()) currentBlackHeight--;

        // Check for consecutive red nodes
        if (x.isRed()) {
            if (x.leftNode && x.leftNode.isRed() || x.rightNode && x.rightNode.isRed()) {
                return false;
            }
        }

        // Validate BST properties
        if (x.leftNode && this.compare(x.key, x.leftNode.key) <= 0) return false;
        if (x.rightNode && this.compare(x.key, x.rightNode.key) >= 0) return false;

        // Recursive check for the left and right subtrees
        return this.validateRedBlackTreeHelper(x.leftNode, currentBlackHeight) && 
               this.validateRedBlackTreeHelper(x.rightNode, currentBlackHeight);
    }


    // end Red-Black Tree methods 

    getRoot(): Node<K, V> | null {
        return this.root;
    }

    size(): number {
        let count = 0;
        for (const _ of this){
            count++;
        }
        return count;
    }

    getNode(node: Node<K, V> | null, key: K): Node<K, V> | undefined {
        if (node === null) return undefined;

        const cmp = this.compare(key, node.key);
        if (cmp < 0) {
            return this.getNode(node.leftNode, key);
        } else if (cmp > 0) {
            return this.getNode(node.rightNode, key);
        } else {
            return node;
        }
    }

    get(key: K): V | undefined {
        return this.getNode(this.root, key)?.value;
    }

    firstKey(): K | undefined {
        return this.root?.key;
    }

    lastKey(): K | undefined {
        return this.maxSubTree()?.rootKey();
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

    private deleteNode(node: Node<K, V> | null, key: K): Node<K, V> | null {
        if (node === null) {
            return null;
        }

        const cmp = this.compare(key, node.key);
        if (cmp < 0) {
            node.leftNode = this.deleteNode(node.leftNode, key);
        } else if (cmp > 0) {
            node.rightNode = this.deleteNode(node.rightNode, key);
        } else {
            if (node.leftNode === null) {
                return node.rightNode;
            } else if (node.rightNode === null) {
                return node.leftNode;
            }

            const minLargerNode = this.findMin(node.rightNode);
            if (minLargerNode !== undefined) {
                node.key = minLargerNode.key;
                node.value = minLargerNode.value;
                node.rightNode = this.deleteNode(node.rightNode, minLargerNode.key);
            }
        }

        return node;
    }


    delete(key: K): TreeMap<K, V> {
        const nodeValue = this.getNode(this.root, key);
        if (nodeValue === undefined) {
            return this;
        }
        const newTree = this.deleteNode(this.root, key);
        return new TreeMap<K, V>(newTree, this.compare);
    }

    deleteAll(keys: Iterable<K>): TreeMap<K, V> {
        let newTree: TreeMap<K, V> = this;
        for (const key of keys) {
            newTree = newTree.delete(key);
        }
        return newTree;
    }

    clear(): TreeMap<K, V> {
        return new TreeMap<K, V>(null, this.compare);
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
                hash += entry.hashCode();
            }
            this._hashCode = hash;
        }
        return this._hashCode;
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
        let newTree = new TreeMap<K, V>(null, this.compare);
        for (const entry of entries) {
            newTree = newTree.set(entry.key, entry.value);
        }
        return newTree;
    }

    static of<K, V>(comparer: Comparator<K>, ...entries: KeyValuePair<K, V>[]): TreeMap<K, V> {
        let newTree = new TreeMap<K, V>(null, comparer);
        for (const entry of entries) {
            newTree = newTree.set(entry.key, entry.value);
        }
        return newTree;
    }

    entry(k: K, v: V): KeyValuePair<K, V> {
        return { key: k, value: v };
    }

    copyOf(map: Map<K, V>): TreeMap<K, V> {
        let newTree = new TreeMap<K, V>(null, this.compare);
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
        let newTreeMap = new TreeMap<K, V>(null, compare ?? this.compare);
        for (const entry of this) {
            newTreeMap = newTreeMap.set(entry.key, entry.value);
        }
        return newTreeMap;
    }

    sortBy<C>(comparatorValueMapper: (value: V, key: K, map: this) => C, compare?: Comparator<C>): TreeMap<K | C, V> {
        // const entries = [...this.entries()];
        // entries.sort((a,b) => {
        //     const mappedA = comparatorValueMapper(a.value, a.key, this);
        //     const mappedB = comparatorValueMapper(b.value, b.key, this);
        //     if (compare) {
        //         return compare(mappedA, mappedB);
        //     } else {
        //         return this.compare(a.key, b.key);
        //     }
        // })

        // return this.ofEntries(...entries);
        throw new Error("Method not implemented.");
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

    isCustomMap(obj: any): obj is Map<any, any> {
        return obj && typeof obj.set === "function" && typeof obj.entries === "function";
    }

    merge<KC, VC>(
        ...collections: Array<Iterable<KeyValuePair<KC, VC>>>
    ): TreeMap<K | KC, Exclude<V, VC> | VC>;
    // merge<C>(
    //     ...collections: Array<{ [key: string]: C }>
    // ): TreeMap<K | string, Exclude<V, C> | C>;
    merge<KC, VC>(other: Map<KC, VC>): TreeMap<K | KC, V | VC>;
    merge(...collections: any[]): TreeMap<any, any> {
        let newTree = this as TreeMap<any, any>;

        for (const collection of collections) {
            if (Array.isArray(collection)) {
                for (const {key, value} of collection) {
                    newTree = newTree.set(key, value);
                }
            } else {
                for (const {key, value} of collection.entries()) {
                    newTree = newTree.set(key, value);
                }
            }
        }

        return newTree;
    }

    concat<KC, VC>(
            ...collections: Array<Iterable<KeyValuePair<KC, VC>>>
    ): TreeMap<K | KC, Exclude<V, VC> | VC> {
        let newTree = this as TreeMap<any, any>;

        for (const collection of collections) {
            for (const {key, value} of collection) {
                newTree = newTree.set(key, value);
            }
        }
        return newTree;
    }
    // concat<C>(
    //     ...collections: Array<{ [key: string]: C }>
    // ): TreeMap<K | string, Exclude<V, C> | C>;



    /*
    findOrAdd(key: K, value: V): KeyValuePair<K, V> {
        throw new Error("Method not implemented.");
    }
    updateOrAdd(key: K, value: V): Map<K, V>;
    updateOrAdd(key: K, value: V, newValue: V): Map<K, V>;
    updateOrAdd(key: K, value: V, newValue?: V): Map<K, V> {
        throw new Error("Method not implemented.");
    }

    check(): boolean {
        return true;
    }

     */

    findMin(node?: Node<K, V> | null): Node<K, V> | undefined {
        let minNode = node ?? this.root;
        while (minNode !== null && minNode?.leftNode !== null) {
            minNode = minNode.leftNode;
        }
        return minNode ?? undefined;
    }

    deleteMin(): TreeMap<K, V> {
        if (this.root === null) return this.empty();

        const minNode = this.findMin();
        if (minNode === undefined) return this.empty();

        return this.delete(minNode.key);
    }

    findMax(key?: K): Node<K, V> | undefined {
        const node = key === undefined ? this.root : this.getNode(this.root, key);
        let maxNode = node ?? this.root;
        while (maxNode !== null && maxNode?.rightNode !== null) {
            maxNode = maxNode.rightNode;
        }
        return maxNode ?? undefined;
    }

    deleteMax(): TreeMap<K, V> {
        if (this.root === null) return this.empty();

        const maxNode = this.findMax();
        if (maxNode === undefined) return this.empty();

        return this.delete(maxNode.key);
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

    predecessor(key: K): Node<K, V> | undefined {
        const node = this.getNode(this.root, key);
        if (node === undefined) return undefined;

        if (node.leftNode !== null) {
            return this.findMax(node.leftNode.key);
        }

        let predecessor: Node<K, V> | undefined = undefined;
        let current = this.root;

        while (current !== null) {
            const cmp = this.compare(key, current.key);
            if (cmp > 0) {
                predecessor = current;
                current = current.rightNode;
            } else if (cmp < 0) {
                current = current.leftNode;
            } else {
                break;
            }
        }
        return predecessor;
    }


    /**
     * Return the successor of the given key
     * @param key
     */
    successor(key: K): Node<K, V> | undefined {
        const node = this.getNode(this.root, key);
        if (node === undefined) return undefined;

        if (node.rightNode !== null) {
            return this.findMin(node.rightNode);
        }

        let successor: Node<K, V> | undefined = undefined;
        let current: Node<K, V> | null = this.root;

        while (current !== null) {
            const cmp = this.compare(node.key, current.key);
            if (cmp < 0) {
                successor = current;
                current = current.leftNode;
            } else if (cmp > 0) {
                current = current.rightNode;
            } else {
                break;
            }
        }
        return successor;
    }
}

