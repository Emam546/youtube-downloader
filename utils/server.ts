import https from "https";
import http from "http";
import { IncomingMessage } from "http";
import { HttpDownloadAgent, HttpsDownloadAgent } from "@serv/util/axios";

export async function WrapResponse<T>(
  fetchData: Promise<Response>
): Promise<T> {
  const res = await fetchData;
  if (res.status >= 300)
    throw new Error(`${res.statusText} With Code Status ${res.status}`);
  return (await res.json()) as T;
}

export type VideoDataInfoType = {
  dlink: string;
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
export type VideoDataClippedType = ClippingDataType<VideoDataInfoType>;
export function removeUnwantedChars(val: string) {
  return val.replace(/[/\\?%*:|"<>]/g, "-").replace(/#[^\s#]+/g, "");
}
export function getFileName<T extends VideoDataClippedType>(data: T) {
  if (data.clipped) {
    return removeUnwantedChars(
      `YoutubeDownloader - ${data.title} v${data.fquality} ${data.start}:${data.end}.${data.ftype}`
    );
  } else
    return removeUnwantedChars(
      `YoutubeDownloader - ${data.title} v${data.fquality}.${data.ftype}`
    );
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
