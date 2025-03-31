export function getTime<T>(data: unknown, defaultN: T, maxTime: number) {
  if (typeof data == "string") return minMax(parseInt(data), maxTime);
  return defaultN;
}
export function minMax(val: number, max: number, min: number = 0) {
  return Math.max(min, Math.min(val, max));
}
export function isValidUrl(string: string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}
export function getVideoQualityLabel(
  width: number,
  height: number
): { height: number; width: number; label: string } | null {
  const resolutions = [
    { width: 256, height: 144, label: "144p" },
    { width: 426, height: 240, label: "240p" },
    { width: 640, height: 360, label: "360p" },
    { width: 854, height: 480, label: "480p" },
    { width: 1280, height: 720, label: "720pHD" },
    { width: 1920, height: 1080, label: "1080pHD" },
    { width: 2560, height: 1440, label: "1440p2K" },
    { width: 3840, height: 2160, label: "2160p4K" },
    { width: 7680, height: 4320, label: "4320p8K" },
  ];

  for (let res of resolutions.reverse()) {
    if (width >= res.width && height >= res.height) {
      return res;
    }
  }
  return null;
}
