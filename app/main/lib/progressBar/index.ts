import {
    ConvertToIpCHandleMainFunc,
    ConvertToIpCMainFunc,
} from "@shared/index";
import { Api } from "@shared/renderer/progress";
import { FileDownloaderWindow } from "./window";
import fs from "fs-extra";
import { BrowserWindow } from "electron";
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
export type FlagType = "w" | "a";
export const OnMethods: OnMethodsType = {
    cancel(e) {
        const window = FileDownloaderWindow.fromWebContents(e.sender);
        if (!window) return;
        window.end();
        if (fs.existsSync(window.downloadingState.path))
            fs.unlinkSync(window.downloadingState.path);
        window.close();
    },
    close(e) {
        const window = BrowserWindow.fromWebContents(e.sender);
        if (!window) return;
        window.close();
    },
};
export const OnceMethods: OnceMethodsType = {};
export const HandleMethods: Pick<
    HandelMethodsType,
    "setThrottle" | "setSpeed" | "triggerConnection"
> = {
    triggerConnection: (e, state) => {
        const window = FileDownloaderWindow.fromWebContents(e.sender);
        if (!window) return;
        window.trigger(state);
    },
    setSpeed: (e, speed) => {
        const window = FileDownloaderWindow.fromWebContents(e.sender);
        if (!window) return;
        window.setThrottleSpeed(speed);
    },
    setThrottle: (e, state) => {
        const window = FileDownloaderWindow.fromWebContents(e.sender);
        if (!window) return;
        window.setThrottleState(state);
    },
};
export const HandleOnceMethod: HandelOnceMethodsType = {};
