/**
 * Static helper for making 32‑bit hash codes.
 *
 * Use it to hash single values or whole arrays.
 */
export default class HashCode {

    /**
     * Hashes a string.
     *
     * Uses <code>hash = 31 * hash + charCode</code>.
     *
     * @param str - String to hash.
     * @returns 32‑bit hash. 0 if empty.
     * @internal
     */
    private static hashCodeString(str: string): number {
        let hash = 0;
        if (str.length == 0) return hash;
        for (let i=0; i < str.length; i++) {
            hash += 31 * hash + str.charCodeAt(i);
        }
        return hash & 0xFFFFFFFF;
    }
    
    /**
     * Hashes any JSON‑serialisable value.
     *
     * @typeParam T - Value type.
     * @param obj - Value to hash. Null or undefined gives 0.
     * @returns 32‑bit hash.
     */
    static hashCode<T>(obj: T): number {
        let hash = 0;
        if (obj === null || obj === undefined) return hash;
        const str = JSON.stringify(obj);
        return this.hashCodeString(str);
    }

    /**
     * Hashes an array by mixing each element's hash.
     *
     * Starts from 17 and multiplies by 31 for each element.
     *
     * @typeParam T - Element type.
     * @param arr - Array to hash.
     * @returns 32‑bit hash for the array.
     */
    static hashCodeArray<T>(arr: T[]) {
        let hash = 17;
        for (let i=0; i < arr.length; i++) {
            const itemHash = this.hashCode(arr[i]);
            hash = hash * 31 + itemHash;
        }
        return hash | 0;
    }
}