import { BrowserWindow, BrowserWindowConstructorOptions, shell } from "electron";
import path from "path";
import { is } from "@electron-toolkit/utils";
import { Context } from "@shared/renderer/finish";
import { convertFunc } from "@utils/app";
import { DownloadingWindow } from "@app/main/lib/donwloading";
export interface Props {
    preloadData: Context;
}
export const createFinishWindow = async (
    vars: Props,
    options?: BrowserWindowConstructorOptions
): Promise<BrowserWindow> => {
    const stateData = vars.preloadData;
    const preloadData: Context = {
        ...stateData,
    };
    const win = new DownloadingWindow({
        icon: "build/icon.ico",
        useContentSize: true,
        show: false,
        autoHideMenuBar: true,
        resizable: false,
        fullscreenable: false,
        height: 270,
        width: 550,
        ...options,
        webPreferences: {
            ...options?.webPreferences,
            sandbox: false,
            preload: path.join(__dirname, "../preload/index.js"),
            additionalArguments: [
                convertFunc(
                    encodeURIComponent(JSON.stringify(preloadData)),
                    "data"
                ),
            ],
        },
    });
    win.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url);
        return { action: "deny" };
    });
    if (is.dev) {
        await win.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}/finish`);
    } else await win.loadFile(path.join(__dirname, "../windows/finish.html"));
    win.show();
    win.moveTop();
    return win;
};
// ObjectEntries(OnMethods).forEach(([key, val]) => {
//     ipcMain.on(key, val);
// });

// ObjectEntries(HandleMethods).forEach(([key, val]) => {
//     ipcMain.handle(key, val);
// });
