import { BrowserWindowConstructorOptions } from "electron";
import { getVideoInfo } from "../utils/ffmpeg";
import { BaseDownloaderWindow, DownloaderData } from "../window";
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
  constructor(
    options: BrowserWindowConstructorOptions,
    data: FFmpegDownloaderData
  ) {
    super(options, data);
    this.ffmpegData = data.ffmpegData;
  }

  async continuoDownloading(
    command: ffmpeg.FfmpegCommand,
    num = 0,
    err?: unknown
  ) {
    if (num > FfmpegWindowOrg.MAX_TRIES) return this.error(err);

    try {
      const metaData = await getVideoInfo(this.downloadingState.path);
      const duration = metaData.format.duration;
      if (!duration) throw new Error("Unrecognized time");
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
          const curSize = (percent.targetSize as number) * 1024;
          if (this.fileSize != curSize) this.setFileSize(curSize);
        })
        .on("start", () => {
          this.setPauseButton("Pause");
        });

      const pipe = this.pipe();
      commando.mergeToFile(pipe, path.dirname(this.downloadingState.path));
      this.on("close", () => {
        try {
          commando.kill("SIGKILL");
        } catch (err) {
          /* empty */
        }
      });
    } catch (err) {
      this.download(command, num + 1, err);
    }
  }
  async download(command: ffmpeg.FfmpegCommand, num = 0, err?: unknown) {
    if (num > FfmpegWindowOrg.MAX_TRIES) return this.error(err);
    try {
      this.setCurSize(0);
      this.changeState("connecting");
      this.setResumability(true);
      const pipe = this.pipe();
      this.setPauseButton("Pause");
      const commando = command
        .outputOptions([
          `-t ${this.ffmpegData?.duration || 1000000000000000}`, // Set duration for both video and audio
        ])
        .outputOptions("-movflags frag_keyframe+empty_moov")
        .outputOptions("-c copy")
        .on("progress", (percent) => {
          const curSize = percent.targetSize * 1024;
          if (this.fileSize != curSize) this.setFileSize(curSize);
        })
        .on("error", (err) => this.error(err))
        .on("start", () => {
          this.setPauseButton("Pause");
        })
        .output(pipe);
      this.on("close", () => {
        try {
          commando.kill("SIGKILL");
        } catch (err) {
          /* empty */
        }
      });
      command.run();
    } catch (err) {
      this.download(command, num + 1, err);
    }
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
    await new Promise<void>((res, rej) => {
      const command = ffmpeg()
        .input(this.downloadingState.path)
        .outputOptions("-movflags +faststart")
        .outputOptions("-c copy")
        .on("progress", (percent) => {
          this.changeState("receiving");
          this.setFileSize(undefined);
          this.onGetChunk(percent.targetSize - this.curSize);
          const curSize = percent.targetSize * 1024;
          if (this.fileSize != curSize) this.setFileSize(curSize);
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
        .output(tempPath);

      this.on("close", () => {
        try {
          command.kill("SIGKILL");
        } catch (err) {
          /* empty */
        }
      });
      command.run();
    });
    fs.unlinkSync(this.downloadingState.path);
    fs.renameSync(tempPath, this.downloadingState.path);
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
