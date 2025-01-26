import { createClippedProgressBarWindow } from "@app/main/lib/progressBar/ffmpgeCutter";
import { createProgressBarWindow } from "@app/main/lib/progressBar/linkDownload";
import { BrowserWindow } from "electron";
import { Downloader } from "./downloader";
import { VideoDataClippedType } from "@serv/routes/videoDownloader/api";

export async function DownloadVideoLink(
  e: Electron.IpcMainEvent,
  data: VideoDataClippedType
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
          previewLink: data.previewLink,
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
          previewLink: data.previewLink,
        },
      },
    });
}
