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


export {
    shuffleArray,
    createRandomIntArray,
    createRandomStringArray
};