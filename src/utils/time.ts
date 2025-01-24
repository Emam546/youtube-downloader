export function getTime(data: unknown, defaultN: number, maxTime: number) {
  if (typeof data == "string") return minMax(parseInt(data), maxTime);
  return defaultN;
}
export function minMax(val: number, max: number, min: number = 0) {
  return Math.max(min, Math.min(val, max));
}
