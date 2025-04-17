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

function equals(a: any, b: any): boolean {
    // 1– identical references or primitive values
    if (a === b) return true;

    // 2– handle the one weird JavaScript case: NaN
    if (typeof a === 'number' && typeof b === 'number') {
        return Number.isNaN(a) && Number.isNaN(b);
    }

    // 3– if either is null/undefined (but they weren’t identical above) → unequal
    if (a == null || b == null) return false;

    // 4– honour a user‑defined `.equals` contract (mirrors Java behaviour)
    const aEq = (a as any).equals;
    if (typeof aEq === 'function') return !!aEq.call(a, b);
    const bEq = (b as any).equals;
    if (typeof bEq === 'function') return !!bEq.call(b, a);

    // 5– deep, ordered array comparison
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (!equals(a[i], b[i])) return false;
        }
        return true;
    }

    // 6– everything else: fall back to strict identity (already failed) ⇒ unequal
    return false;
}


export {
    shuffleArray,
    createRandomIntArray,
    createRandomStringArray,
    equals
};