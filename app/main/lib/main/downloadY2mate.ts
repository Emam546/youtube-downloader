import { createClippedProgressBarWindow } from "@app/main/lib/progressBar/ffmpeg";
import { createProgressBarWindow } from "@app/main/lib/progressBar/linkDownload";
import { BrowserWindow } from "electron";
import { Downloader } from "./downloader";
import { DataClipped } from "@serv/routes/videoDownloader/api";
export type DownloadY2mate = (
  e: Electron.IpcMainEvent,
  data: DataClipped
) => Promise<boolean>;
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
