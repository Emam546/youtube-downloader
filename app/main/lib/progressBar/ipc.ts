import { ConvertToIpCHandleMainFunc, ConvertToIpCMainFunc } from "@shared/api";
import { Api } from "@shared/renderer/progress";
import { BaseDownloaderWindow } from "./window";
import { createFinishWindow } from "@app/main/lib/finish";
import { ObjectEntries } from "@utils/index";
import { ipcMain } from "electron";
type OnMethodsType = {
  [K in keyof Api.OnMethods]: ConvertToIpCMainFunc<Api.OnMethods[K]>;
};
type OnceMethodsType = {
  [K in keyof Api.OnceMethods]: ConvertToIpCMainFunc<Api.OnceMethods[K]>;
};
type HandelMethodsType = {
  [K in keyof Api.HandleMethods]: ConvertToIpCHandleMainFunc<
    Api.HandleMethods[K]
  >;
};
type HandelOnceMethodsType = {
  [K in keyof Api.HandleOnceMethods]: ConvertToIpCHandleMainFunc<
    Api.HandleOnceMethods[K]
  >;
};

export const OnMethods: OnMethodsType = {
  cancel(e) {
    const window = BaseDownloaderWindow.fromWebContents(e.sender);
    if (!window) return;
    window.cancel();
    window.close();
  },
  showDownloadDialog: function (e): void {
    const window = BaseDownloaderWindow.fromWebContents(e.sender);
    if (!window) return;
    createFinishWindow({
      preloadData: {
        fileSize: window.fileSize || window.curSize,
        link: window.videoData.previewLink,
        path: window.downloadingState.path,
      },
    }).then(() => {
      window.close();
    });
  },
};
export const OnceMethods: OnceMethodsType = {};
export const HandleMethods: Pick<
  HandelMethodsType,
  "setThrottle" | "setSpeed" | "triggerConnection"
> = {
  triggerConnection: (e, state) => {
    const window = BaseDownloaderWindow.fromWebContents(e.sender);
    if (!window) return;
    window.trigger(state);
  },
  setSpeed: (e, speed) => {
    const window = BaseDownloaderWindow.fromWebContents(e.sender);
    if (!window) return;
    window.setThrottleSpeed(speed);
  },
  setThrottle: (e, state) => {
    const window = BaseDownloaderWindow.fromWebContents(e.sender);
    if (!window) return;
    window.setThrottleState(state);
  },
};

export const HandleOnceMethod: HandelOnceMethodsType = {};
ObjectEntries(OnMethods).forEach(([key, val]) => {
  ipcMain.on(key, val);
});

ObjectEntries(HandleMethods).forEach(([key, val]) => {
  ipcMain.handle(key, val);
});
