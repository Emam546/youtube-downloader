import { DownloaderData } from "../window";
import fs from "fs";
import { continueDownloading } from "./continueDownloading";
import { FfmpegWindowOrg } from "../ffmpeg/window";
import ffmpeg from "fluent-ffmpeg";
import path from "path";

export interface FfmpegVideoData {
  start: number;
  duration: number;
}
export interface FFmpegDownloaderData extends DownloaderData {
  ffmpegData: FfmpegVideoData;
}

export class FfmpegWindow extends FfmpegWindowOrg {
  async download() {
    const format = path.extname(this.downloadingState.path).slice(1);
    if (
      this.downloadingState.continued &&
      fs.existsSync(this.downloadingState.path)
    ) {
      super.continuoDownloading(
        (
          await continueDownloading(
            this.link,
            this.downloadingState.path,
            this.ffmpegData?.start || 0,
            this.ffmpegData?.duration || 100000000000000
          )
        ).format(format)
      );
    } else {
      super.download(
        ffmpeg()
          .input(this.link)
          .setStartTime(this.ffmpegData?.start || 0)
          .format(format)
      );
    }
  }
}
