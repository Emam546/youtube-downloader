import "./helpers/ipcMain";
import { createMainWindow } from "./helpers/create-window/main";
import { app } from "electron";
import { autoUpdater } from "electron-updater";
const isProd = app.isPackaged;
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

if (!isProd) {
    app.setPath("userData", `${app.getPath("userData")} (development)`);
}

app.whenReady().then(async () => {
    await createMainWindow({
        width: 1000,
        height: 600,
    });
    if (isProd) autoUpdater.checkForUpdatesAndNotify();
});
app.on("window-all-closed", () => {
    app.quit();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
