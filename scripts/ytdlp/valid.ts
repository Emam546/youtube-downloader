import { v4 } from "uuid";
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
export async function navigate(str: string): Promise<string | null> {
  if (await isValidYtdlpUrl(str))
    return `/${PATH}/${v4()}?link=${encodeURI(str)}`;
  return null;
}
export function predictInputString(query: any): string {
  const { link } = query as {
    id: string;
    link: string;
  };
  return decodeURI(link);
}
