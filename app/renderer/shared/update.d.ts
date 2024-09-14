import { ConnectionStatus } from "./progress";

export interface Context {
  curSize: number;
  fileSize: number;
}
export namespace ApiRender {
  interface OnMethods {
    onSpeed(speed: number): void;
    onFileSize(fileSize: number): void;
    onDownloaded(size: number): void;
    onConnectionStatus(status: ConnectionStatus): void;
    onResumeCapacity(status: boolean): void;
    onEnd(): void;
  }
  interface OnceMethods {}
}
export namespace Api {
  interface OnMethods {}
  interface OnceMethods {}
  interface HandleMethods {}
  interface HandleOnceMethods {}
}
