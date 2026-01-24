import { asyncFilter } from "@utils/index";
import axios from "axios";
import { getQualityFromResolution } from "../utils";
import { DownloadParams } from "../utils/Bases";
import {
  YtdlpData,
  YtdlpBase,
  FormatResult,
  ytdlp,
  YtDlpFormat,
} from "../utils/Bases/ytdlp";
export { YtdlpBase };
export type { YtdlpData };
export async function getAllFormats(url: string): Promise<FormatResult[]> {
  const result = await ytdlp.execAsync(url, {
    dumpJson: true,
    checkAllFormats: true,
  });

  const data = JSON.parse(result).formats as YtDlpFormat[];

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
export function download(data: DownloadParams<YtdlpData>) {
  return new YtdlpBase(data, process.env.YoutubeCookies);
}
