import fs from "fs";
import { DownloadParams } from "../../../";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import { continueDownloading } from "../../merge/continueDownloading";
import { Writable } from "stream";

import { FfmpegMergeBase, FFmpegMergeData } from "../../merge";

export interface FFmpegResizeMergeData extends FFmpegMergeData {}

export class FfmpegResizeMergeBase extends FfmpegMergeBase {
  constructor(data: DownloadParams<FFmpegMergeData>) {
    super(data);
  }
  async download(func: (path: string) => Writable) {
    if (!(this.resize && this.mergeData)) return await super.download(func);
    this.setFileSize(
      (await FfmpegResizeMergeBase.getEstimatedFileSize(
        this,
        this.ffmpegData?.duration
      )) || undefined
    );
    const format = path.extname(this.downloadingState.path).slice(1);
    if (
      this.downloadingState.continued &&
      fs.existsSync(this.downloadingState.path)
    ) {
      await super.continueDownResize(
        (
          await continueDownloading(
            {
              video: this.mergeData.videoLink,
              audio: this.mergeData.audioLink,
            },
            this.downloadingState.path,
            this.ffmpegData?.start || 0,
            this.ffmpegData?.duration || 1000000000000
          )
        ).format(format)
      );
    } else {
      await this.prepareDownResize(
        ffmpeg()
          .input(this.mergeData.videoLink)
          .setStartTime(this.ffmpegData?.start || 0)
          .input(this.mergeData.audioLink)
          .setStartTime(this.ffmpegData?.start || 0)
          .format(format)
      );
    }
  }
}
