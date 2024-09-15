import { app } from "electron";
// import { autoUpdater } from "electron-updater";
import { createUpdateWindow } from "@app/main/lib/update";
import AppUpdater from "./AppUpdater";
import PackageJson from "../../../package.json";
import { isProd } from "../utils";
console.log("Version", PackageJson.version);
const autoUpdater = new AppUpdater({
  owner: PackageJson.publish.owner,
  releaseType: PackageJson.publish.releaseType as any,
  repo: PackageJson.publish.repo,
});
app.whenReady().then(async () => {
  autoUpdater.on("error", (e) => console.error(e));
  if (isProd) autoUpdater.checkForUpdates();
});
autoUpdater.once("update-available", (update) => {
  console.log("update available");
  autoUpdater.once("progress", async (info) => {
    console.log("start downloading");
    await createUpdateWindow({
      preloadData: {
        curSize: info.chunk.length,
        fileSize: info.remainingSize + info.chunk.length,
      },
      autoUpdater: autoUpdater,
    });
  });
  app.once("before-quit", () => {
    console.log("Download the update");
    autoUpdater.downloadUpdate(update).then((asset) => {
      console.log(asset?.name);
      autoUpdater.once("updater-downloaded", (report) => {
        console.log("update finished");
        app.removeAllListeners("before-quit");
        if (!report.filePath) return;
        autoUpdater.quitAndInstall(report.filePath);
      });
    });
  });
  app.on("before-quit", (e) => {
    e.preventDefault();
  });
});
export default autoUpdater;
