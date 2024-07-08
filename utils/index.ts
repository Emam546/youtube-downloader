export function ObjectEntries<T extends object | Array<unknown>>(
    val: T
): {
    [K in keyof T]: [K, T[K]];
}[keyof T][] {
    return Object.entries(val) as {
        [K in keyof T]: [K, T[K]];
    }[keyof T][];
}
export function objectKeys<T extends object>(val: T): Array<keyof T> {
    return Object.keys(val) as Array<keyof T>;
}
export function objectValues<T extends object>(val: T): Array<T[keyof T]> {
    return Object.values(val) as Array<T[keyof T]>;
}
export function clipText(text:string, maxLength:number) {
    let clipped = "";
    let length = 0;

    for (let i = 0; i < text.length; i++) {
        const codePoint = text.codePointAt(i)!;

        // Handle surrogate pairs for characters represented by two UTF-16 units
        if (codePoint > 0xffff) {
            i++;
        }

        if (length + 1 > maxLength) {
            break;
        }

        clipped += String.fromCodePoint(codePoint);
        length++;
    }

    return clipped;
}
