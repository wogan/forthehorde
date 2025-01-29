function range(start: string, end?: string): string[] {
    if (!end) {
        return start.split('');
    }
    const startCode = start.charCodeAt(0);
    const endCode = end.charCodeAt(0);
    const length = endCode - startCode + 1;
    return Array.from({ length }, (_, i) => String.fromCharCode(startCode + i));
}

const validCharacters = [
    ...range('0', '9'),
    ...range('A', 'Z'),
    ...range('a', 'z'),
    ...range('_-<>[]'),
];

function randomItem<T>(array: T[]): T {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

export function randomString(length: number = 32): string {
    return Array.from({ length }, () => randomItem(validCharacters)).join('');
}
