import { BrowserWindowConstructorOptions } from "electron";
import { DownloadTheFile } from "./downloader";
import { BaseDownloaderWindow, BrowserProps, DownloaderData } from "../window";
import { DownloadInstance } from "@serv/util/axios";

export class FileDownloaderWindow extends BaseDownloaderWindow {
  constructor(options: BrowserProps, data: DownloaderData) {
    super(options, data);
  }
  async download() {
    await super.download(async () => {
      const res = await DownloadInstance.head(this.link, {
        validateStatus(status) {
          return status < 400;
        },
      });
      const acceptRanges = res.headers["accept-ranges"] as string | undefined;
      if (acceptRanges && acceptRanges === "bytes") this.setResumability(true);
      else this.setResumability(false);
      if (res.headers["content-length"]) {
        const length = parseInt(res.headers["content-length"] as string);
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
        if (!response.closed) response.destroy();
      });
      response.pipe(this.pipe(this.downloadingState.path));
    });
  }
}
