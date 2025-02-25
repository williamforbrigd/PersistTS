import Collection from "./Collection";

export default interface Queue<T> extends Collection<T> {
    add(e: T): Queue<T>;
    offer(e: T): Queue<T>;
    remove(): Queue<T>;
    poll(): {value: T | undefined, newQueue: Queue<T>};
    element(): T; // throws error if empty. That is the only difference from peek()
    peek(): T | undefined;
}