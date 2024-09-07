import { ProgressBarState } from "@shared/renderer/progress";
import { StateType } from "@app/main/lib/main/downloader";
import fs, { WriteStream } from "fs-extra";
import { DownloadTheFile } from "./downloader";
import {
    BrowserWindow,
    BrowserWindowConstructorOptions,
    dialog,
} from "electron";
import axios from "axios";
import { DownloadingWindow } from "../donwloading";
import { PowerStarter, ModifiedThrottle } from "./utils";

export type FlagType = "w" | "a";
export interface VideoData {
    link: string;
    video: {
        title: string;
        vid: string;
    };
}
export interface PipeListener extends NodeJS.EventEmitter {
    pipe<T extends WritableStream>(
        destination: T,
        options?: { end?: boolean | undefined }
    ): T;
}
export class BaseDownloaderWindow extends DownloadingWindow {
    public static readonly MAX_TRIES = 3;
    public static readonly INTERVAL_Bytes = 1024 * 100;
    public static Windows: Record<string, BaseDownloaderWindow> = {};
    public readonly flag: FlagType;
    private stream?: WriteStream;
    private curTimeOut?: ReturnType<typeof setTimeout>;
    private lastTime = Date.now();
    private sleepId = new PowerStarter();
    readonly curStream: ModifiedThrottle;
    private speedTransfer: number = 0;
    readonly link: string;
    readonly videoData: VideoData["video"];
    resumable?: boolean;
    enableThrottle: boolean = true;
    downloadSpeed = 1024 * 50;
    fileSize?: number;
    curSize: number;
    downloadingState: StateType;
    state: ProgressBarState["status"] = "connecting";
    private static addWindow(window: BaseDownloaderWindow) {
        this.Windows[window.id] = window;
    }

    private static removeWindow(window: BaseDownloaderWindow) {
        delete this.Windows[window.id];
    }
    public static fromWebContents(
        webContents: Electron.WebContents
    ): BaseDownloaderWindow | null {
        const win = BrowserWindow.fromWebContents(webContents);
        if (!win) return null;
        return BaseDownloaderWindow.Windows[win.id] || null;
    }
    constructor(
        options: BrowserWindowConstructorOptions,
        state: StateType,
        data: VideoData
    ) {
        super(options);
        this.curStream = new ModifiedThrottle({
            bps: this.enableThrottle
                ? Math.max(1024, this.downloadSpeed)
                : Number.MAX_SAFE_INTEGER,
            highWaterMark: 1024,
        });
        this.flag = state.continued && fs.existsSync(state.path) ? "a" : "w";
        this.downloadingState = state;
        this.curSize = this.flag == "a" ? this.getRealSize() : 0;
        this.link = data.link;
        this.videoData = data.video;
        this.on("close", () => {
            BaseDownloaderWindow.removeWindow(this);
        });

        BaseDownloaderWindow.addWindow(this);
    }
    getRealSize() {
        if (fs.existsSync(this.downloadingState.path)) {
            const state = fs.statSync(this.downloadingState.path);
            return state.size;
        }
        return 0;
    }
    changeState(state: ProgressBarState["status"]) {
        if (this.isDestroyed()) return;
        if (state != this.state) this.onChangeState(state);
        this.state = state;
    }
    pipe<T extends NodeJS.ReadableStream>(response: T): T {
        if (this.curTimeOut) clearInterval(this.curTimeOut);
        this.stream = fs.createWriteStream(this.downloadingState.path, {
            flags: this.flag,
        });
        response.pipe(this.curStream, { end: false });
        this.stream.on("error", (err) => this.error(err));

        this.curStream.on("resume", () => {
            response.resume();
            this.resetSpeed();
            this.sleepId.start();
        });
        this.curStream.on("pause", () => {
            response.pause();
            this.sleepId.stop();
        });
        this.curStream.on("data", (data) => this.data(data));
        this.curStream.on("end", () => this.end());
        this.curStream.on("close", () => this.stream!.close());
        this.curStream.pipe(this.stream!);
        this.curStream.resume();
        this.sleepId.start();
        return response;
    }

    private data(data: Buffer) {
        this.speedTransfer += data.byteLength;
        this.curSize += data.byteLength;

        if (this.curTimeOut) clearTimeout(this.curTimeOut);
        if (this.state == "pause") return;
        this.curTimeOut = setTimeout(() => {
            if (this.state != "pause") this.changeState("connecting");
            this.curTimeOut = undefined;
        }, 3000);
        this.changeState("receiving");
        this.onDownloaded(this.curSize);
        if (this.speedTransfer > BaseDownloaderWindow.INTERVAL_Bytes) {
            const speed = Math.round(
                this.speedTransfer / ((Date.now() - this.lastTime) / 1000)
            );
            this.onSpeed(speed);
            this.resetSpeed();
        }
    }
    private resetSpeed() {
        this.lastTime = Date.now();
        this.speedTransfer = 0;
    }
    end() {
        this.changeState("completed");
        this.onDownloaded(this.curSize);
        this.sleepId.stop();
        this.onEnd();
    }
    setResumability(state: boolean) {
        this.resumable = state;
        this.onResumability(state);
    }
    setFileSize(size: number) {
        this.fileSize = size;
        this.onFileSize(size);
    }
    setThrottleSpeed(speed: number) {
        this.downloadSpeed = speed;
        this.setThrottleState(this.enableThrottle);
    }
    setThrottleState(state: boolean) {
        this.enableThrottle = state;
        if (!this.curStream) return;
        this.curStream.bps = state
            ? Math.max(1024, this.downloadSpeed)
            : Number.MAX_SAFE_INTEGER;
    }
    trigger(state: boolean) {
        if (this.isDestroyed()) return;
        if (state) {
            this.changeState("connecting");
            this.curStream.resume();
        } else {
            this.changeState("pause");
            this.curStream.pause();
        }
    }
    cancel() {
        if (fs.existsSync(this.downloadingState.path))
            fs.unlinkSync(this.downloadingState.path);
        this.close();
    }
    error(err: any) {
        console.error(err);
        // dialog.showErrorBox("Error Happened", err.toString());
        this.close();
    }

    private onEnd() {
        this.webContents.send("onEnd");
    }
    private onFileSize(size: number) {
        if (this.isDestroyed()) return;
        this.webContents.send("onFileSize", size);
    }
    private onDownloaded(size: number) {
        if (this.isDestroyed()) return;
        if (this.fileSize) this.setProgressBar(size / this.fileSize);
        this.webContents.send("onDownloaded", size);
    }
    private onSpeed(speed: number) {
        if (this.isDestroyed()) return;
        this.webContents.send("onSpeed", speed);
    }
    private onResumability(state: boolean) {
        if (this.isDestroyed()) return;
        this.webContents.send("onResumeCapacity", state);
    }
    private onChangeState(state: ProgressBarState["status"]) {
        if (this.isDestroyed()) return;
        this.webContents.send("onConnectionStatus", state);
    }
}
export class FileDownloaderWindow extends BaseDownloaderWindow {
    private onResponsePause() {}
    private onResponseResume() {}
    constructor(
        options: BrowserWindowConstructorOptions,
        state: StateType,
        data: VideoData
    ) {
        super(options, state, data);
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
            response.on("pause", () => this.onResponsePause());
            response.on("resume", () => this.onResponseResume());
            response.on("error", (err) => this.error(err));

            this.on("close", () => {
                if (response) response.destroy();
            });
            this.pipe(response);
        } catch (err) {
            this.download(num + 1, err);
        }
    }
}
