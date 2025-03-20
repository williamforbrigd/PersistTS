enum Color {
    RED,
    BLACK,
    DOUBLEBLACK,
    NEGATIVEBLACK
}

export default class RBTreeBubble<T> {
    private static readonly EMPTY = new RBTreeBubble<any>(Color.BLACK, null, null, null);
    constructor(
        private readonly color: Color = Color.BLACK,
        private readonly leftTree: RBTreeBubble<T> | null = null,
        private readonly root: T | null = null,
        private readonly rightTree: RBTreeBubble<T> | null = null,
    ) {
    }

    from(color: Color, left: RBTreeBubble<T>, value: T, right: RBTreeBubble<T>): RBTreeBubble<T> {
        if (!left.isEmpty() && left.root !== null && left.root! >= value) {
            throw new Error("left subtree value must be less than root value");
        }
        if (!right.isEmpty() && right.root !== null && value >= right.root!) {
            throw new Error("right subtree value must be greater than root value");
        }
        return new RBTreeBubble(color, left, value, right);
    }

    isEmpty(): boolean {
        return this.root === null;
    }

    isDoubleBlackLeaf(): boolean {
        return this.root === null && this.color === Color.DOUBLEBLACK;
    }

    static empty<T>(): RBTreeBubble<T> {
        return this.EMPTY as RBTreeBubble<T>;
    }

    doubleBlackLeaf(): RBTreeBubble<T> {
        return new RBTreeBubble<T>(Color.DOUBLEBLACK, null, null, null);
    }

    rootValue(): T {
        if (this.isEmpty()) throw new Error("Tree is empty. Cannot get root value");
        return this.root!
    }

    left(): RBTreeBubble<T> {
        if (!this.leftTree) return RBTreeBubble.empty<T>();
        return this.leftTree;
    }

    right(): RBTreeBubble<T> {
        if (!this.rightTree) return RBTreeBubble.empty<T>();
        return this.rightTree;
    }

    isB(): boolean {
        return !this.isEmpty() && this.color === Color.BLACK;
    }

    isR(): boolean {
        return !this.isEmpty() && this.color === Color.RED;
    }

    isBB(): boolean {
        if (this.isDoubleBlackLeaf()) return true;
        return !this.isEmpty() && this.color === Color.DOUBLEBLACK;
    }

    isNB(): boolean {
        return !this.isEmpty() && this.color === Color.NEGATIVEBLACK;
    }

    has(x: T): boolean {
        if (this.isEmpty()) return false;
        const y = this.rootValue();
        if (x < y) return this.left().has(x);
        if (x > y) return this.right().has(x);
        else return true;
    }

    redden(): RBTreeBubble<T> {
        if (this.isEmpty()) throw new Error("cannto redden empty tree");
        else if (this.isDoubleBlackLeaf()) throw new Error("cannot redden double black tree");
        return this.paint(Color.RED);
    }

    blacken(): RBTreeBubble<T> {
        if (this.isEmpty()) return RBTreeBubble.empty<T>();
        else if (this.isDoubleBlackLeaf()) return RBTreeBubble.empty<T>();
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
        if (this.isEmpty()) return this.doubleBlackLeaf();
        return this.from(this.blacker(this.color), this.left(), this.rootValue(), this.right());
    }

    redderTree(): RBTreeBubble<T> {
        if (this.isDoubleBlackLeaf()) return RBTreeBubble.empty<T>();
        return this.from(this.redder(this.color), this.left(), this.rootValue(), this.right())
    }

    insert(x: T): RBTreeBubble<T> {
        return this.ins(x).paint(Color.BLACK);
    }

    private ins(x: T): RBTreeBubble<T> {
        if (this.isEmpty()) return this.from(Color.RED, RBTreeBubble.empty<T>(), x, RBTreeBubble.empty<T>());
        const y = this.rootValue();
        const c = this.color;
        if (x < y) {
            return this.bubble(c, this.left().ins(x), y, this.right());
        } else if (x > y) {
            return this.bubble(c, this.left(), y, this.right().ins(x));
        } else {
            return this;
        }
    }

    delete(x: T): RBTreeBubble<T> {
        return this.del(x).paint(Color.BLACK);
    }

