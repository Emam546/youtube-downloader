export type ConnectionStatus =
    | "receiving"
    | "pause"
    | "connecting"
    | "completed";
export interface ProgressBarState {
    title: string;
    link: string;
    status: ConnectionStatus;
    downloadingState?: {
        fileSize: number;
        Downloaded: number;
        transferRate: number;
        resumeCapacity: boolean;
    };
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
    }
    interface OnceMethods {}
    interface HandleMethods {
        triggerConnection(state: boolean): void;
    }
    interface HandleOnceMethods {}
}
