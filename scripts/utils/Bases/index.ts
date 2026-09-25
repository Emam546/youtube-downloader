import { VideoDataClippedType } from "@utils/server";
import EventEmitter from "events";
import { Readable, Writable } from "stream";
import fs from "fs";
export interface WindowData {
  downloadingState: {
    path: string;
    continued: boolean;
  };
}
export interface DownloadParams<T> extends WindowData {
  data: VideoDataClippedType<T>;
}
export class DownloadBase<T = unknown> extends EventEmitter {
  downloadingState: DownloadParams<T>["downloadingState"];
  resumable?: boolean;
  enableThrottle: boolean = false;
  readonly curSize: number;

  constructor({ downloadingState }: DownloadParams<T>) {
    super();
    this.downloadingState = downloadingState;

    this.curSize = fs.existsSync(this.downloadingState.path)
      ? fs.statSync(this.downloadingState.path).size
      : 0;
    this.setCurSize(this.curSize);
  }
  static async getEstimatedFileSize(
    data: {},
    duration?: number,
  ): Promise<number | null> {
    return null;
  }
  async download(func: (path: string) => Writable): Promise<string | null> {
    throw new Error("unimplemented function");
  }
  setPauseButton(state: "Pause" | "Start", enabled: boolean = true) {
    this.emit("setPauseButton", state, enabled);
  }
  setFileSize(size?: number) {
    this.emit("setFileSize", size);
  }
  setResumability(state: boolean) {
    this.resumable = state;
    this.emit("setResumability", state);
  }
  changeState(state: string) {
    this.emit("changeState", state);
  }

  setCurSize(size: number) {
    this.emit("setCurSize", size);
  }
  setThrottleState(state: boolean) {
    this.emit("setThrottleState", state);
  }
  error(e: unknown) {
    this.emit("error", e);
  }
  onGetChunk(size: number) {
    this.emit("onGetChunk", size);
  }
  resetSpeed() {
    this.emit("resetSpeed");
  }
  wrap(base: DownloadBase) {
    base.on("setPauseButton", (state: "Pause" | "Start", enabled?: boolean) =>
      this.setPauseButton(state, enabled),
    );
    base.on("setFileSize", (size?: number) => this.setFileSize(size));
    base.on("setResumability", (state: boolean) => this.setResumability(state));
    base.on("changeState", (state: string) => this.changeState(state));
    base.on("setCurSize", (size: number) => this.setCurSize(size));
    base.on("setThrottleState", (state: boolean) =>
      this.setThrottleState(state),
    );
    base.on("onGetChunk", (size: number) => this.onGetChunk(size));
    base.on("resetSpeed", () => this.resetSpeed());
  }
  async pipe(path: string): Promise<Writable> {
    this.emit("pipe", path);
    return new Promise<Writable>((res, rej) => {
      this.once("pipe", res);
      this.once("error", rej);
    });
  }

  close() {
    this.emit("close");
  }
}
