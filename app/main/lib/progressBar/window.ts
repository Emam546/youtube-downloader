import { ApiRender, ProgressBarState } from "@shared/renderer/progress";
import { IncomingMessage } from "http";
import { StateType } from "@app/main/lib/main/downloader";
import fs, { WriteStream } from "fs-extra";
import { DownloadTheFile } from "./downloader";
import {
    BrowserWindow,
    BrowserWindowConstructorOptions,
    WebContents,
} from "electron";
import axios from "axios";
import stream from "stream";

export type FlagType = "w" | "a";
interface WebEmitter extends WebContents {
    send<Key extends keyof ApiRender.OnMethods>(
        channel: Key,
        ...args: Parameters<ApiRender.OnMethods[Key]>
    ): void;
}
declare module "electron" {
    interface BrowserWindow {
        readonly webContents: WebEmitter;
    }
}

export class FileDownloaderWindow extends BrowserWindow {
    public static readonly MAX_TRIES = 3;
    public static readonly INTERVAL_TIME = 100;
    public static Windows: Record<string, FileDownloaderWindow> = {};
    private readonly stream: WriteStream;
    private response?: IncomingMessage;
    private curInterval?: ReturnType<typeof setInterval>;
    private speedTransfer: number = 0;
    readonly link: string;
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
        link: string
    ) {
        super(options);
        const flag: FlagType =
            state.continued && fs.existsSync(state.path) ? "a" : "w";
        this.downloadingState = state;
        this.curSize = flag == "a" ? this.getRealSize() : 0;
        this.link = link;
        this.stream = fs.createWriteStream(state.path, {
            flags: flag,
        });
        this.stream.on("error", (err) => this.error(err));

        this.on("close", () => {
            FileDownloaderWindow.removeWindow(this);
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
            this.webContents.send("onResumeCapacity", this.resumable);
            const range = `bytes=${this.getRealSize()}-`;
            this.setSpeed(0);
            this.state = "connecting";
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
        if (state != this.state) this.onChangeState(state);
        this.state = state;
    }
    private pipe(response: stream.Readable) {
        response.pipe(this.stream);
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
        this.webContents.send("onSpeed", speed);
        this.webContents.send("onStatus", {
            size: this.curSize,
            speed: speed,
            fileSize: this.fileSize,
        });
    }
    setFileSize(size: number) {
        this.fileSize = size;
        this.webContents.send("onFileSize", size);
    }

    error(err: any) {
        console.error(err);
    }
    pause() {
        setTimeout(() => {
            if (this.response?.isPaused() && this.state != "completed") {
                this.changeState("pause");
            }
        }, 1000);
    }
    resume() {
        setTimeout(() => {
            if (!this.response?.isPaused()) {
                this.changeState("receiving");
            }
        }, 1000);
    }
    data(data: Buffer) {
        this.changeState("receiving");
        this.speedTransfer += data.byteLength;
        this.curSize += data.byteLength;
    }
    end() {
        this.changeState("completed");
        this.setSpeed(0);
        this.stream.close();
        this.moveTop();
    }
}
