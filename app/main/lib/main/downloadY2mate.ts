import { createClippedProgressBarWindow } from "@app/main/helpers/create-window/Cliped";
import { createProgressBarWindow } from "@app/main/helpers/create-window/Non-Clipped";
import { BrowserWindow } from "electron";
import { Downloader } from "./downloader";
import { DataClipped } from "@serv/routes/videoDownloader/api";

export async function DownloadY2mate(
    e: Electron.IpcMainEvent,
    data: DataClipped
) {
    const window = BrowserWindow.fromWebContents(e.sender);
    if (!window) throw new Error("Undefined Window");
    const state = await Downloader(data, window);
    if (!state) return;
    if (data.clipped) {
        createClippedProgressBarWindow({
            stateData: state,
            preloadData: {
                path: state.path,
                link: data.dlink,
                video: {
                    title: data.title,
                    vid: data.vid,
                },
            },
            clippedData: { end: data.end, start: data.start },
        });
    } else
        createProgressBarWindow({
            stateData: state,
            preloadData: {
                path: state.path,
                link: data.dlink,
                video: {
                    title: data.title,
                    vid: data.vid,
                },
            },
        });
}
