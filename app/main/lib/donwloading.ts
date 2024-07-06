import { BrowserWindow } from "electron";

export class DownloadingWindow extends BrowserWindow {
    constructor(...options: ConstructorParameters<typeof BrowserWindow>) {
        super(...options);
        this.setAppDetails({ appId: "Download" });
    }
}
