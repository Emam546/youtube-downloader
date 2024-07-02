import {
    ConvertToIpCHandleMainFunc,
    ConvertToIpCMainFunc,
} from "@shared/index";
import { Api, ApiRender, ProgressBarState } from "@shared/renderer/progress";
import { IncomingMessage } from "http";
import { StateType } from "@app/main/lib/main/downloader";
import fs, { WriteStream } from "fs-extra";
import { DownloadTheFile } from "./downloader";
import { BrowserWindow, WebContents } from "electron";
import axios from "axios";
import Throttle from "throttle";
type OnMethodsType = {
    [K in keyof Api.OnMethods]: ConvertToIpCMainFunc<Api.OnMethods[K]>;
};
type OnceMethodsType = {
    [K in keyof Api.OnceMethods]: ConvertToIpCMainFunc<Api.OnceMethods[K]>;
};
type HandelMethodsType = {
    [K in keyof Api.HandleMethods]: ConvertToIpCHandleMainFunc<
        Api.HandleMethods[K]
    >;
};
type HandelOnceMethodsType = {
    [K in keyof Api.HandleOnceMethods]: ConvertToIpCHandleMainFunc<
        Api.HandleOnceMethods[K]
    >;
};
export type FlagType = "w" | "a";
interface WebEmitter extends WebContents {
    send<Key extends keyof ApiRender.OnMethods>(
        channel: Key,
        ...args: Parameters<ApiRender.OnMethods[Key]>
    ): void;
}
export class FileDownloader {
    public static readonly MAX_TRIES = 3;
    public static readonly INTERVAL_TIME = 1000;
    private readonly stream: WriteStream;
    private readonly webContent: WebEmitter;
    private response?: IncomingMessage;
    private curInterval?: ReturnType<typeof setInterval>;
    private speedTransfer: number = 0;
    readonly link: string;
    downloadSpeed = Number.MAX_SAFE_INTEGER;
    throttle = new Throttle(this.downloadSpeed);
    resumable?: boolean;
    fileSize?: number;
    curSize: number;
    downloadingState: StateType;
    state: ProgressBarState["status"] = "connecting";

    OnMethods: OnMethodsType = {
        log(_, ...arg) {
            console.log(...arg);
        },
    };
    OnceMethods: OnceMethodsType = {};
    HandleMethods: HandelMethodsType = {
        triggerConnection: (_, state) => {
            this.trigger(state);
        },
    };
    HandleOnceMethods: HandelOnceMethodsType = {};
    async download(num: number = 0, err?: any) {
        try {
            if (num > FileDownloader.MAX_TRIES) return this.error(err);
            const res = await axios.head(this.link, {
                validateStatus(status) {
                    return status < 400;
                },
            });
            const acceptRanges = res.headers["accept-ranges"];
            if (acceptRanges && acceptRanges === "bytes") this.resumable = true;
            else this.resumable = false;
            this.webContent.send("onResumeCapacity", this.resumable);
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
        response.on("close", () => this.close());
        response.on("resume", () => this.resume());
        response.on("error", (err) => this.error(err));
        response.on("end", () => this.end());

        response.pipe(this.throttle).pipe(this.stream);

        const length = response.headers["content-length"];
        if (length) this.setFileSize(parseInt(length));

        this.response = response;
        if (this.curInterval) clearInterval(this.curInterval);
        this.curInterval = setInterval(() => {
            if (this.state == "receiving") {
                this.setSpeed(this.speedTransfer);
                this.speedTransfer = 0;
            }
        }, FileDownloader.INTERVAL_TIME);
    }
    constructor(state: StateType, link: string, webContent: WebEmitter) {
        const flag: FlagType =
            state.continued && fs.existsSync(state.path) ? "a" : "w";
        this.downloadingState = state;
        this.curSize = flag == "w" ? this.getRealSize() : 0;
        this.link = link;
        this.stream = fs.createWriteStream(state.path, {
            flags: flag,
        });
        this.stream.on("error", (err) => this.error(err));
        this.webContent = webContent;
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

    onChangeState(state: ProgressBarState["status"]) {
        this.webContent.send("onConnectionStatus", state);
    }
    changeSpeed(speed: number) {
        this.throttle.
    }
    trigger(state: boolean) {
        if (!this.response) return;
        if (state && this.response.isPaused()) this.response.resume();
        else if (!state && !this.response.isPaused()) this.response.pause();
    }
    close() {}
    setSpeed(speed: number) {
        this.webContent.send("onSpeed", speed);
        this.webContent.send("onStatus", {
            size: this.curSize,
            speed: speed,
            fileSize: this.fileSize,
        });
    }
    setFileSize(size: number) {
        this.fileSize = size;
        this.webContent.send("onFileSize", size);
    }

    error(err: any) {
        console.error(err);
    }
    pause() {
        this.changeState("pause");
    }
    resume() {
        this.changeState("connecting");
    }
    data(chunk: Buffer) {
        this.changeState("receiving");
        this.curSize += chunk.length;
        this.speedTransfer += chunk.length;
    }
    end() {
        this.setSpeed(0);
        this.stream.close();
        const window = BrowserWindow.fromWebContents(this.webContent);
        if (!window) return;
        window.close();
    }
}
