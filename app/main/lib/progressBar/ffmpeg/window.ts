import { getVideoInfo } from "../utils/ffmpeg";
import { BaseDownloaderWindow, BrowserProps, DownloaderData } from "../window";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import { getTempName } from "../ffmpgeCutter/continueDownloading";
import path from "path";
import { ProgressBarState } from "@app/renderer/shared/progress";

export interface FfmpegVideoData {
  start: number;
  duration: number;
}
export interface FFmpegDownloaderData extends DownloaderData {
  ffmpegData?: FfmpegVideoData;
}
function timeStringToSeconds(timeString: string) {
  // Split the time string into hours, minutes, and seconds
  const parts = timeString.split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseFloat(parts[2]);

  // Convert everything to seconds
  return hours * 3600 + minutes * 60 + seconds;
}
export class FfmpegWindowOrg extends BaseDownloaderWindow {
  readonly ffmpegData?: FfmpegVideoData;
  rebuildingState = false;
  constructor(options: BrowserProps, data: FFmpegDownloaderData) {
    super(options, data);
    this.ffmpegData = data.ffmpegData;
  }
  async getEstimatedFileSize(): Promise<number | null> {
    const metadata = await getVideoInfo(this.link);
    const bitrate = metadata.format.bit_rate;
    const duration = this.ffmpegData?.duration
      ? this.ffmpegData?.duration
      : metadata.format.duration
      ? parseFloat(metadata.format.duration.toString())
      : 0;

    if (bitrate && duration) {
      const estimatedSize = (bitrate * duration) / 8; // Convert bits to bytes
      return estimatedSize;
    } else {
      return await super.getEstimatedFileSize();
    }
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

    this.setThrottleState(this.enableThrottle);
    const commando = command
      .outputOptions("-movflags frag_keyframe+empty_moov")
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
          if (fileSize && this.fileSize != fileSize) this.setFileSize(fileSize);
        }
      })
      .on("start", () => {
        this.setPauseButton("Pause");
      });

    const pipe = this.pipe(getTempName(this.downloadingState.path));
    commando.mergeToFile(pipe, path.dirname(this.downloadingState.path));
    this.on("close", () => {
      commando.kill("SIGKILL");
    });
    this.prepareDownloading(command);
  }
  async prepareDownloading(command: ffmpeg.FfmpegCommand) {
    this.setCurSize(0);
    this.changeState("connecting");
    this.setResumability(true);
    const metaData = await getVideoInfo(this.link);
    const duration = metaData.format.duration;
    if (!duration) throw new Error("Unrecognized time");
    const numberOfFrames = Math.floor(
      parseInt(
        metaData.streams.find((formate) => formate.codec_type == "video")
          ?.nb_frames || ""
      ) *
        ((this.ffmpegData?.duration || duration) / duration)
    );
    const pipe = this.pipe(getTempName(this.downloadingState.path));
    this.setPauseButton("Pause");
    const commando = command
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
          if (fileSize && this.fileSize != fileSize) this.setFileSize(fileSize);
        }
      })
      .on("error", (err) => this.error(err))
      .on("start", () => {
        this.setPauseButton("Pause");
      })
      .output(pipe);
    this.on("close", () => {
      commando.kill("SIGKILL");
    });
    command.run();

    this.setResumability(true);
  }
  end() {
    this.converting()
      .then(() => {
        super.end();
      })
      .catch((err) => this.error(err));
  }
  async converting(): Promise<void> {
    await new Promise<void>((res) => {
      setTimeout(() => {
        res();
      }, 500);
    });
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

      this.on("close", () => {
        command.kill("SIGKILL");
      });
      command.run();
    });
    fs.unlinkSync(tempPath);
  }
  setThrottleState(state: boolean): void {
    if (this.rebuildingState) super.setThrottleState(false);
    else super.setThrottleState(state);
    this.enableThrottle = state;
  }
  changeState(state: ProgressBarState["status"]): void {
    if (state == "receiving" && this.rebuildingState)
      return super.changeState("rebuilding");
    return super.changeState(state);
  }
}
