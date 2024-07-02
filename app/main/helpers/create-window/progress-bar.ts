import {
    BrowserWindow,
    BrowserWindowConstructorOptions,
    ipcMain,
    shell,
} from "electron";
import path from "path";
import { is } from "@electron-toolkit/utils";
import { ProgressBarState } from "@shared/renderer/progress";
import { StateType } from "@app/main/lib/main/downloader";
import { FileDownloader } from "@app/main/lib/progressBar";
import { ObjectEntries } from "@utils/index";
import { convertProgressFunc } from "@app/preload/utils/progress";
import { convertFunc } from "@utils/app";
export interface Props {
    preloadData: ProgressBarState;
    stateData: StateType;
}
export const createProgressBarWindow = async (
    vars: Props,
    options?: BrowserWindowConstructorOptions
): Promise<BrowserWindow> => {
    const stateData = vars.preloadData;
    const win = new BrowserWindow({
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
                stateData.link,
                stateData.title,
                stateData.status,
            ].map((str) => convertFunc(encodeURIComponent(str), "data")),
        },
    });
    win.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url);
        return { action: "deny" };
    });
    const fileDownloader = new FileDownloader(
        vars.stateData,
        vars.preloadData.link,
        win.webContents
    );

    if (is.dev) {
        await win.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}/progress`);
        win.show();
    } else
        await win.loadFile(
            path.join(__dirname, "../progressBar/progress.html")
        );

    await fileDownloader.download();
    ObjectEntries(fileDownloader.OnMethods).forEach(([key, val]) => {
        ipcMain.on(convertProgressFunc(key), val);
    });
    ObjectEntries(fileDownloader.HandleMethods).forEach(([key, val]) => {
        ipcMain.handle(convertProgressFunc(key), val);
    });
    return win;
};
