import "./ipc";
import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  shell,
} from "electron";
import path from "path";
import { Context } from "@shared/renderer/update";
import { convertFunc } from "@utils/app";
import { isDev } from "@app/main/utils";
import { UpdaterWindow } from "./window";
import AppUpdater from "@app/main/updater/AppUpdater";
export interface Props {
  preloadData: Context;
  autoUpdater: AppUpdater;
}

export const createUpdateWindow = async (
  vars: Props,
  options?: BrowserWindowConstructorOptions
): Promise<BrowserWindow> => {
  const preloadData: Context = {
    ...vars.preloadData,
  };
  const win = new UpdaterWindow(
    {
      icon: "build/icon.ico",
      useContentSize: true,
      show: false,
      autoHideMenuBar: true,
      frame: false,
      resizable: false,
      fullscreenable: false,
      skipTaskbar: true,
      height: 270,
      width: 450,
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
    vars.autoUpdater
  );
  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (isDev) {
    await win.loadURL(
      `${process.env["ELECTRON_RENDERER_URL"] as string}/update`
    );
  } else await win.loadFile(path.join(__dirname, "../windows/update.html"));
  win.show();
  win.moveTop();
  return win;
};
