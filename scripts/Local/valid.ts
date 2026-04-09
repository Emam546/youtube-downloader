import fs from "fs";
import { v4 } from "uuid";
import { NavigateData } from "../types/types";
import { getVideoInfo } from "../utils/ffmpeg";
export const PATH = "local";
export async function navigate(str: string): Promise<NavigateData | null> {
  try {
    if (!fs.existsSync(str)) return null;
    if (fs.statSync(str).isFile()) await getVideoInfo(str);

    return {
      path: PATH,
      id: encodeURI(str),
      navigate: `/${PATH}/${encodeURI(str)}`,
      queries: {},
    };
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
