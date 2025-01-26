export type ConnectionStatus =
  | "receiving"
  | "pause"
  | "connecting"
  | "completed"
  | "rebuilding";
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
    previewLink: string;
  };
}
export type TabsType = "Download" | "speedLimiter" | "Options";
export interface TabState {
  type: TabsType;
  title: string;
  id: string;
  enabled: boolean;
}
export interface ProgressData {
  tabs: TabState[];
  footer: {
    pause: {
      enabled: boolean;
      text: string;
    };
    cancel: {
      enabled: boolean;
      text: string;
    };
  };
}
export interface Context extends ProgressBarState {
  throttle: boolean;
  downloadSpeed: number;
  pageData: ProgressData;
}

export namespace ApiRender {
  interface OnMethods {
    onSpeed(speed: number): void;
    onFileSize(fileSize: number): void;
    onDownloaded(size: number): void;
    onConnectionStatus(status: ConnectionStatus): void;
    onResumeCapacity(status: boolean): void;
    onEnd(): void;
    onSetPageData(data: ProgressData): void;
  }
  interface OnceMethods {}
}
export namespace Api {
  interface OnMethods {
    cancel(): void;
    showDownloadDialog(): void;
  }
  interface OnceMethods {}
  interface HandleMethods {
    triggerConnection(state: boolean): void;
    setSpeed(speed: number): void;
    setThrottle(state: boolean): void;
  }
  interface HandleOnceMethods {}
}
