import { BrowserWindow, Menu, nativeImage, Tray } from "electron";
import { clipText, objectValues } from "@utils/index";
import path from "path";
import { MainWindow } from "../main/window";
const MAX_CHARS = 50;

export class DownloadTray extends Tray {
    public static Tray: DownloadTray | null;
    private static HidedWindows: Record<string, BrowserWindow> = {};

    constructor(...options: ConstructorParameters<typeof Tray>) {
        super(...options);
        this.on("double-click", () => {
            if (MainWindow.Window) {
                MainWindow.Window.restore();
                MainWindow.Window.focus();
            }
        });
        this.setToolTip("Youtube Downloads");
        DownloadTray.Tray = this;
    }
    static getTray() {
        if (!this.Tray)
            return new DownloadTray(
                nativeImage.createFromPath(
                    path.join(__dirname, "../../build/icon.ico")
                )
            );
        return this.Tray;
    }
    static addWindow(window: BrowserWindow) {
        window.addListener("close", () => {
            if (this.HidedWindows[window.id])
                delete this.HidedWindows[window.id];
            this.construct();
        });
        window.addListener("show", () => {
            if (this.HidedWindows[window.id])
                delete this.HidedWindows[window.id];
            this.construct();
        });
        window.addListener("hide", () => {
            this.HidedWindows[window.id] = window;
            this.construct();
        });
    }
    public static construct() {
        if (objectValues(this.HidedWindows).length == 0) {
            if (this.Tray) {
                if (!this.Tray.isDestroyed()) this.Tray.destroy();
                this.Tray = null;
            }
            return;
        }
        const tray = this.getTray();

        const contextMenu = Menu.buildFromTemplate([
            {
                label: "Restore all windows",
                click: () => {
                    objectValues(this.HidedWindows).forEach((window) =>
                        window.show()
                    );
                },
            },
            { type: "separator" },
            ...objectValues(this.HidedWindows).map((window) => {
                return {
                    label: clipText(window.getTitle(), MAX_CHARS),
                    click: () => {
                        window.show();
                    },
                };
            }),
        ]);

        tray.setContextMenu(contextMenu);
    }
}
