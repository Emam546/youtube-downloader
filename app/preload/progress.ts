import { contextBridge } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { ChangeApiRender, convertFunc } from "@utils/app";
import { ConnectionStatus, ProgressBarState } from "@shared/renderer/progress";
import { convertProgressFunc } from "./utils/progress";

// Custom APIs for renderer
const api = ChangeApiRender(
    electronAPI.ipcRenderer as any,
    convertProgressFunc
);

const [link, title, status] = process.argv
    .filter((v) => v.startsWith("data-"))
    .map((v) => decodeURIComponent(v.replace(/^data-/, "")));

const context: ProgressBarState = {
    link,
    status: status as ConnectionStatus,
    title,
};
// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld("electron", electronAPI);
        contextBridge.exposeInMainWorld("api", api);
        contextBridge.exposeInMainWorld("context", context);
    } catch (error) {
        console.error(error);
    }
} else {
    window.electron = electronAPI;
    // @ts-ignore (define in dts)
    window.api = api;
    // @ts-ignore (define in dts)
    window.context = context;
}
