import { BrowserWindowConstructorOptions, ipcMain, shell } from "electron";
import path from "path";
import { is } from "@electron-toolkit/utils";
import { ProgressBarState, Context } from "@shared/renderer/progress";
import { StateType } from "@app/main/lib/main/downloader";
import { HandleMethods, OnMethods } from "@app/main/lib/progressBar";
import { ObjectEntries } from "@utils/index";
import { convertFunc } from "@utils/app";
import {
    defaultPageData,
    DownloadingStatus,
} from "@app/main/lib/progressBar/window";
import { DownloadTray } from "@app/main/lib/progressBar/tray";
import { FileDownloaderWindow } from "@app/main/lib/progressBar/directDownlaod";
export interface Props {
    preloadData: Omit<ProgressBarState, "status">;
    stateData: StateType;
    downloadingStatus?: DownloadingStatus;
}
export const createProgressBarWindow = async (
    vars: Props,
    options?: BrowserWindowConstructorOptions
): Promise<FileDownloaderWindow> => {
    const stateData = vars.preloadData;
    const preloadData: Context = {
        ...stateData,
        status: "connecting",
        throttle: vars.downloadingStatus?.enableThrottle || false,
        downloadSpeed: vars.downloadingStatus?.downloadSpeed || 1024 * 50,
        pageData: defaultPageData,
    };
    const win = new FileDownloaderWindow(
        {
            icon: "build/icon.ico",
            useContentSize: true,
            show: false,
            autoHideMenuBar: true,
            height: 270,
            width: 550,
            frame: false,
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
        {
            fileStatus: vars.stateData,
            downloadingStatus: {
                downloadSpeed: preloadData.downloadSpeed,
                enableThrottle: preloadData.throttle,
            },
            videoData: { link: preloadData.link, video: preloadData.video },
            pageData: preloadData.pageData,
        }
    );
    win.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url);
        return { action: "deny" };
    });

    if (is.dev) {
        await win.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}/progress`);
        win.webContents.openDevTools();
    } else await win.loadFile(path.join(__dirname, "../windows/progress.html"));
    win.show();
    win.download();
    DownloadTray.addWindow(win);
    return win;
};
ObjectEntries(OnMethods).forEach(([key, val]) => {
    ipcMain.on(key, val);
});

ObjectEntries(HandleMethods).forEach(([key, val]) => {
    ipcMain.handle(key, val);
});