import "./Non-Clipped";
import { BrowserWindowConstructorOptions, shell } from "electron";
import path from "path";
import { is } from "@electron-toolkit/utils";
import { ProgressBarState, Context } from "@shared/renderer/progress";
import { StateType } from "@app/main/lib/main/downloader";
import { convertFunc } from "@utils/app";
import { FfmpegCutterWindow } from "@app/main/lib/progressBar/ffmpeg";
import { DownloadTray } from "@app/main/lib/progressBar/tray";
export interface ClippedData {
    start: number;
    end: number;
}
export interface Props {
    clippedData: ClippedData;
    preloadData: Omit<ProgressBarState, "status">;
    stateData: StateType;
}

export const createClippedProgressBarWindow = async (
    vars: Props,
    options?: BrowserWindowConstructorOptions
): Promise<FfmpegCutterWindow> => {
    const stateData = vars.preloadData;
    const preloadData: Context = {
        ...stateData,
        status: "connecting",
        throttle: false,
        downloadSpeed: 1024 * 50,
    };
    const win = new FfmpegCutterWindow(
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
        vars.stateData,
        vars.preloadData,
        {
            duration: vars.clippedData.end - vars.clippedData.start,
            start: vars.clippedData.start,
        }
    );
    win.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url);
        return { action: "deny" };
    });

    win.enableThrottle = preloadData.throttle;
    win.downloadSpeed = preloadData.downloadSpeed;
    if (is.dev) {
        await win.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}/progress`);
        win.webContents.openDevTools();
    } else await win.loadFile(path.join(__dirname, "../windows/progress.html"));
    win.show();
    win.download();
    DownloadTray.addWindow(win);
    return win;
};
