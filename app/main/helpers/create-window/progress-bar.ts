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
import { convertProgressFunc } from "@app/preload/utils/progress";
import { convertFunc } from "@utils/app";
import { FileDownloaderWindow } from "@app/main/lib/progressBar/window";
export interface Props {
    preloadData: ProgressBarState;
    stateData: StateType;
}
export const createProgressBarWindow = async (
    vars: Props,
    options?: BrowserWindowConstructorOptions
): Promise<BrowserWindow> => {
    const stateData = vars.preloadData;
    const preloadData = {
        ...stateData,
        throttle: true,
        downloadSpeed: 1,
    };
    const win = new FileDownloaderWindow(
        {
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
                preload: path.join(__dirname, "../preload/progress.js"),
                additionalArguments: [
                    convertFunc(
                        encodeURIComponent(
                            JSON.stringify(preloadData as Context)
                        ),
                        "data"
                    ),
                ],
            },
        },

        vars.stateData,
        vars.preloadData.link
    );
    win.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url);
        return { action: "deny" };
    });

    win.enableThrottle = preloadData.throttle;
    win.downloadSpeed = preloadData.downloadSpeed;
    if (is.dev) {
        await win.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}/progress`);
        win.show();
        // win.webContents.openDevTools();
    } else
        await win.loadFile(path.join(__dirname, "../windows/progress.html"));

    await win.download();
    return win;
};
ObjectEntries(OnMethods).forEach(([key, val]) => {
    ipcMain.on(convertProgressFunc(key), val);
});

ObjectEntries(HandleMethods).forEach(([key, val]) => {
    ipcMain.handle(convertProgressFunc(key), val);
});
