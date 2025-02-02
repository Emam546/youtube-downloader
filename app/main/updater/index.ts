import { app } from "electron";
// import { autoUpdater } from "electron-updater";
import { createUpdateWindow } from "@app/main/lib/update";
import AppUpdater from "./AppUpdater";
import PackageJson from "../../../package.json";
import { isProd } from "../utils";
import { MainWindow } from "../lib/main/window";
console.log("Version", PackageJson.version);
const autoUpdater = new AppUpdater({
  owner: PackageJson.publish.owner,
  releaseType: PackageJson.publish.releaseType as any,
  repo: PackageJson.publish.repo,
});
app.whenReady().then(async () => {
  autoUpdater.on("error", (e) => console.error(e));
  console.log("checking fro update");
  autoUpdater.checkForUpdates();
});
autoUpdater.once("update-available", (update) => {
  console.log("update available", update.tag_name);
  console.log("Download the update");
  autoUpdater.downloadUpdate(update).then((asset) => {
    console.log(asset?.name);
    autoUpdater.once("updater-downloaded", (savedFilePath) => {
      console.log("update finished");
      autoUpdater.quitAndInstall(savedFilePath);
    });
  });
  autoUpdater.once("metadata", async (metadata) => {
    console.log("start downloading");
    await createUpdateWindow({
      preloadData: {
        curSize: 0,
        fileSize: metadata.size,
      },
      autoUpdater: autoUpdater,
    });
  });
  MainWindow.Window?.hide();
});
autoUpdater.once("update-not-available", () => {
  console.log("update not available");
});
export default autoUpdater;
