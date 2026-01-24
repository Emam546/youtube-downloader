import {
  Menu,
  clipboard,
  BrowserWindow,
  MenuItemConstructorOptions,
  MenuItem,
} from "electron";

export const showContextMenu = (event: Electron.IpcMainEvent, params: any) => {
  const mainWindow = BrowserWindow.fromWebContents(event.sender)!;
  const menu = Menu.buildFromTemplate(
    [
      mainWindow.webContents.canGoBack() && {
        label: "Back",
        accelerator: "Alt+Left",
        enabled: mainWindow.webContents.canGoBack(),
        click: () => mainWindow.webContents.goBack(),
      },
      mainWindow.webContents.canGoForward() && {
        label: "Back",
        accelerator: "Alt+Right",
        enabled: mainWindow.webContents.canGoForward(),
        click: () => mainWindow.webContents.goForward(),
      },
      {
        label: "Refresh",
        accelerator: "Ctrl+R",
        click: () => mainWindow.webContents.reload(),
      },
      { type: "separator" },
      {
        label: "Copy",
        accelerator: "Ctrl+C",
        click: () => {
          clipboard.writeText(params);
        },
      },
      {
        label: "Paste",
        accelerator: "Ctrl+V",
        click: () => {
          event.sender.send("paste-text", clipboard.readText());
        },
      },
    ].filter((v) => v) as (MenuItemConstructorOptions | MenuItem)[],
  );
  // return menu;
  menu.popup({ window: BrowserWindow.fromWebContents(event.sender)! });
};
