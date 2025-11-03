import { DownloadBase, DownloadParams } from "..";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";
import { getVideoInfo } from "../../ffmpeg";
import { continueDownloading, getTempName } from "./continueDownloading";
import { PassThrough, Writable } from "stream";
import { pipeAsync } from "../..";
import { LinkDownloadBase, LinkDownloadData } from "../link";

export interface FFmpegData extends LinkDownloadData {
  editData?: {
    audioOnly?: boolean;
    videoOnly?: boolean;
  };
}
export function timeStringToSeconds(timeString: string) {
  // Split the time string into hours, minutes, and seconds
  const parts = timeString.split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseFloat(parts[2]);

  // Convert everything to seconds
  return hours * 3600 + minutes * 60 + seconds;
}
function isFile(link: string) {
  try {
    return fs.statSync(link).isFile();
  } catch (error) {
    return false;
  }
}
export class FfmpegBase extends LinkDownloadBase {
  ffmpegData?: {
    start: number;
    duration: number;
  };
  editData: FFmpegData["editData"];

  constructor(data: DownloadParams<FFmpegData>) {
    super(data);

    this.editData = data.data.data.editData;
    if (!data.data.clipped) return;
    this.ffmpegData = {
      duration: data.data.end - data.data.start,
      start: data.data.start,
    };
  }
  rebuildingState = false;

  static async getEstimatedFileSize(
    data: FFmpegData,
    duration?: number
  ): Promise<number | null> {
    if (!data.editData || !data.link) return null;
    const { audioOnly, videoOnly } = data.editData;
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
    } else {
      // full video (with audio)
      overallBitrate = videoBitrate + audioBitrate;
    }

    // Convert bits/sec * seconds → bytes
    const estimatedSize = (overallBitrate * EstimatedDuration) / 8;

    return isFinite(estimatedSize) && estimatedSize > 0 ? estimatedSize : null;
  }
  async continuoDownloading(command: ffmpeg.FfmpegCommand) {
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
      .outputOptions("-movflags frag_keyframe+empty_moov")
      .outputOptions("-c copy")
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
    const transfer = new PassThrough();
    commando.mergeToFile(transfer, path.dirname(this.downloadingState.path));
    this.once("close", () => {
      try {
        command.kill("SIGKILL");
      } catch (error) {}
    });
    return { pipe: transfer, path: getTempName(this.downloadingState.path) };
  }
  async prepareDownloading(command: ffmpeg.FfmpegCommand) {
    this.setCurSize(0);
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
    // const pipe = await this.pipe(getTempName(this.downloadingState.path));
    this.setPauseButton("Pause");
    if (this.editData?.audioOnly) command.noVideo();
    else if (this.editData?.videoOnly) command.noAudio();
    command
      .inputOption("-y")
      .outputOptions(
        this.ffmpegData?.duration
          ? [
              `-t ${this.ffmpegData.duration}`, // Set duration for both video and audio
            ]
          : []
      )
      .outputOptions("-movflags frag_keyframe+empty_moov")
      .outputOptions("-c copy")
      .on("progress", (progress) => {
        if (progress.frames) {
          const fileSize =
            (numberOfFrames / progress.frames) * progress.targetSize * 1024;
          this.setFileSize(fileSize);
        }
      })
      .on("start", () => {
        this.setPauseButton("Pause");
      });

    this.on("close", () => {
      command.kill("SIGKILL");
    });

    this.setResumability(true);
    return { pipe: command, path: getTempName(this.downloadingState.path) };
  }
  async converting(): Promise<void> {
    const tempPath = getTempName(this.downloadingState.path);
    const metaData = await getVideoInfo(tempPath);
    const numberOfFrames = parseInt(
      metaData.streams.find((formate) => formate.codec_type == "video")
        ?.nb_frames || ""
    );
    await new Promise<void>((res, rej) => {
      const command = ffmpeg()
        .input(tempPath)
        .outputOptions("-movflags +faststart")
        .outputOptions("-c copy")
        .on("progress", (progress) => {
          const targetSize = progress.targetSize * 1024;
          this.changeState("receiving");
          this.setFileSize(undefined);
          this.onGetChunk(progress.targetSize - this.curSize);
          if (numberOfFrames) {
            const totalFileSize = Math.round(
              (numberOfFrames / progress.frames) * targetSize
            );
            this.setFileSize(totalFileSize);
          }
        })
        .on("start", () => {
          this.rebuildingState = true;
          this.changeState("receiving");
          this.setResumability(false);
          this.setCurSize(0);
          this.onGetChunk(0);
          this.setPauseButton("Pause", false);
          this.resetSpeed();
        })
        .on("end", () => {
          res();
        })
        .on("error", (err) => {
          rej(err);
        })
        .output(this.downloadingState.path);
      this.once("close", () => {
        try {
          command.kill("SIGKILL");
        } catch (error) {}
      });
      command.run();
    });
    fs.unlinkSync(tempPath);
  }
  setThrottleState(state: boolean): void {
    if (this.rebuildingState) super.setThrottleState(false);
    else super.setThrottleState(state);
  }
  changeState(
    ...[state, ...args]: Parameters<DownloadBase["changeState"]>
  ): void {
    if (state == "receiving" && this.rebuildingState)
      return super.changeState("rebuilding", ...args);
    return super.changeState(state, ...args);
  }

  async download(func: (path: string) => Writable) {
    if (
      !this.ffmpegData &&
      !this.editData &&
      !(!this.link || isFile(this.link))
    )
      return await super.download(func);
    const format = path.extname(this.downloadingState.path).slice(1);
    this.setFileSize(
      (await FfmpegBase.getEstimatedFileSize(
        this,
        this.ffmpegData?.duration
      )) || undefined
    );
    if (
      this.downloadingState.continued &&
      fs.existsSync(this.downloadingState.path)
    ) {
      const command = (
        await continueDownloading(
          this.link!,
          this.downloadingState.path,
          this.ffmpegData?.start || 0,
          this.ffmpegData?.duration
        )
      ).format(format);

      const stream = await this.continuoDownloading(command);

      await pipeAsync(stream.pipe.pipe(func(stream.path)));
    } else {
      await new Promise(async (res, rej) => {
        const command = ffmpeg()
          .input(this.link!)
          .seekInput(this.ffmpegData?.start ?? 0)
          .format(format)
          .on("end", res)
          .on("error", rej);
        const stream = await this.prepareDownloading(command);
        await pipeAsync(stream.pipe.pipe(func(stream.path)));
      });
    }
    await this.converting();
  }
}
