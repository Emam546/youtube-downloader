import { DownloadParams } from "../utils/Bases";
import { YtdlpData, YtdlpBase } from "../utils/Bases/ytdlp";
export { YtdlpBase };
export type { YtdlpData };
export function download(data: DownloadParams<YtdlpData>) {
  return new YtdlpBase(data, process.env.YoutubeCookies);
}
