import { powerSaveBlocker } from "electron";
import Throttle from "throttle";
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
export class ModifiedThrottle extends Throttle {
    public ops: Throttle.Options;
    public bps: number;
    constructor(options: Throttle.Options) {
        super(options);
        this.ops = options;
        this.bps = options.bps;
    }
}
