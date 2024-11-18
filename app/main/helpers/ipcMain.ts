import { ConvertToIpCMainFunc, ConvertToIpCHandleMainFunc } from "@shared/api";
import { ObjectEntries } from "@utils/index";
import { app, BrowserWindow, ipcMain } from "electron";
import {
  OpenFile,
  OpenFileWith,
  OpenFolder,
  ShutDown,
  SleepComputer,
} from "../lib/ipcmain";
import { ApiMain } from "@shared/api";
type OnMethodsType = {
  [K in keyof ApiMain.OnMethods]: ConvertToIpCMainFunc<ApiMain.OnMethods[K]>;
};
type OnceMethodsType = {
  [K in keyof ApiMain.OnceMethods]: ConvertToIpCMainFunc<
    ApiMain.OnceMethods[K]
  >;
};
type HandelMethodsType = {
  [K in keyof ApiMain.HandleMethods]: ConvertToIpCHandleMainFunc<
    ApiMain.HandleMethods[K]
  >;
};
type HandelOnceMethodsType = {
  [K in keyof ApiMain.HandleOnceMethods]: ConvertToIpCHandleMainFunc<
    ApiMain.HandleOnceMethods[K]
  >;
};
export const OnMethods: OnMethodsType = {
  log(_, ...arg) {
    // eslint-disable-next-line no-console
    console.log(...arg);
  },
  setTitle: function (event, name: string): void {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) return;
    window.setTitle(name);
  },
  closeWindow(e) {
    const window = BrowserWindow.fromWebContents(e.sender);
    if (!window) return;
    window.close();
  },
  openFolder: function (_, path: string): void {
    OpenFolder(path);
  },
  openFile: function (_, path: string): void {
    OpenFile(path);
  },
  opeFileWith: function (_, path: string): void {
    OpenFileWith(path);
  },
  setContentHeight: function (event, height: number): void {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) return;
    window.setContentSize(window.getSize()[0], height);
  },
  minimizeWindow: function (event): void {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) return;
    window.minimize();
  },
  hideWindow: function (event): void {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) return;
    window.hide();
  },
  ToggleWindowMaximizeState: function (
    event: Electron.CrossProcessExports.IpcMainEvent
  ): void {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) return;
    if (window.isMaximized()) window.restore();
    else window.maximize();
  },
  quitApp: function (): void {
    app.quit();
  },
  shutDownComputer: function (_, force: boolean): void {
    ShutDown(force);
  },
  sleepComputer: function (): void {
    SleepComputer();
  },
};
export const OnceMethods: OnceMethodsType = {};
export const HandleMethods: HandelMethodsType = {};
export const HandleOnceMethods: HandelOnceMethodsType = {};
ObjectEntries(OnMethods).forEach(([key, val]) => {
  ipcMain.on(key, val);
});
// ObjectEntries(HandleMethods).forEach(([key, val]) => {
//     ipcMain.handle(key, val);
// });
// ObjectEntries(OnceMethods).forEach(([key, val]) => {
//     ipcMain.once(key, val);
// });
// ObjectEntries(HandleOnceMethods).forEach(([key, val]) => {
//     ipcMain.handleOnce(key, val);
// });
