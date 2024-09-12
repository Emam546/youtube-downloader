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
    private isPausedManually: boolean = false;
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
