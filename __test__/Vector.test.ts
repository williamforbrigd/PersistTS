import ArrayList from "../src/Arrays/ArrayList";
import Vector from "../src/Arrays/Vector";
import LinkedList from "../src/LinkedLists/LinkedList";
import {createRandomIntArray, shuffleArray} from "../src/Utils/Utils";


describe("Vector general tests", () => {
    const WIDTH = 1 << 5; // 32
  
    test("iterator and toArray produce the same sequence", () => {
      const arr = Array.from({ length: 100 }, (_, i) => i * 2);
      const vec = Vector.of(...arr);
      // toArray
      expect(vec.toArray()).toEqual(arr);
      // iterator
      const iterated: number[] = [];
      for (const x of vec) iterated.push(x);
      expect(iterated).toEqual(arr);
    });
  
    test("original vector is unchanged after push, pop, and set", () => {
      const base = Vector.of(1, 2, 3);
      const afterPush = base.push(4);
      expect(base.size()).toBe(3);
      expect(() => base.get(3)).toThrow(RangeError);
  
      const afterSet = base.set(1, 99);
      expect(base.get(1)).toBe(2);
      expect(afterSet.get(1)).toBe(99);
  
      const afterPop = base.pop();
      expect(base.size()).toBe(3);
      expect(afterPop.size()).toBe(2);
    });
  
    test("boundary around WIDTH: push exactly WIDTH then one more", () => {
      // push 32 elements
      let v = Vector.empty<number>();
      for (let i = 0; i < WIDTH; i++) v = v.push(i);
      expect(v.size()).toBe(WIDTH);
      // all elements correct
      for (let i = 0; i < WIDTH; i++) {
        expect(v.get(i)).toBe(i);
      }
  
      // push one more, should promote tail into root
      const v2 = v.push(WIDTH);
      expect(v2.size()).toBe(WIDTH + 1);
      // existing elements unchanged
      for (let i = 0; i < WIDTH; i++) {
        expect(v2.get(i)).toBe(i);
      }
      // new element at index WIDTH
      expect(v2.get(WIDTH)).toBe(WIDTH);
    });
  
    test("deep set works at various depths", () => {
      // build a tree at least 3 levels deep: push > WIDTH^2 elements
      const N = WIDTH * WIDTH + 5; // 32*32 + 5 = 1029
      let v = Vector.empty<number>();
      for (let i = 0; i < N; i++) v = v.push(i);
  
      // set at start, middle, end
      const v1 = v.set(0, 1000);
      const v2 = v1.set(Math.floor(N / 2), 2000);
      const v3 = v2.set(N - 1, 3000);
  
      expect(v.get(0)).toBe(0);
      expect(v1.get(0)).toBe(1000);
  
      expect(v.get(Math.floor(N / 2))).toBe(Math.floor(N / 2));
      expect(v2.get(Math.floor(N / 2))).toBe(2000);
  
      expect(v.get(N - 1)).toBe(N - 1);
      expect(v3.get(N - 1)).toBe(3000);
    });
  
    test("pop collapses tree height when tail boundary crossed", () => {
      // push WIDTH + 1, then pop back to WIDTH
      let v = Vector.empty<number>();
      for (let i = 0; i < WIDTH + 1; i++) v = v.push(i);
      // now tree height is 2
      const vPop = v.pop(); // size = WIDTH
      expect(vPop.size()).toBe(WIDTH);
      // should still have all 0..WIDTH-1
      for (let i = 0; i < WIDTH; i++) {
        expect(vPop.get(i)).toBe(i);
      }
      // one more pop to get into single-node tree
      const vPop2 = vPop.pop();
      expect(vPop2.size()).toBe(WIDTH - 1);
      expect(vPop2.get(WIDTH - 2)).toBe(WIDTH - 2);
    });
  
    test("round-trip: toArray → of → toArray yields same", () => {
      const arr = Array.from({ length: 500 }, () => Math.floor(Math.random() * 1000));
      const v = Vector.of(...arr);
      const arr2 = v.toArray();
      const v2 = Vector.of(...arr2);
      expect(v2.toArray()).toEqual(arr);
    });
  });


describe("Vector get()", () => {
    const vec = Vector.of(1, 2, 3, 4, 5);
    test('get() should return the correct element at index 0', () => {
        expect(vec.get(0)).toBe(1);
        expect(vec.get(1)).toBe(2);
        expect(vec.get(2)).toBe(3);
        expect(vec.get(3)).toBe(4);
        expect(vec.get(4)).toBe(5);
    });

    test('get() throws on out-of-bounds', () => {
        expect(() => vec.get(-1)).toThrow(RangeError);
        expect(() => vec.get(5)).toThrow(RangeError);
      });
})

