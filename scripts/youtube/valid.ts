import { isValidUrl } from "../utils";
import { validateURL as ValidateUrlYoutube } from "./utils";
import { youtube_parser } from "./utils";

type YoutubeParams = [
  string | null,
  string | null,
  [number | null, number | null] | null
];
function appendPathToBaseUrl(...paths: string[]) {
  // Ensure there is exactly one slash between base URL and path
  let baseUrl = "/";
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    if (!baseUrl.endsWith("/")) baseUrl += "/";
    if (path.startsWith("/")) baseUrl += path.slice(1);
    else baseUrl += path;
  }

  return baseUrl;
}
export const PATH = "youtube";
const baseUrl = `/${PATH}/`;
function getPathYoutubeUrl(youtubeUrl: URL) {
  const [id, list, time] = extractParams(youtubeUrl);
  const url = id ? appendPathToBaseUrl(baseUrl, encodeURI(id)) : baseUrl;
  const searchParams = new URLSearchParams();
  if (list) searchParams.set("list", list);
  if (time) {
    if (time[0]) searchParams.set("start", time[0].toString());
    if (time[1]) searchParams.set("end", time[1].toString());
  }
  return `${url}?${searchParams.toString()}`;
}
function extractParams(youtubeUrl: URL): YoutubeParams {
  const id = youtube_parser(youtubeUrl.href);
  const list = youtubeUrl.searchParams.get("list");
  let start =
    youtubeUrl.searchParams.get("start") || youtubeUrl.searchParams.get("t");
  const end = youtubeUrl.searchParams.get("end");
  return [
    id || null,
    list,
    [start ? parseInt(start) : null, end ? parseInt(end) : null],
  ];
}
function isYoutubeUrl(val: string): boolean {
  if (!isValidUrl(val)) return false;
  if (!ValidateUrlYoutube(val)) return false;
  return extractParams(new URL(val))
    .slice(0, 2)
    .some((val) => val != null);
}
export function navigate(str: string): string | null {
  if (isYoutubeUrl(str)) return getPathYoutubeUrl(new URL(str));
  return null;
}
