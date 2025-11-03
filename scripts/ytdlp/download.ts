import { DownloadParams } from "../utils/Bases";
import { YtdlpData, YtdlpBase } from "../utils/Bases/ytdlp";
export { YtdlpData, YtdlpBase };

export function download(data: DownloadParams<YtdlpData>) {
  return new YtdlpBase(data);
}
