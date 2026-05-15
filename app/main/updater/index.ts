import { app } from "electron";
// import { autoUpdater } from "electron-updater";
import { createUpdateWindow } from "@app/main/lib/update";
import AppUpdater from "./AppUpdater";
import PackageJson from "../../../package.json";
import { MainWindow } from "../lib/main/window";
import { logger } from "../helpers/logger";
logger.info(`Version ${PackageJson.version}`);
const autoUpdater = new AppUpdater({
  owner: PackageJson.publish.owner,
  releaseType: PackageJson.publish.releaseType as "release",
  repo: PackageJson.publish.repo,
});
app.whenReady().then(async () => {
  autoUpdater.on("error", (e) => logger.err(e));
  logger.info("checking for update");
  autoUpdater.checkForUpdates();
});
autoUpdater.once("update-available", (update) => {
  logger.info("update available", update.tag_name);
  logger.info("Download the update");
  autoUpdater.downloadUpdate(update).then((asset) => {
    if (!asset) return;
    autoUpdater.once("updater-downloaded", (savedFilePath) => {
      logger.info("update finished");
      autoUpdater.quitAndInstall(savedFilePath);
    });
  });
  autoUpdater.once("metadata", async (metadata) => {
    logger.info("start downloading");
    MainWindow.Window?.hide();
    const win = await createUpdateWindow({
      preloadData: {
        curSize: 0,
        fileSize: metadata.size,
        message: "Downloading the update ...",
      },
    });
    autoUpdater.on("error", (e) => {
      win.error(e);
    });
    autoUpdater.on("updater-downloaded", () => {
      win.end();
    });
    autoUpdater.on("size", (size: number) => {
      win.setCurSize(size);
    });
  });
});
autoUpdater.once("update-not-available", () => {
  logger.info("update not available");
});
export default autoUpdater;
