import { StateType } from "@app/main/lib/main/downloader";
import { BrowserWindowConstructorOptions } from "electron";
import { getEstimatedVideoSize, getVideoInfo } from "./utils";
import FfmpegCommand from "fluent-ffmpeg";
import { BaseDownloaderWindow, VideoData } from "../window";
import path from "path";
export type FlagType = "w" | "a";
export interface FfmpegVideoData {
    start: number;
    duration: number;
}
class FFmpeg implements NodeJS.ReadableStream {
    readable: boolean;
    public ffmbeg: FfmpegCommand.FfmpegCommand = FfmpegCommand();
    private pauseState: boolean = true;
    constructor() {
        this.readable = true;
    }
    isPaused(): boolean {
        return this.pauseState;
    }
    unpipe(destination?: NodeJS.WritableStream): this {
        throw new Error("Method not implemented.");
    }
    unshift(chunk: string | Uint8Array, encoding?: BufferEncoding): void {
        throw new Error("Method not implemented.");
    }
    wrap(oldStream: NodeJS.ReadableStream): this {
        throw new Error("Method not implemented.");
    }
    [Symbol.asyncIterator](): AsyncIterableIterator<string | Buffer> {
        throw new Error("Method not implemented.");
    }
    addListener(
        eventName: string | symbol,
        listener: (...args: any[]) => void
    ): this {
        this.ffmbeg.addListener(eventName, listener);
        return this;
    }
    on(eventName: string | symbol, listener: (...args: any[]) => void): this {
        this.ffmbeg.on(eventName, listener);
        return this;
    }
    once(eventName: string | symbol, listener: (...args: any[]) => void): this {
        this.ffmbeg.once(eventName, listener);
        return this;
    }
    removeListener(
        eventName: string | symbol,
        listener: (...args: any[]) => void
    ): this {
        this.ffmbeg.removeListener(eventName, listener);
        return this;
    }
    off(eventName: string | symbol, listener: (...args: any[]) => void): this {
        this.ffmbeg.off(eventName, listener);
        return this;
    }
    removeAllListeners(event?: string | symbol): this {
        this.ffmbeg.removeAllListeners(event);
        return this;
    }
    setMaxListeners(n: number): this {
        this.ffmbeg.setMaxListeners(n);
        return this;
    }
    getMaxListeners(): number {
        return this.ffmbeg.getMaxListeners();
    }
    listeners(eventName: string | symbol): Function[] {
        return this.ffmbeg.listeners(eventName);
    }
    rawListeners(eventName: string | symbol): Function[] {
        return this.ffmbeg.rawListeners(eventName);
    }
    emit(eventName: string | symbol, ...args: any[]): boolean {
        return this.ffmbeg.emit(eventName, ...args);
    }
    listenerCount(eventName: string | symbol): number {
        return this.ffmbeg.listenerCount(eventName);
    }
    prependListener(
        eventName: string | symbol,
        listener: (...args: any[]) => void
    ): this {
        this.ffmbeg.prependListener(eventName, listener);
        return this;
    }
    prependOnceListener(
        eventName: string | symbol,
        listener: (...args: any[]) => void
    ): this {
        this.ffmbeg.prependOnceListener(eventName, listener);
        return this;
    }
    eventNames(): Array<string | symbol> {
        return this.ffmbeg.eventNames();
    }
    //@ts-ignore
    pipe<T extends NodeJS.WritableStream>(
        destination: T,
        options?: { end?: boolean | undefined }
    ): T {
        this.ffmbeg.pipe(destination as unknown as NodeJS.WriteStream, options);
        return destination;
    }

    read(size?: number): string | Buffer {
        throw new Error("Method not implemented.");
    }
    setEncoding(encoding: BufferEncoding): this {
        throw new Error("Method not implemented.");
    }
    pause(): this {
        if (!this.isPaused()) this.ffmbeg.kill("SIGSTOP");
        return this;
    }
    resume(): this {
        if (this.isPaused()) this.ffmbeg.kill("SIGCONT");
        return this;
    }
}
export class FfmpegCutterWindow extends BaseDownloaderWindow {
    readonly ffmpegData: FfmpegVideoData;
    constructor(
        options: BrowserWindowConstructorOptions,
        state: StateType,
        data: VideoData,
        ffmpegData: FfmpegVideoData
    ) {
        super(options, state, data);
        this.ffmpegData = ffmpegData;
    }
    async download(num: number = 0, err?: any) {
        if (num > FfmpegCutterWindow.MAX_TRIES) return this.error(err);
        try {
            const data = await getVideoInfo(this.link);
            const videoStream = data.streams.find(
                (stream) => stream.codec_type === "video"
            );
            const audioStream = data.streams.find(
                (stream) => stream.codec_type === "audio"
            );
            const response = new FFmpeg();
            // if (videoStream)
            //     response.ffmbeg = response.ffmbeg.videoCodec(
            //         videoStream.codec_name!
            //     );
            // if (audioStream)
            //     response.ffmbeg = response.ffmbeg.audioCodec(
            //         audioStream.codec_name!
            //     );

            response.ffmbeg = response.ffmbeg
                .input(this.link)
                .outputOptions(["-movflags frag_keyframe + empty_moov"])
                .withAudioCodec("copy")
                .withVideoCodec("copy")
                .toFormat("mp4")
                .setStartTime(this.ffmpegData.start)
                .duration(this.ffmpegData.duration)
                .on("progress", (progress) => {
                    console.log(progress.percent);
                });
            this.on("close", () => {
                if (response) response.ffmbeg.kill("SIGKILL");
            });
            this.pipe(response);
        } catch (err) {
            this.download(num + 1, err);
        }
    }
}
