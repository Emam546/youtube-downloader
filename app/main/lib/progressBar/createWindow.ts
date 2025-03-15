import "./ipc";
import { BrowserWindow, shell } from "electron";
import path from "path";
import { isDev } from "@app/main/utils";
import { BaseDownloaderWindow } from "./window";

export const createWindow = async <
  T extends BaseDownloaderWindow,
  G extends new (...args: any) => T
>(
  Con: G,
  ...a: ConstructorParameters<G>
): Promise<T> => {
  const win = new Con(...a);
  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (isDev) {
    await win.loadURL(
      `${process.env["ELECTRON_RENDERER_URL"] as string}/progress`
    );
  } else await win.loadFile(path.join(__dirname, "../windows/progress.html"));
  await win.download();
  win.show();
  return win;
};
