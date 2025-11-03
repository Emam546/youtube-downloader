import { createWindow } from "@app/main/lib/progressBar/createWindow";
import { BrowserWindow } from "electron";
import { Downloader } from "./downloader";
import { VideoDataClippedType } from "@utils/server";
import { Plugins } from "../lib/plugins";

export async function DownloadVideo<T>(
  e: Electron.IpcMainEvent,
  data: VideoDataClippedType<T>
) {
  const progressBarData = Plugins.find((d) => d.PATH == data.PATH)?.download;
  if (!progressBarData) throw new Error("Undefined Window");
  const window = BrowserWindow.fromWebContents(e.sender);
  if (!window) throw new Error("Undefined Window");
  const state = await Downloader(data, window);
  if (!state) return;
  createWindow<T>(
    {
      stateData: state,
      preloadData: {
        path: state.path,
        link: data.previewLink,
        video: {
          title: data.title,
          previewLink: data.previewLink,
        },
      },
    },
    (args) => progressBarData({ data: data, ...args })
  );
}
