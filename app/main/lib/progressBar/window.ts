import {
  Context,
  ProgressBarState,
  ProgressData,
} from "@shared/renderer/progress";
import { StateType } from "@app/main/lib/main/utils/downloader";
import fs, { WriteStream } from "fs-extra";
import { BrowserWindowConstructorOptions } from "electron";
import { DownloaderWindow } from "../donwloading";
import { ModifiedThrottle } from "./utils";
import internal from "stream";
import { DownloadTray } from "./tray";
import path from "path";
import { convertFunc } from "@utils/app";
import type { DownloadBase, WindowData } from "@scripts/utils/Bases";
import { getHistoryManager, DownloadStatus } from "../downloadHistory";
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
    options?: { end?: boolean | undefined },
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
  historyData: {
    url: string;
    title: string;
    thumbnail: string;
    format: string;
    quality: string;
  };
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
export interface BrowserProps extends BrowserWindowConstructorOptions {
  preloadData: Context;
}

export class BaseDownloaderWindow<T> extends DownloaderWindow {
  downloader: DownloadBase<T>;
  public static readonly MAX_TRIES = 3;
  pageData: ProgressData;
  public flag: FlagType;
  private stream?: WriteStream;
  private curStream?: ModifiedThrottle;
  readonly link: string;
  readonly videoData: VideoData["video"];
  enableThrottle: boolean;
  downloadSpeed: number;
  downloadingState: StateType;
  state: ProgressBarState["status"] = "connecting";
  private historyManager = getHistoryManager();
  public historyId?: string;
  constructor(
    options: BrowserProps,
    downloader: (data: WindowData) => DownloadBase<T>,
    data: DownloaderData,
  ) {
    super({
      icon: "build/icon.ico",
      useContentSize: true,
      show: false,
      autoHideMenuBar: true,
      height: 270,
      width: 550,
      frame: false,
      resizable: false,
      fullscreenable: false,
      ...options,
      webPreferences: {
        ...options?.webPreferences,
        sandbox: false,
        preload: path.join(__dirname, "../preload/index.js"),
        additionalArguments: [
          convertFunc(
            encodeURIComponent(JSON.stringify(options.preloadData)),
            "data",
          ),
        ],
      },
    });

    this.enableThrottle = data.downloadingStatus.enableThrottle;
    this.downloadSpeed = data.downloadingStatus.downloadSpeed;

    this.pageData = data.pageData;
    this.flag =
      data.fileStatus.continued && fs.existsSync(data.fileStatus.path)
        ? "a"
        : "w";
    this.downloadingState = data.fileStatus;
    this.link = data.videoData.link;
    this.videoData = data.videoData.video;
    this.downloader = downloader({
      downloadingState: this.downloadingState,
    });

    this.downloader.on("setPauseButton", this.setPauseButton.bind(this));
    this.downloader.on("setFileSize", this.setFileSize.bind(this));
    this.downloader.on("changeState", this.changeState.bind(this));
    this.downloader.on("end", this.end.bind(this));
    this.downloader.on("setThrottleState", this.setThrottleState.bind(this));
    this.downloader.on("onGetChunk", this.onGetChunk.bind(this));
    this.downloader.on("resetSpeed", this.resetSpeed.bind(this));
    // this.downloader.on("error", this.error.bind(this));
    this.on("close", () => {
      if (this.curStream && !this.curStream.closed) this.curStream.destroy();
      this.downloader.close();
      if (this.historyId) {
        this.historyManager.untrackDownload(this.historyId);
      }
    });
    DownloadTray.addWindow(this);

    // Initialize history tracking
    this.initializeHistoryTracking(data);
  }

