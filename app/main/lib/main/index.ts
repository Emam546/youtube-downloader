import "./ipc";
import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  globalShortcut,
  shell,
} from "electron";
import path from "path";
import serve from "electron-serve";
import { convertFunc } from "@utils/app";
import { Context } from "@src/types/api";
import { MainWindow } from "@app/main/lib/main/window";
import { isDev, isProd } from "@app/main/utils";

const appServe = isProd
  ? serve({
      directory: path.join(__dirname, "../renderer"),
    })
  : null;
export const createMainWindow = async (
  options: BrowserWindowConstructorOptions,
  preloadData?: Context
): Promise<BrowserWindow> => {
  const state: Electron.BrowserWindowConstructorOptions = {
    show: false,
    autoHideMenuBar: true,
  };

  const getCurrentPosition = () => {
    const position = win.getPosition();
    const size = win.getSize();
    return {
      x: position[0],
      y: position[1],
      width: size[0],
      height: size[1],
    };
  };

  const saveState = () => {
    if (!win.isMinimized() && !win.isMaximized()) {
      Object.assign(state, getCurrentPosition());
    }
  };

  const win = new MainWindow({
    ...options,
    ...state,
    icon: "build/icon.ico",
    webPreferences: {
      ...state.webPreferences,
      ...options.webPreferences,
      sandbox: false,
      preload: path.join(__dirname, "../preload/index.js"),
      additionalArguments: [
        convertFunc(
          encodeURIComponent(JSON.stringify(preloadData || null)),
          "data"
        ),
      ],
    },
  });

  win.on("ready-to-show", () => {
    win.maximize();
    win.show();
  });

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });
  win.on("close", saveState);
  if (isProd && appServe) {
    await appServe(win);
  } else if (isDev) {
    await win.loadURL(`http://localhost:3000`);
    win.webContents.openDevTools();
    win.webContents.on("did-fail-load", () => {
      win.webContents.reloadIgnoringCache();
    });
    globalShortcut.register("Ctrl+Shift+I", () => {
      if (win.webContents.isDevToolsOpened()) {
        win.webContents.closeDevTools();
      } else {
        win.webContents.openDevTools();
      }
    });
  } else throw new Error("Unrecognized environment");
  return win;
};
