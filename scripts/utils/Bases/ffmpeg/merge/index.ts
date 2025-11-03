import fs from "fs";
import { DownloadParams } from "../../";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import { continueDownloading } from "./continueDownloading";
import { Writable } from "stream";
import { getVideoInfo } from "../../../ffmpeg";
import { pipeAsync } from "../../..";
import { FfmpegResizeBase, FFmpegResizeData } from "../resize";

export interface FFmpegMergeData extends FFmpegResizeData {
  mergeData?: {
    audioLink: string;
    videoLink: string;
  };
}

export class FfmpegMergeBase extends FfmpegResizeBase {
  mergeData?: FFmpegMergeData["mergeData"];
  constructor(data: DownloadParams<FFmpegMergeData>) {
    super(data);
    this.mergeData = data.data.data.mergeData;
  }
  static async getEstimatedFileSize(
    data: FFmpegMergeData,
    duration?: number
  ): Promise<number | null> {
    if (!data.mergeData)
      return await super.getEstimatedFileSize(data, duration);

    const { audioOnly, videoOnly } = data.editData || {};
    const metadata = await getVideoInfo(data.mergeData.videoLink);
    const audioMetadata = await getVideoInfo(data.mergeData.audioLink);

    // duration
    const EstimatedDuration =
      duration ??
      (metadata.format.duration
        ? parseFloat(metadata.format.duration.toString())
        : 0);

    if (!EstimatedDuration || !metadata.format.bit_rate) {
      return await FfmpegResizeBase.getEstimatedFileSize(data, duration);
    }

    // Helper to safely parse numbers
    const safeNum = (n?: any) => (n ? parseFloat(n.toString()) : 0);

    // Get bitrates from streams (more accurate than format.bit_rate)
    const videoStream = metadata.streams?.find((s) => s.codec_type === "video");
    const audioStream = audioMetadata.streams?.find(
      (s) => s.codec_type === "audio"
    );

    let videoBitrate =
      safeNum(videoStream?.bit_rate) || safeNum(metadata.format.bit_rate);
    let audioBitrate = safeNum(audioStream?.bit_rate);

    // Estimate total bitrate depending on output type
    let overallBitrate = 0;

    if (audioOnly) {
      overallBitrate = audioBitrate;
    } else if (videoOnly) {
      // 🔹 video-only → remove audio bitrate
      overallBitrate = videoBitrate;

      // optional resize scaling (bitrate roughly scales with pixel count)
      if (data.resize && videoStream?.width) {
        const scaleFactor = data.resize / videoStream.width;
        overallBitrate *= Math.pow(scaleFactor, 2);
      }
    } else {
      overallBitrate = videoBitrate + audioBitrate;
      if (data.resize && videoStream?.width) {
        const scaleFactor = data.resize / videoStream.width;
        overallBitrate = videoBitrate * Math.pow(scaleFactor, 2) + audioBitrate;
      }
    }
    const estimatedSize = (overallBitrate * EstimatedDuration) / 8;
    return isFinite(estimatedSize) && estimatedSize > 0 ? estimatedSize : null;
  }
  async download(func: (path: string) => Writable) {
    if (!this.mergeData) return await super.download(func);
    this.setFileSize(
      (await FfmpegMergeBase.getEstimatedFileSize(
        this,
        this.ffmpegData?.duration
      )) || undefined
    );
    const format = path.extname(this.downloadingState.path).slice(1);
    if (
      this.downloadingState.continued &&
      fs.existsSync(this.downloadingState.path)
    ) {
      const stream = await super.continuoDownloading(
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
      await pipeAsync(stream.pipe.pipe(func(stream.path)));
    } else {
      await new Promise(async (res, rej) => {
        const stream = await this.prepareDownloading(
          ffmpeg()
            .input(this.mergeData!.videoLink)
            .setStartTime(this.ffmpegData?.start || 0)
            .input(this.mergeData!.audioLink)
            .setStartTime(this.ffmpegData?.start || 0)
            .format(format)
            .on("end", res)
            .on("error", rej)
        );
        await pipeAsync(stream.pipe.pipe(func(stream.path)));
      });
    }
  }
}
