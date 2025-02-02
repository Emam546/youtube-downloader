import { app } from "electron";
import { EventEmitter } from "stream";
import semver from "semver";
import fs from "fs";
import EasyDl from "easydl";
import cproc from "child_process";
import path from "path";
import { DownloadInstance } from "@serv/util/axios";
export interface Data {
  owner: string;
  releaseType: "release" | "draft" | "both";
  repo: string;
}
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
  percentage: number;
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
  async checkForUpdates(): Promise<Release> {
    const response = await DownloadInstance.get<Releases>(
      `https://api.github.com/repos/${this.data.owner}/${this.data.repo}/releases`
    );
    const update = response.data.find((release) => {
      return semver.gt(release.tag_name, app.getVersion());
    });
    if (!update) {
      this.hasUpdate = false;
      this.emit("update-not-available");
      return response.data.find((release) => {
        return semver.gt(release.tag_name, app.getVersion());
      })!;
    } else {
      this.emit("update-available", update);
      this.hasUpdate = true;
      return update;
    }
  }
  async downloadUpdate(update: Release) {
    const directory = app.getPath("temp");
    const regEx = PlatForms[process.platform];
    const asset = update.assets.find((asset) => regEx.test(asset.name));
    if (!asset) return null;
    const filename = `${path.basename(asset.name)}-upgrade${path.extname(
      asset.name
    )}`;

    const downloader = new EasyDl(
      asset.browser_download_url,
      path.join(directory, filename),
      {
        existBehavior: "ignore",
      }
    );
    downloader.on("metadata", (metadata) => {
      this.emit("metadata", metadata);
    });

    downloader.wait().then(async (state) => {
      if (!state) return;
      this.emit(
        "updater-downloaded",
        downloader.savedFilePath || path.join(directory, filename)
      );
    });
    downloader.on("error", (e) => {
      this.emit("error", e);
    });
    downloader.on("progress", (e) => {
      this.emit("size", e.total.bytes);
    });

    return asset;
  }
  async quitAndInstall(setupPath: string) {
    if (!fs.existsSync(setupPath))
      return console.warn("file doesn't exist", setupPath);
    if (process.platform == "win32") {
      await new Promise<void>((res, rej) => {
        cproc.exec(`${setupPath} /SILENT`, (err, stdout, stderr) => {
          if (!!stdout) console.log(stdout);
          if (!!stderr) console.error(stderr);
          return !!err ? rej(err) : res();
        });
      });
    }
    app.quit();
    app.relaunch();
  }
}
