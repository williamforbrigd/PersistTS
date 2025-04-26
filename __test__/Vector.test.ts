import Vector from "../src/Arrays/Vector";
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