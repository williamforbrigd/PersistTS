import PersistentVector from "../src/Arrays/PersistentVector";
import LinkedList from "../src/LinkedLists/LinkedList";
import { createRandomIntArray, shuffleArray } from "../src/Utils/Utils";
import Sorting from "../src/Sorting/Sorting";

describe("PersistentVector", () => {
    let vec = PersistentVector.empty<number>();
    const arr = shuffleArray(createRandomIntArray(1000, 0, 1000));

    beforeAll(() => {
        for (const elem of arr) {
            vec = vec.add(elem);
        }
    })

    test('set()', () => {
        const oldVec = PersistentVector.of(1,2,3,4,5,6,7,8,9,10);
        let newVec = oldVec.set(3, 9999)
        expect(oldVec.get(3)).toBe(4);
        expect(newVec.get(3)).toBe(9999);
    })

    test('pop()', () => {
        const elem = vec.get(vec.size()-1);
        const size = vec.size();

        const newVec = vec.pop();
        expect(newVec.size()).toBe(size-1);
        expect(newVec.get(newVec.size()-1)).not.toBe(elem);
    })

    test('pop() all the elements', () => {
        for (const _ of arr) {
            vec = vec.pop();
        }
        expect(vec.size()).toBe(0);
        expect(vec.get(0)).toBe(undefined);
    })
});