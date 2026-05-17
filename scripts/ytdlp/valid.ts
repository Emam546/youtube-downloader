import { v4 } from "uuid";
import { NavigateData } from "../types/types";
import { ytdlp } from "../utils/Bases/ytdlp";
export const PATH = "custom";
export async function isValidYtdlpUrl(url: string): Promise<boolean> {
  try {
    const output = await ytdlp.execAsync(url, {
      dumpSingleJson: true,
      skipDownload: true,
      noWarnings: true,
      abortOnError: true,
    });

    const data = JSON.parse(output.output);

    // reject playlists/channels/pages
    if (data?._type && data._type !== "video") {
      return false;
    }

    // must contain a video id + title
    return !!data?.title;
  } catch {
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
