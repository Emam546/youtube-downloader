import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";

export class MainWindow extends BrowserWindow {
    public static Window: BrowserWindow | null = null;
    constructor(options: BrowserWindowConstructorOptions) {
        super(options);
        if (!MainWindow.Window) {
            MainWindow.Window = this;
        }
        this.on("close", () => {
            if (this.id == MainWindow.Window?.id) MainWindow.Window = null;
        });
    }
}
