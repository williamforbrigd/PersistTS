import HashCode from "../Hashing/HashCode";
import {equals, createRandomIntArray, shuffleArray} from "../Utils/Utils";

/**
 * Counts the number of set bits (Hamming weight) in a 32‑bit integer.
 * Implementation taken from "Hacker's Delight".
 */
function popcount(x: number): number {
    x = x - ((x >>> 1) & 0x55555555);
    x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
    return (((x + (x >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24;
}

function mask(hash: number, shift: number): number {
    return (hash >>> shift) & 0x01f;
}

function bitpos(hash: number, shift: number): number {
    return 1 << mask(hash, shift);
}

function index(bitmap: number, bit: number) {
    return popcount(bitmap & (bit - 1));
}

interface INode<K, V> {
    assoc(shift: number, hash: number, key: K, value: V): Node<K, V> | null;
    find(hash: number, key: K): LeafNode<K, V> | null;
    getHash(): number;
}

type Node<K, V> = EmptyNode<K, V> | LeafNode<K, V> | FullNode<K, V> | HashCollisionNode<K, V> | BitmapIndexedNode<K, V>; 

class EmptyNode<K, V> implements INode<K, V> {

    constructor(
        readonly _hash: number,
    ) {}

    static empty<K, V>() {
        return new EmptyNode<K, V>(0);
    }

    assoc(shift: number, hash: number, key: K, value: V): Node<K, V> | null {
        return new LeafNode(hash, key, value);
    }

    find(hash: number, key: K): LeafNode<K, V> | null {
        return null;
    }

    getHash(): number {
        return this._hash;
    }
}

class LeafNode<K, V> implements INode<K, V> {

    constructor(
        readonly _hash: number,
        readonly _key: K,
        readonly _value: V
    ) {}

    static empty<K, V>() {
        return new LeafNode(0, 0, 0);
    }

    assoc(shift: number, hash: number, key: K, value: V): Node<K, V> | null {
        if (hash === this._hash) {
            if (equals(this._key, key)) {
                if (value === this._value) return this;

                // note do not set added leaf since we are replacing
                return new LeafNode(hash, key, value);
            }
            // hash collision - same hash different keys
            const newLeaf = new LeafNode(hash, key, value);
            return new HashCollisionNode(hash, [this, newLeaf]);
        }
        return BitmapIndexedNode.create2<K, V>(shift, this, hash, key, value);
    }
    find(hash: number, key: K): LeafNode<K, V> | null {
        if (hash == this._hash && equals(this._key, key)) {
            return this;
        }
        return null;
    }

    getHash(): number {
        return this._hash;
    }
}

class FullNode<K, V> implements INode<K, V> {
    _hash: number;
    constructor(
        readonly _nodes: Node<K, V>[],
        readonly _shift: number,
    ) {
        this._hash = this._nodes[0].getHash();
    }

    assoc(shift: number, hash: number, key: K, value: V): Node<K, V> | null {
        const idx = mask(hash, shift);

        const n = this._nodes[idx].assoc(shift + 5, hash, key, value);
        if (n === null || n === this._nodes[idx]) {
            return this;
        } else {
            const newNodes = [...this._nodes];
            newNodes[idx] = n;
            return new FullNode(newNodes, shift);
        }
    }

    find(hash: number, key: K): LeafNode<K, V> | null {
        return this._nodes[mask(hash, this._shift)].find(hash, key);
    }

    getHash(): number {
        return this._hash;
    }
}


class HashCollisionNode<K, V> implements INode<K, V> {
    constructor(
        readonly _hash: number,
        readonly _leaves: LeafNode<K, V>[],
    ) {}

    assoc(shift: number, hash: number, key: K, value: V): Node<K, V> | null {
        if (hash === this._hash) {
            const idx = this.findIndex(hash, key);
            if (idx !== -1) {
                if (this._leaves[idx]._value === value) {
                    return this;
                }
                const newLeaves = [...this._leaves];
                newLeaves[idx] = new LeafNode(hash, key, value);
                return new HashCollisionNode(hash, newLeaves);
            }
            const newLeaves: LeafNode<K, V>[] = [...this._leaves];
            newLeaves[newLeaves.length] = new LeafNode(hash, key, value);
            return new HashCollisionNode(hash, newLeaves);
        }

        return BitmapIndexedNode.create2<K, V>(shift, this, hash, key, value);
    }
    find(hash: number, key: K): LeafNode<K, V> | null {
        const idx = this.findIndex(hash, key);
        if (idx !== -1) {
            return this._leaves[idx];
        }
        return null;
    }

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

class BitmapIndexedNode<K, V> implements INode<K, V> {
    _bitmap: number;
    _nodes: Node<K, V>[];
    _shift: number;
    _hash: number;


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

    static create2<K, V>(shift: number, branch: Node<K, V>, hash: number, key: K, value: V): Node<K, V> | null {
        return (new BitmapIndexedNode(bitpos(branch.getHash(), shift), [branch], shift))
            .assoc(shift, hash, key, value);
    }

    assoc(shift: number, hash: number, key: K, value: V): Node<K, V> | null {
        const bit = bitpos(hash, shift);
        const idx = index(this._bitmap, bit);
        if ((this._bitmap & bit) !== 0) {
            const n = this._nodes[idx].assoc(shift + 5, hash, key, value);
            if (n === null || n === this._nodes[idx]) {
                return this;
            } else {
                const newNodes = [...this._nodes];
                newNodes[idx] = n;
                return new BitmapIndexedNode(this._bitmap, newNodes, shift);
            }
        } else {
            const newNodes = [...this._nodes];
            newNodes.splice(idx, 0, new LeafNode(hash, key, value));
            //newNodes[idx] = new LeafNode(hash, key, value);
            return BitmapIndexedNode.create1(this._bitmap | bit, newNodes, shift);
        }
    }

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

export default class HashMap<K, V> {
    private _size: number;
    private _shift: number;
    private _root: Node<K, V>;

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

    *entriesNode(node: Node<K, V>): IterableIterator<[K, V]> {
        if (node instanceof LeafNode) {
            yield [node._key, node._value];
        } else if (node instanceof HashCollisionNode) {
            for (const leaf of node._leaves) {
                yield [leaf._key, leaf._value];
            }
        } else if (node instanceof BitmapIndexedNode || node instanceof FullNode) {
            for (const child of (node as any)._nodes as Node<K, V>[]) {
                yield* this.entriesNode(child);
            }
        }
    }

    *[Symbol.iterator](): IterableIterator<[K, V]> {
        yield* this.entriesNode(this._root);
    }

    entries(): [K, V][] {
        return Array.from(this);
    }

    keys(): K[] {
        return Array.from(this, ([k]) => k);
    }

    values(): V[] {
        return Array.from(this, ([_, v]) => v);
    }

    size(): number {
        return this._size;
    }

    assoc(key: K, value: V): HashMap<K, V> {
        const newRoot = this._root.assoc(this._shift, HashCode.hashCode(key), key, value);
        if (newRoot === null || newRoot === this._root) {
            return this;
        }
        return new HashMap(this._size + 1, this._shift, newRoot);
    }

    find(hash: number, key: K): LeafNode<K, V> | null {
        return this._root.find(HashCode.hashCode(key), key);
    }

    get(key: K): V | null {
        const find = this.find(HashCode.hashCode(key), key);
        if (find !== null) {
            return find._value;
        }
        return null;
    }

    printContents(): void {
        for (const [key, value] of this.entries()) {
            console.log(`${key}: ${value}`);
        }
    }
}

// const arr  = shuffleArray(createRandomIntArray(1000));
const arr = shuffleArray(Array.from({ length: 1000 }, (_, i) => i));
//const arr  = [65, 398, 1922];
let map = HashMap.empty<number, number>();

for (const elem of arr) {
    map = map.assoc(elem, elem);
}

for (const elem of arr) {
    console.log(map.get(elem));
}

map.printContents();
console.log("size: " + map.size());
console.log(map.entries())