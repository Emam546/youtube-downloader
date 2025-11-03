import { v4 } from "uuid";
import { isValidUrl } from "@utils/index";
import { getVideoInfo } from "../utils/ffmpeg";

export const PATH = "link";
export async function navigate(str: string): Promise<string | null> {
  try {
    if (!isValidUrl(str)) return null;
    await getVideoInfo(str);
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
