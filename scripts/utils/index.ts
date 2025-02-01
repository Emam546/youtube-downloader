export function getTime(data: unknown, defaultN: number, maxTime: number) {
  if (typeof data == "string") return minMax(parseInt(data), maxTime);
  return defaultN;
}
export function minMax(val: number, max: number, min: number = 0) {
  return Math.max(min, Math.min(val, max));
}
export function isValidUrl(string: string) {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
}
