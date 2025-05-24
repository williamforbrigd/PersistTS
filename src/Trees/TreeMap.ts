import { Speed } from "../Enums/Speed";
import HashCode from "../Hashing/HashCode";
import Map from "../Interfaces/Map";
import {Comparator} from "../Interfaces/Comparator";
import SortedMap from "../Interfaces/SortedMap"

import Sorting from "../Sorting/Sorting";
import AbstractSortedMap from "../AbstractClasses/AbstractSortedMap";

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
 * This class is inspired by the article "The missing method": Deleting from Okasaki's red-black trees". 
 * 
 * @see https://matt.might.net/articles/red-black-delete/
 */
export default class TreeMap<K, V> extends AbstractSortedMap<K, V> implements SortedMap<K, V> {
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

    /**
     * In-order traversal of the tree.
     * This will yield the key-value pairs in sorted order.
     * It goes into the left subtree, yields the root, and then goes into the right subtree.
     */
    *inOrderTraversal(): MapIterator<[K, V]> {
        if (!this.isEmpty()) {
            yield* this.left().inOrderTraversal();
            yield this.keyValue();
            yield* this.right().inOrderTraversal();
        }
    }

    /**
     * Pre-order traversal of the tree.
     * This will yield the key-value pairs in the order they are visited.
     * It yields the root first, then goes into the left subtree, and finally into the right subtree.
     */
    *preOrderTraversal(): MapIterator<[K, V]> {
        if (!this.isEmpty()) {
            yield this.keyValue();
            yield* this.left().preOrderTraversal();
            yield* this.right().preOrderTraversal();
        }
    }

    /**
     * Post-order traversal of the tree.
     * This will yield the key-value pairs after visiting both subtrees.
     * It goes into the left subtree, then into the right subtree, and finally yields the root.
     */
    *postOrderTraversal(): MapIterator<[K, V]> {
        if (!this.isEmpty()) {
            yield* this.left().postOrderTraversal();
            yield* this.right().postOrderTraversal();
            yield this.keyValue();
        }
    }


    // Red-Black Tree methods

    /**
     * Creates an instance of TreeMap with the specified color, root key-value pair, and the subtrees.
     * Checks the invariants that the left subtree's root key is less than the root key and
     * the right subtree's root key is greater than the root key.
     * 
     * @param color - the color of the root node
     * @param left - the left subtree
     * @param root - the root key-value pair
     * @param right - the right subtree
     * @returns an instance of TreeMap with the specified color, root key-value pair, and the subtrees.
     */
    from(color: Color, left: TreeMap<K, V>, root: [K, V], right: TreeMap<K, V>): TreeMap<K, V> {
        if (!left.isEmpty() && this.compare(left.key(), root[0]) >= 0) {
            throw new Error("left subtree value must be less than root value");
        }
        if (!right.isEmpty() && this.compare(right.key(), root[0]) <= 0) {
            throw new Error("right subtree value must be greater than root value");
        }
        return new TreeMap(this.compare, color, left, root, right);
    }

    /**
     * Checks if the tree is empty.
     * @returns true if the tree is empty, false otherwise.
     */
    isEmpty(): boolean {
        return this.root === null;
    }

    /**
     * Private helper method to check that the current subtree is a double black leaf.
     * @returns true if the tree is a double black leaf, which is an empty tree with a double black color.
     */
    private isDoubleBlackLeaf(): boolean {
        return this.root === null && this.color === Color.BB;
    }

    // static empty<K, V>(): TreeMap<K, V> {
    //     return this.EMPTY as TreeMap<K, V>;
    // }

    /**
     * Returns an empty TreeMap instance with the same comparator.
     * @returns a new empty TreeMap instance with the same comparator.
     */
    empty(): TreeMap<K, V> {
        return new TreeMap<K, V>(this.compare);
    }

    /**
     * Creates a new empty TreeMap instance with the specified comparator.
     * @param compare - the comparator to use for the keys in the new TreeMap.
     * @returns a new empty TreeMap instance with the specified comparator.
     */
    protected createEmpty<KM, VM>(compare?: Comparator<KM>): TreeMap<KM, VM> {
        return new TreeMap<KM, VM>(compare ?? (this.compare as unknown as Comparator<KM>));
    }

    /**
     * Creates a new TreeMap instance with a double black leaf.
     * This counts for two of the black height. 
     * @returns a new TreeMap instance that represents a double black leaf.
     */
    doubleBlackLeaf(): TreeMap<K, V> {
        return new TreeMap<K, V>(this.compare, Color.BB, null, null, null);
    }

    /**
     * Returns the key-value pair of the root node of the current subtree.
     * @returns the key-value pair of the root node.
     */
    private keyValue(): [K, V] {
        if (this.isEmpty()) throw new Error("Tree is empty. Cannot get the root key value pair");
        return this.root!;
    }

    /**
     * Returns the key of the root node of the current subtree.
     * @returns the key of the root node of the current subtree.
     */
    private key(): K {
        return this.keyValue()[0];
    }

    /**
     * Returns the value of the root node of the current subtree.
     * @returns the value of the root node of the current subtree.
     */
    private value(): V {
        return this.keyValue()[1];
    }

    /**
     * Returns the left subtree of the current node.
     * @returns the left subtree of the current node.
     */
    private left(): TreeMap<K, V> {
        if (!this.leftTree) return this.empty();
        return this.leftTree;
    }

