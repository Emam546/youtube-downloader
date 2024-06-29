import path from "path";
import { app, ipcMain } from "electron";
import { createWindow } from "./helpers";
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

    (async () => {
        await app.whenReady();
        const mainWindow = createWindow("main", {
            width: 1000,
            height: 600,
            webPreferences: {
                preload: path.join(__dirname, "../preload/index.js"),
            },
        });
        
        if (isProd) {
            if (appServe)
                appServe(mainWindow).then(() => {
                    mainWindow.loadURL("app://-");
                });
        } else {
            const port = process.argv[2];
            await mainWindow.loadURL(`http://localhost:3000`);
            // mainWindow.webContents.openDevTools();
            mainWindow.webContents.on("did-fail-load", (e, code, desc) => {
                mainWindow.webContents.reloadIgnoringCache();
            });
        }
    })();

    app.on("window-all-closed", () => {
        app.quit();
    });

    ipcMain.on("message", async (event, arg) => {
        event.reply("message", `${arg} World!`);
    });
})();
