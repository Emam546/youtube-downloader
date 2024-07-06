import {
    BrowserWindow,
    BrowserWindowConstructorOptions,
    ipcMain,
    shell,
} from "electron";
import path from "path";
import { is } from "@electron-toolkit/utils";
import { ProgressBarState, Context } from "@shared/renderer/progress";
import { StateType } from "@app/main/lib/main/downloader";
import { HandleMethods, OnMethods } from "@app/main/lib/progressBar";
import { ObjectEntries } from "@utils/index";
import { convertFunc } from "@utils/app";
import { FileDownloaderWindow } from "@app/main/lib/progressBar/window";
export interface Props {
    preloadData: Omit<ProgressBarState, "status">;
    stateData: StateType;
}
export const createProgressBarWindow = async (
    vars: Props,
    options?: BrowserWindowConstructorOptions
): Promise<BrowserWindow> => {
    const stateData = vars.preloadData;
    const preloadData: Context = {
        ...stateData,
        status: "connecting",
        throttle: true,
        downloadSpeed: 1,
    };
    const win = new FileDownloaderWindow(
        {
            icon: "build/icon.ico",
            useContentSize: true,
            show: false,
            autoHideMenuBar: true,
            height: 270,
            width: 550,
            resizable: true,
            fullscreenable: false,
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
        },
        vars.stateData,
        vars.preloadData
    );
    win.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url);
        return { action: "deny" };
    });

    win.enableThrottle = preloadData.throttle;
    win.downloadSpeed = preloadData.downloadSpeed;
    win.on("ready-to-show", () => {
        win.show();
        win.download();
    });
    if (is.dev) {
        await win.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}/progress`);
    } else await win.loadFile(path.join(__dirname, "../windows/progress.html"));

    return win;
};
ObjectEntries(OnMethods).forEach(([key, val]) => {
    ipcMain.on(key, val);
});

ObjectEntries(HandleMethods).forEach(([key, val]) => {
    ipcMain.handle(key, val);
});
