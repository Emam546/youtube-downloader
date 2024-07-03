export type ConnectionStatus =
    | "receiving"
    | "pause"
    | "connecting"
    | "completed";
export interface DownloadingData {
    fileSize?: number;
    downloaded: number;
    transferRate: number;
    resumeCapacity: boolean;
}
export interface ProgressBarState {
    title: string;
    link: string;
    status: ConnectionStatus;
    downloadingState?: DownloadingData;
}
export interface Context extends ProgressBarState {
    throttle: boolean;
    downloadSpeed: number;
}
export namespace ApiRender {
    interface OnMethods {
        onSpeed(speed: number): void;
        onFileSize(fileSize: number): void;
        onStatus(status: ConnectionStatus): void;
        onDownloaded(size: number): void;
        onStatus(obj: { speed: number; fileSize?: number; size: number }): void;
        onConnectionStatus(status: ConnectionStatus): void;
        onResumeCapacity(status: boolean): void;
    }
    interface OnceMethods {}
}
export namespace Api {
    interface OnMethods {
        log(...arg: unknown[]): void;
        cancel(): void;
        close(): void;
    }
    interface OnceMethods {}
    interface HandleMethods {
        triggerConnection(state: boolean): void;
        setSpeed(speed: number): void;
        setThrottle(state: boolean): void;
    }
    interface HandleOnceMethods {}
}
