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
    link: string;
    status: ConnectionStatus;
    path: string;
    downloadingState?: DownloadingData;
    video: {
        title: string;
        vid: string;
    };
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
        cancel(): void;
    }
    interface OnceMethods {}
    interface HandleMethods {
        triggerConnection(state: boolean): void;
        setSpeed(speed: number): void;
        setThrottle(state: boolean): void;
    }
    interface HandleOnceMethods {}
}
