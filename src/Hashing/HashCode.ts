export default class HashCode {

    private static hashCodeString(str: string): number {
        let hash = 0;
        if (str.length == 0) return hash;
        for (let i=0; i < str.length; i++) {
            hash += 31 * hash + str.charCodeAt(i);
        }
        return hash & 0xFFFFFFFF;
    }
    
    static hashCode<T>(obj: T): number {
        let hash = 0;
        if (obj === null || obj === undefined) return hash;
        const str = JSON.stringify(obj);
        return this.hashCodeString(str);
    }

    static hashCodeArray<T>(arr: T[]) {
        let hash = 17;
        for (let i=0; i < arr.length; i++) {
            const itemHash = this.hashCode(arr[i]);
            hash = hash * 31 + itemHash;
        }
        return hash | 0;
    }
}