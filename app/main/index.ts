import { createWindow } from "./helpers";
import { HandleMethods, OnMethods } from "./lib";
import { ObjectEntries } from "@utils/index";
import { app, ipcMain } from "electron";
const isProd = process.env.NODE_ENV === "production";

(async () => {
    if (!isProd) {
        app.setPath("userData", `${app.getPath("userData")} (development)`);
    }

    app.whenReady().then(async () => {
        const mainWindow = await createWindow({
            width: 1000,
            height: 600,
        });
    });
    app.on("window-all-closed", () => {
        app.quit();
    });
    ObjectEntries(OnMethods).forEach(([key, val]) => {
        ipcMain.on(key, val);
    });
    ObjectEntries(HandleMethods).forEach(([key, val]) => {
        ipcMain.handle(key, val);
    });
    // ObjectEntries(OnceMethods).forEach(([key, val]) => {
    //     ipcMain.once(key, val);
    // });
    // ObjectEntries(HandleOnceMethods).forEach(([key, val]) => {
    //     ipcMain.handleOnce(key, val);
    // });
})();
