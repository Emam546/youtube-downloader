import { Transform, TransformCallback, TransformOptions } from "stream";


export interface Options extends TransformOptions {
    bps: number;
    delayTime?: number;
}
export interface ModifiedThrottle {
    addListener(event: "close", listener: () => void): this;
    addListener(event: "data", listener: (chunk: any) => void): this;
    addListener(event: "end", listener: () => void): this;
    addListener(event: "error", listener: (err: Error) => void): this;
    addListener(event: "pause", listener: () => void): this;
    addListener(event: "readable", listener: () => void): this;
    addListener(event: "resume", listener: () => void): this;
    addListener(event: "reset-speed", listener: () => void): this;
    addListener(
        event: string | symbol,
        listener: (...args: any[]) => void
    ): this;

    emit(event: "close"): boolean;
    emit(event: "data", chunk: any): boolean;
    emit(event: "end"): boolean;
    emit(event: "error", err: Error): boolean;
    emit(event: "pause"): boolean;
    emit(event: "readable"): boolean;
    emit(event: "resume"): boolean;
    emit(event: "reset-speed", listener: () => void): this;
    emit(event: string | symbol, ...args: any[]): boolean;

    on(event: "close", listener: () => void): this;
    on(event: "data", listener: (chunk: any) => void): this;
    on(event: "end", listener: () => void): this;
    on(event: "error", listener: (err: Error) => void): this;
    on(event: "pause", listener: () => void): this;
    on(event: "readable", listener: () => void): this;
    on(event: "resume", listener: () => void): this;
    on(event: "reset-speed", listener: () => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;

    once(event: "close", listener: () => void): this;
    once(event: "data", listener: (chunk: any) => void): this;
    once(event: "end", listener: () => void): this;
    once(event: "error", listener: (err: Error) => void): this;
    once(event: "pause", listener: () => void): this;
    once(event: "readable", listener: () => void): this;
    once(event: "resume", listener: () => void): this;
    once(event: "reset-speed", listener: () => void): this;
    once(event: string | symbol, listener: (...args: any[]) => void): this;

    prependListener(event: "close", listener: () => void): this;
    prependListener(event: "data", listener: (chunk: any) => void): this;
    prependListener(event: "end", listener: () => void): this;
    prependListener(event: "error", listener: (err: Error) => void): this;
    prependListener(event: "pause", listener: () => void): this;
    prependListener(event: "readable", listener: () => void): this;
    prependListener(event: "resume", listener: () => void): this;
    prependListener(event: "reset-speed", listener: () => void): this;
    prependListener(
        event: string | symbol,
        listener: (...args: any[]) => void
    ): this;

    prependOnceListener(event: "close", listener: () => void): this;
    prependOnceListener(event: "data", listener: (chunk: any) => void): this;
    prependOnceListener(event: "end", listener: () => void): this;
    prependOnceListener(event: "error", listener: (err: Error) => void): this;
    prependOnceListener(event: "pause", listener: () => void): this;
    prependOnceListener(event: "readable", listener: () => void): this;
    prependOnceListener(event: "resume", listener: () => void): this;
    prependOnceListener(event: "reset-speed", listener: () => void): this;
    prependOnceListener(
        event: string | symbol,
        listener: (...args: any[]) => void
    ): this;

    removeListener(event: "close", listener: () => void): this;
    removeListener(event: "data", listener: (chunk: any) => void): this;
    removeListener(event: "end", listener: () => void): this;
    removeListener(event: "error", listener: (err: Error) => void): this;
    removeListener(event: "pause", listener: () => void): this;
    removeListener(event: "readable", listener: () => void): this;
    removeListener(event: "resume", listener: () => void): this;
    removeListener(event: "reset-speed", listener: () => void): this;
    removeListener(
        event: string | symbol,
        listener: (...args: any[]) => void
    ): this;
}
export class ModifiedThrottle extends Transform {
    private startDownloading = false;
    private isPausedManually = false;
    private pauseTimeout: NodeJS.Timeout | null = null;
    private delayTime: number;
    public bps: number;
    totalBytes = 0;
    startTime: number = Date.now();
    currentCall?: () => void;
    currentTimeOut?: ReturnType<typeof setTimeout>;
    constructor(opts: Options) {
        super({
            ...opts,
        });
        this.bps = opts.bps;
        this.delayTime = opts.delayTime ? opts.delayTime : 5000;
        this.on("pause", () => {
            // If a pause timeout already exists, clear it
            if (this.pauseTimeout) {
                clearTimeout(this.pauseTimeout);
            }
            // Schedule the actual pause after the delay time
            this.pauseTimeout = setTimeout(() => {
                super.pause();
                if (!this.isPausedManually && !this.closed) {
                    this.emit("delayed-pause");
                    this.once("resume", () => {
                        this.emit("resetSpeed");
                    });
                }
            }, this.delayTime);
        });
        this.on("reset-speed", () => {
            this.resetSpeed();
        });
        this.on("resume", () => {
            if (this.pauseTimeout) {
                clearTimeout(this.pauseTimeout);
                this.pauseTimeout = null;
            }
        });
        this.on("close", () => {
            this.emit("resume");
        });
    }
    _transform(
        chunk: Buffer,
        encoding: BufferEncoding,
        callback: TransformCallback
    ): void {
        if (!this.startDownloading) this.emit("reset-speed");
        this.startDownloading = true;
        const sendData = (chunk: Buffer) => {
            return new Promise<boolean>((resolve) => {
                this.totalBytes += chunk.length;
                // Calculate time passed and expected bytes to throttle
                const elapsed = (Date.now() - this.startTime) / 1000;
                const expectedBytes = elapsed * this.bps;
                const delay = Math.max(
                    0,
                    ((this.totalBytes - expectedBytes) / this.bps) * 1000
                );
                if (delay > 0) {
                    this.currentCall = () => {
                        this.asyncPush(chunk).then(resolve);
                    };
                    this.currentTimeOut = setTimeout(() => {
                        this.asyncPush(chunk).then(resolve);
                        this.currentTimeOut = undefined;
                        this.currentCall = undefined;
                    }, delay);
                } else {
                    this.asyncPush(chunk).then(resolve);
                }
            });
        };
        const process = (chunk: Buffer) => {
            if (chunk.length == 0) return callback();
            const processChunk = chunk.subarray(0, this.bps);
            sendData(processChunk).then((state) => {
                if (state) process(chunk.subarray(processChunk.length));
                else if (!this.closed) process(processChunk);
                else this.push(chunk);
            });
        };
        process(chunk);
    }

    trigger(state: boolean) {
        this.isPausedManually = !state;
        if (state) {
            this.emit("resume");
            this.emit("reset-speed");
            this.resume();
        } else this.pause();
    }
    asyncPush(
        ...p: Parameters<Transform["push"]>
    ): Promise<ReturnType<Transform["push"]>> {
        return new Promise((res) => {
            if (!this.isPausedManually && !this.isPaused())
                return res(this.push(...p));
            this.once("resume", () => {
                res(this.push(...p));
            });
        });
    }

    private resetSpeed() {
        this.startTime = Date.now();
        this.totalBytes = 0;
    }
    setSpeed(speed: number) {
        if (speed == this.bps) return;
        this.resetSpeed();
        this.bps = speed;
        if (this.currentCall) {
            if (!this.currentTimeOut) throw new Error("Unexpected error");
            clearTimeout(this.currentTimeOut);
            this.currentTimeOut = undefined;
            this.currentCall();
            this.currentCall = undefined;
        }
    }
}
