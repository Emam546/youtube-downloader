import "./ipc";
import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  shell,
} from "electron";
import path from "path";
import { Context } from "@shared/renderer/finish";
import { convertFunc } from "@utils/app";
import { DownloadingWindow } from "@app/main/lib/donwloading";
import { isDev } from "@app/main/utils";
export interface Props {
  preloadData: Context;
}

export const createFinishWindow = async (
  vars: Props,
  options?: BrowserWindowConstructorOptions
): Promise<BrowserWindow> => {
  const stateData = vars.preloadData;
  const preloadData: Context = {
    ...stateData,
  };
  const win = new DownloadingWindow({
    icon: "build/icon.ico",
    useContentSize: true,
    show: false,
    autoHideMenuBar: true,
    resizable: false,
    fullscreenable: false,
    height: 270,
    width: 550,
    ...options,
    webPreferences: {
      ...options?.webPreferences,
      sandbox: false,
      preload: path.join(__dirname, "../preload/index.js"),
      additionalArguments: [
        convertFunc(encodeURIComponent(JSON.stringify(preloadData)), "data"),
      ],
    },
  });
  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (isDev) {
    await win.loadURL(
      `${process.env["ELECTRON_RENDERER_URL"] as string}/finish`
    );
  } else await win.loadFile(path.join(__dirname, "../windows/finish.html"));
  win.show();
  win.moveTop();
  return win;
};

