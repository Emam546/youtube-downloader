import { asyncFilter } from "@utils/index";
import axios from "axios";
import { getQualityFromResolution } from "../utils";
import { DownloadParams } from "../utils/Bases";
import { FormatResult } from "../utils/Bases/ytdlp";
import { YtdlMerge, YtdlpMergeData } from "../utils/Bases/ytdlp/mix";
import { getYtdlpStreams } from "../utils/func";
export { YtdlMerge };
export type { YtdlpMergeData };
export async function getAllFormats(url: string): Promise<FormatResult[]> {
  const result = await getYtdlpStreams(url);
  const data = result.formats;

  return (
    await asyncFilter(data, async (data) => {
      try {
        await axios.head(data.url);
        return true;
      } catch (error) {
        return false;
      }
    })
  ).map((data) => {
    return {
      ...data,
      has_video: data.vcodec != "none",
      has_audio: data.acodec != "none",
      qualityLabel: getQualityFromResolution(data.width!, data.height!)
        .label as FormatResult["qualityLabel"],
      type: data.ext!,

      args: {
        format: data.format_id,
      } as FormatResult,
    };
  });
}
export function download(data: DownloadParams<YtdlpMergeData>) {
  return new YtdlMerge(data, process.env.YoutubeCookies);
}
