import { ProgressBarState } from "@shared/renderer/progress";
import { IncomingMessage } from "http";
import { StateType } from "@app/main/lib/main/downloader";
import fs, { WriteStream } from "fs-extra";
import { DownloadTheFile } from "./downloader";
import {
    BrowserWindow,
    BrowserWindowConstructorOptions,
} from "electron";
import axios from "axios";
import stream from "stream";
import { createFinishWindow } from "@app/main/helpers/create-window/finsih";

export type FlagType = "w" | "a";
export interface VideoData {
    link: string;
    video: {
        title: string;
        vid: string;
    };
}
export class FileDownloaderWindow extends BrowserWindow {
    public static readonly MAX_TRIES = 3;
    public static readonly INTERVAL_TIME = 100;
    public static Windows: Record<string, FileDownloaderWindow> = {};
    private readonly flag: FlagType;
    private stream?: WriteStream;
    private response?: IncomingMessage;
    private curInterval?: ReturnType<typeof setInterval>;
    private speedTransfer: number = 0;
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
            if (acceptRanges && acceptRanges === "bytes") this.resumable = true;
            else this.resumable = false;
            if (res.headers["Content-Length"]) {
                const length = parseInt(
                    res.headers["Content-Length"] as string
                );
                if (!isNaN(length)) {
                    if (length == this.curSize) return this.end();
                    this.setFileSize(length);
                }
            }
            this.webContents.send("onResumeCapacity", this.resumable);
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
        if (this.curInterval) clearInterval(this.curInterval);
        this.curInterval = setInterval(() => {
            if (this.speedTransfer > 0) {
                const speed = Math.round(
                    this.speedTransfer /
                        (FileDownloaderWindow.INTERVAL_TIME / 1000)
                );
                this.setSpeed(speed);
                this.speedTransfer = 0;
            }
        }, FileDownloaderWindow.INTERVAL_TIME);
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
    onChangeState(state: ProgressBarState["status"]) {
        this.webContents.send("onConnectionStatus", state);
    }
    setThrottleSpeed(speed: number) {
        throw new Error("unimplemented");
    }
    setThrottleState(state: boolean) {
        throw new Error("unimplemented");
    }
    trigger(state: boolean) {
        if (this.isDestroyed()) return;

        if (!this.response) return;
        if (state && this.response.isPaused()) {
            this.response.resume();
            this.changeState("receiving");
        } else if (!state && !this.response.isPaused()) {
            this.changeState("pause");
            this.response.pause();
        }
    }
    setSpeed(speed: number) {
        if (this.isDestroyed()) return;
        this.webContents.send("onSpeed", speed);
        this.webContents.send("onStatus", {
            size: this.curSize,
            speed: speed,
            fileSize: this.fileSize,
        });
    }
    setFileSize(size: number) {
        if (this.isDestroyed()) return;
        this.fileSize = size;
        this.webContents.send("onFileSize", size);
    }

    error(err: any) {
        console.error(err);
    }
    pause() {
        if (this.response?.isPaused() && this.state != "completed") {
            this.changeState("pause");
        }
    }
    resume() {
        if (!this.response?.isPaused()) {
            this.changeState("receiving");
        }
    }
    data(data: Buffer) {
        this.changeState("receiving");
        this.speedTransfer += data.byteLength;
        this.curSize += data.byteLength;
    }
    cancel() {
        if (fs.existsSync(this.downloadingState.path))
            fs.unlinkSync(this.downloadingState.path);
        this.close();
    }
    end() {
        this.changeState("completed");
        this.setSpeed(0);
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
