import axios from "axios";
import https from "https";
import http from "http";
import { getHttpMethod } from "@utils/server";
import { IncomingMessage } from "http";
import { Writable } from "stream";
import { DownloadBase, DownloadParams } from "..";
import { pipeAsync } from "../..";

const HttpsDownloadAgent = new https.Agent({
  rejectUnauthorized: false, // (NOTE: this will disable client verification)
});
const HttpDownloadAgent = new http.Agent({});
const DownloadInstance = axios.create({
  httpsAgent: HttpsDownloadAgent,
  httpAgent: HttpDownloadAgent,
});
export interface LinkDownloadData {
  link?: string;
}
export async function DownloadTheFile(
  link: string,
  range?: string
): Promise<IncomingMessage> {
  const response = await getHttpMethod(link, range);

  if (!response.statusCode || response.statusCode >= 300) {
    switch (response.statusCode) {
      case 302:
        return await DownloadTheFile(response.headers.location!, range);

      default:
        throw new Error(
          `Sever Failed With Status Code:${
            response.statusCode || "unrecognized status code"
          }`
        );
    }
  }

  return response;
}

export class LinkDownloadBase extends DownloadBase {
  link?: string;
  constructor(data: DownloadParams<LinkDownloadData>) {
    super(data);
    this.link = data.data.data.link;
  }
  static async getEstimatedFileSize(
    data: LinkDownloadData,
    duration?: number
  ): Promise<number | null> {
    if (!data.link) return super.getEstimatedFileSize(data, duration);
    const res = await DownloadInstance.head(data.link, {
      validateStatus(status) {
        return status < 400;
      },
    });
    if (res.headers["content-length"]) {
      const length = parseInt(res.headers["content-length"] as string);
      if (!isNaN(length)) return length;
    }
    return super.getEstimatedFileSize(data, duration);
  }
  async download(func: (path: string) => Writable) {
    if (!this.link) return super.download(func);

    const res = await DownloadInstance.head(this.link, {
      validateStatus(status) {
        return status < 400;
      },
    });
    const contentSize = await LinkDownloadBase.getEstimatedFileSize(this);
    if (contentSize) {
      if (contentSize == this.curSize) return;
      this.setFileSize(contentSize);
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
    response.once("data", () => {
      this.setPauseButton("Pause");
    });
    await pipeAsync(response.pipe(func(this.downloadingState.path)));
  }
}
