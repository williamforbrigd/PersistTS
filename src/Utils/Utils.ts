function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createRandomIntArray(size: number, min: number = 0, max: number = 100): number[] {
    return Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

function createRandomStringArray(size: number, min: number = 0, max: number = 100): string[] {
    return Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min + '');
}



export class Utils {
    static equals(a: any, b: any): boolean {
        // identical references
        if (a === b) return true;

        // JavaScript case NaN
        if (typeof a === 'number' && typeof b === 'number') {
            return Number.isNaN(a) && Number.isNaN(b);
        }

        // if either is null or undefined
        if (a == null || b == null) return false;

        // user defined equals
        const aEq = (a as any).equals;
        if (typeof aEq === 'function') return !!aEq.call(a, b);
        const bEq = (b as any).equals;
        if (typeof bEq === 'function') return !!bEq.call(b, a);

        // deep, array comparison
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) return false;
            for (let i = 0; i < a.length; i++) {
                if (!Utils.equals(a[i], b[i])) return false;
            }
            return true;
        }

        return false;
    }
}

export {
    shuffleArray,
    createRandomIntArray,
    createRandomStringArray,
};