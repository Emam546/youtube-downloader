import { DownloadTheFile } from "./downloader";
import { BaseDownloaderWindow, BrowserProps, DownloaderData } from "../window";
import { DownloadInstance } from "@serv/util/axios";

export class FileDownloaderWindow extends BaseDownloaderWindow {
  constructor(options: BrowserProps, data: DownloaderData) {
    super(options, data);
  }
  async getEstimatedFileSize(): Promise<number | null> {
    const res = await DownloadInstance.head(this.link, {
      validateStatus(status) {
        return status < 400;
      },
    });
    if (res.headers["content-length"]) {
      const length = parseInt(res.headers["content-length"] as string);
      if (!isNaN(length)) return length;
    }
    return null;
  }
  async download() {
    await super.download(async () => {
      const res = await DownloadInstance.head(this.link, {
        validateStatus(status) {
          return status < 400;
        },
      });
      const length = await this.getEstimatedFileSize();
      if (length) {
        if (length == this.curSize) return this.end();
        this.setFileSize(length);
      }
      const acceptRanges = res.headers["accept-ranges"] as string | undefined;
      if (acceptRanges && acceptRanges === "bytes") this.setResumability(true);
      else this.setResumability(false);

      const range = `bytes=${this.curSize}-`;
      this.changeState("connecting");
      const response = await DownloadTheFile(
        this.link,
        this.resumable ? range : undefined
      );

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
