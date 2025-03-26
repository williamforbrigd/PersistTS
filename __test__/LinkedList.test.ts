import LinkedList from '../src/LinkedLists/LinkedList';
import ArrayList from '../src/Arrays/ArrayList';

describe('LinkedList', () => {
    let list: LinkedList<number>;
    beforeEach(() => {
        list = new LinkedList<number>();
    });

    test('isEmpty()', () =>{
        const list2 = new LinkedList<number>();
        expect(list2.isEmpty()).toBe(true);
    });

    test('add()', () => {
        const result = list.add(1);
        expect(result.getFirst()).toBe(1);
    });
    test('get()', () => {
        const result = list.addAll([1, 2, 3]);
        expect(result.get(1)).toBe(2);
    });
    test('addFirst()', () => {
        const result = list.addFirst(1);
        expect(result.getFirst()).toBe(1);
        const result2 = list.addFirst(2);
        expect(result2.getFirst()).toBe(2);
    });
    test('addLast()', () => {
        const result = list.addLast(1);
        expect(result.getFirst()).toBe(1);
        const result2 = result.addLast(2);
        expect(result2.getLast()).toBe(2);
    });

    test('addAll()', () => {
        const result = list.addAll([1, 2, 3]);
        expect(result.getFirst()).toBe(1);
        expect(result.getLast()).toBe(3);
    });

    test('addAllAtIndex()', () => {
        const result = list.addAll([1, 2, 3]);
        const result2 = result.addAll(1, [4, 5]);
        expect(result2.get(1)).toBe(4);
        expect(result2.get(2)).toBe(5);
    });

    test('toArray()', () => {
        const result = list.addAll([1, 2, 3]);
        expect(result.toArray()).toEqual([1, 2, 3]);
    })

    test('equals()', () => {
        const result = list.addAll([1, 2, 3]);
        const result2 = LinkedList.of([1,2,3]);

        expect(result.equals(result2)).toBe(true);
    });

    test('hashcode() is cached and does not change', () => {
        const list1 = LinkedList.of([1,2,3])
        const list2 = list1.add(22);
        const list3 = list2.add(222);
        const hashCodeList3 = list3.hashCode();
            
        const list4 = list3.remove(222);
        const list5 = list4.add(756);

        const hashCodeList3Pram = list3.hashCode();

        expect(hashCodeList3).toBe(hashCodeList3Pram);
        expect(hashCodeList3).not.toBe(list5.hashCode());
    })

    test('clear()', () => {
        const result = list.addAll([1, 2, 3]);
        const result2 = result.clear();
        expect(result2.isEmpty()).toBe(true);
    })

    test('concat', () => {
        const result1 = list.addAll([1, 2, 3]);
        const result2 = list.addAll([4, 5, 6]);

        const result3 = result1.concat(result2);

        expect(result3).toEqual(LinkedList.of([1, 2, 3, 4, 5, 6]));
    });

    test('sort() ascending', () => {
        const result = list.addAll([3, 2, 1]);
        const result2 = result.sort();
        expect(result2).toEqual(LinkedList.of([1, 2, 3]));
    });

    test('sort() descending', () => {
        const result = list.addAll([3, 2, 1]);
        const result2 = result.sort((a, b) => b - a);
        expect(result2).toEqual(LinkedList.of([3, 2, 1]));
    })

    test('distinct()', () => {
        const result = list.addAll([2, 3, 1, 2, 3, 1, 2, 3, 1, 1, 1, 1, 1, 1, 1]);
        const result2 = result.distinct().sort();
        expect(result2).toEqual(LinkedList.of([1, 2, 3]));
    });

    test('filter()', () => {
        const result = list.addAll([1,2,3]);
        const result2 = result.filter((value, _) => value > 2);
        expect(result2.size()).toBe(1);
        expect(result2.getLast()).toBe(3);
        expect(result2.getFirst()).toBe(3);
    });

    test('flatMap()', () => {
        const result = list.addAll([1,2,3]);
        const result2 = result.flatMap((value, _) => [value, value]);
        expect(result2.size()).toBe(6);
        expect(result2).toEqual(LinkedList.of([1,1,2,2,3,3]));
    });

    test('map()', () => {
        const result = list.addAll([1,2,3]);
        const result2 = result.map((value, _) => value * 2);
        expect(result2.size()).toBe(3);
        expect(result2).toEqual(LinkedList.of([2,4,6]));
    });

    test('map() with list of strings', () => {
        const result = LinkedList.of(["hello", "world"]);
        const result2 = result.map((value, _) => value + value);
        expect(result2.size()).toBe(2);
        expect(result2).toEqual(LinkedList.of(["hellohello", "worldworld"]));
    });

    test('merge()', () => {
        const result = list.addAll([1,2,3]);
        const result2 = LinkedList.of([4,5,6]);
        const result3 = result.merge(result2);
        expect(result3.size()).toBe(6);
        expect(result3).toEqual(LinkedList.of([1,2,3,4,5,6]));

    });

    test('partition()', () => {
        const result = list.addAll([1,2,3,4,5,6,7,8,9,10]);
        const [trueList, falseList] = result.partition((value, _) => value % 2 === 0);
        expect(trueList).toEqual(LinkedList.of([2,4,6,8,10]));
        expect(falseList).toEqual(LinkedList.of([1,3,5,7,9]));
    });

    test('reduce()', () => {
        const result = list.addAll([10,20,30,40,50]);
        const reduced = result.reduce((acc, value, _) => acc + value, 0);
        expect(reduced).toBe(150);

    });

    test('reduce() on strings', () => {
        const result = LinkedList.of(["hello", "world"]);
        const reduced = result.reduce((acc, value, _) => acc + value, "");
        expect(reduced).toBe("helloworld");
    });

    test('reduceRight()', () => {
        const result = LinkedList.of(["hello", "world"]);
        const reducedRight = result.reduceRight((acc, value, _) => acc + value, "");
        expect(reducedRight).toBe("worldhello");
    });

    test('remove()', () => {
        const result = LinkedList.of(["Hello", "World"]);
        const removed = result.remove("Hello");
        expect(removed.getFirst()).toEqual("World");
        expect(removed.getLast()).toEqual("World");
    });

    test('remove() index', () => {
        const result = LinkedList.of(["Hello", "World"]);
        const removed = result.remove(1);
        expect(removed.getFirst()).toEqual("Hello");
        expect(removed.getLast()).toEqual("Hello");
    });

    test('removeAll()', () => {
        const result = LinkedList.of([1,2,23,4,5]);
        const removed = result.removeAll([1,2,23]);
        expect(removed).toEqual(LinkedList.of([4,5]));
    });

    test('removeFirst()', () => {
        const result = LinkedList.of([1,2,3,41,242]);
        const removedFirst = result.removeFirst();
        expect(removedFirst.getFirst()).toEqual(2);
        expect(removedFirst.getLast()).toEqual(242);
    });

    test('removeIf()', () => {
        const result = LinkedList.of([1,2,3,4,5,6,7,8,9,10]);
        const removed = result.removeIf((value) => value % 2 === 0);
        expect(removed).toEqual(LinkedList.of([1,3,5,7,9])); 
    });

    test('removeLast()', () => {
        const result = LinkedList.of([1,2,3,4,5]);
        const removed = result.removeLast();
        expect(removed.getLast()).toEqual(4);
    });

    test('retainAll()', () => {
        const result = LinkedList.of([1,2,3,4,5]);
        const retained = result.retainAll([1,2,3]);

        expect(retained).toEqual(LinkedList.of([1,2,3]));
    });

    test('reversed', () => {
        const result = LinkedList.of([1,2,3,4,5]);
        const reversed = result.reversed();
        expect(reversed).toEqual(LinkedList.of([5,4,3,2,1]));
    });

    test('set()', () => {
        const result = LinkedList.of([1,2,3,4,5]);

        const set = result.set(2, 10);
        expect(set.get(2)).toBe(10);
        expect(set).toEqual(LinkedList.of([1,2,10,4,5]));
    });

    test('shift()', () => {
        const result = LinkedList.of(["Hello", "World"]);
        const shifted = result.shift();
        expect(shifted.getFirst()).toBe("World");
        expect(shifted.getLast()).toBe("World");   
    });

    test('unshift()', () => {
        const result = LinkedList.of(["World"]);
        const unshifted = result.unshift("Hello", "New");
        expect(unshifted.getFirst()).toBe("Hello");
        expect(unshifted.getLast()).toBe("World");
    });

    test('slice()', () => {
        const result = LinkedList.of([1,2,3,4,5,6,7,8,9,10]);
        const sliced = result.slice(2, 5);
        expect(sliced).toEqual(LinkedList.of([3,4,5]));
    });

    test('slice() with start', () => {
        const result = LinkedList.of([1,2,3,4,5,6,7,8,9,10]);
        const sliced = result.slice(0);
        expect(sliced).toEqual(result);
    })

    test('slice() with end', () => {
        const result = LinkedList.of([1,2,3,4,5,6,7,8,9,10]);
        const sliced = result.slice(undefined, 5);
        expect(sliced).toEqual(LinkedList.of([1,2,3,4,5]));
    })

    test('splice()', () => {
        const result = LinkedList.of([1,2,3,4,5,6,7,8,9,10]);
        const spliced = result.splice(2, 5);
        expect(spliced).toEqual(LinkedList.of([1,2,8,9,10]));

        const result2 = LinkedList.of([1,2,3,4,5,6,7,8,9,10]);
        const spliced2 = result2.splice(2, 5, 100, 200, 300);
        expect(spliced2).toEqual(LinkedList.of([1,2,100,200,300,8,9,10]));
    })

    test('zip()', () => {
        const result = LinkedList.of([1,2,3,4,5]);
        const result2 = LinkedList.of([6,7,8,9,10]);
        const zipped = result.zip(result2);
        expect(zipped).toEqual(LinkedList.of([[1,6],[2,7],[3,8],[4,9],[5,10]]));
    });

    test('zip() passing an iterable', () => {
        const result = LinkedList.of([1,2,3,4,5]);
        const zipped = result.zip([6,7,8,9,10]);
        expect(zipped).toEqual(LinkedList.of([[1,6],[2,7],[3,8],[4,9],[5,10]]));
    });

    test('zip() with ArrayList', () => {
        const result = LinkedList.of([1,2,3,4,5]);
        const arrayList = new ArrayList([6,7,8,9,10]);
        const zipped = result.zip(arrayList);
        expect(zipped).toEqual(LinkedList.of([[1,6],[2,7],[3,8],[4,9],[5,10]]));
    });

    test('zipAll()', () => {
        const result = LinkedList.of([1,2,3,4,5]);
        const result2 = LinkedList.of([6,7,8,9,10]);
        const zipped = result.zipAll(result2);
        expect(zipped).toEqual(LinkedList.of([[1,6],[2,7],[3,8],[4,9],[5,10]]));
    })

    test('zipAll() with ArrayList that has different size', () => {
        const result = LinkedList.of([1,2,3,4,5]);
        const arrayList = new ArrayList([21, 213, 213, 22, 6,7,8,9,10]);
        const zipped = result.zipAll(arrayList);
        expect(zipped).toEqual(LinkedList.of([[1,21],[2,213],[3,213],[4,22],[5,6], [undefined, 7], [undefined, 8], [undefined, 9], [undefined, 10]]));
    });

    test('zipAll() passing an array', () => {
        const result = LinkedList.of([1,2,3,4,5]);
        const zipped = result.zipAll([6,7,8,9,10]);
        expect(zipped).toEqual(LinkedList.of([[1,6],[2,7],[3,8],[4,9],[5,10]]));
    }); 

    test('zipWith() where the lengths of the lists are different', () => {
        const result = LinkedList.of([10, 20, 30, 3231, 123]);
        const result2 = LinkedList.of([21, 22, 23, 24, 25, 123, 21, 123, 213, 123]);
        const zipper = (a: number, b: number) => a+b;
        const zipped = result.zipWith(zipper, result2);
        expect(zipped).toEqual(LinkedList.of([31, 42, 53, 3255, 148]));
    });

    test('zipWith() with LinkedList and ArrayList', () => {
        const result = LinkedList.of([10, 20, 30, 3231, 123]);
        const arrayList = new ArrayList([21, 22, 23, 24, 25, 123, 21, 123, 213, 123]);
        const zipper = (a: number, b: number) => a+b;
        const zipped = result.zipWith(zipper, arrayList);
        expect(zipped).toEqual(LinkedList.of([31, 42, 53, 3255, 148]));
    });


    test('element()', () => {
        const result = LinkedList.of([1,2,3,4,5]);
        const element = result.element();
        expect(element).toBe(1);
    });

    test('element() on an empty queue should return an error', () => {
        const result = new LinkedList<number>();
        expect(() => result.element()).toThrow("NoSuchElementException - tried to retrieve the head of the Linked List but it is empty");
    });


    test('offer()', () => {
        const result = new LinkedList<number>();
        const result2 = result.offer(1);
        expect(result2.getFirst()).toBe(1);
    })

    test('poll()', () => {
        const result = LinkedList.of([1,2,3,4,5]);
        const polled = result.poll();
        expect(polled.value).toBe(1);
        expect(polled.newQueue).toEqual(LinkedList.of([2,3,4,5]));
    })


    test('peek()', () => {
        const result = LinkedList.of([1,2,3,4,5]);
        const peeked = result.peek();
        expect(peeked).toBe(1);
    });

    test('peek() om emptyu list returns undefined', () => {
        const list = LinkedList.of(["Hello", "World"]);
        const result = list.clear();
        const peeked = result.peek();
        expect(peeked).toBe(undefined);
    });


});