    /**
     * Returns the right subtree of the current node
     * @returns the right subtree of the current node.
     */
    private right(): TreeMap<K, V> {
        if (!this.rightTree) return this.empty();
        return this.rightTree;
    }

    /**
     * Checks if the current node is a black node.
     * @returns true if the current node is a black node, false otherwise.
     */
    private isB(): boolean {
        return !this.isEmpty() && this.color === Color.B;
    }

    /**
     * Checks if the current node is a red node.
     * @returns true if the current node is a red node, false otherwise.
     */
    private isR(): boolean {
        return !this.isEmpty() && this.color === Color.R;
    }

    /**
     * Returns true if the current node is a double black node.
     * @returns true if the current node is a negative black node, which is a red node that has a negative black color.
     */
    private isBB(): boolean {
        if (this.isDoubleBlackLeaf()) return true;
        return !this.isEmpty() && this.color === Color.BB;
    }

    /**
     * Returns true if the current node is a negative black node.
     * @returns true if the current node is a negative black node, which is a red node that has a negative black color.
     */
    private isNB(): boolean {
        return !this.isEmpty() && this.color === Color.NB;
    }

    /**
     * Helper method to get the key-value pair of a node with the specified key.
     * @param x the key to search for in the tree.
     * @returns the key-value pair of the node with the specified key, or null if the key is not found.
     */
    private getNode(x: K): [K, V] | null {
        if (this.isEmpty()) return null;
        const y = this.key();
        const cmp = this.compare(x, y);
        if (cmp < 0) return this.left().getNode(x);
        if (cmp > 0) return this.right().getNode(x);
        return this.keyValue();
    }

    /**
     * Paints the current node red.
     * Cannot redden an empty tree or a double black leaf.
     * @returns a new TreeMap instance with the same comparator and a red root node.
     */
    private redden(): TreeMap<K, V> {
        if (this.isEmpty()) throw new Error("cannto redden empty tree");
        else if (this.isDoubleBlackLeaf()) throw new Error("cannot redden double black tree");
        return this.paint(Color.R);
    }

    /**
     * Paints the current node black.
     * If the tree is empty, it returns an empty tree.
     * @returns a new TreeMap instance with the same comparator and a black root node.
     */
    private blacken(): TreeMap<K, V> {
        if (this.isEmpty()) return this.empty();
        else if (this.isDoubleBlackLeaf()) this.empty();
        return this.paint(Color.B);
    }

    /**
     * Makes the current node one step darker.
     * black becomes double black, red becomes black, and negative black becomes red.
     * 
     * @param c - the color to blacken
     * @returns a new color that is one step darker than the given color.
     */
    private blacker(c: Color): Color {
        switch (c) {
            case Color.B: return Color.BB;
            case Color.R: return Color.B;
            case Color.NB: return Color.R;
            case Color.BB: throw new Error("Cannot blacken double black");
        }
    }

    /**
     * Makes the current node one step lighter.
     * black becomes red, double black becomes black, and negative black becomes red.
     * 
     * @param c - the color to redder
     * @returns a new color that is one step lighter than the given color.
     */
    private redder(c: Color): Color {
        switch (c) {
            case Color.BB: return Color.B;
            case Color.B: return Color.R;
            case Color.R: return Color.NB;
            case Color.NB: throw new Error("cannot lighten negative black");
        }
    }

    /**
     * Creates a new TreeMap instance that is one step blacker.
     * @returns a new TreeMap instance that is one step blacker.
     */
    private blackerTree(): TreeMap<K, V> {
        if (this.isEmpty()) return this.doubleBlackLeaf();
        return this.from(this.blacker(this.color), this.left(), this.keyValue(), this.right());
    }

    /**
     * Creates a new TreeMap instance that is one step redder.
     * @returns a new TreeMap instance that is one step redder.
     */
    private redderTree(): TreeMap<K, V> {
        if (this.isDoubleBlackLeaf()) return this.empty();
        return this.from(this.redder(this.color), this.left(), this.keyValue(), this.right())
    }

    /**
     * Returns a new TreeMap instance that associates a new key with a value.
     * If the element with the same key already exists, it will be updated. 
     * 
     * The new root of the TreeMap will be painted black.
     * 
     * Complexity: O(log n) where n is the number of elements in the TreeMap.
     * 
     * @param key
     * @param value
     */
    set(key: K, value: V): TreeMap<K, V> {
        return this.ins([key, value]).paint(Color.B);
    }

