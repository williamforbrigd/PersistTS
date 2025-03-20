enum Color {
    RED,
    BLACK,
    DOUBLEBLACK,
    NEGATIVEBLACK
}

class Node2<T> {
    constructor(
        public color: Color,
        public leftNode: Node2<T> | null,
        public value: T,
        public rightNode: Node2<T> | null
    ) {
    }

    isRed(): boolean {
        return this.color === Color.RED;
    }

    isBlack(): boolean {
        return this.color === Color.BLACK;
    }

    isDoubleBlack(): boolean {
        return this.color === Color.DOUBLEBLACK;
    }

    isNegativeBlack(): boolean {
        return this.color === Color.NEGATIVEBLACK;
    }


    toString(): string {
        // include the double black as DB
        return `${this.value}${this.color === Color.RED ? 'R' : this.color === Color.BLACK ? 'B' : 'DB'}`;
    }
}

export default class RBTreeBubble<T> {
    
    constructor(
        private readonly root: Node2<T> | null = null,
        private readonly isDoubleBlackLeaf: boolean = false
    ) {
    }

    from(color: Color, left: RBTreeBubble<T>, value: T, right: RBTreeBubble<T>): RBTreeBubble<T> {
        if (!left.isEmpty() && left.rootValue() >= value) {
            throw new Error("left subtree value must be less than root value");
        }
        if (!right.isEmpty() && value >= right.rootValue()) {
            throw new Error("right subtree value must be greater than root value");
        }
        return new RBTreeBubble(new Node2(color, left.root, value, right.root));
    }

    isEmpty(): boolean {
        return this.root === null;
    }

    isEmptyDoubleBlackLeaf(): boolean {
        return this.root === null && this.isDoubleBlackLeaf;
    }

    empty(): RBTreeBubble<T> {
        return new RBTreeBubble<T>(null);
    }

    emptyDoubleBlackLeaf(): RBTreeBubble<T> {
        return new RBTreeBubble<T>(null, true);
    }

    rootValue(): T {
        if (this.isEmpty()) throw new Error("Tree is empty. Cannot get root value");
        return this.root!.value;
    }

    rootColor(): Color {
        if (this.isEmpty()) throw new Error("Tree is empty. Cannot get root color");
        return this.root!.color;
    }

    left(): RBTreeBubble<T> {
        if (this.isEmpty()) return this.empty();
        return new RBTreeBubble<T>(this.root!.leftNode);
    }

    right(): RBTreeBubble<T> {
        if (this.isEmpty()) return this.empty();
        return new RBTreeBubble<T>(this.root!.rightNode);
    }

    isB(): boolean {
        return this.rootColor() === Color.BLACK;
    }

    isR(): boolean {
        return this.rootColor() === Color.RED;
    }

    isBB(): boolean {
        return this.rootColor() === Color.DOUBLEBLACK || this.isDoubleBlackLeaf;
    }

    isNB(): boolean {
        return this.rootColor() === Color.NEGATIVEBLACK;
    }

    member(x: T): boolean {
        if (this.isEmpty()) return false;
        const y = this.rootValue();
        if (x < y) return this.left().member(x);
        if (x > y) return this.right().member(x);
        else return true;
    }

    redden(): RBTreeBubble<T> {
        if (this.isEmpty()) throw new Error("cannto redden empty tree");
        else if (this.isEmptyDoubleBlackLeaf()) throw new Error("cannot redden double black tree");
        return this.paint(Color.RED);
    }

    blacken(): RBTreeBubble<T> {
        if (this.isEmpty()) return this.empty();
        else if (this.isEmptyDoubleBlackLeaf()) return this.empty();
        return this.paint(Color.BLACK);
    }

    blacker(c: Color): Color {
        switch (c) {
            case Color.BLACK: return Color.DOUBLEBLACK;
            case Color.RED: return Color.BLACK;
            case Color.NEGATIVEBLACK: return Color.RED;
            case Color.DOUBLEBLACK: throw new Error("Cannot blacken double black");
        }
    }

    redder(c: Color): Color {
        switch (c) {
            case Color.DOUBLEBLACK: return Color.BLACK;
            case Color.BLACK: return Color.RED;
            case Color.RED: return Color.NEGATIVEBLACK;
            case Color.NEGATIVEBLACK: throw new Error("cannot lighten negative black");
        }
    }

