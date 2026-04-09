import { v4 } from "uuid";
import { isValidUrl } from "@utils/index";
import { getVideoInfo } from "../utils/ffmpeg";
import axios from "axios";
import { NavigateData } from "../types/types";
export const PATH = "link";
export async function isDownloadableVideo(url: string) {
  try {
    const res = await axios.head(url, { timeout: 100000 });

    const type = res.headers["content-type"];
    if (!type) return false;

    const videoTypes = [
      "video/",
      "application/octet-stream", // fallback (many servers use this)
    ];

    return videoTypes.some((t) => type.includes(t));
  } catch (err) {
    return false;
  }
}
function isFfmpeg(url: string) {
  return new Promise<boolean>((res, rej) => {
    getVideoInfo(url)
      .then(() => res(true))
      .catch(() => res(false));
    setTimeout(() => res(false), 90000);
  });
}
export async function navigate(str: string): Promise<NavigateData | null> {
  try {
    if (!isValidUrl(str)) return null;
    if (!(await isDownloadableVideo(str))) return null;

    if (!(await isFfmpeg(str))) return null;
    const id = v4();
    return {
      path: PATH,
      id,
      navigate: `/${PATH}/${id}?link=${encodeURI(str)}`,
      queries: { link: encodeURI(str) },
    };
  } catch (error) {}
  return null;
}
export function predictInputString(query: any): string {
  const { link } = query as {
    link: string;
  };
  return decodeURI(link);
}