    /**
     * Helper method to insert a key-value pair into the TreeMap.
     * 
     * An empty subtree will return a red node.
     * 
     * Compares the key with the current root key and decides whether to go left or right.
     * If the key is less than the current root key, it goes left and inserts the key-value pair into the left subtree.
     * If the key is greater than the current root key, it goes right and inserts the key-value pair into the right subtree.
     * If the key is equal to the current root key, it updates the value of the current root node.
     * 
     * Calls the `bubble` method at each step of the modification path to ensure that the red-black tree properties are maintained.
     * This method essentially calls the `balance` method.
     * 
     * @param x - the key-value pair to insert into the TreeMap.
     * @returns a new TreeMap instance with the key-value pair inserted.
     */
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
            return this.from(this.color, this.left(), x, this.right());
        }
    }

    /**
     * Deletes a key-value pair from the TreeMap
     * 
     * If the key is not found, it returns the TreeMap unchanged.
     * 
     * The new root of the TreeMap will be painted black.
     * 
     * @param key - the key to delete from the TreeMap.
     * @returns a new TreeMap instance with the key-value pair removed.
     */
    delete(key: K): TreeMap<K, V> {
        return this.del([key, undefined as unknown as V]).paint(Color.B); // undefined is used as a placeholder
    }

    /**
     * Helper method to delete a key-value pair from the TreeMap.
     * 
     * If the tree is empty, it returns an empty TreeMap.
     * 
     * Compares the key with the current root key and decides whether to go left or right.
     * If the key is less than the current root key, it goes left and deletes the key-value pair from the left subtree.
     * If the key is greater than the current root key, it goes right and deletes the key-value pair from the right subtree.
     * Once the key is found, it removes the node and returns a new TreeMap instance with the key-value pair removed.
     * 
     * It calls `bubble` on each step of the modification path to ensure that the red-black tree properties are maintained.
     * This method essentially calls the `balance` method.
     * 
     * @param x - the key-value pair to delete from the TreeMap.
     * @returns a new TreeMap instance with the key-value pair removed.
     */
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

    /**
     * `Bubble` method is used to "bubble up" the extra black height introduced by deleting a black leaf so that it can later be eliminated. 
     * A black leaf will be marked as a double black leaf, which means that it counts for two of the black height.
     * 
     * This method checks if the left or right subtree is double black, and if so, it balances the tree by calling the `balance` method.
     * It moves one black height from the left or the right subtree to the current node, which is painted a step one step blacker.
     * 
     * Otherwise, it just calls the `balance` method with the current color and the left and right subtrees. 
     * 
     * @param c - the color of the current node
     * @param left - the left subtree
     * @param y - the key-value pair of the current node
     * @param right - the right subtree
     * @returns a new TreeMap instance that is balanced after insertion or deletion.
     */
    private bubble(c: Color, left: TreeMap<K, V>, y: [K, V], right: TreeMap<K, V>): TreeMap<K, V> {
        if ((left.isBB()) || (right.isBB())) {
            return this.balance(this.blacker(c), left.redderTree(), y, right.redderTree());
        } else {
            return this.balance(c, left, y, right);
        }
    }

    /**
     * The `balance` method is used to restore the red-black tree invariants. 
     * It applies rotations and color flips to ensure that every root-to-leaf path has the same number of black nodes and 
     * that no red node has a red child.
     * 
     * The balance method is divided into the insertion cases that Chris Okasaki described in his paper.
     * Additionally, it has Matt Might's deletion cases for double black nodes and negative black nodes. 
     * 
     * For Okasaki's insertion cases, we rebuild the same subtree and color the root of that subtree red.
     * For Matt Might's double black deletion cases, we rebuild the same subtree and color the root of that subtree black.
     * And for the additional negative black deletion cases, we call the `redden` on the left or right subtree to 
     * move one black height from the left or right subtree to the current node.
     * 
     * @param c - the color of the current node
     * @param left - the left subtree
     * @param x - the curren key-value pair.
     * @param right - the right subtree
     * @returns a new TreeMap instance that is balanced after insertion or deletion.
     */
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

    /**
     * When an interior node is removed, we have a few cases to handle:
     * - If the current node is empty, we return an empty TreeMap.
     * - If the current node is a red leaf (both left and right subtrees are empty), we return an empty TreeMap.
     * - If the current node is a black leaf (both left and right subtrees are empty), we mark it as a double black leaf.
     *      This extra black height will be removed later.
     * - If the current node has a red right child and an empty left child, we return the right child painted black.
     * - If the current node has a red left child and an empty right child, we return the left child painted black.
     * 
     * Otherwise, the node has two children and we remove inorder successor. This is the minimum value in the right subtree.
     * Meaning that it is the smallest value in the right subtree, that is still larger than the current node. This will not break the 
     * balanced binary search tree property.
     * We also remove that from the right subtree so that we have no duplicate nodes. 
     * 
     * Lastly, we call the `bubble` method with the inorder successor as the new root, left is unchanged, and right has its inorder successor removed.
     * 
     * @returns a new TreeMap instance that is a copy of the current TreeMap.
     */
    private remove(): TreeMap<K, V> {
        if (this.isEmpty()) return this.empty();
        else if (this.isR() && this.left().isEmpty() && this.right().isEmpty()) return this.empty();
        // deletion of double black leaf
        else if (this.isB() && this.left().isEmpty() && this.right().isEmpty()) return this.doubleBlackLeaf();
        else if (this.isB() && this.left().isEmpty() && this.right().isR()) return this.right().paint(Color.B);
        else if (this.isB() && this.left().isR() && this.right().isEmpty()) return this.left().paint(Color.B);
        else {
            // find minimum value in the right subtree, which is the inorder successor
            const minTreeValue = this.right().minSubTreeKeyValue();
            // remove the minimum value from the right subtree
            const rmMin = this.right().removeMin();
            return this.bubble(this.color, this.left(), minTreeValue, rmMin);
        }
    }

    /**
     * Remove the max node from the current subtree.
     * This method will go to the right until it finds the max node.
     * @returns a new subtree where the max node is removed
     */
    private removeMax(): TreeMap<K, V> {
        if (this.isEmpty()) throw new Error("cannot remove max from empty tree");
        else if (this.right().isEmpty()) {
            return this.remove();
        } else {
            // recurse to the right subtree, then bubble back up
            return this.bubble(this.color, this.left(), this.keyValue(), this.right().removeMax())
        }
    }

    /**
     * Remove the min node from the current subtree.
     * This method will go to the left until it finds the min node. 
     * @returns a new subtree where the min node is removed.
     */
    private removeMin(): TreeMap<K, V> {
        if (this.isEmpty()) throw new Error("cannot remove min from empty tree");
        else if (this.left().isEmpty()) {
            return this.remove();
        } else {
            // recurse to the left subtree, then bubble back up
            return this.bubble(this.color, this.left().removeMin(), this.keyValue(), this.right());
        }
    }

    /**
     * Checks if there is a red-red violation to the left
     * @returns true if we have a red-red violation to the left, false otherwise
     */
    private doubledLeft(): boolean {
        const res = !this.isEmpty()
            && this.isR()
            && this.left().isR();
        return res ?? false;
    }

    /**
     * Checks if there is a red-red violation to the right
     * @returns true if we have a red-red violation to the right, false otherwise.
     */
    private doubledRight(): boolean {
        const res = !this.isEmpty()
            && this.isR()
            && this.right().isR();
        return res ?? false;
    }

    /**
     * Paints the root color of the current subtree.
     * @param color - color to paint the current subtree
     * @returns a new instance of TreeMap with the root color painted
     */
    private paint(color: Color): TreeMap<K, V> {
        if (this.isEmpty()) return this.empty();
        return new TreeMap(this.compare, color, this.leftTree, this.root, this.rightTree);
    }

    /**
     * Finds the minimum subtree. 
     * Recurses to the left until it cannot go left anymore.
     * @returns the subtree that is the minimum 
     */
    minSubTree(): TreeMap<K, V> {
        if (this.isEmpty()) throw new Error("cannot get min value from empty tree");
        return this.left().isEmpty() ? this : this.left().minSubTree();
    }

    /**
     * Finds the maximum subtree.
     * Recurses to the right until it cannot to right anymore
     * @returns tbe subtree that is the maxmum
     */
    maxSubTree(): TreeMap<K, V>  {
        if (this.isEmpty()) throw new Error("cannot get max value from empty tree");
        return this.right().isEmpty() ? this : this.right().maxSubTree();
    }

    /**
     * Same as `minSubTree` but gets the key-value
     * @returns the key-value of the minimum subtree
     */
    minSubTreeKeyValue(): [K, V] {
        if (this.isEmpty()) throw new Error("cannot get min value from empty tree");
        return this.left().isEmpty() ? this.keyValue() : this.left().minSubTreeKeyValue();
    }

    /**
     * Same as `maxSubTree` but gets the key-value
     * @returns the key-value of the maximum subtree
     */
    maxSubTreeKeyValue(): [K, V] {
        if (this.isEmpty()) throw new Error("cannot get max value from empty tree");
        return this.right().isEmpty() ? this.keyValue() : this.right().maxSubTreeKeyValue();
    }
    
    /**
     * Gets the subtree that is the successor tree.
     * This is the subtree with the entry with the least key greater than the specified key.
     * @returns the successor tree of the current subtree or null if it does not exist. 
     */
    successorTree(): TreeMap<K, V> | null {
        if (this.right().isEmpty()) return null;
        return this.right().minSubTree();
    }

    /**
     * Gets the subtree that is the predecessor tree.
     * This is the subtree with the entry with the greatest key less than the specified key.
     * @returns 
     */
    predecessorTree(): TreeMap<K, V> | null {
        if (this.left().isEmpty()) return null;
        return this.left().maxSubTree();
    }

    // methods for printing in a nice format
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
    /**
     * Checks if the tree is a valid binary search tree.
     * This means that every key to the left should be smaller according to the compare function, 
     * and every key to the right should be greater.
     * 
     * @returns true if the tree satisifes the BST invariant, or false otherwise.
     */
    isBST(): boolean {
        return this.isBSTHelper(undefined, undefined);
    }

    /**
     * Checks if the tree is a valid BST according to the compare function.
     * Maintains the minimum and maximum key of the current subtree.
     * 
     * If the current key yields a result from the compare that is less than or equal to the minimum key, we return false.
     * If the current key yields a result from the compare that is greater than or equal to the maximum key, we return false.
     * 
     * Recursively checks the left and the right subtree.
     * 
     * @param min - current minimum key for this subtree
     * @param max - current maximum key for this subtree
     * @returns true if the tree satisifes the BST invariant, or false otherwise.
     */
    private isBSTHelper(min: K | undefined, max: K | undefined): boolean {
        if (this.isEmpty()) return true;

        if (min !== undefined && this.compare(this.key(), min) <= 0) return false;
        if (max !== undefined && this.compare(this.key(), max) >= 0) return false;

        return this.left().isBSTHelper(min, this.key()) && this.right().isBSTHelper(this.key(), max);
    }

    /**
     * Method to check the red invariant of the red-black tree.
     * This is that no consecutive nodes can be red. 
     */
    redInvariant(): boolean {
        return this.redInvariantHelper();
    }

    /**
     * Recurses into the left and right subtree and checks that no two red nodes are red.
     * @returns true if it does not violated red invariant, false otherwise. 
     */
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

    /**
     * Static method to get the default comparator for this class.
     */
    static defaultComparator<T>(a: T, b: T): number {
        return a < b ? -1 : a > b ? 1 : 0;
    }

    /**
     * Returns the root key-value pair.
     * @returns the root key-value pair
     */
    getRoot(): [K, V] | null {
        return this.root;
    }

    /**
     * Returns the size.
     * @returns the size of the tree
     */
    size(): number {
        return super.size();
    }

    /**
     * Get the value that is associated with the key.
     * 
     * Complexity: O(log n) where n are the number of nodes in the tree.
     * 
     * @param key - the key to get the value from.
     * @returns the value that is associated with the key.
     */
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

    /**
     * Last key is the rightmost key in the tree.
     * @returns the last key in the tree or undefined if the tree is empty. 
     */
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

    /**
     * Sets all entries in the TreeMap.
     * @param entries - an iterable of key-value pairs to set in the TreeMap.
     * @returns a new TreeMap instance with the entries set.
     */
    setAll(entries: Iterable<[K, V]>): TreeMap<K, V> {
        let newTree: TreeMap<K, V> = this;

        for (const [k, v] of entries) {
            newTree = newTree.set(k, v);
        }
        return newTree;
    }


    /**
     * Returns the entries of the TreeMap as an array of key-value pairs.
     * @returns the entries of the TreeMap as an array of key-value pairs.
     */
    entries(): [K, V][] {
        return super.entries();
    }

    /**
     * Returns the keys of the TreeMap as an array.
     * @returns the keys of the TreeMap as an array.
     */
    keys(): K[] {
        return super.keys();
    }

    /**
     * Returns the values of the TreeMap as an array.
     * @returns the values of the TreeMap as an array.
     */
    values(): V[] {
        return super.values();
    }

    /**
     * Check if the TreeMap contains a key.
     * @param key - the key to check if it exists in the TreeMap.
     * @returns true if the key exists in the TreeMap, false otherwise.
     */
    has(key: K): boolean {
        const node = this.getNode(key);
        return node !== null;
    }

    /**
     * Checks if the TreeMap contains a value.
     * @param value - the value to check if it exists in the TreeMap.
     * @returns true if the value exists in the TreeMap, false otherwise.
     */
    hasValue(value: V): boolean {
        return super.hasValue(value);
    }

    /**
     * Checks if the TreeMap contains all keys from the iterable.
     * @param keys - an iterable of keys to check if they exist in the TreeMap.
     * @returns true if all keys exist in the TreeMap, false otherwise.
     */
    hasAll<H extends K>(keys: Iterable<H>): boolean {
        return super.hasAll(keys);
    }


    /**
     * Deletes all keys from the TreeMap.
     * @param keys - an iterable of keys to delete from the TreeMap.
     * @returns a new TreeMap instance with the keys deleted.
     */
    deleteAll(keys: Iterable<K>): TreeMap<K, V> {
        return super.deleteAll(keys) as TreeMap<K, V>;
    }

    /**
     * Clears the TreeMap and returns a new empty TreeMap instance.
     * @returns a new TreeMap instance that is empty.
     */
    clear(): TreeMap<K, V> {
        return this.empty();
    }

    /**
     * Compares the TreeMap with another object for equality.
     * This method checks if the other object is an instance of TreeMap and compares the size and entries.
     * The entries must be in the same order for the TreeMaps to be considered equal.
     * @param o - the object to compare with
     * @returns true if the TreeMap is equal to the object, false otherwise.
     */
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

    /**
     * Compare the map to another map.
     * 
     * First compare the reference, if that is the same then return 0.
     * 
     * Then compare the sizes, if they are different then return the size difference.
     * 
     * Then iterate over the TreeMap's and compare their keys and values. 
     * 
     * @param o the HashMap to compareTo()
     * @returns:
     *      0 -> equal
     *     <0 -> this < 0
     *     >0 -> this > 0
     */
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

    /**
     * Returns the time complexity of has operation.
     * @returns the speed of the TreeMap operations.
     */
    hasSpeed(): Speed {
        return Speed.Log;
    }

    /**
     * Returns the time complexity of get operation.
     * @returns the speed of the get operation.
     */
    addSpeed(): Speed {
        return Speed.Log;
    }

    /**
     * Returns the time complexity of remove operation.
     * @return the time complexity of the remove operation.
     */
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

    /**
     * Returns a string representation of the TreeMap.
     * @returns a string representation of the TreeMap.
     */
    toString(): string {
        let res = "{";
        for (const entry of this) {
            res += entry.toString() + ", ";
        }
        return res + "}";
    }

    /**
     * Returns the value associated with the specified key, or the default value if the key is not found.
     * @param key - the key to look up in the TreeMap.
     * @param defaultValue - the default value to return if the key is not found.
     * @returns the value associated with the key, or the default value if the key is not found.
     */
    getOrDefault(key: K, defaultValue: V): V {
        return super.getOrDefault(key, defaultValue);
    }

    /**
     * If the specified key is not already associated with a value (or is mapped to null)
     * computes its value using the given mapping function and adds it to the map.
     * @param key - the key to compute the value for.
     * @param func - the function to compute the value if the key is absent
     */
    computeIfAbsent(key: K, func: (key: K) => V): [TreeMap<K, V>, V] {
        return super.computeIfAbsent(key, func) as [TreeMap<K, V>, V];
    }

    /**
     * If the value for the specified key is present and non-null, attempts to compute
     * a new mapping given the key and its current mapped value.
     * @param key - the key to compute the value for.
     * @param func - the function to compute the new value if the key is present
     */

    computeIfPresent(key: K, func: (key: K, value: V) => V): [TreeMap<K, V>, V] {
        return super.computeIfPresent(key, func) as [TreeMap<K, V>, V];
    }

    /**
     * Computes a new value for the specified key using the provided function,
     * regardless of whether the key is already present in the map.
     * @param key - the key to compute the value for.
     * @param func - the function to compute the new value for the key
     */
    compute(key: K, func: (key: K, value: (V | undefined)) => V): [TreeMap<K, V>, V] {
        return super.compute(key, func) as [TreeMap<K, V>, V];
    }

    /**
     * Creates a new TreeMap instance with the specified comparator and entries.
     * @param comparer - the comparator to use for the keys in the TreeMap.
     * @param entries - an array of key-value pairs to initialize the TreeMap with.
     * @returns a new TreeMap instance with the specified entries.
     */
    static of<K, V>(comparer: Comparator<K>, ...entries: [K, V][]): TreeMap<K, V> {
        let newTree = new TreeMap<K, V>(comparer);
        for (const [k, v] of entries) {
            newTree = newTree.set(k, v);
        }
        return newTree;
    }

    /**
     * Creates a new TreeMap instance that is a copy of the provided map.
     * @param map - the map to copy from.
     * @returns a new TreeMap instance that is a copy of the provided map.
     */
    copyOf(map: Map<K, V>): TreeMap<K, V> {
        return TreeMap.of(this.compare, ...map.entries());
    }

    // Higher Order Functions
    /**
     * Check that every element in the map satisfies the predicate.
     * @param predicate - a function that takes a value, key, and map, and returns a boolean.
     * @param thisArg - the context to use when calling the predicate function.
     */
    every(predicate: (value: V, key: K, map: this) => boolean, thisArg?: unknown): this is Map<K, V>;
    every(predicate: (value: V, key: K, map: this) => unknown, thisArg?: unknown): boolean;
    every(predicate: (value: V, key: K, map: this) => unknown, thisArg?: unknown): unknown {
        return super.every(predicate, thisArg);
    }

    /**
     * Check that some element in the map satisfies the predicate.
     * @param predicate - a function that takes a value, key, and map, and returns a boolean.
     * @param thisArg - the context to use when calling the predicate function.
     * @returns true if at least one element in the map satisfies the predicate, false otherwise.
     */
    some(predicate: (value: V, key: K, map: this) => boolean, thisArg?: unknown): boolean {
        return super.some(predicate, thisArg);
    }

    /**
     * Sort the TreeMap based on the provided comparator.
     * @param compare - an optional comparator function to sort the keys.
     */
    sort(compare?: Comparator<K>): TreeMap<K, V> {
        let newTreeMap = new TreeMap<K, V>(compare ?? this.compare);
        for (const [k, v] of this) {
            newTreeMap = newTreeMap.set(k, v);
        }
        return newTreeMap;
    }

    /**
     * Sort the TreeMap by a new key derived from the values using the provided comparatorValueMapper.
     * @param comparatorValueMapper - a function that maps the value to a new key for sorting.
     * @param compare - an optional comparator function to compare the new keys.
     * @returns a new TreeMap instance sorted by the new keys.
     */
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

    /**
     * Iterates over each element in the map and applies the callback function.
     * @param callback - a function that takes a value, key, and map, and performs an action for each element in the map.
     * @param thisArg - the context to use when calling the callback function.
     */
    forEach(callback: (value: V, key: K, map: this) => void, thisArg?: unknown) {
        super.forEach(callback, thisArg);
    }

    /**
     * Finds the first value in the map that satisfies the predicate.
     * @param predicate - a function that takes a value, key, and map, and returns a boolean.
     * @param thisArg - the context to use when calling the predicate function.
     * @returns the first value that satisfies the predicate, or undefined if no value satisfies the predicate.
     */
    find(predicate: (value: V, key: K, map: this) => boolean, thisArg?: unknown): V | undefined {
        return super.find(predicate, thisArg);
    }

    /**
     * Reduces the map to a single value by applying the callback function to each element.
     * @param callback - a function that takes a value, key, and map, and returns a boolean.
     * @param initialValue - an optional initial value to start the reduction.
     */
    reduce(callback: (accumulator: V, value: V, key: K, map: this) => V, initialValue?: V): V;
    reduce<R>(callback: (accumulator: R, value: V, key: K, map: this) => R, initialValue?: R): R;
    reduce<R>(callback: (accumulator: R, value: V, key: K, map: this) => R, initialValue?: R): R {
        return super.reduce(callback, initialValue);
    }

    /**
     * reduceRight method to reduce the map from right to left
     * @param callback - a function that takes an accumulator, value, key, and map, and returns a new accumulator.
     * @param initialValue - an optional initial value to start the reduction.
     */
    reduceRight(callback: (accumulator: V, value: V, key: K, map: this) => V, initialValue?: V): V;
    reduceRight<R>(callback: (accumulator: R, value: V, key: K, map: this) => R, initialValue?: R): R;
    reduceRight<R>(callback: (accumulator: R, value: V, key: K, map: this) => R, initialValue?: R): R {
        return super.reduceRight(callback, initialValue);
    }

    /**
     * Updates or adds a key-value pair to the TreeMap.
     * @param key - the key to update or add
     * @param callback - a function that takes the current value and returns the new value.
     */
    updateOrAdd(key: K, callback: (value: V) => V): TreeMap<K, V>;
    updateOrAdd(key: K, callback: (value: V | undefined) => V | undefined): TreeMap<K, V | undefined>;
    updateOrAdd(key: K, newValue: V): TreeMap<K, V>;
    updateOrAdd(key: K, callbackOrValue: any): TreeMap<K, any> {
        return super.updateOrAdd(key, callbackOrValue) as TreeMap<K, V>;
    }

    /**
     * Merges the current TreeMap with one or more collections.
     * This method will add all entries from the collections to the current TreeMap.
     * 
     * The overload accepts either an array of collections (iterables or objects) or a single Map.
     * @param collections - an array of collections to merge with the current TreeMap.
     */
    merge<KC, VC>(
        ...collections: Array<Iterable<[KC, VC]>>
    ): TreeMap<K | KC, Exclude<V, VC> | VC>;
    merge<C>(
        ...collections: Array<{ [key: string]: C }>
    ): TreeMap<K | string, Exclude<V, C> | C>;
    merge<KC, VC>(other: Map<KC, VC>): TreeMap<K | KC, V | VC>;
    merge(...collections: any[]): TreeMap<any, any> {
        return super.merge(...collections) as TreeMap<any, any>;
    }

    /**
     * Concatenates the current TreeMap with one or more collections.
     * This method will add all entries from the collections to the current TreeMap.
     * 
     * The overload accepts either an array of collections (iterables or objects).
     * Difference to `merge` is that this does not accept a single map as argument. 
     * @param collections - an array of collections to concatenate with the current TreeMap.
     */
    concat<KC, VC>(
        ...collections: Array<Iterable<[KC, VC]>>
    ): TreeMap<K | KC, Exclude<V, VC> | VC>;    
    concat<C>(
        ...collections: Array<{ [key: string]: C }>
    ): TreeMap<K | string, Exclude<V, C> | C>;
    concat(...collections: any[]): TreeMap<any, any> {
        return super.concat(...collections) as TreeMap<any, any>;
    }

    /**
     * Merges one or more collections into the current map resolving key conflicts using a provided callback function.
     * @param callback - a function that takes the old value, new value, and key, and returns a new value.
     * @param collections - an array of collections to merge with the current TreeMap.
     */
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
        return super.mergeWith(callback, ...collections) as TreeMap<any, any>;
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
    

    /**
     * Transforms the values in the TreeMap using the provided callback function.
     * @param callback - the callback function to apply to each value in the map.
     * @param thisArg - the context to use when calling the callback function.
     * @returns a new TreeMap with the results of applying the callback to each value.
     */
    map<M>(
        callback: (value: V, key: K, map: this) => M,
        thisArg?: unknown
    ): TreeMap<K, M> {
        return super.map(callback, thisArg) as TreeMap<K, M>;
    }

    /**
     * Transforms the keys in the TreeMap using the provided callback function.
     * @param callback - the callback function to apply to each key in the map.
     * @param thisArg - the context to use when calling the callback function.
     * @param compare - an optional comparator function to compare the new keys.
     * @returns a new TreeMap with the keys transformed by the callback function.
     */
    mapKeys<M>(
        callback: (key: K, value: V, map: this) => M,
        thisArg?: unknown,
        compare?: Comparator<M>
    ): TreeMap<M, V> {
        return super.mapKeys(callback, thisArg, compare) as TreeMap<M, V>;
    }

    /**
     * Transforms the entries in the TreeMap using the provided callback function.
     * @param mapper - the callback function to apply to each entry in the map.
     * @param thisArg - the context to use when calling the callback function.
     * @param compare - an optional comparator function to compare the new keys.
     * @returns a new TreeMap with the entries transformed by the callback function.
     */
    mapEntries<KM, VM>(
        mapper: (
          entry: [K, V],
          index: number,
          map: this
        ) => [KM, VM] | undefined,
        thisArg?: unknown,
        compare?: Comparator<KM>
      ): TreeMap<KM, VM> {
        return super.mapEntries(mapper, thisArg, compare) as TreeMap<KM, VM>;
      }

    /**
     * Applies a callback function to each value in the TreeMap and flattens the results into a new TreeMap.
     * @param callback - a function that takes a value, key, and map, and returns an iterable of key-value pairs.
     * @param thisArg - the context to use when calling the callback function.
     * @param compare - an optional comparator function to compare the new keys.
     * @returns a new TreeMap with the results of applying the callback to each value.
     */
    flatMap<KM, VM>(
        callback: (value: V, key: K, map: this) => Iterable<[KM, VM]>,
        thisArg?: unknown,
        compare?: Comparator<KM>
    ): TreeMap<KM, VM> {
        return super.flatMap(callback, thisArg, compare) as TreeMap<KM, VM>;
    }

    /**
     * Filters the TreeMap based on a predicate function.
     * @param predicate - a function that takes a value, key, and map, and returns a boolean.
     * @param thisArg - the context to use when calling the predicate function.
     */
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
    ): TreeMap<K, any> {
        return super.filter(predicate, thisArg) as TreeMap<K, any>;
    }

    /**
     * Partitions the TreeMap into two new TreeMaps based on a predicate function.
     * The first TreeMap contains elements that satisfy the predicate, and the second TreeMap contains elements that do not.
     * @param predicate - a function that takes a value, key, and map, and returns a boolean.
     * @param thisArg - the context to use when calling the predicate function.
     */
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
        return super.partition(predicate, thisArg) as [TreeMap<K, V>, TreeMap<K, V>];
    }

    /**
     * Flips the keys and values of the TreeMap.
     * @returns a new TreeMap with the keys and values flipped.
     */
    flip(): TreeMap<V, K> {
        return super.flip() as TreeMap<V, K>;
    }


    // end HOFs

    /**
     * Find the minimum key-value pair in the tree, or from a given key.
     * @param key - the key to find the minimum value for
     * @returns the minimum key-value pair in the tree, or undefined if the tree is empty
     */
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

    /**
     * Delete the minimum key-value pair from the tree.
     * @returns a new TreeMap with the minimum key-value pair deleted.
     */
    deleteMin(): TreeMap<K, V> {
        if (this.isEmpty()) return this.empty();
        const min = this.findMin();
        if (min === undefined) return this;
        return this.delete(min[0]);
    }

    /**
     * Find the maximum key-value pair in the tree, or from a given key.
     * @param key - the key to find the maximum value for
     * @returns the maximum key-value pair in the tree, or undefined if the tree is empty
     */
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
   
    /**
     * Delete the maximum key-value pair from the tree.
     * @returns the maximum key-value pair in the tree, or undefined if the tree is empty
     */
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

    /**
     * Returns the comparator function used for this TreeMap.
     * @returns the compare function for this tree
     */
    getComparator(): Comparator<K> {
        return this.compare;
    }
    
    /**
     * Returns a slice of the TreeMap based on a cut function and a range of keys.
     * @param cutFunction - a function that takes a key and returns a value to compare against.
     * @param fromKey - the starting key for the cut operation (inclusive).
     * @param toKey - the ending key for the cut operation (exclusive).
     * @returns a new TreeMap containing only the entries that fall within the specified range.
     */
    cut(cutFunction: (compareToOther: K) => number, fromKey: K, toKey: K): TreeMap<K, V> {
        return super.cut(cutFunction, fromKey, toKey) as TreeMap<K, V>;
    }

    /**
     * Returns a new TreeMap containing all entries from the specified key to the end of the TreeMap.
     * @param fromKey - the key to start the range from (inclusive).
     * @returns a new TreeMap containing all entries from the specified key to the end of the TreeMap.
     */
    rangeFrom(fromKey: K): TreeMap<K, V> {
        return super.rangeFrom(fromKey) as TreeMap<K, V>;
    }

    /**
     * Returns a new TreeMap containing all entries from the start of the TreeMap to the specified key.
     * @param toKey - the key to end the range at (exclusive).
     * @returns a new TreeMap containing all entries from the start of the TreeMap to the specified key.
     */
    rangeTo(toKey: K): TreeMap<K, V> {
        return super.rangeTo(toKey) as TreeMap<K, V>;
    }

    /**
     * Returns a new TreeMap containing all entries from the specified range of keys.
     * This method includes the `fromKey` and excludes the `toKey`.
     * @param fromKey - the key to start the range from (inclusive).
     * @param toKey - the key to end the range at (exclusive).
     * @returns - a new TreeMap containing all entries from the specified range.
     */
    rangeFromTo(fromKey: K, toKey: K): TreeMap<K, V> {
        return super.rangeFromTo(fromKey, toKey) as TreeMap<K, V>;
    }
    
    /**
     * Returns a new TreeMap containing all entries from the start of the TreeMap to the specified key.
     * @param fromKey - the key to start the range from (inclusive).
     * @returns - a new TreeMap containing all entries from the start of the TreeMap to the specified key.
     */
    removeRangeFrom(fromKey: K): TreeMap<K, V> {
        return super.removeRangeFrom(fromKey) as TreeMap<K, V>;
    }
    /**
     * Removes all entries with keys less than or equal to the given `toKey`.
     * @param toKey - the key to end the range at (inclusive).
     * @returns - a new TreeMap containing all entries with keys greater than the `toKey`.
     */ 
    removeRangeTo(toKey: K): TreeMap<K, V> {
        return super.removeRangeTo(toKey) as TreeMap<K, V>;
    }

    /**
     * Removes all entries with keys in the range `[fromKey, toKey)`
     * @param fromKey - the key to start the range from (inclusive).
     * @param toKey - the key to end the range at (exclusive).
     * @returns - a new TreeMap containing all entries with keys outside the specified range.
     */
    removeRangeFromTo(fromKey: K, toKey: K): TreeMap<K, V> {
        return super.removeRangeFromTo(fromKey, toKey) as TreeMap<K, V>;
    }
}