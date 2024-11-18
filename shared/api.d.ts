import type { IpcMainEvent, IpcMainInvokeEvent } from "electron";
type ConvertToIpCMainFunc<T extends (...args: any) => any> = (
  event: IpcMainEvent,
  ...args: Parameters<T>
) => void;
type ExcludeFirst<T extends any[]> = T extends [infer First, ...infer Rest]
  ? Rest
  : never;
type ConvertFromIpCMainFunc<
  T extends (event: IpcMainEvent, ...args: any) => any
> = (...args: ExcludeFirst<Parameters<T>>) => ReturnType<T>;
type ConvertToIpCHandleMainFunc<T extends (...args: any[]) => any> = (
  event: IpcMainInvokeEvent,
  ...args: Parameters<T>
) => ReturnType<T>;
export namespace ApiMain {
  interface OnMethods {
    log(...args: any[]): void;
    setTitle(name: string): void;
    closeWindow(): void;
    openFolder(path: string): void;
    openFile(path: string): void;
    opeFileWith(path: string): void;
    setContentHeight(height: number): void;
    minimizeWindow(): void;
    hideWindow(): void;
    ToggleWindowMaximizeState(): void;
    quitApp(): void;
    shutDownComputer(force: boolean): void;
    sleepComputer(): void;
  }
  interface OnceMethods {}
  interface HandleMethods {}
  interface HandleOnceMethods {}
}
