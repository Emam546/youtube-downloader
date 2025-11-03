import "./ipc";
import { BrowserWindowConstructorOptions, shell } from "electron";
import path from "path";
import { isDev } from "@app/main/utils";
import {
  BaseDownloaderWindow,
  defaultPageData,
  DownloadingStatus,
} from "./window";
import { ProgressBarState, Context } from "@shared/renderer/progress";
import { StateType } from "../main/utils/downloader";
import { DownloadBase, WindowData } from "@scripts/utils/Bases";
export interface Props {
  preloadData: Omit<ProgressBarState, "status">;
  stateData: StateType;
  downloadingStatus?: DownloadingStatus;
}
export const createWindow = async <T>(
  vars: Props,
  downloader: (args: WindowData) => DownloadBase<T>,
  options?: BrowserWindowConstructorOptions
): Promise<BaseDownloaderWindow<T>> => {
  const stateData = vars.preloadData;

  const preloadData: Context = {
    ...stateData,
    status: "connecting",
    throttle: vars.downloadingStatus?.enableThrottle || false,
    downloadSpeed: vars.downloadingStatus?.downloadSpeed || 50 * 1024,
    pageData: defaultPageData,
  };
  const win = new BaseDownloaderWindow(
    {
      preloadData: preloadData,
      ...options,
    },
    downloader,
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
  if (isDev) {
    await win.loadURL(
      `${process.env["ELECTRON_RENDERER_URL"] as string}/progress`
    );
  } else await win.loadFile(path.join(__dirname, "../windows/progress.html"));
  await win.download();
  win.show();
  return win;
};
