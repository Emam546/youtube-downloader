import { powerSaveBlocker } from "electron";

import { Transform, TransformCallback, TransformOptions } from "stream";
export class PowerStarter {
    private id: number | null = null;
    start() {
        if (this.id == null)
            this.id = powerSaveBlocker.start("prevent-app-suspension");
    }
    stop() {
        if (this.id != null) powerSaveBlocker.stop(this.id);
    }
}

export interface Options extends TransformOptions {
    bps: number;
    delayTime?: number;
}

export class ModifiedThrottle extends Transform {
    private pauseTimeout: NodeJS.Timeout | null = null;
    private delayTime: number;
    public bps: number;
    totalBytes: number = 0;
    startTime: number = Date.now();
    currentCall?: () => void;
    currentTimeOut?: ReturnType<typeof setTimeout>;
    constructor(opts: Options) {
        super({
            ...opts,
        });
        this.bps = opts.bps;
        this.delayTime = opts.delayTime ? opts.delayTime : 5000;
        this.on("resume", () => {
            this.resetSpeed();
        });
    }
    _transform(
        chunk: Buffer,
        encoding: BufferEncoding,
        callback: TransformCallback
    ): void {
        const sendData = (chunk: Buffer) => {
            return new Promise<void>((resolve) => {
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
                        this.push(chunk);
                        resolve();
                    };
                    this.currentTimeOut = setTimeout(() => {
                        this.push(chunk);
                        resolve();
                        this.currentTimeOut = undefined;
                        this.currentCall = undefined;
                    }, delay);
                } else {
                    this.push(chunk);
                    resolve();
                }
            });
        };
        const process = (chunk: Buffer) => {
            if (chunk.length == 0) return callback();
            const processChunk = chunk.subarray(0, this.bps);
            sendData(processChunk).then(() =>
                process(chunk.subarray(processChunk.length))
            );
        };
        process(chunk);
    }
    pause(): this {
        // If the stream is already paused, don't schedule another pause event
        if (this.isPaused()) return this;

        // If a pause timeout already exists, clear it
        if (this.pauseTimeout) {
            clearTimeout(this.pauseTimeout);
        }

        // Schedule the actual pause after the delay time
        this.pauseTimeout = setTimeout(() => {
            super.pause();
            this.emit("delayed-pause"); // Custom event after the pause
        }, this.delayTime);

        return this;
    }

    resume(): this {
        // If the stream is paused, resume it immediately

        super.resume();

        // Clear any existing pause timeout when resuming
        if (this.pauseTimeout) {
            clearTimeout(this.pauseTimeout);
            this.pauseTimeout = null;
        }

        return this;
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
