import { DownloadBase, DownloadParams } from "..";
import { Readable, Writable } from "stream";
import { FfmpegMergeBase, FFmpegMergeData } from "../ffmpeg/merge";
import fs from "fs";
import { YtdlpData, YtdlpBase } from ".";
import path from "path";
export interface YtdlpMergeData extends YtdlpData {
  interfaces?: {
    video: YtdlpData["ytdlpData"];
    audio: YtdlpData["ytdlpData"];
  };
}

export class YtdlMerge extends YtdlpBase implements YtdlpMergeData {
  interfaces: YtdlpMergeData["interfaces"];
  data: DownloadParams<YtdlpMergeData>;
  constructor(data: DownloadParams<YtdlpMergeData>, cookies?: string) {
    super(data, cookies);
    this.data = data;
    this.interfaces = data.data.data.interfaces;
  }
  async download(func: (path: string) => Writable) {
    if (!this.interfaces) return await super.download(func);
    const folder = path.dirname(this.downloadingState.path);
    const fileName = path.basename(
      this.downloadingState.path,
      path.extname(this.downloadingState.path),
    );
    const videoFileName = path.join(
      folder,
      fileName + "-video-part." + this.interfaces.video?.ext,
    );
    const videoBase = new YtdlpBase({
      data: { ...this.data.data, data: { ytdlpData: this.interfaces.video } },
      downloadingState: { continued: false, path: videoFileName },
    });
    this.wrap(videoBase);
    const video = await videoBase.download(func);
    if (!video) return null;

    ////////////////////////////////////
    const audioFileName = path.join(
      folder,
      fileName + "-audio-part." + this.interfaces.audio?.ext,
    );
    const audioBase = new YtdlpBase({
      data: { ...this.data.data, data: { ytdlpData: this.interfaces.audio } },
      downloadingState: { continued: false, path: audioFileName },
    });
    this.wrap(audioBase);
    const audio = await audioBase.download(func);
    if (!audio) return null;
    this.ffmpegData = undefined;
    this.mergeData = { videoLink: video, audioLink: audio };
    const result = await super.download(func);

    fs.unlinkSync(video);
    fs.unlinkSync(audio);
    return result;
  }
}
