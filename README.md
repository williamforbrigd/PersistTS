# PersistTS

**PersistTS** is a collection library that supports generic algorithms and persistent data structures. It is designed to bring functional, persistent data structures to TypeScript. 

PersistTS is inspired by:
- The C5 Collection Library
- The Java Collections Framework
- Scala and Clojure's immutable collections
- Chris Okasaki's *Purely Functional Data Structures* and *Red-black trees in a functional setting*
- Phil Bagwell's *Ideal Hash Trees* and *Fast and Space Efficient Trie Searches*

Currently, it supports the following persistent data structures:

- `ArrayList<T>`: Dynamic array
- `LinkedList<T>`: Singly linked list
- `TreeMap<K, V>`: Ordered map using a persistent red-black tree
- `TreeSet<T>`: Set implementation that is a wrapper around the `TreeMap`
- `HashMap<K, V>`: Persistent map based on the Hash Array Mapped Trie (HAMT)
- `HashSet<T>`: Set implementation that is a wrapper around the `HashMap`
- `Vector<T>`: Represents a sequence of elements based on the Array Mapped Trie (AMT)

Persistent data structures allow you to access previous versions after updates. Each modification returns a new version of the structure without altering the original. The data structures also supports *structural sharing*, a technique that reuses as much of the existing structure as possible to minimize memory and improve performance. 

The tree-based data structures in this library are implemented using persistent red-black trees, which offer logarithmic time complexity for operations such as insertions, deletions, and lookups. A *red-black tree* is a self-balancing binary search tree maintains balance through some invariants: no two consecutive nodes can be red, and every path from the root to a leaf must contain the same number of black nodes. The `TreeMap` is implemented as a persistent red-black tree and the `TreeSet` is a wrapper for the map. 

The hash-based data structures are built upon the **Hash Array Mapped Trie (HAMT)**, which extends the idea of an **Array Mapped Trie (AMT)** with hashing. 

An **Array Mapped Trie (AMT)** is a tree structure that uses fixed-size array at each level (typically 32 slots). Each level of the trie consumes a fixed number of bits (often 5) from an index to determine the next branch. This design enables shallow and wide trees, that can offer near constant time complexity for its operations. The `Vector` is implemented as an AMT. 

An **Hash Array Mapped Trie (HAMT)** is a trie based data structure that also uses hashing to index its keys. The hash is broken into segments to find where to traverse through the trie. PersistTS uses a persistent version of the HAMT, that uses structural sharing where only the modified path is copied during updates. The `HashMap` is implemented as a HAMT, and the `HashSet` is a wrapper for the map. 

## Goals of the PersistTS library
The goal of PersistTS is to be a generic persistent library in TypeScript that who lacks some of the data structures that are available in languages such as Java and C#. The design goals of the library are as follows:

- Design and implement persistent data structures that fully leverage TypeScript's type system.
- Develop efficient algorithms that are compatible with the custom data structures.
- Provide practical examples demonstrating the usage of the library.
- Create a modular and extensible library that benefits existing TypeScript developers, with the potential for future development.
- Provide testing and validation for the custom data structures to ensure robustness, quality, and efficiency. 
- To describe functionality by interfaces: "program to interface, not implementation."
- Document and present design choices, challenges, and outcomes of the project, demonstrating how the library aligns with programming practices and theory. 
- To publish the library to GitHub as well as NPM so that it can be integrated into JavaScript and TypeScript applications. 



## Code Example
The following is a code example on how to use the library:
```ts
import {TreeSet, HashMap, Vector} from "persist-ts";

const vec = Vector.of<number>(1, 2, 3, 4, 5);
const vec2 = vec.add(6).add(7).add(8).add(9).add(10);
console.log(vec.toArray()); // Vector [1, 2, 3, 4, 5]
console.log(vec2.toArray()); // Vector [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const treeSet = TreeSet.of<number>(...vec.toArray());
const treeSet2 = TreeSet.of<number>(3, 4, 5, 6, 7, 8, 9, 10);
const union = treeSet.union(treeSet2);
console.log(union.values()); // TreeSet [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const intersection = treeSet.intersect(treeSet2);
console.log(intersection.values()); // TreeSet [3, 4, 5]

const hashmap = HashMap.of<number, string>([1, "value1"], [2, "value2"]);
const hashmap2 = HashMap.of<number, string>([2, "value2"], [3, "value4"]);
const merged = hashmap.mergeWith((v1, v2) => v1 + ", " + v2, hashmap2);
console.log(merged.entries()); // [[1, "value1"], [2, "value2, value2"], [3, "value4"]]
```
## Installation
To compile and run this program, we first ensure that both **Node.js** and **npm** are installed on your system. This can be checked with:
```bash
node --version
npm --version
```

If they are not installed, download Node.js from the official site: [https://nodejs.org](https://nodejs.org).

To use the **PersistTS** library in a local TypeScript project, we start by initializing a new project and installing the library:

```bash
npm init -y
npm install persist-ts
```

In the root directory of your project, it is recommended to include a **tsconfig.json** file to configure the TypeScript compiler. At the minimum, it should contain:

```json
{
  "compilerOptions": {
    "downlevelIteration": true,
    "moduleResolution": "node"
  }
}
```

To run TypeScript files directly without compiling them to JavaScript first, we recommend installing **ts-node** and **typescript** as development dependencies:

```bash
npm install ts-node typescript --save-dev
```

Finally, the TypeScript code (for example, in \texttt{main.ts}) can be executed directly using:
```bash
ts-node main.ts
```