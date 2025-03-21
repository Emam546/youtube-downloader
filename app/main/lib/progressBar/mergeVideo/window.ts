import fs from "fs";
import { continueDownloading } from "./continueDownloading";
import { FfmpegWindowOrg } from "../ffmpeg/window";
import ffmpeg from "fluent-ffmpeg";
import path from "path";

export interface MergeDataType {
  audioLink: string;
  videoLink: string;
}
export class FfmpegMergeWindow extends FfmpegWindowOrg {
  readonly mergeData: MergeDataType;
  constructor(
    ...a: [...ConstructorParameters<typeof FfmpegWindowOrg>, MergeDataType]
  ) {
    const [data, ffmpegData, mergeData] = a;
    super(data, ffmpegData);
    this.mergeData = mergeData;
  }
  async download() {
    await super.download(async () => {
      const format = path.extname(this.downloadingState.path).slice(1);
      if (
        this.downloadingState.continued &&
        fs.existsSync(this.downloadingState.path)
      ) {
        await super.continuoDownloading(
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
        await super.prepareDownloading(
          ffmpeg()
            .input(this.mergeData.videoLink)
            .setStartTime(this.ffmpegData?.start || 0)
            .input(this.mergeData.audioLink)
            .setStartTime(this.ffmpegData?.start || 0)
            .format(format)
        );
      }
    });
  }
}
