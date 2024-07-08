import { ProgressBarState } from "@shared/renderer/progress";
import { IncomingMessage } from "http";
import { StateType } from "@app/main/lib/main/downloader";
import fs, { WriteStream } from "fs-extra";
import { DownloadTheFile } from "./downloader";
import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import axios from "axios";
import stream from "stream";
import { createFinishWindow } from "@app/main/helpers/create-window/finish";
import { DownloadingWindow } from "../donwloading";

export type FlagType = "w" | "a";
export interface VideoData {
    link: string;
    video: {
        title: string;
        vid: string;
    };
}
export class FileDownloaderWindow extends DownloadingWindow {
    public static readonly MAX_TRIES = 3;
    public static readonly PAUSETIME = 3000;
    public static readonly INTERVAL_Bytes = 1024 * 200;
    public static Windows: Record<string, FileDownloaderWindow> = {};
    private readonly flag: FlagType;
    private stream?: WriteStream;
    private response?: IncomingMessage;
    private curTimeOut?: ReturnType<typeof setTimeout>;
    private speedTransfer: number = 0;
    private lastTime = Date.now();
    readonly link: string;
    readonly videoData: VideoData["video"];
    enableThrottle: boolean = true;
    downloadSpeed = 1024 * 4;
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
            if (this.stream) this.stream.close();
        });

        FileDownloaderWindow.addWindow(this);
    }
    async download(num: number = 0, err?: any) {
        try {
            if (num > FileDownloaderWindow.MAX_TRIES) return this.error(err);
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
        response.on("data", (data) => this.data(data));
        response.on("pause", () => this.pause());
        response.on("resume", () => this.resume());
        response.on("error", (err) => this.error(err));
        response.on("end", () => this.end());
        const length = response.headers["content-length"];
        if (length) this.setFileSize(parseInt(length));
        this.response = response;
        if (this.curTimeOut) clearInterval(this.curTimeOut);
        this.pipe(this.response);
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
    private pipe(response: stream.Readable) {
        response.pipe(this.stream!);
    }

    setThrottleSpeed(speed: number) {
        throw new Error("unimplemented");
    }
    setThrottleState(state: boolean) {
        throw new Error("unimplemented");
    }

    private pause() {}
    private resume() {}
    private data(data: Buffer) {
        if (this.curTimeOut) clearTimeout(this.curTimeOut);
        this.curTimeOut = setTimeout(() => {
            if (this.state != "pause") this.changeState("connecting");
            this.curTimeOut = undefined;
        }, 3000);

        this.changeState("receiving");
        this.speedTransfer += data.byteLength;
        this.curSize += data.byteLength;
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
            this.response.resume();
            this.resetSpeed();
        } else {
            this.changeState("pause");
            this.response.pause();
        }
    }

    error(err: any) {
        console.error(err);
    }
    end() {
        this.changeState("completed");
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
