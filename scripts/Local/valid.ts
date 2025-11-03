import fs from "fs";
import { v4 } from "uuid";
import { getVideoInfo } from "../utils/ffmpeg";
export const PATH = "local";
export async function navigate(str: string): Promise<string | null> {
  try {
    if (!fs.existsSync(str)) return null;
    if (fs.statSync(str).isFile()) await getVideoInfo(str);

    return `/${PATH}/${encodeURI(str)}`;
  } catch (error) {
    return null;
  }
}
export function predictInputString(query: any): string {
  const { id } = query as {
    id: string;
  };
  return decodeURI(id);
}
