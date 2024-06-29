import {
    BrowserWindow,
    BrowserWindowConstructorOptions,
    shell,
} from "electron";
import path from "path";
import serve from "electron-serve";
const isProd = process.env.NODE_ENV === "production";

const appServe = isProd
    ? serve({
          directory: path.join(__dirname, "../../out"),
      })
    : null;
export const createWindow = async (
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
        webPreferences: {
            ...options.webPreferences,
            sandbox: false,
            preload: path.join(__dirname, "../preload/index.js"),
        },
    });
    win.on("ready-to-show", () => {
        win?.show();
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
