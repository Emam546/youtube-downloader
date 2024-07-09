import { ProgressBarState } from "@shared/renderer/progress";
import { IncomingMessage } from "http";
import { StateType } from "@app/main/lib/main/downloader";
import fs, { WriteStream } from "fs-extra";
import { DownloadTheFile } from "./downloader";
import {
    BrowserWindow,
    BrowserWindowConstructorOptions,
    dialog,
} from "electron";
import axios from "axios";
import stream from "stream";
import { createFinishWindow } from "@app/main/helpers/create-window/finish";
import { DownloadingWindow } from "../donwloading";
import Throttle from "throttle";
import { Transform, TransformOptions } from "stream";
export type FlagType = "w" | "a";
export interface VideoData {
    link: string;
    video: {
        title: string;
        vid: string;
    };
}
export class ModifiedThrottle extends Throttle {
    public ops: Throttle.Options;
    public bps: number;
    constructor(options: Throttle.Options) {
        super(options);
        this.ops = options;
        this.bps = options.bps;
    }
}
export class FileDownloaderWindow extends DownloadingWindow {
    public static readonly MAX_TRIES = 3;
    public static readonly PAUSETIME = 3000;
    public static readonly INTERVAL_Bytes = 1024 * 100;
    public static Windows: Record<string, FileDownloaderWindow> = {};
    private readonly flag: FlagType;
    private stream?: WriteStream;
    private response?: stream.Readable;
    private curTimeOut?: ReturnType<typeof setTimeout>;
    private speedTransfer: number = 0;
    private lastTime = Date.now();
    private curStream?: ModifiedThrottle;
    readonly link: string;
    readonly videoData: VideoData["video"];

    enableThrottle: boolean = true;
    downloadSpeed = 1024 * 50;
    resumable?: boolean;
    fileSize?: number;
    curSize: number;
    downloadingState: StateType;
    state: ProgressBarState["status"] = "connecting";
    private static addWindow(window: FileDownloaderWindow) {
        this.Windows[window.id] = window;
    }

    private static removeWindow(window: FileDownloaderWindow) {
        delete this.Windows[window.id];
    }
    public static fromWebContents(
        webContents: Electron.WebContents
    ): FileDownloaderWindow | null {
        const win = BrowserWindow.fromWebContents(webContents);
        if (!win) return null;
        return FileDownloaderWindow.Windows[win.id] || null;
    }
    constructor(
        options: BrowserWindowConstructorOptions,
        state: StateType,
        data: VideoData
    ) {
        super(options);
        this.flag = state.continued && fs.existsSync(state.path) ? "a" : "w";
        this.downloadingState = state;
        this.curSize = this.flag == "a" ? this.getRealSize() : 0;
        this.link = data.link;
        this.videoData = data.video;
        this.on("close", () => {
            FileDownloaderWindow.removeWindow(this);
            if (this.response) this.response.destroy();
        });

        FileDownloaderWindow.addWindow(this);
    }
    async download(num: number = 0, err?: any) {
        if (num > FileDownloaderWindow.MAX_TRIES) return this.error(err);
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
            this.function(response);
        } catch (err) {
            this.download(num + 1, err);
        }
    }
    private function(response: IncomingMessage) {
        this.stream = fs.createWriteStream(this.downloadingState.path, {
            flags: this.flag,
        });
        this.stream.on("error", (err) => this.error(err));
        response.on("pause", () => this.pause());
        response.on("resume", () => this.resume());
        response.on("error", (err) => this.error(err));

        const length = response.headers["content-length"];
        if (length) this.setFileSize(parseInt(length));
        if (this.curTimeOut) clearInterval(this.curTimeOut);
        this.response = response;

        this.pipe();
    }
    private getRealSize() {
        if (fs.existsSync(this.downloadingState.path)) {
            const state = fs.statSync(this.downloadingState.path);
            return state.size;
        }
        return 0;
    }
    private changeState(state: ProgressBarState["status"]) {
        if (this.isDestroyed()) return;
        if (state != this.state) this.onChangeState(state);
        this.state = state;
    }
    private pipe() {
        if (!this.response) return;
        this.curStream = this.response.pipe(
            new ModifiedThrottle({
                bps: this.enableThrottle
                    ? Math.max(1024, this.downloadSpeed)
                    : Number.MAX_SAFE_INTEGER,
                highWaterMark: 1024,
            })
        );

        this.curStream.on("resume", () => this.response?.resume());
        this.curStream.on("pause", () => this.response?.pause());
        this.curStream.on("data", (data) => this.data(data));
        this.curStream.on("end", () => this.end());
        this.curStream.on("close", () => this.stream!.close());
        this.curStream.pipe(this.stream!);
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

    private pause() {}
    private resume() {}
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
        if (this.speedTransfer > FileDownloaderWindow.INTERVAL_Bytes) {
            const speed = Math.round(
                this.speedTransfer / ((Date.now() - this.lastTime) / 1000)
            );
            this.setSpeed(speed);
            this.resetSpeed();
        }
    }
    private resetSpeed() {
        this.lastTime = Date.now();
        this.speedTransfer = 0;
    }
    cancel() {
        if (fs.existsSync(this.downloadingState.path))
            fs.unlinkSync(this.downloadingState.path);
        this.close();
    }
    onDownloaded(size: number) {
        if (this.isDestroyed()) return;
        if (this.fileSize) this.setProgressBar(size / this.fileSize);
        this.webContents.send("onDownloaded", size);
    }
    setSpeed(speed: number) {
        if (this.isDestroyed()) return;
        this.webContents.send("onSpeed", speed);
    }
    setFileSize(size: number) {
        this.fileSize = size;
        if (this.isDestroyed()) return;
        this.webContents.send("onFileSize", size);
    }
    setResumability(state: boolean) {
        this.resumable = state;
        if (this.isDestroyed()) return;
        this.webContents.send("onResumeCapacity", state);
    }
    onChangeState(state: ProgressBarState["status"]) {
        if (this.isDestroyed()) return;
        this.webContents.send("onConnectionStatus", state);
    }

    trigger(state: boolean) {
        if (this.isDestroyed()) return;
        if (!this.response) return;
        if (state) {
            this.changeState("connecting");
            this.curStream?.resume();
            this.resetSpeed();
        } else {
            this.changeState("pause");
            this.curStream?.pause();
        }
    }

    error(err: any) {
        dialog.showErrorBox("Error Happened", err.toString());
        this.close();
    }
    end() {
        this.changeState("completed");
        this.onDownloaded(this.curSize);
        createFinishWindow({
            preloadData: {
                fileSize: this.fileSize || this.curSize,
                link: `https://www.youtube.com/watch?v=${this.videoData.vid}`,
                path: this.downloadingState.path,
            },
        }).then(() => {
            this.close();
        });
    }
}
