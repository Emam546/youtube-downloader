import axios from "axios";
import { app } from "electron";
import { EventEmitter } from "stream";
import semver from "semver";
import fs from "fs";
import { Downloader, DownloaderReport } from "nodejs-file-downloader";
import cproc from "child_process";
import path from "path";
export interface Data {
  owner: string;
  releaseType: "release" | "draft" | "both";
  repo: string;
}
process.platform;
export const PlatForms: Record<NodeJS.Process["platform"], RegExp> = {
  aix: /.+/,
  android: /.+/,
  darwin: /.+/,
  freebsd: /.+/,
  haiku: /.+/,
  linux: /.+/,
  openbsd: /.+/,
  sunos: /.+/,
  win32: /win/,
  cygwin: /.+/,
  netbsd: /.+/,
};
export interface ProgressData {
  percentage: string;
  remainingSize: number;
  chunk: Buffer;
}
export default interface AppUpdater {
  addListener(event: "update-not-available", listener: () => void): this;
  on(event: "update-not-available", listener: () => void): this;
  once(event: "update-not-available", listener: () => void): this;
  prependListener(event: "update-not-available", listener: () => void): this;
  prependOnceListener(
    event: "update-not-available",
    listener: () => void
  ): this;
  removeListener(event: "update-not-available", listener: () => void): this;
  //update-downloaded
  addListener(event: "error", listener: (error: unknown) => void): this;
  on(event: "error", listener: (error: unknown) => void): this;
  once(event: "error", listener: (error: unknown) => void): this;
  prependListener(event: "error", listener: (error: unknown) => void): this;
  prependOnceListener(event: "error", listener: (error: unknown) => void): this;
  removeListener(event: "error", listener: (error: unknown) => void): this;

  addListener(
    event: "updater-downloaded",
    listener: (report: DownloaderReport) => void
  ): this;
  on(
    event: "updater-downloaded",
    listener: (report: DownloaderReport) => void
  ): this;
  once(
    event: "updater-downloaded",
    listener: (report: DownloaderReport) => void
  ): this;
  prependListener(
    event: "updater-downloaded",
    listener: (report: DownloaderReport) => void
  ): this;
  prependOnceListener(
    event: "updater-downloaded",
    listener: (report: DownloaderReport) => void
  ): this;
  removeListener(
    event: "updater-downloaded",
    listener: (report: DownloaderReport) => void
  ): this;

  addListener(
    event: "progress",
    listener: (progress: ProgressData) => void
  ): this;

  on(event: "progress", listener: (progress: ProgressData) => void): this;
  once(event: "progress", listener: (progress: ProgressData) => void): this;
  prependListener(
    event: "progress",
    listener: (progress: ProgressData) => void
  ): this;
  prependOnceListener(
    event: "progress",
    listener: (progress: ProgressData) => void
  ): this;
  removeListener(
    event: "progress",
    listener: (progress: ProgressData) => void
  ): this;

  addListener(
    event: "update-available",
    listener: (update: Release) => void
  ): this;

  on(event: "update-available", listener: (update: Release) => void): this;
  once(event: "update-available", listener: (update: Release) => void): this;
  prependListener(
    event: "update-available",
    listener: (update: Release) => void
  ): this;
  prependOnceListener(
    event: "update-available",
    listener: (update: Release) => void
  ): this;
  removeListener(
    event: "update-available",
    listener: (update: Release) => void
  ): this;
}

export default class AppUpdater extends EventEmitter {
  data: Data;
  update?: Release;
  public hasUpdate: boolean = false;
  constructor(data: Data) {
    super();
    this.data = data;
    this.on("update-available", (update) => {
      this.update = update;
    });
  }
  async checkForUpdates() {
    const response = await axios.get<Releases>(
      `https://api.github.com/repos/${this.data.owner}/${this.data.repo}/releases`
    );
    const update = response.data.find((release) => {
      return !semver.gte(app.getVersion(), release.tag_name);
    });
    if (!update) {
      this.hasUpdate = false;
      return this.emit("update-not-available");
    } else {
      this.emit("update-available", update);
      this.hasUpdate = true;
      return update;
    }
  }
  getWindowsName(update: Release) {
    return update.assets.find((asset) => asset.name.includes("win"));
  }
  async downloadUpdate(update: Release) {
    const directory = app.getPath("temp");
    const regEx = PlatForms[process.platform];
    const asset = update.assets.find((asset) => regEx.test(asset.name));
    if (!asset) return null;
    const filename = `${path.basename(asset.name)}-upgrade${path.extname(
      asset.name
    )}`;
    const downloader = new Downloader({
      url: asset.browser_download_url,
      directory: directory,
      fileName: filename,
      cloneFiles: false,
      maxAttempts: 0,
      onProgress: (percentage, chunk, remainingSize) => {
        this.emit("progress", { percentage, chunk, remainingSize });
      },
      onError: (e) => {
        console.log(e);
        this.emit("error", e);
      },
    });
    downloader.download().then((download) => {
      this.emit("updater-downloaded", download);
    });
    return asset;
  }
  quitAndInstall(setupPath: string) {
    if (fs.existsSync(setupPath)) {
      cproc
        .spawn(setupPath, ["/SILENT"], {
          detached: true,
          stdio: ["ignore", "ignore", "ignore"],
        })
        .unref();

      app.quit();
    }
  }
}
