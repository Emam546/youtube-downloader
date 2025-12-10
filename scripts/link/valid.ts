import { v4 } from "uuid";
import { isValidUrl } from "@utils/index";
import { getVideoInfo } from "../utils/ffmpeg";
import axios from "axios";
export const PATH = "link";
export async function isDownloadableVideo(url: string) {
  try {
    const res = await axios.head(url, { timeout: 5000 });

    const type = res.headers["content-type"];
    if (!type) return false;

    const videoTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/x-matroska",
      "video/quicktime",
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
    setTimeout(() => res(true), 3000);
  });
}
export async function navigate(str: string): Promise<string | null> {
  try {
    if (!isValidUrl(str)) return null;
    if (!(await isDownloadableVideo(str))) return null;
    if (!isFfmpeg(str)) return null;
    return `/${PATH}/${v4()}?link=${encodeURI(str)}`;
  } catch (error) {}
  return null;
}
export function predictInputString(query: any): string {
  const { link } = query as {
    link: string;
  };
  return decodeURI(link);
}
