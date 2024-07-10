import "./helpers/ipcMain";
import { createMainWindow } from "./helpers/create-window/main";
import { app } from "electron";
import { autoUpdater } from "electron-updater";
import { electronApp } from "@electron-toolkit/utils";
import { lunchArgs } from "./helpers/launchHelpers";
import path from "path";
import { MainWindow } from "./lib/main/window";
import { createProgressBarWindow } from "./helpers/create-window/progress-bar";
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
async function createWindow(args: string[]) {
    const data = lunchArgs(args);
    return await createMainWindow(
        {},
        data ? { video: { link: data.youtubeLink } } : undefined
    );
}
app.whenReady().then(async () => {
    await createWindow(process.argv);
    if (!isProd) {
        const win = await createProgressBarWindow({
            preloadData: {
                link: "http://localhost:4001/example.mov",
                path: "newExample.env",
                video: {
                    title: "Title",
                    vid: "id",
                },
            },
            stateData: {
                path: "newExample.env",
                continued: false,
            },
        });
        win.setThrottleState(true);
        win.setThrottleSpeed(10 * 1024);
    }
    if (isProd) autoUpdater.checkForUpdatesAndNotify();
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
                    MainWindow.Window.webContents.send(
                        "getYoutubeUrl",
                        data.youtubeLink
                    );
            }
        } else createWindow(argv);
    });

app.on("window-all-closed", () => {
    app.quit();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