    blackerTree(): RBTreeBubble<T> {
        if (this.isEmpty()) return this.emptyDoubleBlackLeaf();
        return this.from(Color.BLACK, this.left(), this.rootValue(), this.right());
    }

    redderTree(): RBTreeBubble<T> {
        if (this.isEmpty() && this.isDoubleBlackLeaf) return this.empty();
        return this.from(this.redder(this.rootColor()), this.left(), this.rootValue(), this.right())
    }

    insert(x: T): RBTreeBubble<T> {
        return this.ins(x).blacken();
    }

    private ins(x: T): RBTreeBubble<T> {
        if (this.isEmpty()) return this.from(Color.RED, this.empty(), x, this.empty());
        const y = this.rootValue();
        const c = this.rootColor();
        if (x < y) {
            return this.bubble(c, this.left().ins(x), y, this.right());
        } else if (x > y) {
            return this.bubble(c, this.left(), y, this.right().ins(x));
        } else {
            return this;
        }
    }

    delete(x: T): RBTreeBubble<T> {
        return this.del(x).blacken();
    }

    private del(x: T): RBTreeBubble<T> {
        if (this.isEmpty()) return this.empty();

        const y = this.rootValue();
        const c = this.rootColor();

        if (x < y) {
            return this.bubble(c, this.left().del(x), y, this.right());
        } else if (x > y) {
            return this.bubble(c, this.left(), y, this.right().del(x));
        } else  {
            // node found remove it
            return this.remove();
        }
    }

    private bubble(c: Color, left: RBTreeBubble<T>, y: T, right: RBTreeBubble<T>): RBTreeBubble<T> {
        if ((!left.isEmpty() && left.isBB()) || (!right.isEmpty() && right.isBB())) {
            return this.balance(this.blacker(c), left.redderTree(), y, right.redderTree());
        } else {
            return this.balance(c, left, y, right);
        }
    }

    private balance(c: Color, left: RBTreeBubble<T>, x: T, right: RBTreeBubble<T>): RBTreeBubble<T> {
        // Okasaki's insertion cases
        if (c === Color.BLACK) {
            if (left.doubledLeft()) {
                const newLeft = left.left().paint(Color.BLACK);
                const rootValue = left.rootValue();
                const newRight = this.from(Color.BLACK, left.right(), x, right);
                return this.from(Color.RED, newLeft, rootValue, newRight);
            } else if (left.doubledRight()) {
                const newLeft = this.from(Color.BLACK, left.left(), left.rootValue(), left.right().left());
                const rootValue = left.right().rootValue();
                const newRight = this.from(Color.BLACK, left.right().right(), x, right);
                return this.from(Color.RED, newLeft, rootValue, newRight);
            } else if (right.doubledLeft()) {
                const newLeft = this.from(Color.BLACK, left, x, right.left().left());
                const rootValue = right.left().rootValue();
                const newRight = this.from(Color.BLACK, right.left().right(), right.rootValue(), right.right());
                return this.from(Color.RED, newLeft, rootValue, newRight);
            } else if (right.doubledRight()) {
                const newLeft = this.from(Color.BLACK, left, x, right.left());
                const rootValue = right.rootValue();
                const newRight = right.right().paint(Color.BLACK);
                return this.from(Color.RED, newLeft, rootValue, newRight);
            } else {
                return this.from(c, left, x, right);
            }
        }

        if (c === Color.DOUBLEBLACK) {
            // Matt Might's deletion cases for double black
            if (left.doubledLeft()) {
                const newLeft = this.from(Color.BLACK, left.left().left(), left.left().rootValue(), left.left().right());
                const rootValue = left.rootValue();
                const newRight = this.from(Color.BLACK, left.right(), x, right);
                return this.from(Color.BLACK, newLeft, rootValue, newRight)
            } else if (left.doubledRight()) {
                const newLeft = this.from(Color.BLACK, left.left(), left.rootValue(), left.right().left());
                const rootValue = left.right().rootValue();
                const newRight = this.from(Color.BLACK, left.right().right(), x, right);
                return this.from(Color.BLACK, newLeft, rootValue, newRight);
            } else if (right.doubledLeft()) {
                const newLeft = this.from(Color.BLACK, left, x, right.left().left());
                const rootValue = right.left().rootValue();
                const newRight = this.from(Color.BLACK, right.left().right(), right.rootValue(), right.right());
                return this.from(Color.BLACK, newLeft, rootValue, newRight);
            } else if (right.doubledRight()) {
                const newLeft = this.from(Color.BLACK, left, x, right.left());
                const rootValue = right.rootValue();
                const newRight = this.from(Color.BLACK, right.right(), right.rootValue(), right.right());
                return this.from(Color.BLACK, newLeft, rootValue, newRight);
            // end Matt Might's deletion cases

            // Matt Might's negative black cases
            } else if (right.isNB()) {
                if (right.left().isB() && right.right().isB()) {
                    const newLeft = this.from(Color.BLACK, left, x, right.left().left());
                    const rootValue = right.left().rootValue();
                    const newRight = this.balance(
                                            Color.BLACK,
                                            right.left().right(),
                                            right.rootValue(),
                                            right.right().redden(),
                    );
                    return this.from(Color.BLACK, newLeft, rootValue, newRight);
                } else {
                    return this.from(c, left, x, right);
                }
            } else if (left.isNB()) {
                if (left.left().isB() && left.right().isB()) {
                    const newLeft = this.balance(
                                        Color.BLACK,
                                        left.left().redden(),
                                        left.rootValue(),
                                        left.right().left(),
                        
                    );
                    const rootValue = left.right().rootValue();
                    const newRight = this.from(Color.BLACK, left.right().right(), x, right);
                    return this.from(Color.BLACK, newLeft, rootValue, newRight);
                } else {
                    return this.from(c, left, x, right);
                }
            } else {
                return this.from(c, left, x, right);
            }
        }

        return this.from(c, left, x, right);
    }

