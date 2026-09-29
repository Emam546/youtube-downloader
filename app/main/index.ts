import "./pre-start";
import "./helpers/ipcMain";
import autoUpdater from "./updater";
import { createMainWindow } from "./lib/main";
import { app } from "electron";
import { lunchArgs } from "./helpers/launchHelpers";
import path from "path";
import { MainWindow } from "./lib/main/window";
import { fileHandler } from "./lib/FileHandeler";
import { AfterLunch, PrePare } from "./lib/prepare";
import { getHistoryManager } from "./lib/downloadHistory";

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
    data ? { video: { link: data } } : undefined,
  );
}
app.whenReady().then(async () => {

  fileHandler();
  await PrePare();
  // Initialize download history and check for interrupted downloads
  const historyManager = getHistoryManager();
  historyManager.initialize();
  await createWindow(process.argv);
  await AfterLunch();
});

// Set app user model ID after app is ready
app.whenReady().then(() => {
  try {
    app.setAppUserModelId("com.youtube-downloader");
  } catch (error) {
    console.error("Failed to set app user model ID:", error);
  }
});

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) app.quit();
else
  app.on("second-instance", (_, argv) => {
    //User requested a second instance of the app.
    //argv has the process.argv arguments of the second instance.
    if (!app.hasSingleInstanceLock()) return;
    if (MainWindow.Window) {
      if (argv.length >= 2 && lunchArgs(argv)) {
        createWindow(argv);
        return;
      }
      MainWindow.Window.focus();
      if (MainWindow.Window.isMinimized()) MainWindow.Window.restore();
    } else if (!autoUpdater.hasUpdate) createWindow(argv);
  });

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
export default app;
