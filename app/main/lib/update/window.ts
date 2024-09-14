import { BrowserWindowConstructorOptions } from "electron";
import { DownloaderWindow } from "../donwloading";
import AppUpdater from "@app/main/updater/AppUpdater";
export class UpdaterWindow extends DownloaderWindow {
  autoUpdater: AppUpdater;
  constructor(
    options: BrowserWindowConstructorOptions,
    autoUpdater: AppUpdater
  ) {
    super(options);
    this.autoUpdater = autoUpdater;
    autoUpdater.on("error", () => {
      this.close();
    });
    autoUpdater.on("updater-downloaded", () => {
      this.close();
    });
    autoUpdater.on("progress", (info) => {
      this.onGetChunk(info.chunk.length);
    });
  }
}