  private initializeHistoryTracking(data: DownloaderData) {
    this.historyId = this.historyManager.createHistoryItem(
      data.historyData.url,
      data.historyData.title,
      data.historyData.thumbnail,
      data.historyData.format,
      data.historyData.quality,
      this.id,
    ).id;
    this.historyManager.trackDownload(this.historyId, this);
    this.historyManager.updateStatus(this.historyId, "preparing");
  }
  public static fromWebContents(
    webContents: Electron.WebContents,
  ): BaseDownloaderWindow<unknown> | null {
    return DownloaderWindow.fromWebContents(
      webContents,
    ) as BaseDownloaderWindow<unknown>;
  }
  async download() {
    this.downloader
      .download((p) => this.pipe(p))
      .then(() => this.end())
      .catch((e) => this.error(e));
  }
  getRealSize() {
    if (fs.existsSync(this.downloadingState.path)) {
      const state = fs.statSync(this.downloadingState.path);
      return state.size;
    }
    return 0;
  }

  pipe(path: string): internal.Writable {
    this.curStream = new ModifiedThrottle({
      bps: this.enableThrottle
        ? Math.max(1024, this.downloadSpeed)
        : Number.MAX_SAFE_INTEGER,
      writableHighWaterMark: 1024 * 5,
      delayTime: 5000,
    });
    this.curStream.on("reset-speed", () => {
      this.resetSpeed();
    });
    this.curStream.on("delayed-pause", () => {
      if (this.state == "receiving") this.changeState("connecting");
    });
    this.curStream.on("data", (data: Buffer) =>
      this.onGetChunk(data.byteLength),
    );
    if (this.stream && !this.stream.destroyed)
      throw new Error("there is unclosed stream file");

    this.stream = fs.createWriteStream(path, {
      flags: this.flag,
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
    this.curStream?.setSpeed(
      state ? Math.max(1024, this.downloadSpeed) : Number.MAX_SAFE_INTEGER,
    );
  }
  trigger(state: boolean) {
    super.trigger(state);
    if (state) this.setPauseButton("Pause");
    else this.setPauseButton("Start");
    this.curStream?.trigger(state);
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

  // Override parent methods to update history
  changeState(state: ProgressBarState["status"]) {
    super.changeState(state);
    if (this.historyId) {
      const statusMap: Record<ProgressBarState["status"], DownloadStatus> = {
        connecting: "connecting",
        receiving: "downloading",
        pause: "paused",
        completed: "completed",
        rebuilding: "downloading",
      };
      this.historyManager.updateStatus(
        this.historyId,
        statusMap[state] || "downloading",
      );
    }
  }

  onGetChunk(size: number) {
    super.onGetChunk(size);
    if (this.historyId) {
      const progress = this.fileSize ? (this.curSize / this.fileSize) * 100 : 0;
      // Calculate speed and ETA for history tracking
      const now = Date.now();
      const elapsedSeconds = Math.ceil((now - this.startTime) / 1000);
      const speed =
        elapsedSeconds > 0
          ? Math.round(this.speedTransfer / elapsedSeconds)
          : 0;
      const eta =
        speed > 0 && this.fileSize
          ? (this.fileSize - this.curSize) / speed
          : undefined;
      this.historyManager.updateProgress(
        this.historyId,
        progress,
        this.curSize,
        this.fileSize,
        speed,
        eta,
      );
    }
  }

  end() {
    super.end();
    if (this.historyId) {
      this.historyManager.updateStatus(this.historyId, "completed");
      this.historyManager.updateFilePath(
        this.historyId,
        this.downloadingState.path,
      );
      this.historyManager.untrackDownload(this.historyId);
    }
  }

  setResumability(state: boolean) {
    super.setResumability(state);
    if (this.historyId) {
      this.historyManager.updateResumability(this.historyId, state);
    }
  }

  setFileSize(size?: number) {
    super.setFileSize(size);
    if (this.historyId && size) {
      this.historyManager.updateProgress(this.historyId, 0, 0, size);
    }
  }

  error(err: Error) {
    super.error(err);
    if (this.historyId) {
      this.historyManager.setError(this.historyId, err.message);
      this.historyManager.untrackDownload(this.historyId);
    }
  }
}
