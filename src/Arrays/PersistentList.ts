// PersistentList.ts

// === Lazy + Memoization ===

type Lazy<T> = () => T;

function memoize<T>(f: () => T): Lazy<T> {
  let cached: T | undefined;
  let evaluated = false;
  return () => {
    if (!evaluated) {
      cached = f();
      evaluated = true;
    }
    return cached!;
  };
}

// === Linked List Types ===

type List<T> = Nil<T> | Cons<T>;

class Nil<T> {
  readonly kind = "nil";
  constructor() {}
}

class Cons<T> {
  readonly kind = "cons";
  constructor(public head: T, public tail: List<T>) {}
}

function nil<T>(): List<T> {
  return new Nil<T>();
}

function cons<T>(head: T, tail: List<T>): List<T> {
  return new Cons(head, tail);
}

function isNil<T>(list: List<T>): list is Nil<T> {
  return list.kind === "nil";
}

function reverse<T>(list: List<T>): List<T> {
  let result = nil<T>();
  while (!isNil(list)) {
    result = cons(list.head, result);
    list = list.tail;
  }
  return result;
}

function concat<T>(l1: List<T>, l2: List<T>): List<T> {
  if (isNil(l1)) return l2;
  return cons(l1.head, concat(l1.tail, l2));
}

function tail<T>(list: List<T>): List<T> {
  return isNil(list) ? list : list.tail;
}

function toArray<T>(list: List<T>): T[] {
  const result: T[] = [];
  while (!isNil(list)) {
    result.push(list.head);
    list = list.tail;
  }
  return result;
}

// === Persistent Functional List ===

export class PersistentList<T> {
  private constructor(
    private readonly front: List<T>,
    private readonly rear: List<T>,
    private readonly schedule: Lazy<List<T>>
  ) {}

  static empty<T>(): PersistentList<T> {
    return new PersistentList(nil(), nil(), memoize(() => nil()));
  }

  append(item: T): PersistentList<T> {
    const newRear = cons(item, this.rear);
    const newSchedule =
      isNil(this.rear) && !isNil(this.front)
        ? memoize(() => concat(this.front, reverse(newRear)))
        : this.schedule;

    return new PersistentList(this.front, newRear, newSchedule);
  }

  head(): T | undefined {
    if (!isNil(this.front)) return this.front.head;
    const scheduled = this.schedule();
    return isNil(scheduled) ? undefined : scheduled.head;
  }

  tail(): PersistentList<T> {
    if (!isNil(this.front)) {
      return new PersistentList(this.front.tail, this.rear, this.schedule);
    }

    const scheduled = this.schedule();
    return new PersistentList(tail(scheduled), nil(), memoize(() => nil()));
  }

  toArray(): T[] {
    return [...toArray(this.front), ...toArray(reverse(this.rear))];
  }
}

// === Test / Example Usage ===

function test() {
  let list1 = PersistentList.empty<number>();
  let list2 = list1.append(1);
  let list3 = list2.append(2);
  let list4 = list3.append(3);

  console.log("list1:", list1.toArray()); // []
  console.log("list2:", list2.toArray()); // [1]
  console.log("list3:", list3.toArray()); // [1, 2]
  console.log("list4:", list4.toArray()); // [1, 2, 3]

  const list5 = list4.tail();
  console.log("list5 (tail of list4):", list5.toArray()); // [2, 3]

  const list6 = list5.append(4);
  console.log("list6 (list5 + 4):", list6.toArray()); // [2, 3, 4]

  // All earlier versions are still intact
  console.log("list4 (should still be [1,2,3]):", list4.toArray());
}

test();