    private del(x: T): RBTreeBubble<T> {
        if (this.isEmpty()) return RBTreeBubble.empty<T>();

        const y = this.rootValue();
        const c = this.color;

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
        if ((left.isBB()) || (right.isBB())) {
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
                const newRight = right.right().paint(Color.BLACK);
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
        if (this.isEmpty()) return RBTreeBubble.empty<T>();
        else if (this.isR() && this.left().isEmpty() && this.right().isEmpty()) return RBTreeBubble.empty<T>();
        // deletion of double black leaf
        else if (this.isB() && this.left().isEmpty() && this.right().isEmpty()) return this.doubleBlackLeaf();
        else if (this.isB() && this.left().isEmpty() && this.right().isR()) return this.right().paint(Color.BLACK);
        else if (this.isB() && this.left().isR() && this.right().isEmpty()) return this.left().paint(Color.BLACK);
        else {
            // find max in the left subtree and move it to the root
            const maxTreeValue = this.left().maxSubTreeValue();
            // remove max in the left subtree from the left subtree
            const rmMax = this.left().removeMax();
            return this.bubble(this.color, rmMax, maxTreeValue, this.right());
        }
    }

    private removeMax(): RBTreeBubble<T> {
        if (this.isEmpty()) throw new Error("cannot remove max from empty tree");
        else if (this.right().isEmpty()) {
            return this.remove();
        } else {
            return this.bubble(this.color, this.left(), this.rootValue(), this.right().removeMax())
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

    private paint(color: Color): RBTreeBubble<T> {
        if (this.isEmpty()) return RBTreeBubble.empty<T>();
        return new RBTreeBubble(color, this.leftTree, this.root, this.rightTree);
    }

    minSubTree(): RBTreeBubble<T> {
        if (this.isEmpty()) throw new Error("cannot get min value from empty tree");
        return this.left().isEmpty() ? this : this.left().minSubTree();
    }

    maxSubTree(): RBTreeBubble<T> {
        if (this.isEmpty()) throw new Error("cannot get max value from empty tree");
        return this.right().isEmpty() ? this : this.right().maxSubTree();
    }

    minSubTreeValue(): T {
        if (this.isEmpty()) throw new Error("cannot get min value from empty tree");
        return this.left().isEmpty() ? this.rootValue() : this.left().minSubTreeValue();
    }

    maxSubTreeValue(): T {
        if (this.isEmpty()) throw new Error("cannot get max value from empty tree");
        return this.right().isEmpty() ? this.rootValue() : this.right().maxSubTreeValue();
    }

    private printTreeHelper(space: number): void {
        if (!this.isEmpty()) {
            space += 10;
            this.right().printTreeHelper(space);

            const color = this.color === Color.RED ? 'R' : 'B';
            const rootString = this.root + color;
            console.log(' '.repeat(space) + rootString);

            this.left().printTreeHelper(space);
        }
    }

    public printTree(): void {
        this.printTreeHelper(0);
    }

    isBST(): boolean {
        return this.isBSTHelper();
    }

    private isBSTHelper(): boolean {
        if (this.isEmpty()) return true;

        if (!this.left().isEmpty() && this.left().rootValue() >= this.rootValue()) return false;

        if (!this.right().isEmpty() && this.right().rootValue() <= this.rootValue()) return false;

        return this.left().isBSTHelper() && this.right().isBSTHelper();
    }

    redInvariant(): boolean {
        return this.redInvariantHelper();
    }

    private redInvariantHelper(this: RBTreeBubble<T>): boolean {
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
        if (!this.left().isEmpty() && this.left().rootValue() >= this.rootValue()) return -1;
        if (!this.right().isEmpty() && this.right().rootValue() <= this.rootValue()) return -1;

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

const largeArray = createRandomIntArray(1_000_000, 1, 1000);
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

const elemsToDelete = shuffleArray(largeArray);
for (const elem of elemsToDelete) {
    rbtree = rbtree.delete(elem);
    if (!rbtree.isBST()) {
        console.log("Tree is not a valid BST after deletion");
        rbtree.printTree();
    }
    if (!rbtree.redInvariant()) {
        console.log("red invariant violated after deletion");
        rbtree.printTree();
    }
    if (!rbtree.blackBalancedInvariant()) {
        console.log("black balanced invariant violated after deletion");
        rbtree.printTree();
    }
}


// const tree = new RBTreeBubble<number>();
// console.log(tree.isEmpty()); // true

// let newTree = tree;
// // const arr = [50, 40, 30, 10, 20, 30, 100, 0, 45, 55, 25, 15];
// const arr = [50, 40, 30, 10, 20, 30, 100, 0, 45, 55, 25, 15, 1000, 11111];

// for (const elem of arr) {
//     newTree = newTree.insert(elem);
//     newTree.printTree();
// }

// console.log("minSubTree: " + newTree.minSubTree());

// const newTree12 = newTree.delete(55);
// newTree12.printTree();
// console.log(newTree12.isBST());
// console.log(newTree12.redInvariant());
// console.log(newTree12.blackBalancedInvariant());
// console.log(newTree12.validateRedBlackTree())

// const newTree13 = newTree12.delete(50);
// newTree13.printTree();
// console.log(newTree13.isBST());
// console.log(newTree13.redInvariant());
// console.log(newTree13.blackBalancedInvariant());
// console.log(newTree13.validateRedBlackTree())

// const newTree14 = newTree13.delete(45);
// newTree14.printTree();
// console.log(newTree14.isBST());
// console.log(newTree14.redInvariant());
// console.log(newTree14.blackBalancedInvariant());
// console.log(newTree14.validateRedBlackTree())

// const newTree15 = newTree14.delete(40);
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

// const newTree17 = newTree16.delete(25);
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

// const newTree19 = newTree18.delete(15);
// newTree19.printTree();
// console.log(newTree19.isBST());
// console.log(newTree19.redInvariant());
// console.log(newTree19.blackBalancedInvariant());
// console.log(newTree19.validateRedBlackTree())