describe("Vector push()", () => {
    let vec = Vector.empty<number>();
    const arr = shuffleArray(createRandomIntArray(10000));

    beforeAll(() => {
        
    })

    test('push method adds all the elements in random array', () => {
        for (const e of arr) vec = vec.push(e);
        expect(vec.size()).toBe(arr.length);
    })

    test("push() returns a new vector with the element appended", () => {
        const vec = Vector.of(1, 2, 3);
        const newVec = vec.push(4);
        expect(newVec.size()).toBe(4);
        expect(newVec.get(3)).toBe(4);

        // original untouched
        expect(vec.size()).toBe(3);
        expect(vec.get(2)).toBe(3);
        expect(() => vec.get(3)).toThrow(RangeError);
    })

    test('push() retains previous elements', () => {
        const many = Vector.empty<number>();
        const array = Array.from({ length: 10_000 }, (_, i) => i);
        const pushed = array.reduce((vec, i) => vec.push(i), many);
    
        // spot-check a few random positions
        expect(pushed.get(0)).toBe(0);
        expect(pushed.get(1234)).toBe(1234);
        expect(pushed.get(9999)).toBe(9999);

        // check all elements
        for (const elem of array) {
            expect(pushed.get(elem)).toBe(elem);
        }
      });
})

describe("Vector set()", () => {

    test('set() updates an element and returns a new vector', () => {
        const vec = Vector.of(1, 2, 3);
        const newVec = vec.set(1, 99);
        expect(newVec.size()).toBe(3);
        expect(newVec.get(1)).toBe(99);

        // original untouched
        expect(vec.size()).toBe(3);
        expect(vec.get(1)).toBe(2);
    })

    test('set() at size === push()', () => {
        const vec = Vector.of(1, 2, 3);
        const newVec = vec.set(3, 4);
        expect(newVec.size()).toBe(4);
        expect(newVec.get(3)).toBe(4);
    })
})

describe("Vector pop()", () => {
    let vec = Vector.empty<number>();
    const arr = shuffleArray(createRandomIntArray(10000));

    beforeAll(() => {
        for (const e of arr) vec = vec.push(e);
    })

    test('pop() all the elements in the array should have 0 size after', () => {
        for (const _ of arr) {
            vec = vec.pop();
        }

        expect(vec.size()).toBe(0);
    })

    test('pop() an empty vector yields an error', () => {
        let vec = Vector.empty<number>();
        expect(() => {
            vec = vec.pop();
        }).toThrowError("Can't pop empty vector");
    })

    test('pop() on a vector with one element should yield an empty vector', () => {
        let vec = Vector.empty<number>();
        vec = vec.push(1);
        expect(vec.size()).toBe(1);
        vec = vec.pop();
        expect(vec.size()).toBe(0);
    })

})

