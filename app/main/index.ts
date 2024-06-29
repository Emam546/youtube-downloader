import path from "path";
import { app, ipcMain } from "electron";
import { createWindow } from "./helpers";
import {
    HandleMethods,
    HandleOnceMethods,
    OnMethods,
    OnceMethods,
} from "./lib";
import { ObjectEntries } from "@utils/index";
(async () => {
    const serve = await import("electron-serve").then((d) => d.default);
    const isProd = process.env.NODE_ENV === "production";
    const appServe = isProd
        ? serve({
              directory: path.join(__dirname, "../out"),
          })
        : null;
    if (!isProd) {
        app.setPath("userData", `${app.getPath("userData")} (development)`);
    }

    ObjectEntries(OnMethods).forEach(([key, val]) => {
        ipcMain.on(key, val);
    });
    ObjectEntries(HandleMethods).forEach(([key, val]) => {
        ipcMain.handle(key, val);
    });
    app.whenReady().then(async () => {
        const mainWindow = createWindow("main", {
            width: 1000,
            height: 600,
            webPreferences: {
                sandbox: false,
                preload: path.join(__dirname, "../preload/index.js"),
            },
        });
        if (isProd) {
            if (appServe)
                appServe(mainWindow).then(() => {
                    mainWindow.loadURL("app://-");
                });
        } else {
            await mainWindow.loadURL(`http://localhost:3000`);
            mainWindow.webContents.openDevTools();
            mainWindow.webContents.on("did-fail-load", (e, code, desc) => {
                mainWindow.webContents.reloadIgnoringCache();
            });
        }
    });
    app.on("window-all-closed", () => {
        app.quit();
    });

    // ObjectEntries(OnceMethods).forEach(([key, val]) => {
    //     ipcMain.once(key, val);
    // });
    // ObjectEntries(HandleOnceMethods).forEach(([key, val]) => {
    //     ipcMain.handleOnce(key, val);
    // });
})();
