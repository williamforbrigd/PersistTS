import HashMap from "../src/Maps/HashMap";
import {createRandomIntArray, shuffleArray} from "../src/Utils/Utils";
import Sorting from "../src/Sorting/Sorting";

describe('HashMap', () => {
    let map = HashMap.empty<number, string>();
    
    test('check that the hashmap works as expeted', () => {
        const size = 1_000_000;
        const arr = shuffleArray(Array.from({length: size}, (_, i) => i));


        for (const elem of arr) {
            map = map.put(elem, elem.toString());
        }

        expect(map.size()).toBe(size);

        // check that it has 1000 entries
        expect(map.entries().length).toBe(size);

        // keys must return 1000 distinct entries
        const keys = map.keys();
        expect(keys.length).toBe(size);
        expect(new Set(keys).size).toBe(size);

        // updating an existing key should not change the size but change the value
        const map2 = map.put(0, "1234");
        expect(map2.size()).toBe(size);
        expect(map2.get(0)).toBe("1234");
        expect(map.get(0)).toBe("0");
    })
})


