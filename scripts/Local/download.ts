import { DownloadParams } from "../utils/Bases";
import {
  FfmpegResizeBase,
  FFmpegResizeData,
} from "../utils/Bases/ffmpeg/resize";
export interface LocalData extends FFmpegResizeData {}
export class LocalBaseDownload extends FfmpegResizeBase {}
export function download(data: DownloadParams<LocalData>) {
  return new LocalBaseDownload(data);
}
