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
    await super.download(async () => {
      const format = path.extname(this.downloadingState.path).slice(1);
      if (
        this.downloadingState.continued &&
        fs.existsSync(this.downloadingState.path)
      ) {
        await this.continuoDownloading(
          (
            await continueDownloading(
              this.link,
              this.downloadingState.path,
              this.ffmpegData?.start || 0,
              this.ffmpegData?.duration
            )
          ).format(format)
        );
      } else {
        await this.prepareDownloading(
          ffmpeg()
            .input(this.link)
            .setStartTime(this.ffmpegData?.start || 0)
            .format(format)
        );
      }
    });
  }
}
