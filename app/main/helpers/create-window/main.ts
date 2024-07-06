import {
    BrowserWindow,
    BrowserWindowConstructorOptions,
    ipcMain,
    shell,
} from "electron";
import path from "path";
import serve from "electron-serve";
import { ObjectEntries } from "@utils/index";
import { OnMethods, HandleMethods } from "@app/main/lib/main";
import { is } from "@electron-toolkit/utils";

const isProd = !is.dev;

const appServe = isProd
    ? serve({
          directory: path.join(__dirname, "../renderer"),
      })
    : null;
export const createMainWindow = async (
    options: BrowserWindowConstructorOptions
): Promise<BrowserWindow> => {
    let state: Electron.BrowserWindowConstructorOptions = {
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
        // store.set(key, state);
    };

    const win = new BrowserWindow({
        ...options,
        ...state,
        icon: "build/icon.ico",
        webPreferences: {
            ...state.webPreferences,
            ...options.webPreferences,
            sandbox: false,
            preload: path.join(__dirname, "../preload/index.js"),
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
        appServe(win).then(() => {
            win.loadURL("app://-");
        });
    } else {
        await win.loadURL(`http://localhost:3000`);
        win.webContents.openDevTools();
        win.webContents.on("did-fail-load", () => {
            win.webContents.reloadIgnoringCache();
        });
    }
    return win;
};
ObjectEntries(OnMethods).forEach(([key, val]) => {
    ipcMain.on(key, val);
});
ObjectEntries(HandleMethods).forEach(([key, val]) => {
    ipcMain.handle(key, val);
});
// ObjectEntries(OnceMethods).forEach(([key, val]) => {
//     ipcMain.once(key, val);
// });
// ObjectEntries(HandleOnceMethods).forEach(([key, val]) => {
//     ipcMain.handleOnce(key, val);
// });
