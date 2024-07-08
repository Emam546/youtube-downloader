import { BrowserWindow, Menu, Tray } from "electron";
import { clipText, objectValues } from "@utils/index";

export class DownloadTray extends Tray {
    public static Tray: DownloadTray | null;
    private static HidedWindows: Record<string, BrowserWindow> = {};
    public windowListeners: Array<() => any> = [];
    constructor(...options: ConstructorParameters<typeof Tray>) {
        super(...options);
        this.setToolTip("Youtube Downloads");
        DownloadTray.Tray = this;
    }
    static getTray() {
        if (!this.Tray) return new DownloadTray("build/icon.ico");
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
    destroy(): void {
        super.destroy();
        this.windowListeners.forEach((v) => v());
    }
    setContextMenu(menu: Electron.Menu | null): void {
        this.windowListeners.forEach((v) => v());
        super.setContextMenu(menu);
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
                    label: clipText(window.getTitle(), 30),
                    click: () => {
                        window.show();
                    },
                };
            }),
        ]);
        tray.setContextMenu(contextMenu);
        tray.windowListeners = objectValues(this.HidedWindows).map(
            (window, i) => {
                const f = () =>
                    (contextMenu.items[i].label = clipText(
                        window.getTitle(),
                        30
                    ));
                window.addListener("page-title-updated", f);
                return () => window.removeListener("close", f);
            }
        );
    }
}