    private remove(): RBTreeBubble<T> {
        if (this.isEmpty()) return this.empty();
        else if (this.isR() && this.left().isEmpty() && this.right().isEmpty()) return this.empty();
        else if (this.isB() && this.left().isEmpty() && this.right().isEmpty()) return this.emptyDoubleBlackLeaf();
        else if (this.isB() && this.left().isEmpty() && this.right().isR()) return this.right().paint(Color.BLACK);
        else if (this.isB() && this.left().isR() && this.right().isEmpty()) return this.left().paint(Color.BLACK);
        else {
            // find max in the left subtree and move it to the root
            const maxTreeValue = this.left().maxSubTreeValue();
            // remove max in the left subtree from the left subtree
            const rmMax = this.left().removeMax();
            return this.bubble(this.rootColor(), rmMax, maxTreeValue, this.right());
        }
    }

    private removeMax(): RBTreeBubble<T> {
        if (this.isEmpty()) throw new Error("cannot remove max from empty tree");
        else if (this.right().isEmpty()) {
            return this.remove();
        } else {
            return this.bubble(this.rootColor(), this.left(), this.rootValue(), this.right().removeMax())
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

    private paint(color: Color): RBTreeBubble<T> {
        if (this.isEmpty()) return this.empty();
        return this.from(color, this.left(), this.rootValue(), this.right());
    }


    minSubTree(): RBTreeBubble<T> | null {
        let current: RBTreeBubble<T> = this;
        while (!current.left().isEmpty()) {
            current = current.left();
        }
        return current.isEmpty() ? null : current;
    }

    maxSubTree(): RBTreeBubble<T> | null {
        let current: RBTreeBubble<T> = this;
        while (!current.right().isEmpty()) {
            current = current.right();
        }
        return current.isEmpty() ? null : current;
    }

    // maxSubTreeValue(): T {
    //     const maxSubTree = this.maxSubTree();
    //     if (maxSubTree === null) throw new Error("cannot get max value from empty tree");
    //     return maxSubTree.rootValue();
    // }

    minSubTreeValue(): T {
        if (this.isEmpty()) throw new Error("cannot get min value from empty tree");
        return this.left().isEmpty() ? this.rootValue() : this.left().minSubTreeValue();
    }

    maxSubTreeValue(): T {
        if (this.isEmpty()) throw new Error("cannot get max value from empty tree");
        return this.right().isEmpty() ? this.rootValue() : this.right().maxSubTreeValue();
    }

    private printTreeHelper(root: Node2<T> | null, space: number): void {
        if (root) {
            space += 10;
            this.printTreeHelper(root.rightNode, space);
            console.log(' '.repeat(space) + root.toString());
            this.printTreeHelper(root.leftNode, space);
        }
    }

    public printTree(): void {
        this.printTreeHelper(this.root, 0);
    }

    isBST(): boolean {
        return this.isBSTHelper(this.root);
    }

    private isBSTHelper(x: Node2<T> | null): boolean {
        if (x === null) return true;

        if (x.leftNode !== null && x.value < x.leftNode.value) return false;

        if (x.rightNode !== null && x.value > x.rightNode.value) return false;

        return this.isBSTHelper(x.leftNode) && this.isBSTHelper(x.rightNode);
    }

    redInvariant(): boolean {
        return this.redInvariantHelper(this.root);
    }

    private redInvariantHelper(x: Node2<T> | null): boolean {
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

    private blackBalancedHelper(x: Node2<T> | null, bb: number): boolean {
        if (x === null) return bb === 0;
        let currentBlackHeight = bb;
        if (x.isBlack()) currentBlackHeight--;
        if (x.leftNode === null && x.rightNode !== null) {
            return this.blackBalancedHelper(x.rightNode, currentBlackHeight);
        } else if (x.leftNode !== null && x.rightNode === null) {
            return this.blackBalancedHelper(x.leftNode, currentBlackHeight);
        } else {
            return this.blackBalancedHelper(x.leftNode, currentBlackHeight) && this.blackBalancedHelper(x.rightNode, currentBlackHeight);
        }
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

    private validateRedBlackTreeHelper(x: Node2<T> | null, bb: number): boolean {
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
        if (x.leftNode && x.leftNode.value >= x.value) return false;
        if (x.rightNode && x.rightNode.value <= x.value) return false;

        // Recursive check for the left and right subtrees
        if (x.leftNode === null && x.rightNode !== null) {
            return this.validateRedBlackTreeHelper(x.rightNode, currentBlackHeight);
        } else if (x.leftNode !== null && x.rightNode === null) {
            return this.validateRedBlackTreeHelper(x.leftNode, currentBlackHeight);
        } else {
            return this.validateRedBlackTreeHelper(x.leftNode, currentBlackHeight) && 
                   this.validateRedBlackTreeHelper(x.rightNode, currentBlackHeight);
        }
    }
}

function createRandomIntArray(size: number, min: number = 0, max: number = 100): number[] {
    return Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const largeArray = createRandomIntArray(1_000, 1, 100);
let rbtree = new RBTreeBubble<number>();

for (const elem of largeArray) {
    rbtree = rbtree.insert(elem);
    if (!rbtree.isBST()) {
        console.log("Tree is not a valid BST after insertion");
        rbtree.printTree();
    }
    if (!rbtree.redInvariant()) {
        console.log("red invariant violated after insertion");
        rbtree.printTree();
    }
    if (!rbtree.blackBalancedInvariant()) {
        console.log("black balanced invariant violated after insertion");
        rbtree.printTree();
    }
}

// const elemsToDelete = shuffleArray(largeArray);
// const elemsToDelete = largeArray;
// for (const elem of elemsToDelete) {
//     rbtree = rbtree.delete(elem);
//     if (!rbtree.isBST()) {
//         console.log("Tree is not a valid BST after deletion");
//         rbtree.printTree();
//     }
//     if (!rbtree.redInvariant()) {
//         console.log("red invariant violated after deletion");
//         rbtree.printTree();
//     }
//     if (!rbtree.blackBalancedInvariant()) {
//         console.log("black balanced invariant violated after deletion");
//         rbtree.printTree();
//     }
// }

//TODO: look at this becasue sometimes fails for black invariant and for large data sets.
// TODO: maybe look at the other implementation in RedBlackSet.hs

const tree = new RBTreeBubble<number>();
console.log(tree.isEmpty()); // true

let newTree = tree;
// const arr = [50, 40, 30, 10, 20, 30, 100, 0, 45, 55, 25, 15];
const arr = [50, 40, 30, 10, 20, 30, 100, 0, 45, 55, 25, 15, 1000, 11111];

for (const elem of arr) {
    newTree = newTree.insert(elem);
    newTree.printTree();
}

console.log("minSubTree: " + newTree.minSubTree());

const newTree12 = newTree.delete(55);
newTree12.printTree();
console.log(newTree12.isBST());
console.log(newTree12.redInvariant());
console.log(newTree12.blackBalancedInvariant());
console.log(newTree12.validateRedBlackTree())

const newTree13 = newTree12.delete(50);
newTree13.printTree();
console.log(newTree13.isBST());
console.log(newTree13.redInvariant());
console.log(newTree13.blackBalancedInvariant());
console.log(newTree13.validateRedBlackTree())

const newTree14 = newTree13.delete(45);
newTree14.printTree();
console.log(newTree14.isBST());
console.log(newTree14.redInvariant());
console.log(newTree14.blackBalancedInvariant());
console.log(newTree14.validateRedBlackTree())

const newTree15 = newTree14.delete(40);
newTree15.printTree();
console.log(newTree15.isBST());
console.log(newTree15.redInvariant());
console.log(newTree15.blackBalancedInvariant());
console.log(newTree15.validateRedBlackTree())

const newTree16 = newTree15.delete(30);
newTree16.printTree();
console.log(newTree16.isBST());
console.log(newTree16.redInvariant());
console.log(newTree16.blackBalancedInvariant());
console.log(newTree16.validateRedBlackTree())

const newTree17 = newTree16.delete(25);
newTree17.printTree();
console.log(newTree17.isBST());
console.log(newTree17.redInvariant());
console.log(newTree17.blackBalancedInvariant());
console.log(newTree17.validateRedBlackTree())

const newTree18 = newTree17.delete(20);
newTree18.printTree();
console.log(newTree18.isBST());
console.log(newTree18.redInvariant());
console.log(newTree18.blackBalancedInvariant());
console.log(newTree18.validateRedBlackTree())

const newTree19 = newTree18.delete(15);
newTree19.printTree();
console.log(newTree19.isBST());
console.log(newTree19.redInvariant());
console.log(newTree19.blackBalancedInvariant());
console.log(newTree19.validateRedBlackTree())


// const newTree14 = newTree13.delete(10);
// newTree14.printTree();
// console.log(newTree14.isBST());
// console.log(newTree14.redInvariant());
// console.log(newTree14.blackBalancedInvariant());
// console.log(newTree14.validateRedBlackTree())

// const newTree15 = newTree14.delete(15);
// newTree15.printTree();
// console.log(newTree15.isBST());
// console.log(newTree15.redInvariant());
// console.log(newTree15.blackBalancedInvariant());
// console.log(newTree15.validateRedBlackTree())

// const newTree16 = newTree15.delete(30);
// newTree16.printTree();
// console.log(newTree16.isBST());
// console.log(newTree16.redInvariant());
// console.log(newTree16.blackBalancedInvariant());
// console.log(newTree16.validateRedBlackTree())

// const newTree17 = newTree16.delete(55);
// newTree17.printTree();
// console.log(newTree17.isBST());
// console.log(newTree17.redInvariant());
// console.log(newTree17.blackBalancedInvariant());
// console.log(newTree17.validateRedBlackTree())

// const newTree18 = newTree17.delete(20);
// newTree18.printTree();
// console.log(newTree18.isBST());
// console.log(newTree18.redInvariant());
// console.log(newTree18.blackBalancedInvariant());
// console.log(newTree18.validateRedBlackTree())

// const newTree19 = newTree18.delete(45);
// newTree19.printTree();
// console.log(newTree19.isBST());
// console.log(newTree19.redInvariant());
// console.log(newTree19.blackBalancedInvariant());
// console.log(newTree19.validateRedBlackTree())

// const newTree20 = newTree19.delete(100);
// newTree20.printTree();
// console.log(newTree20.isBST());
// console.log(newTree20.redInvariant());
// console.log(newTree20.blackBalancedInvariant());
// console.log(newTree20.validateRedBlackTree())


// const newTree21 = newTree20.delete(40);
// newTree21.printTree();
// console.log(newTree21.isBST());
// console.log(newTree21.redInvariant());
// console.log(newTree21.blackBalancedInvariant());
// console.log(newTree21.validateRedBlackTree())