import { Writable } from "stream";

export function getTime<T>(data: unknown, defaultN: T, maxTime: number) {
  if (typeof data == "string") return minMax(parseInt(data), maxTime);
  return defaultN;
}
export function minMax(val: number, max: number, min: number = 0) {
  return Math.max(min, Math.min(val, max));
}

export function pipeAsync(pipe: Writable) {
  return new Promise<void>((res, rej) => {
    pipe
      .on("error", (e) => {
        console.error(e);
        rej(e);
      })
      .on("finish", () => pipe.on("close", () => res()));
  });
}
export type QualitiesType = {
  label: string;
  width: number;
  height: number;
};
const qualities: QualitiesType[] = [
  { label: "2160p", width: 2560, height: 1440 },
  { label: "1080p", width: 1920, height: 1080 },
  { label: "720p", width: 1280, height: 720 },
  { label: "480p", width: 854, height: 480 },
  { label: "360p", width: 640, height: 360 },
  { label: "240p", width: 426, height: 240 },
  { label: "144p", width: 256, height: 144 },
];
export function getResizedQualitiesFromLabel(
  fromQuality: QualitiesType["label"]
) {
  const index = qualities.findIndex(
    (q) => q.label.toLowerCase() === fromQuality.toLowerCase()
  );

  if (index === -1) {
    throw new Error(`Unknown quality: ${fromQuality}`);
  }

  // Return the given quality and all lower ones
  return qualities.slice(index + 1);
}
export function getQualityFromResolution(width: number, height: number) {
  // Find the closest match based on height difference
  let closest = qualities[0];
  let minDiff = Math.abs(height - closest.height);

  for (const q of qualities) {
    const diff = Math.abs(height - q.height);
    if (diff < minDiff) {
      closest = q;
      minDiff = diff;
    }
  }

  return closest;
}
