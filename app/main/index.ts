import "./pre-start";
import "./helpers/ipcMain";
import "./updater";
import { createMainWindow } from "./lib/main";
import { app } from "electron";
import { electronApp } from "@electron-toolkit/utils";
import { lunchArgs } from "./helpers/launchHelpers";
import path from "path";
import { MainWindow } from "./lib/main/window";

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("youtube-downloader", process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else app.setAsDefaultProtocolClient("youtube-downloader");

if (!app.isPackaged) {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}
async function createWindow(args: string[]) {
  const data = lunchArgs(args);
  return await createMainWindow(
    {},
    data ? { video: { link: data.youtubeLink } } : undefined
  );
}
app.whenReady().then(async () => {
  await createWindow(process.argv);
});
electronApp.setAppUserModelId("com.youtube-downloader");

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) app.quit();
else
  app.on("second-instance", (_, argv) => {
    //User requested a second instance of the app.
    //argv has the process.argv arguments of the second instance.
    if (!app.hasSingleInstanceLock()) return;
    if (MainWindow.Window) {
      if (MainWindow.Window.isMinimized()) MainWindow.Window.restore();
      MainWindow.Window.focus();
      if (argv.length >= 2) {
        const data = lunchArgs(argv);
        if (data)
          MainWindow.Window.webContents.send("getYoutubeUrl", data.youtubeLink);
      }
    } else createWindow(argv);
  });

app.on("window-all-closed", () => {
  app.quit();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
export default app;
