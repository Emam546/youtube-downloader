import fs from "fs";
import { DownloadParams } from "../../";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import { continueDownloading } from "../continueDownloading";
import { FfmpegBase, FFmpegData, timeStringToSeconds } from "../";
import { getVideoInfo } from "../../../ffmpeg";
import { Writable } from "stream";

export interface FFmpegResizeData extends FFmpegData {
  resize?: number;
}

export class FfmpegResizeBase extends FfmpegBase {
  resize: FFmpegResizeData["resize"];

  constructor(data: DownloadParams<FFmpegResizeData>) {
    super(data);
    this.resize = data.data.data.resize;
  }
  rebuildingState = false;

  static async getEstimatedFileSize(
    data: FFmpegResizeData,
    duration?: number
  ): Promise<number | null> {
    if (!data.resize || !data.link)
      return await super.getEstimatedFileSize(data, duration);

    const { audioOnly, videoOnly } = data.editData || {};
    const metadata = await getVideoInfo(data.link);

    // duration
    const EstimatedDuration =
      duration ??
      (metadata.format.duration
        ? parseFloat(metadata.format.duration.toString())
        : 0);

    if (!EstimatedDuration || !metadata.format.bit_rate) {
      return await FfmpegBase.getEstimatedFileSize(data, duration);
    }

    // Helper to safely parse numbers
    const safeNum = (n?: any) => (n ? parseFloat(n.toString()) : 0);

    // Get bitrates from streams (more accurate than format.bit_rate)
    const videoStream = metadata.streams?.find((s) => s.codec_type === "video");
    const audioStream = metadata.streams?.find((s) => s.codec_type === "audio");

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
      // full video (with audio)
      overallBitrate = videoBitrate + audioBitrate;

      if (data.resize && videoStream?.width) {
        const scaleFactor = data.resize / videoStream.width;
        overallBitrate = videoBitrate * Math.pow(scaleFactor, 2) + audioBitrate;
      }
    }
    const estimatedSize = (overallBitrate * EstimatedDuration) / 8;
    return isFinite(estimatedSize) && estimatedSize > 0 ? estimatedSize : null;
  }
  async continueDownResize(command: ffmpeg.FfmpegCommand) {
    const metaData = await getVideoInfo(this.downloadingState.path);
    const duration = metaData.format.duration;
    if (!duration) throw new Error("Unrecognized time");
    const numberOfFrames =
      parseInt(
        metaData.streams.find((formate) => formate.codec_type == "video")
          ?.nb_frames || ""
      ) *
      ((this.ffmpegData?.duration || duration) / duration);
    this.rebuildingState = true;
    if (this.editData?.audioOnly) command.noVideo();
    else if (this.editData?.videoOnly) command.noAudio();
    this.setThrottleState(this.enableThrottle);
    const commando = command
      .inputOption("-y")
      .on("error", (err) => this.error(err))
      .on("progress", ({ timemark, ...percent }) => {
        if (
          this.rebuildingState &&
          timeStringToSeconds(timemark as string) > duration
        ) {
          this.setPauseButton("Pause");
          this.rebuildingState = false;
          this.setThrottleState(this.enableThrottle);
        }
        if (percent.percent) {
          const targetSize = percent.targetSize * 1024;
          const totalFileSize = Math.round(
            (targetSize / percent.percent) * 100
          );
          this.setFileSize(totalFileSize);
        } else if (percent.frames) {
          const fileSize = (numberOfFrames / percent.frames) * this.curSize;
          this.setFileSize(fileSize);
        }
      })
      .on("start", () => {
        this.setPauseButton("Pause");
      });
    commando.mergeToFile(
      this.downloadingState.path,
      path.dirname(this.downloadingState.path)
    );
    this.once("close", () => {
      try {
        command.kill("SIGKILL");
      } catch (error) {}
    });
  }
  async prepareDownResize(command: ffmpeg.FfmpegCommand) {
    this.setCurSize(0);
    this.setResumability(true);
    this.changeState("connecting");
    this.setResumability(true);
    const metaData = await getVideoInfo(this.link!);
    const duration = metaData.format.duration;
    if (!duration) throw new Error("Unrecognized time");
    const numberOfFrames = Math.floor(
      parseInt(
        metaData.streams.find((formate) => formate.codec_type == "video")
          ?.nb_frames || ""
      ) *
        ((this.ffmpegData?.duration || duration) / duration)
    );
    this.setPauseButton("Pause");
    await new Promise((res, rej) => {
      command
        .inputOption("-y")
        .outputOptions(
          this.ffmpegData?.duration
            ? [
                `-t ${this.ffmpegData.duration}`, // Set duration for both video and audio
              ]
            : []
        )
        .on("progress", (progress) => {
          if (progress.frames) {
            const fileSize =
              (numberOfFrames / progress.frames) * progress.targetSize * 1024;
            this.onGetChunk(this.curSize - progress.targetSize * 1024);
            this.setFileSize(fileSize);
          }
        })
        .on("error", rej)
        .on("start", () => {
          this.setPauseButton("Pause");
        })
        .on("end", res);
      if (this?.resize) command.videoFilters(`scale=-2:${this.resize}`);
      if (this.editData?.audioOnly) command.noVideo();
      else if (this.editData?.videoOnly) command.noAudio();
      command.output(this.downloadingState.path);
      this.once("close", () => {
        try {
          command.kill("SIGKILL");
        } catch (error) {}
      });

      command.run();
    });
  }
  async download(func: (path: string) => Writable) {
    if (!this.resize || !this.link) return await super.download(func);
   
    this.setFileSize(
      (await FfmpegResizeBase.getEstimatedFileSize(
        this,
        this.ffmpegData?.duration
      )) || undefined
    );
    const format = path.extname(this.downloadingState.path).slice(1);
    if (
      this.downloadingState.continued &&
      fs.existsSync(this.downloadingState.path)
    ) {
      const command = (
        await continueDownloading(
          this.link,
          this.downloadingState.path,
          this.ffmpegData?.start || 0,
          this.ffmpegData?.duration || 1000000000000
        )
      ).format(format);
      if (this.editData?.audioOnly) command.noVideo();
      else if (this.editData?.videoOnly) command.noAudio();
      if (this.resize) command.videoFilters(`scale=-2:${this.resize}`);
      await this.continueDownResize(command);
    } else {
      await new Promise(async (res, rej) => {
        const command = ffmpeg()
          .input(this.link!)
          .on("error", rej)
          .on("end", res)
          .setStartTime(this.ffmpegData?.start || 0);
        await this.prepareDownResize(command);
      });
    }
  }
}
