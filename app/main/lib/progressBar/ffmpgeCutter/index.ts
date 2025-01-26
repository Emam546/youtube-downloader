import "./ipc";
import { BrowserWindowConstructorOptions, shell } from "electron";
import path from "path";
import { Context } from "@shared/renderer/progress";
import { convertFunc } from "@utils/app";
import { FfmpegWindow } from "./window";
import { defaultPageData } from "@app/main/lib/progressBar/window";
import { Props as NonClippedProps } from "../linkDownload";
import { isDev } from "@app/main/utils";

export interface ClippedData {
  start: number;
  end: number;
}
export interface Props extends NonClippedProps {
  clippedData: ClippedData;
}
export const createClippedProgressBarWindow = async (
  vars: Props,
  options?: BrowserWindowConstructorOptions
): Promise<FfmpegWindow> => {
  const stateData = vars.preloadData;
  const preloadData: Context = {
    ...stateData,
    status: "connecting",
    throttle: vars.downloadingStatus?.enableThrottle || false,
    downloadSpeed: vars.downloadingStatus?.downloadSpeed || 50 * 1024,
    pageData: defaultPageData,
  };
  const win = new FfmpegWindow(
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
          convertFunc(encodeURIComponent(JSON.stringify(preloadData)), "data"),
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
      ffmpegData: {
        duration: vars.clippedData.end - vars.clippedData.start,
        start: vars.clippedData.start,
      },
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
    win.webContents.openDevTools();
  } else await win.loadFile(path.join(__dirname, "../windows/progress.html"));
  win.show();
  await win.download();
  return win;
};
