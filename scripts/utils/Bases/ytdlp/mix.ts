import { DownloadBase, DownloadParams } from "..";
import { Readable, Writable } from "stream";
import { FfmpegMergeBase, FFmpegMergeData } from "../ffmpeg/merge";
import fs from "fs";
import { YtdlpData, YtdlpBase } from ".";
import path from "path";
interface MixDataData extends FFmpegMergeData {
  interfaces: {
    video: YtdlpData["ytdlpData"];
    audio: YtdlpData["ytdlpData"];
  };
}

export class YtdlMerge extends FfmpegMergeBase implements MixDataData {
  interfaces: MixDataData["interfaces"];
  data: DownloadParams<MixDataData>;
  constructor(data: DownloadParams<MixDataData>) {
    super(data);
    this.data = data;
    this.interfaces = data.data.data.interfaces;
  }
  async download(func: (path: string) => Writable) {
    const folder = path.(this.downloadingState.path);
    const videoFileName = path.basename(this.interfaces.video., path.extname(filePath));
    const [video, audio] = await Promise.all([
      new YtdlpBase({
        data: { ...this.data.data, data: { ytdlpData: this.interfaces.video } },
        curSize: fs.statSync(),
        downloadingState: { continued: true ,path:},
      }),
      new YtdlpBase(this.interfaces.audio),
    ]);
    if (!video || !audio) return null;
    this.mergeData = { videoLink: video, audioLink: audio };
    super.download(func);

    fs.unlinkSync(video);
    fs.unlinkSync(audio);
    return this.downloadingState.path;
  }
}
