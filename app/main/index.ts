import "./helpers/ipcMain";
import { createMainWindow } from "./helpers/create-window/main";
import { app, BrowserWindow } from "electron";
import { autoUpdater } from "electron-updater";
import { electronApp } from "@electron-toolkit/utils";
import { lunchArgs } from "./helpers/launchHelpers";
import path from "path";
let mainWindow: BrowserWindow;
const isProd = app.isPackaged;
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;
if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient("youtube-downloader", process.execPath, [
            path.resolve(process.argv[1]),
        ]);
    }
} else app.setAsDefaultProtocolClient("youtube-downloader");

if (!isProd) {
    app.setPath("userData", `${app.getPath("userData")} (development)`);
}

app.whenReady().then(async () => {
    mainWindow = await createMainWindow({
        width: 1000,
        height: 600,
    });

    lunchArgs(process.argv, mainWindow);
    if (isProd) autoUpdater.checkForUpdatesAndNotify();
});
electronApp.setAppUserModelId("com.youtube-downloader");

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) app.quit();
else
    app.on("second-instance", (_, argv) => {
        //User requested a second instance of the app.
        //argv has the process.argv arguments of the second instance.
        if (app.hasSingleInstanceLock() && argv.length >= 2 && mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
            lunchArgs(argv, mainWindow);
        }
    });

app.on("window-all-closed", () => {
    app.quit();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
