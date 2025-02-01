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
    autoUpdater.on("error", (e) => {
      this.error(e);
    });
    autoUpdater.on("updater-downloaded", () => {
      this.end();
    });
    autoUpdater.on("size", (size: number) => {
      this.setCurSize(size);
    });
  }
}
