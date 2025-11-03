import { DownloadParams } from "../utils/Bases";
import {
  FFmpegResizeData,
  FfmpegResizeBase,
} from "../utils/Bases/ffmpeg/resize";
export { FFmpegResizeData, FfmpegResizeBase };
export function download(data: DownloadParams<FFmpegResizeData>) {
  return new FfmpegResizeBase(data);
}
