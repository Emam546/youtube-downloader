import https from "https";
import http from "http";
import { IncomingMessage } from "http";
import { HttpDownloadAgent, HttpsDownloadAgent } from "@serv/util/axios";
import path from "path";

export async function WrapResponse<T>(
  fetchData: Promise<Response>
): Promise<T> {
  const res = await fetchData;
  if (res.status >= 300)
    throw new Error(`${res.statusText} With Code Status ${res.status}`);
  return (await res.json()) as T;
}

export type VideoDataInfoType<T> = {
  PATH: string;
  data: T;
  previewLink: string;
  fquality: string;
  ftype: string;
  title: string;
};
export type ClippingDataType<G> =
  | (G & {
      clipped: true;
      start: number;
      end: number;
    })
  | (G & { clipped: false });
export type VideoDataClippedType<T> = ClippingDataType<VideoDataInfoType<T>>;
const WINDOWS_RESERVED_NAMES =
  /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i;

export function removeUnwantedChars(input: string) {
  let name = input
    .normalize("NFKC") // normalize unicode (important for cross-platform)
    // remove control chars
    .replace(/[\u0000-\u001f\u007f]/g, "")
    // replace invalid windows chars
    .replace(/[<>:"/\\|?*]/g, "-")
    // remove hashtags patterns if you want (your logic kept)
    .replace(/#[^\s#]+/g, "")
    // collapse whitespace
    .replace(/\s+/g, " ")
    .trim();

  // remove trailing dots/spaces (Windows breaks on these)
  name = name.replace(/[. ]+$/g, "");

  // avoid reserved device names
  if (WINDOWS_RESERVED_NAMES.test(name)) {
    name = `_${name}`;
  }

  // fallback for empty result
  if (!name) name = "file";

  return name;
}
const AppPrefix = "YoutubeDownloader";
export function getFileName<T>(data: VideoDataClippedType<T>) {
  if (data.clipped) {
    return removeUnwantedChars(
      `${AppPrefix} - ${data.title} v${data.fquality} ${data.start}-${data.end}.${data.ftype}`
    );
  } else
    return removeUnwantedChars(
      `${AppPrefix} - ${data.title} v${data.fquality}.${data.ftype}`
    );
}
export function getOriginalFileName(filename: string) {
  const regex = new RegExp(
    `^${AppPrefix} - (.+?) v[\\w]+(?: \\d+-\\d+)?\\.\\w+$`
  );
  const match = filename.match(regex);

  return match ? `${match[1]}${path.extname(filename)}` : filename;
}
export function getHttpMethod(dlink: string, range?: string) {
  return new Promise<IncomingMessage>((res) => {
    const headers: Record<string, string> = {
      "User-Agent": "Your User Agent Here",
    };
    if (range) headers["range"] = range;
    if (dlink.startsWith("https"))
      https.get(
        dlink,
        {
          headers,
          rejectUnauthorized: true,
          agent: HttpsDownloadAgent,
        },
        (response) => {
          res(response);
        }
      );
    else
      http.get(
        dlink,
        {
          headers,
          agent: HttpDownloadAgent,
        },
        (response) => {
          res(response);
        }
      );
  });
}
