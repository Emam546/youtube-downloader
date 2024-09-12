import { ProgressBarState, ProgressData } from "@shared/renderer/progress";
import { StateType } from "@app/main/lib/main/downloader";
import fs, { WriteStream } from "fs-extra";
import {
    BrowserWindow,
    BrowserWindowConstructorOptions,
    dialog,
} from "electron";
import { DownloadingWindow } from "../donwloading";
import { PowerStarter, ModifiedThrottle } from "./utils";
import { is } from "@electron-toolkit/utils";
import internal from "stream";
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
export interface DownloadingStatus {
    enableThrottle: boolean;
    downloadSpeed: number;
}
export interface DownloaderData {
    fileStatus: StateType;
    videoData: VideoData;
    downloadingStatus: DownloadingStatus;
    pageData: ProgressData;
}
export const defaultPageData: ProgressData = {
    footer: {
        cancel: {
            enabled: true,
            text: "Cancel",
        },
        pause: {
            enabled: false,
            text: "Pause",
        },
    },
    tabs: [
        {
            id: "0",
            title: "Download Status",
            type: "Download",
            enabled: true,
        },
        {
            id: "1",
            title: "Speed limiter",
            type: "speedLimiter",
            enabled: true,
        },
        {
            id: "2",
            title: "Options on completion",
            type: "Options",
            enabled: true,
        },
    ],
};

export class BaseDownloaderWindow extends DownloadingWindow {
    public static readonly MAX_TRIES = 3;
    private startTime = Date.now();
    public static Windows: Record<string, BaseDownloaderWindow> = {};
    public flag: FlagType;
    private stream?: WriteStream;
    private sleepId = new PowerStarter();
    private readonly curStream: ModifiedThrottle;
    private speedTransfer: number = 0;
    pageData: ProgressData;
    readonly link: string;
    readonly videoData: VideoData["video"];
    resumable?: boolean;
    enableThrottle: boolean;
    downloadSpeed: number;
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
        data: DownloaderData
    ) {
        super(options);
        this.enableThrottle = data.downloadingStatus.enableThrottle;
        this.downloadSpeed = data.downloadingStatus.downloadSpeed;
        this.curStream = new ModifiedThrottle({
            bps: this.enableThrottle
                ? Math.max(1024, this.downloadSpeed)
                : Number.MAX_SAFE_INTEGER,
            writableHighWaterMark: 1024 * 5,
            delayTime: 5000,
        });

        this.flag =
            data.fileStatus.continued && fs.existsSync(data.fileStatus.path)
                ? "a"
                : "w";
        this.downloadingState = data.fileStatus;
        this.curSize = this.flag == "a" ? this.getRealSize() : 0;
        this.link = data.videoData.link;
        this.videoData = data.videoData.video;
        this.on("close", () => {
            BaseDownloaderWindow.removeWindow(this);
            if (!this.curStream.closed) this.curStream.destroy();
            this.sleepId.stop();
        });
        this.curStream.on("reset-speed", () => {
            this.resetSpeed();
        });
        this.curStream.on("delayed-pause", () => {
            if (this.state == "receiving") this.changeState("connecting");
        });

        this.curStream.on("data", (data: Buffer) =>
            this.onGetChunk(data.byteLength)
        );
        this.pageData = data.pageData;
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

    pipe(): internal.Writable {
        if (this.stream && !this.stream.destroyed)
            throw new Error("there is unclosed stream file");
        this.stream = fs.createWriteStream(this.downloadingState.path, {
            flags: this.flag,
        });
        this.stream.on("error", (err) => this.error(err));
        this.curStream.on("end", () => {
            this.stream!.once("finish", () => {
                this.end();
            });
        });
        this.curStream.pipe(this.stream);
        return this.curStream;
    }
    onGetChunk(size: number) {
        this.sleepId.start();
        this.speedTransfer += size;
        this.curSize += size;
        this.onDownloaded(this.curSize);
        const speed = Math.round(
            this.speedTransfer / Math.ceil((Date.now() - this.startTime) / 1000)
        );
        this.onSpeed(speed);
        if (this.state != "pause") this.changeState("receiving");
    }
    end() {
        this.changeState("completed");
        this.onDownloaded(this.curSize);
        this.sleepId.stop();
        this.setProgressBar(-1);
        this.onEnd();
    }
    setResumability(state: boolean) {
        this.resumable = state;
        this.onResumability(state);
    }
    setFileSize(size?: number) {
        this.fileSize = size;
        this.onFileSize(size);
    }
    setThrottleSpeed(speed: number) {
        this.downloadSpeed = speed;
        this.setThrottleState(this.enableThrottle);
    }
    setThrottleState(state: boolean) {
        this.enableThrottle = state;
        this.resetSpeed();
        this.curStream.setSpeed(
            state ? Math.max(1024, this.downloadSpeed) : Number.MAX_SAFE_INTEGER
        );
    }
    resetSpeed() {
        this.speedTransfer = 0;
        this.startTime = Date.now();
    }
    trigger(state: boolean) {
        if (state) {
            this.changeState("connecting");
            this.setPauseButton("Pause");
            this.sleepId.start();
        } else {
            this.sleepId.stop();
            this.changeState("pause");
            this.setPauseButton("Start");
        }
        this.curStream.trigger(state);
    }
    cancel() {
        if (fs.existsSync(this.downloadingState.path))
            fs.unlinkSync(this.downloadingState.path);
        this.close();
    }
    error(err: any) {
        dialog.showErrorBox("Error Happened", err.toString());
        if (!this.isDestroyed()) this.close();
    }
    setPauseButton(state: "Pause" | "Start", enabled = true) {
        this.pageData.footer.pause.text = state;
        this.pageData.footer.pause.enabled = enabled;
        this.onSetPageData(this.pageData);
    }
    private onEnd() {
        this.webContents.send("onEnd");
    }
    private onFileSize(size?: number) {
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
    private onSetPageData(pageData: ProgressData) {
        if (this.isDestroyed()) return;
        this.webContents.send("onSetPageData", pageData);
    }
}
