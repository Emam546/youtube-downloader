import { v4 } from "uuid";
import { NavigateData } from "../types/types";
import { ytdlp } from "../utils/Bases/ytdlp";
export const PATH = "custom";
export async function isValidYtdlpUrl(str: string): Promise<boolean> {
  try {
    await ytdlp.execAsync(str, {
      abortOnError: true,
      skipDownload: true,
    });
    return true;
  } catch (error) {
    return false;
  }
}
export async function navigate(str: string): Promise<NavigateData | null> {
  if (await isValidYtdlpUrl(str)) {
    const id = v4();
    return {
      path: PATH,
      id,
      navigate: `/${PATH}/${id}?link=${encodeURI(str)}`,
      queries: { link: encodeURI(str) },
    };
  }
  return null;
}
export function predictInputString(query: any): string {
  const { link } = query as {
    id: string;
    link: string;
  };
  return decodeURI(link);
}