describe("Vector slice()", () => {
  const vec = Vector.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

  test('slice() returns collection elements', () => {
    const s = vec.slice(2, 7);
    expect(s.size()).toBe(5);
    expect(s.toArray()).toEqual([3, 4, 5, 6, 7]);
  })

  test('slice() without arguments returns the same instance', () => {
    const s = vec.slice();
    expect(s.size()).toBe(vec.size());
    expect(s.toArray()).toEqual(vec.toArray());
  })

  test('slice() support negative indices', () => {
    const s = vec.slice(-3);
    expect(s.size()).toBe(3);
    expect(s.toArray()).toEqual([8, 9, 10]);
  })

  test('slice() support negative indices with start and end', () => {
    const s = vec.slice(-8, -3);
    expect(s.size()).toBe(5);
    expect(s.toArray()).toEqual([3, 4, 5, 6, 7]);
  })

  test("nested slice() works", () => {
    const s1 = vec.slice(1, 9);
    const s2 = s1.slice(2, 5);
    expect(s2.size()).toBe(3);
    expect(s2.toArray()).toEqual([4, 5, 6]);
    expect(s1.toArray()).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
    expect(vec.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  })

  test('mutating the slice() does not affect the original vector', () => {
    const s = vec.slice(0, vec.size() - 1);

    const modified = s.set(0, 100);
    expect(s.get(0)).toBe(1);
    expect(modified.get(0)).toBe(100);
    expect(vec.get(0)).toBe(1);
  })

  test('slice throws exception for out of bounds', () => {
    expect(() => vec.slice(0, 11)).toThrow(RangeError);
    expect(() => vec.slice(-11)).toThrow(RangeError);
    expect(() => vec.slice(0, -11)).toThrow(RangeError);
    expect(() => vec.slice(-11, -1)).toThrow(RangeError);
  })

})


describe("Vector remove()", () => {
  const base = Vector.of(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);

  test("remove first element", () => {
    const result = base.remove(0);
    expect(result.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(result.size()).toBe(9);
    // original vector must stay unchanged
    expect(base.get(0)).toBe(0);
    expect(base.size()).toBe(10);
  });

  test("remove middle element", () => {
    const result = base.remove(5);
    expect(result.toArray()).toEqual([0, 1, 2, 3, 4, 6, 7, 8, 9]);
    expect(result.size()).toBe(9);
  });

  test("remove last element (pop fast-path)", () => {
    const result = base.remove(base.size() - 1) as Vector<number>;
    expect(result.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(result.size()).toBe(9);
  });

  test("remove on singleton vector returns empty", () => {
    const single = Vector.of(42);
    const result = single.remove(0) as Vector<number>;
    expect(result.isEmpty()).toBe(true);
    expect(result.size()).toBe(0);
  });

  test("remove throws on out-of-bounds indices", () => {
    expect(() => base.remove(-1)).toThrow(RangeError);
    expect(() => base.remove(base.size())).toThrow(RangeError);
  });
});



describe("Vector removeItem(item) - value semantics", () => {
  const base = Vector.of("a", "b", "c", "d", "e", "f", "g");

  test("remove first item", () => {
    const result = base.removeItem("a");
    expect(result.toArray()).toEqual(["b", "c", "d", "e", "f", "g"]);
    expect(base.toArray()).toEqual(["a", "b", "c", "d", "e", "f", "g"]); // original intact
  });

  test("remove middle item", () => {
    const result = base.removeItem("d");
    expect(result.toArray()).toEqual(["a", "b", "c", "e", "f", "g"]);
  });

  test("remove last item", () => {
    const result = base.removeItem("g");
    expect(result.toArray()).toEqual(["a", "b", "c", "d", "e", "f"]);
  });

  test("remove non‑existing item returns same instance", () => {
    const result = base.removeItem("zzz");
    expect(result).toBe(base); // should return identical vector when nothing removed
  });

  test("remove duplicates removes first occurrence only", () => {
    const dup = Vector.of("x", "y", "x", "z");
    const result = dup.removeItem("x");
    expect(result.toArray()).toEqual(["y", "x", "z"]);
  });

  test("remove on singleton vector yields empty vector", () => {
    const single = Vector.of("only");
    const result = single.removeItem("only");
    expect(result.isEmpty()).toBe(true);
  });
});




describe("Vector removeAll(iterable)", () => {
  const base = Vector.of(1, 2, 3, 4, 5, 2, 3); // duplicates included

  test("removes every element that appears in the iterable", () => {
    const toRemove = [2, 4];
    const result = base.removeAll(toRemove);
    expect(result.toArray()).toEqual([1, 3, 5, 3]); // both 2s and the 4 gone
    expect(result.size()).toBe(4);
    // original vector unchanged
    expect(base.toArray()).toEqual([1, 2, 3, 4, 5, 2, 3]);
  });

  test("iterable with duplicates still removes only matching elements", () => {
    const toRemove = [3, 3, 3]; // duplicates in the iterable
    const result = base.removeAll(toRemove);
    expect(result.toArray()).toEqual([1, 2, 4, 5, 2]); // both 3s removed once each
  });

  test("iterable with no common elements returns same instance", () => {
    const result = base.removeAll([42, 99]);
    expect(result).toBe(base);
  });

  test("removeAll where iterable equals the vector leaves it empty", () => {
    const result = base.removeAll(base);
    expect(result.isEmpty()).toBe(true);
  });

  test("removeAll on empty iterable returns same vector", () => {
    const result = base.removeAll([]);
    expect(result).toBe(base);
  });

  test("removeAll works with different generic type (string)", () => {
    const fruits = Vector.of("apple", "banana", "cherry", "date", "apple");
    const result = fruits.removeAll(["apple", "date"]);
    expect(result.toArray()).toEqual(["banana", "cherry"]);
  });
});

describe("Vector replaceAll()", () => {
  test("replaceAll replaces content with new items and leaves original unchanged", () => {
    const base = Vector.of(1, 2, 3);
    const result = base.replaceAll([4, 5, 6]);
    expect(result.toArray()).toEqual([4, 5, 6]);
    expect(result.size()).toBe(3);
    // original unchanged
    expect(base.toArray()).toEqual([1, 2, 3]);
  });

  test("replaceAll on empty vector adds all items", () => {
    const base = Vector.empty<number>();
    const result = base.replaceAll([10, 20]);
    expect(result.toArray()).toEqual([10, 20]);
    expect(result.size()).toBe(2);
  });

  test("replaceAll with empty iterable yields empty vector and returns new instance", () => {
    const base = Vector.of(1, 2, 3);
    const result = base.replaceAll([]);
    expect(result.isEmpty()).toBe(true);
    expect(result).not.toBe(base);
  });

  test("replaceAll with same items yields a new vector instance with identical items", () => {
    const base = Vector.of(1, 2, 3);
    const result = base.replaceAll([1, 2, 3]);
    expect(result.toArray()).toEqual([1, 2, 3]);
    expect(result).not.toBe(base);
  });

  test("replaceAll works with different generic type (string)", () => {
    const base = Vector.of("a", "b", "c");
    const result = base.replaceAll(["x", "y"]);
    expect(result.toArray()).toEqual(["x", "y"]);
    expect(base.toArray()).toEqual(["a", "b", "c"]);
  });
});

describe("Vector copyTo()", () => {
  test("copyTo copies elements into target array at a non-zero index", () => {
    const v = Vector.of(1, 2, 3);
    const arr = [0, 0, 0, 0, 0];
    v.copyTo(arr, 1);
    expect(arr).toEqual([0, 1, 2, 3, 0]);
  });

  test("copyTo into exact-sized array at index 0", () => {
    const v = Vector.of("a", "b", "c");
    const arr = ["", "", ""];
    v.copyTo(arr, 0);
    expect(arr).toEqual(["a", "b", "c"]);
  });

  test("copyTo throws RangeError if arrayIndex is negative", () => {
    const v = Vector.of(1);
    expect(() => v.copyTo([], -1)).toThrow(RangeError);
  });

  test("copyTo throws RangeError if arrayIndex greater than array length", () => {
    const v = Vector.of(1);
    expect(() => v.copyTo([], 1)).toThrow(RangeError);
  });

  test("copyTo throws RangeError when destination array is too small", () => {
    const v = Vector.of(1, 2, 3);
    const arr = [0, 0];
    expect(() => v.copyTo(arr, 0)).toThrow(RangeError);
  });
});

describe("Vector lastIndexOf()", () => {
  test("lastIndexOf() returns the last index of the item", () => {
    const vec = Vector.of(1, 2, 3, 2, 1);
    expect(vec.lastIndexOf(1)).toBe(4);
    expect(vec.lastIndexOf(2)).toBe(3);
    expect(vec.lastIndexOf(3)).toBe(2);
    expect(vec.lastIndexOf(4)).toBe(-1); // not found
  })
  test('lastIndexOf() returns -1 for empty vector', () => {
    const vec = Vector.empty<number>();
    expect(vec.lastIndexOf(1)).toBe(-1);
  })
})



describe("Vector from SequencedCollection interface", () => {
  test("reversed() returns a new vector with elements in reverse order", () => {
    const vec = Vector.of(1, 2, 3, 4, 5);
    const reversed = vec.reversed();
    expect(reversed.toArray()).toEqual([5, 4, 3, 2, 1]);
    expect(vec.toArray()).toEqual([1, 2, 3, 4, 5]); // original unchanged
  });

  test("reversed() on empty vector returns empty vector", () => {
    const vec = Vector.empty<number>();
    const reversed = vec.reversed();
    expect(reversed.isEmpty()).toBe(true);
    expect(reversed.size()).toBe(0);
  });
  test("addFirst() adds an element to the front of the vector", () => {
    const vec = Vector.of(2, 3, 4);
    const newVec = vec.addFirst(1);
    expect(newVec.toArray()).toEqual([1, 2, 3, 4]);
    expect(vec.toArray()).toEqual([2, 3, 4]); // original unchanged
  });
  test('addLast() adds element to the end of the vector', () => {
    const vec = Vector.of(1, 2, 3);
    const newVec = vec.addLast(4);
    expect(newVec.toArray()).toEqual([1, 2, 3, 4]);
    expect(vec.toArray()).toEqual([1, 2, 3]); // original unchanged
  })
  test('getFirst() returns the first element of the vector', () => {
    const vec = Vector.of("hello", "world", "!");
    expect(vec.getFirst()).toBe("hello");
  })
  test('getLast() returns the last element of the vector', () => {
    const vec = Vector.of("hello", "world", "!");
    expect(vec.getLast()).toBe("!");
  })
  test('removeFirst() removes the first element and returns a new vector', () => {
    const vec = Vector.of("hello", "world", "!");
    const newVec = vec.removeFirst();
    expect(newVec.toArray()).toEqual(["world", "!"]);
    expect(vec.toArray()).toEqual(["hello", "world", "!"]); // original unchanged
  })
  test('removeLast() removes the last element and returns a new vector', () => {
    const vec = Vector.of("hello", "world", "!");
    const newVec = vec.removeLast();
    expect(newVec.toArray()).toEqual(["hello", "world"]);
    expect(vec.toArray()).toEqual(["hello", "world", "!"]); // original unchanged
  })
})


describe("Vector has(), hasAll(), removeIf(), retainAll(), clear(), equals(), hashCode()", () => {
  test("has() returns true for existing elements and false otherwise", () => {
    const vec = Vector.of(1, 2, 3);
    expect(vec.has(2)).toBe(true);
    expect(vec.has(4)).toBe(false);
  });

  test("hasAll() returns true only if all elements are present", () => {
    const vec = Vector.of("a", "b", "c");
    expect(vec.hasAll(["a", "c"])).toBe(true);
    expect(vec.hasAll(["a", "d"])).toBe(false);
  });

  test("removeIf() filters elements by predicate and does not mutate original", () => {
    const vec = Vector.of(1, 2, 3, 4);
    const result = vec.removeIf(x => x % 2 === 0);
    expect(result.toArray()).toEqual([1, 3]);
    expect(vec.toArray()).toEqual([1, 2, 3, 4]);
  });

  test("retainAll() keeps only specified elements and does not mutate original", () => {
    const vec = Vector.of(1, 2, 3);
    const result = vec.retainAll([2, 3]);
    expect(result.toArray()).toEqual([2, 3]);
    expect(vec.toArray()).toEqual([1, 2, 3]);
  });

  test("clear() returns an empty vector and leaves original unchanged", () => {
    const vec = Vector.of("x", "y");
    const cleared = vec.clear();
    expect(cleared.isEmpty()).toBe(true);
    expect(vec.isEmpty()).toBe(false);
  });

  test("equals() correctly compares vectors", () => {
    const v1 = Vector.of(1, 2, 3);
    const v2 = Vector.of(1, 2, 3);
    const v3 = Vector.of(3, 2, 1);
    expect(v1.equals(v1)).toBe(true);
    expect(v1.equals(v2)).toBe(true);
    expect(v1.equals(v3)).toBe(false);
    expect(v1.equals({})).toBe(false);
  });

  test("hashCode() is consistent and immutable for original vector", () => {
    const vec = Vector.of("a", "b");
    const originalHash = vec.hashCode();
    // Equal vectors have same hash
    const same = Vector.of("a", "b");
    expect(same.hashCode()).toBe(originalHash);
    // Modifying vector yields new hash, but original remains unchanged
    const modified = vec.push("c");
    expect(vec.hashCode()).toBe(originalHash);
    expect(modified.hashCode()).not.toBe(originalHash);
  });
});


describe("Vector splice()", () => {
  test("splice(start) removes from start to end when deleteCount is undefined", () => {
    const vec = Vector.of(1, 2, 3, 4, 5);
    const result = vec.splice(2);
    expect(result.toArray()).toEqual([1, 2]);
  });

  test("splice(start, deleteCount) removes given number of elements", () => {
    const vec = Vector.of(1, 2, 3, 4, 5);
    const result = vec.splice(1, 2);
    expect(result.toArray()).toEqual([1, 4, 5]);
  });

  test("splice(start, 0, ...items) inserts items without deletion", () => {
    const vec = Vector.of(1, 2, 3);
    const result = vec.splice(1, 0, 9, 8);
    expect(result.toArray()).toEqual([1, 9, 8, 2, 3]);
  });

  test("splice supports negative start index", () => {
    const vec = Vector.of("a", "b", "c", "d", "e");
    const result = vec.splice(-2, 1);
    expect(result.toArray()).toEqual(["a", "b", "c", "e"]);
  });

  test("splice clamps deleteCount greater than remaining length", () => {
    const vec = Vector.of(1, 2, 3);
    const result = vec.splice(1, 10);
    expect(result.toArray()).toEqual([1]);
  });

  test("splice treats negative deleteCount as zero", () => {
    const vec = Vector.of(1, 2, 3);
    const result = vec.splice(1, -1, 9);
    expect(result.toArray()).toEqual([1, 9, 2, 3]);
  });

  test("splice on empty vector returns empty when start=0", () => {
    const vec = Vector.empty<number>();
    const result = vec.splice(0);
    expect(result.isEmpty()).toBe(true);
  });

  test("splice throws RangeError for start index out of bounds", () => {
    const vec = Vector.of(1, 2, 3);
    expect(() => vec.splice(4, 1)).toThrow(RangeError);
    expect(() => vec.splice(-5, 1)).toThrow(RangeError);
  });
});


describe("Vector shift() and unshift()", () => {
  test("shift() removes the first element and leaves original unchanged", () => {
    const vec = Vector.of(1, 2, 3);
    const shifted = vec.shift();
    expect(shifted.toArray()).toEqual([2, 3]);
    expect(vec.toArray()).toEqual([1, 2, 3]);
  });

  test("shift() on empty vector throws RangeError", () => {
    const vec = Vector.empty<number>();
    expect(() => vec.shift()).toThrow(RangeError);
  });

  test("unshift() adds elements to the front and leaves original unchanged", () => {
    const vec = Vector.of(3, 4);
    const result = vec.unshift(1, 2);
    expect(result.toArray()).toEqual([1, 2, 3, 4]);
    expect(vec.toArray()).toEqual([3, 4]);
  });

  test("unshift() on empty vector adds items as new elements", () => {
    const vec = Vector.empty<string>();
    const result = vec.unshift("a", "b");
    expect(result.toArray()).toEqual(["a", "b"]);
    expect(vec.isEmpty()).toBe(true);
  });
});


describe("Vector concat() and merge()", () => {
  test("concat with single values appends correctly and leaves original unchanged", () => {
    const vec = Vector.of(1, 2);
    const result = vec.concat(3, 4);
    expect(result.toArray()).toEqual([1, 2, 3, 4]);
    expect(vec.toArray()).toEqual([1, 2]);
  });

  test("concat with iterable appends all elements and leaves original unchanged", () => {
    const vec = Vector.of("a", "b");
    const result = vec.concat(["c", "d"]);
    expect(result.toArray()).toEqual(["a", "b", "c", "d"]);
    expect(vec.toArray()).toEqual(["a", "b"]);
  });

  test('concat with iterables and another collection', () => {
    const vec = Vector.of(1, 2);
    const result = vec.concat([3, 4], Vector.of(5, 6));
    expect(result.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
    expect(vec.toArray()).toEqual([1, 2]);
  })

  test('concat with other vectors', () => {
    const vec1 = Vector.of(1, 2);
    const vec2 = Vector.of(44, 33, 77);
    const vec3 = Vector.of(669, 88);

    const res = vec1.concat(vec2, vec3);
    expect(res.toArray()).toEqual([1, 2, 44, 33, 77, 669, 88]);
  })

  test("merge with multiple iterables combines them in sequence", () => {
    const vec = Vector.of(1);
    const result = vec.merge([2, 3], [4], []);
    expect(result.toArray()).toEqual([1, 2, 3, 4]);
    expect(vec.toArray()).toEqual([1]);
  });

  test("merge with no iterables returns the same instance", () => {
    const vec = Vector.of("x", "y");
    const result = vec.merge();
    expect(result).toBe(vec);
  });

});

describe("Vector zip()", () => {
  test("zip with two vectors of equal length", () => {
    const v1 = Vector.of(1, 2, 3);
    const v2 = Vector.of("a", "b", "c");
    const result = v1.zip(v2);
    expect(result.toArray()).toEqual([[1, "a"], [2, "b"], [3, "c"]]);
    // originals unchanged
    expect(v1.toArray()).toEqual([1, 2, 3]);
    expect(v2.toArray()).toEqual(["a", "b", "c"]);
  });

  test("zip stops at shortest iterable", () => {
    const v1 = Vector.of(1, 2, 3, 4);
    const arr = ["x", "y"];
    const result = v1.zip(arr);
    expect(result.toArray()).toEqual([[1, "x"], [2, "y"]]);
  });

  test("zip with array and vector mix", () => {
    const v = Vector.of("p", "q");
    const arr = [10, 20];
    const result = v.zip(arr);
    expect(result.toArray()).toEqual([["p", 10], ["q", 20]]);
  });

  test("zip on empty vector returns empty", () => {
    const vEmpty = Vector.empty<number>();
    const v2 = Vector.of(1, 2);
    const result = vEmpty.zip(v2);
    expect(result.isEmpty()).toBe(true);
  });

  test('zip with a LinkedList and an ArrayList', () => {
     const res = Vector.of(1,2,3)
                        .zip(LinkedList.of(4,5,6))
                        .zip(ArrayList.of(7, 8, 9));
    expect(res.toArray()).toEqual([[[1, 4], 7], [[2, 5], 8], [[3, 6], 9]]);
  })

  test('zip with LinkedList and ArrayList of different lengths. Stops at shortest collection', () => {
    const res = Vector.of(1,2,3)
                        .zip(LinkedList.of(4,5,6,7), ArrayList.of(8, 9));
    expect(res.toArray()).toEqual([[1, 4, 8], [2, 5, 9]])
  })
});


describe("Vector zipAll()", () => {
  test("zipAll with two vectors of equal length", () => {
    const v1 = Vector.of(1, 2, 3);
    const v2 = Vector.of("a", "b", "c");
    const result = v1.zipAll(v2);
    expect(result.toArray()).toEqual([[1, "a"], [2, "b"], [3, "c"]]);
  });

  test("zipAll stops at longest iterable, filling missing with undefined", () => {
    const v1 = Vector.of(1, 2);
    const arr = ["x"];
    const v3 = Vector.of("p", "q", "r");
    const result = v1.zipAll(arr, v3);
    expect(result.toArray()).toEqual([
      [1, "x", "p"],
      [2, undefined, "q"],
      [undefined, undefined, "r"]
    ]);
  });

  test("zipAll with empty vector returns tuples for other collections", () => {
    const vEmpty = Vector.empty<number>();
    const v2 = Vector.of("a", "b");
    const arr = [true];
    const result = vEmpty.zipAll(v2, arr);
    expect(result.toArray()).toEqual([
      [undefined, "a", true],
      [undefined, "b", undefined]
    ]);
  });

  test("zipAll on all empty returns empty vector", () => {
    const empty = Vector.empty<number>();
    const result = empty.zipAll([], []);
    expect(result.isEmpty()).toBe(true);
  });
});

describe("Vector zipWith()", () => {
  test("zipWith two vectors of equal length using addition", () => {
    const v1 = Vector.of(1, 2, 3);
    const v2 = Vector.of(4, 5, 6);
    const result = v1.zipWith((a, b) => a + b, v2);
    expect(result.toArray()).toEqual([5, 7, 9]);
    // originals unchanged
    expect(v1.toArray()).toEqual([1, 2, 3]);
    expect(v2.toArray()).toEqual([4, 5, 6]);
  });

  test("zipWith vector and array using multiplication", () => {
    const v = Vector.of(2, 3, 4);
    const arr = [5, 6, 7];
    const result = v.zipWith((a, b) => a * b, arr);
    expect(result.toArray()).toEqual([10, 18, 28]);
  });

  test("zipWith three collections combining into strings", () => {
    const v = Vector.of("a", "b");
    const v2 = Vector.of("x", "y");
    const arr = ["1", "2"];
    const result = v.zipWith((a, b, c) => `${a}${b}${c}`, v2, arr);
    expect(result.toArray()).toEqual(["ax1", "by2"]);
  });

  test("zipWith stops at shortest collection", () => {
    const v1 = Vector.of(1, 2, 3);
    const arr = [10, 20];
    const result = v1.zipWith((a, b) => a - b, arr);
    expect(result.toArray()).toEqual([-9, -18]);
  });

  test("zipWith on empty vector returns empty", () => {
    const empty = Vector.empty<number>();
    const v2 = Vector.of(1, 2, 3);
    const result = empty.zipWith((a, b) => a + b, v2);
    expect(result.isEmpty()).toBe(true);
  });
});


describe('Vector distinct()', () => {
  it('returns an empty vector when called on an empty vector', () => {
    const v = Vector.empty<number>();
    const d = v.distinct();
    expect(d.size()).toBe(0);
    expect(d.toArray()).toEqual([]);
  });

  it('removes duplicate primitive values and preserves insertion order', () => {
    const v = Vector.of(1, 2, 2, 3, 1, 4, 3);
    const d = v.distinct();
    expect(d.toArray()).toEqual([1, 2, 3, 4]);
    // original is unchanged
    expect(v.toArray()).toEqual([1, 2, 2, 3, 1, 4, 3]);
  });

  it('returns the same sequence if there are no duplicates', () => {
    const arr = ['a', 'b', 'c'];
    const v = Vector.of(...arr);
    const d = v.distinct();
    expect(d.toArray()).toEqual(arr);
  });

  it('uses reference equality for objects', () => {
    const o1 = { x: 1 };
    const o2 = { x: 1 };
    const v = Vector.of(o1, o2, o1, o2);
    const d = v.distinct();
    // should keep the first occurrences of each reference
    expect(d.toArray()).toEqual([o1, o2]);
  });

  it('works on a VectorView slice', () => {
    const v = Vector.of(5, 5, 6, 7, 6, 8);
    const slice = v.slice(1, 5); // [5,6,7,6]
    const d = slice.distinct();
    expect(d.toArray()).toEqual([5, 6, 7]);
  });
});

describe("Vector join()", () => {
  test("join() with default separator", () => {
    const vec = Vector.of(1, 2, 3);
    const result = vec.join();
    expect(result).toBe("1,2,3");
  });

  test("join() with custom separator", () => {
    const vec = Vector.of("a", "b", "c");
    const result = vec.join("-");
    expect(result).toBe("a-b-c");
  });

  test("join() on empty vector returns empty string", () => {
    const vec = Vector.empty<number>();
    const result = vec.join(", ");
    expect(result).toBe("");
  });

})


describe("Vector every() and some()", () => {
  test("every returns true when all elements satisfy predicate", () => {
      const vec = Vector.of(2, 4, 6, 8);
      expect(vec.every(x => x % 2 === 0)).toBe(true);
  });

  test("every returns false when at least one element does not satisfy predicate", () => {
    const vec = Vector.of(1, 2, 3, 4);
    expect(vec.every(x => x < 4)).toBe(false);
  });
  test("some returns true when at least one element satisfies predicate", () => {
    const vec = Vector.of(1, 3, 5, 6);
    expect(vec.some(x => x % 2 === 0)).toBe(true);
  });

  test("some returns false when no elements satisfy predicate", () => {
    const vec = Vector.of(1, 3, 5);
    expect(vec.some(x => x % 2 === 0)).toBe(false);
  });

  test("every returns true and some returns false on empty vector", () => {
    const vec = Vector.empty<number>();
    expect(vec.every(x => x > 0)).toBe(true);
    expect(vec.some(x => x > 0)).toBe(false);
  });
});



describe("Vector sort() and sortedBy()", () => {
  test("sort sorts numbers using provided comparator", () => {
      const vec = Vector.of(3, 1, 2);
      const sorted = vec.sort((a, b) => a - b);
      expect(sorted.toArray()).toEqual([1, 2, 3]);
  });

  test("sort with large random dataset", () => {
    const SIZE = 100_000;
    const arr = Array.from({ length: SIZE }, () => Math.floor(Math.random() * SIZE));
    const vec = Vector.empty<number>().addAll(arr); // spread operator is not good for large datasets
    const sorted = vec.sort((a, b) => a - b);
    const expected = [...arr].sort((a, b) => a - b);
    expect(sorted.toArray()).toEqual(expected);
  });

  test("sortedBy sorts objects by key selector", () => {
    const vec = Vector.of({ v: 3 }, { v: 1 }, { v: 2 });
    const sorted = vec.sortedBy(obj => obj.v);
    expect(sorted.toArray()).toEqual([{ v: 1 }, { v: 2 }, { v: 3 }]);
  });

  test("sortedBy with large random object dataset", () => {
    const SIZE = 100_000;
    const arr = Array.from({ length: SIZE}, () => ({
        v: Math.floor(Math.random() * SIZE),
        id: Math.random().toString()
    }));
    const vec = Vector.empty<{ v: number, id: string }>().addAll(arr); // spread operator is not good for large datasets
    const sorted = vec.sortedBy(obj => obj.v);
    const expected = [...arr].sort((a, b) => a.v - b.v);
    expect(sorted.toArray()).toEqual(expected);
  });

  test("sortedBy with custom comparator (descending order)", () => {
    const vec = Vector.of(1, 3, 2);
    const sortedDesc = vec.sortedBy(x => x, (a, b) => b - a);
    expect(sortedDesc.toArray()).toEqual([3, 2, 1]);
  });
  });


  describe("Vector forEach()", () => {
    test("forEach iterates through all elements in order", () => {
        const results: number[] = [];
        const vec = Vector.of(1, 2, 3);
        vec.forEach((value, index) => {
            results.push(value + index);
        });
        expect(results).toEqual([1, 3, 5]);
    });

    test("forEach with empty vector does nothing", () => {
      const results: number[] = [];
      const vec = Vector.empty<number>();
      vec.forEach(value => results.push(value));
      expect(results).toEqual([]);
  });
});

describe("Vector find()", () => {
  test("find returns the first element matching predicate", () => {
      const vec = Vector.of(1, 2, 3, 4);
      const found = vec.find(x => x % 2 === 0);
      expect(found).toBe(2);
  });

  test("find returns undefined when no element matches", () => {
      const vec = Vector.of(1, 3, 5);
      const found = vec.find(x => x > 10);
      expect(found).toBeUndefined();
  });
});

describe("Vector reduce() and reduceRight()", () => {
  test("reduce sums elements without initial value", () => {
      const vec = Vector.of(1, 2, 3, 4);
      expect(vec.reduce((acc, x) => acc + x)).toBe(10);
  });

  test("reduce sums elements with initial value", () => {
      const vec = Vector.of(1, 2, 3);
      expect(vec.reduce((acc, x) => acc + x, 5)).toBe(11);
  });

  test("reduce throws TypeError on empty vector without initial value", () => {
      const vec = Vector.empty<number>();
      expect(() => vec.reduce((acc, x) => acc + x)).toThrow(TypeError);
  });

  test("reduceRight concatenates elements without initial value", () => {
      const vec = Vector.of("a", "b", "c");
      expect(vec.reduceRight((acc, x) => acc + x)).toBe("cba");
  });

  test("reduceRight concatenates elements with initial value", () => {
      const vec = Vector.of("x", "y", "z");
      expect(vec.reduceRight((acc, x) => acc + x, "!")).toBe("!zyx");
  });

  test("reduceRight throws TypeError on empty vector without initial value", () => {
      const vec = Vector.empty<string>();
      expect(() => vec.reduceRight((acc, x) => acc + x)).toThrow(TypeError);
  });
});



