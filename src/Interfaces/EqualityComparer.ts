export default interface EqualityComparer<T> {
    equals(x: T, y: T): boolean;
    hashCode(obj: T): number;
}