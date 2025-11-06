import os from "os";
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
export function clipText(text: string, maxLength: number) {
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
export function isValidUrl(string: string) {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
}
/**
 * Asynchronous filter for arrays.
 * @param {Array} arr - The array to filter.
 * @param {Function} predicate - An async function that returns a boolean.
 * @returns {Promise<Array>} Filtered array.
 */
export async function asyncFilter<T>(
  arr: T[],
  predicate: (data: T, i: number, arr: T[]) => Promise<boolean>
) {
  const results = await Promise.all(arr.map(predicate));
  return arr.filter((_, i) => results[i]);
}
export async function asyncFindSequential<T>(
  arr: T[],
  asyncPredicate: (val: T, index: number, arr: T[]) => Promise<boolean>
) {
  for (let i = 0; i < arr.length; i++) {
    try {
      if (await asyncPredicate(arr[i], i, arr)) return arr[i];
    } catch (err) {
      // If you want to treat thrown errors as "no match", continue.
      // You could also rethrow to fail fast: `throw err`
      continue;
    }
  }
  return undefined;
}
export function getYtDlpName() {
  const platform = os.platform();
  switch (platform) {
    case "win32":
      return "yt-dlp.exe";
    case "darwin":
      "yt-dlp_macos";
    default:
      return "yt-dlp";
  }
}
