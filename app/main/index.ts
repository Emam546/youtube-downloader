import { createMainWindow } from "./helpers/create-window/main";
import { app } from "electron";
import "./helpers/ipcMain";
const isProd = app.isPackaged;

if (!isProd) {
    app.setPath("userData", `${app.getPath("userData")} (development)`);
}

app.whenReady().then(async () => {
    createMainWindow({
        width: 1000,
        height: 600,
    });
});
app.on("window-all-closed", () => {
    app.quit();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
