import { DownloadParams } from "..";
import { YtDlp, ArgsOptions } from "ytdlp-nodejs";
import path from "path";
import { Writable } from "stream";
import {
  FfmpegResizeMergeBase,
  FFmpegResizeMergeData,
} from "../ffmpeg/resize/merge";
import { convertSecondsToHHMMSS } from "@utils/time";
import os from "os";
import { getVideoInfo } from "../../ffmpeg";

export const ytdlp = new YtDlp({
  binaryPath: process.env.ytdlp_binDir,
});
export interface YtdlpData extends FFmpegResizeMergeData {
  ytdlpData?: FormatResult & { link: string };
}

export class YtdlpBase extends FfmpegResizeMergeBase {
  ytdlpData: YtdlpData["ytdlpData"];
  readonly cookies?: string;
  constructor(data: DownloadParams<YtdlpData>, cookies?: string) {
    super(data);
    this.ytdlpData = data.data.data.ytdlpData;
    this.cookies = cookies;
  }
  async download(func: (path: string) => Writable) {
    if (!this.ytdlpData) return await super.download(func);
    if (!this.ffmpegData) {
      try {
        await getVideoInfo(this.ytdlpData.url);
        this.link = this.ytdlpData.url;
        return await super.download(func);
      } catch (error) {}
    }
    const ytdlpStream = ytdlp.stream(this.ytdlpData.link, {
      ...this.ytdlpData.args,
      abortOnError: true,
      noKeepFragments: true,
      noContinue: true,
      cookies: this.cookies,
      paths: `TEMP:${os.tmpdir()}`,
      onProgress: (p) => {
        this.setFileSize(p.total);
      },
      downloadSections:
        this.ffmpegData &&
        `*${convertSecondsToHHMMSS(
          this.ffmpegData.start,
        )}-${convertSecondsToHHMMSS(
          this.ffmpegData.duration + this.ffmpegData.start,
        )}`,
    });
    ytdlpStream.pipe(func(this.downloadingState.path));
    await ytdlpStream.promise;
    // return new Promise<void>((res, rej) => {
    //   ytdlpStream.stderr.once("error", (e) => rej(e.toString()));

    //   ytdlpStream.on("error", rej);
    //   pipeAsync(ytdlpStream.stdout.pipe(func(this.downloadingState.path))).then(
    //     res
    //   );
    // });
  }
}
export interface YtDlpFormat {
  format_id: string;
  filesize: number | null;
  filesize_approx: number | null;
  format_index: number | null;
  url: string;
  manifest_url?: string;
  tbr?: number;
  ext?: string;
  fps?: number;
  protocol?: string;
  preference?: number | null;
  quality?: number;
  has_drm?: boolean;
  width?: number;
  height?: number;
  vcodec?: string;
  acodec?: string;
  dynamic_range?: string;
  available_at?: number;
  source_preference?: number;
  language?: string;
  video_ext?: string;
  audio_ext?: string;
  vbr?: number | null;
  abr?: number | null;
  resolution?: string;
  aspect_ratio?: number;
  http_headers?: {
    "User-Agent"?: string;
    Accept?: string;
    "Accept-Language"?: string;
    "Sec-Fetch-Mode"?: string;
    [key: string]: any;
  };
  format?: string;
  __working?: boolean;
}
type Formats = "1080p" | "720p" | "480p" | "360p" | "240p" | "144p";
export interface FormatResult extends YtDlpFormat {
  qualityLabel?: Formats;
  type: any;
  has_audio: boolean;
  has_video: boolean;
  args: ArgsOptions;
}
