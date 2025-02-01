import { ProgressBarState, ProgressData } from "@shared/renderer/progress";
import { StateType } from "@app/main/lib/main/utils/downloader";
import fs, { WriteStream } from "fs-extra";
import { BrowserWindowConstructorOptions } from "electron";
import { DownloaderWindow } from "../donwloading";
import { ModifiedThrottle } from "./utils";
import internal from "stream";
import { DownloadTray } from "./tray";
export type FlagType = "w" | "a";
export interface VideoData {
  link: string;
  video: {
    title: string;
    previewLink: string;
  };
}
export interface PipeListener extends NodeJS.EventEmitter {
  pipe<T extends WritableStream>(
    destination: T,
    options?: { end?: boolean | undefined }
  ): T;
}
export interface DownloadingStatus {
  enableThrottle: boolean;
  downloadSpeed: number;
}
export interface DownloaderData {
  fileStatus: StateType;
  videoData: VideoData;
  downloadingStatus: DownloadingStatus;
  pageData: ProgressData;
}
export const defaultPageData: ProgressData = {
  footer: {
    cancel: {
      enabled: true,
      text: "Cancel",
    },
    pause: {
      enabled: false,
      text: "Pause",
    },
  },
  tabs: [
    {
      id: "0",
      title: "Download Status",
      type: "Download",
      enabled: true,
    },
    {
      id: "1",
      title: "Speed limiter",
      type: "speedLimiter",
      enabled: true,
    },
    {
      id: "2",
      title: "Options on completion",
      type: "Options",
      enabled: true,
    },
  ],
};
export interface BaseDownloaderWindow {
  fromWebContents(
    webContents: Electron.WebContents
  ): BaseDownloaderWindow | null;
}
export class BaseDownloaderWindow extends DownloaderWindow {
  public static readonly MAX_TRIES = 3;
  pageData: ProgressData;

  public flag: FlagType;
  private stream?: WriteStream;
  private readonly curStream: ModifiedThrottle;
  readonly link: string;
  readonly videoData: VideoData["video"];
  enableThrottle: boolean;
  downloadSpeed: number;
  downloadingState: StateType;
  state: ProgressBarState["status"] = "connecting";
  readonly curSize: number;
  constructor(options: BrowserWindowConstructorOptions, data: DownloaderData) {
    super(options);
    this.enableThrottle = data.downloadingStatus.enableThrottle;
    this.downloadSpeed = data.downloadingStatus.downloadSpeed;
    this.curStream = new ModifiedThrottle({
      bps: this.enableThrottle
        ? Math.max(1024, this.downloadSpeed)
        : Number.MAX_SAFE_INTEGER,
      writableHighWaterMark: 1024 * 5,
      delayTime: 5000,
    });
    this.pageData = data.pageData;
    this.flag =
      data.fileStatus.continued && fs.existsSync(data.fileStatus.path)
        ? "a"
        : "w";
    this.downloadingState = data.fileStatus;
    this.curSize = this.flag == "a" ? this.getRealSize() : 0;
    this.link = data.videoData.link;
    this.videoData = data.videoData.video;
    this.on("close", () => {
      if (!this.curStream.closed) this.curStream.destroy();
    });
    this.curStream.on("reset-speed", () => {
      this.resetSpeed();
    });
    this.curStream.on("delayed-pause", () => {
      if (this.state == "receiving") this.changeState("connecting");
    });

    this.curStream.on("data", (data: Buffer) =>
      this.onGetChunk(data.byteLength)
    );
    DownloadTray.addWindow(this);
  }
  public static fromWebContents(
    webContents: Electron.WebContents
  ): BaseDownloaderWindow | null {
    return DownloaderWindow.fromWebContents(
      webContents
    ) as BaseDownloaderWindow;
  }
  getRealSize() {
    if (fs.existsSync(this.downloadingState.path)) {
      const state = fs.statSync(this.downloadingState.path);
      return state.size;
    }
    return 0;
  }

  pipe(): internal.Writable {
    if (this.stream && !this.stream.destroyed)
      throw new Error("there is unclosed stream file");
    this.stream = fs.createWriteStream(this.downloadingState.path, {
      flags: this.flag,
    });
    this.stream.on("error", (err) => this.error(err));
    this.curStream.on("end", () => {
      this.stream!.once("finish", () => {
        this.end();
      });
    });
    this.curStream.pipe(this.stream);
    return this.curStream;
  }

  setThrottleSpeed(speed: number) {
    this.downloadSpeed = speed;
    this.setThrottleState(this.enableThrottle);
  }
  setThrottleState(state: boolean) {
    this.enableThrottle = state;
    this.resetSpeed();
    this.curStream.setSpeed(
      state ? Math.max(1024, this.downloadSpeed) : Number.MAX_SAFE_INTEGER
    );
  }
  trigger(state: boolean) {
    super.trigger(state);
    if (state) this.setPauseButton("Pause");
    else this.setPauseButton("Start");

    this.curStream.trigger(state);
  }
  cancel() {
    if (fs.existsSync(this.downloadingState.path))
      fs.unlinkSync(this.downloadingState.path);
    this.close();
  }
  setPauseButton(state: "Pause" | "Start", enabled = true) {
    this.pageData.footer.pause.text = state;
    this.pageData.footer.pause.enabled = enabled;
    this.onSetPageData(this.pageData);
  }
  private onSetPageData(pageData: ProgressData) {
    if (this.isDestroyed()) return;
    this.webContents.send("onSetPageData", pageData);
  }
}
