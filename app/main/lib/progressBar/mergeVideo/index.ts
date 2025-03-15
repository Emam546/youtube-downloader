
import { BrowserWindowConstructorOptions } from "electron";
import { Context } from "@shared/renderer/progress";
import { FfmpegMergeWindow, MergeDataType } from "./window";
export type { MergeDataType } from "./window";
import { defaultPageData } from "@app/main/lib/progressBar/window";
import { Props as NonClippedProps } from "../linkDownload";
import { createWindow } from "../createWindow";

export interface ClippedData {
  start: number;
  end: number;
}
export interface Props extends NonClippedProps {
  clippedData?: ClippedData;
  mergeData: MergeDataType;
}

export const createMergeProgressBarWindow = async (
  vars: Props,
  options?: BrowserWindowConstructorOptions
) => {
  const stateData = vars.preloadData;

  const preloadData: Context = {
    ...stateData,
    status: "connecting",
    throttle: vars.downloadingStatus?.enableThrottle || false,
    downloadSpeed: vars.downloadingStatus?.downloadSpeed || 50 * 1024,
    pageData: defaultPageData,
  };
  return createWindow(
    FfmpegMergeWindow,
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
      ffmpegData: vars.clippedData
        ? {
            duration: vars.clippedData.end - vars.clippedData.start,
            start: vars.clippedData.start,
          }
        : undefined,
      pageData: preloadData.pageData,
    },
    vars.mergeData
  );
};
