/**
 * Defines a strategy for comparing objects of generic type T
 * for equality and generating hash codes.
 * 
 * This interface is used by all collection and map types to compare 
 * different objects to each other.
 *  
 */
export default interface EqualityComparer<T> {
    /**
     * Determines whether two objects are equal.
     * More specifically, it compares the calling object with the specified object.
     * @param o - the object to compare with this object
     * @returns True if the objects are equal, false otherwise
     */
    equals(o: Object): boolean;

    /**
     * Computes the hash code for the calling object.
     * @returns A number representing the hash code of the object.
     */
    hashCode(): number;
}