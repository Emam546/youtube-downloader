import axios from "axios";
import { BrowserWindowConstructorOptions } from "electron";
import { DownloadTheFile } from "./downloader";
import { BaseDownloaderWindow, DownloaderData } from "./window";

export class FileDownloaderWindow extends BaseDownloaderWindow {
    constructor(
        options: BrowserWindowConstructorOptions,
        data: DownloaderData
    ) {
        super(options, data);
    }
    async download(num: number = 0, err?: any) {
        if (num > BaseDownloaderWindow.MAX_TRIES) return this.error(err);
        try {
            const res = await axios.head(this.link, {
                validateStatus(status) {
                    return status < 400;
                },
            });
            const acceptRanges = res.headers["accept-ranges"];
            if (acceptRanges && acceptRanges === "bytes")
                this.setResumability(true);
            else this.setResumability(false);
            if (res.headers["content-length"]) {
                const length = parseInt(
                    res.headers["content-length"] as string
                );
                if (!isNaN(length)) {
                    if (length == this.curSize) return this.end();
                    this.setFileSize(length);
                }
            }

            const range = `bytes=${this.curSize}-`;
            this.changeState("connecting");
            const response = await DownloadTheFile(
                this.link,
                this.resumable ? range : undefined
            );
            const length = response.headers["content-length"];
            if (length) this.setFileSize(parseInt(length));
            response.on("error", (err) => this.error(err));
            response.once("data", () => {
                this.setPauseButton("Pause");
            });
            this.on("close", () => {
                if (response) response.destroy();
            });
            response.pipe(this.pipe());
        } catch (err) {
            this.download(num + 1, err);
        }
    }
}
