import { ElectronAPI, IpcRendererListener } from "@electron-toolkit/preload";
import { IpcMainEvent, IpcMainInvokeEvent } from "electron";
type ConvertToIpCMainFunc<T extends (...args: any) => any> = (
    event: IpcMainEvent,
    ...args: Parameters<T>
) => void;
type ConvertToIpCHandleMainFunc<T extends (...args: any) => any> = (
    event: IpcMainInvokeEvent,
    ...args: Parameters<T>
) => ReturnType<T>;

interface ApiRender {
    on(channel: string, listener: IpcRendererListener): () => void;

    once(channel: string, listener: IpcRendererListener): () => void;

    send<Key extends keyof ApiMain.OnMethods>(
        channel: Key,
        ...args: Parameters<(ApiMain.OnMethods & ApiMain.OnceMethods)[Key]>
    ): void;
    invoke<Key extends keyof ApiMain.HandleMethods & ApiMain.HandleOnceMethods>(
        channel: Key,
        ...args: (ApiMain.HandleMethods & ApiMain.HandleOnceMethods)[Key]
    ): Promise<
        Awaited<
            ReturnType<(ApiMain.HandleMethods & ApiMain.HandleOnceMethods)[Key]>
        >
    >;
}

declare global {
    namespace ApiMain {
        interface OnMethods {
            log(...arg: unknown[]): void;
        }
        interface OnceMethods {}
        interface HandleMethods {}
        interface HandleOnceMethods {}
    }
    namespace ApiRender {
        interface OnMethods {}
        interface OnceMethods {}
        interface HandleMethods {}
        interface HandleOnceMethods {}
    }
    interface Window {
        electron: ElectronAPI;
        api: ApiRender;
        context: {};
        IS_DESKTOP: true | undefined;
    }

    const IS_DESKTOP: true | undefined;
}
declare module "electron" {
    namespace Electron {
        interface IpcMain {
            on<Key extends keyof ApiMain.OnMethods>(
                channel: Key,
                listener: ConvertToIpCMainFunc<ApiMain.OnMethods[Key]>
            ): this;
            once<Key extends keyof ApiMain.OnceMethods>(
                channel: Key,
                listener: ConvertToIpCMainFunc<ApiMain.OnceMethods[Key]>
            ): this;
            handel<Key extends keyof ApiMain.HandleMethods>(
                channel: Key,
                listener: ConvertToIpCHandleMainFunc<ApiMain.HandleMethods[Key]>
            ): this;
            handleOnce<Key extends keyof ApiMain.HandleOnceMethods>(
                channel: Key,
                listener: ConvertToIpCHandleMainFunc<
                    ApiMain.HandleOnceMethods[Key]
                >
            ): this;
        }
    }
}
