import { BrowserWindowConstructorOptions } from "electron";
import { ProgressBarState, Context } from "@shared/renderer/progress";
import { StateType } from "@app/main/lib/main/utils/downloader";
import {
  defaultPageData,
  DownloadingStatus,
} from "@app/main/lib/progressBar/window";
import { FileDownloaderWindow } from "./window";
import { createWindow } from "../createWindow";
export interface Props {
  preloadData: Omit<ProgressBarState, "status">;
  stateData: StateType;
  downloadingStatus?: DownloadingStatus;
}
export const createProgressBarWindow = async (
  vars: Props,
  options?: BrowserWindowConstructorOptions
) => {
  const stateData = vars.preloadData;
  const preloadData: Context = {
    ...stateData,
    status: "connecting",
    throttle: vars.downloadingStatus?.enableThrottle || false,
    downloadSpeed: vars.downloadingStatus?.downloadSpeed || 1024 * 50,
    pageData: defaultPageData,
  };
  return createWindow(
    FileDownloaderWindow,
    {
      preloadData: preloadData,
      ...options,
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
};
