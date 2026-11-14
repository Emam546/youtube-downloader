import { DownloadParams } from "../utils/Bases";
import { YtdlpBase, YtdlpData } from "../utils/Bases/ytdlp";

export { YtdlpBase };
export type { YtdlpData };

/**
 * The desktop flow flattens `VideoDataInfoType.data` before calling the
 * plugin, while the web endpoint passes the wrapped object as-is. Accept both
 * shapes so downloads work in the app and in the browser.
 */
function normalize(
  data: DownloadParams<YtdlpData>,
): DownloadParams<YtdlpData> {
  if (data.data.ytdlpData) return data;
  const inner = (data.data as { data?: YtdlpData }).data;
  if (!inner?.ytdlpData) return data;
  return {
    ...data,
    data: { ...inner, ...data.data } as DownloadParams<YtdlpData>["data"],
  };
}

export function download(data: DownloadParams<YtdlpData>) {
  return new YtdlpBase(normalize(data), process.env.YoutubeCookies);
}
