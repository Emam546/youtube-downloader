import type {
    ElectronAPI,
    IpcRendererListener,
} from "@electron-toolkit/preload";
import type { IpcMainEvent, IpcMainInvokeEvent } from "electron";
import {
    getY2mateData,
    convertY2mateData,
    ServerVideoInfo,
    ServerConvertResults,
} from "@serv/routes/videoDownloader/api";
import { getSearchData as getSearchData } from "@serv/routes/search/api";
export type ConvertToIpCMainFunc<T extends (...args: any) => any> = (
    event: IpcMainEvent,
    ...args: Parameters<T>
) => void;
export type ConvertToIpCHandleMainFunc<T extends (...args: any[]) => any> = (
    event: IpcMainInvokeEvent,
    ...args: Parameters<T>
) => ReturnType<T>;

interface ApiRender {
    on(channel: string, listener: IpcRendererListener): () => void;

    once(channel: string, listener: IpcRendererListener): () => void;

    send<Key extends keyof (ApiMain.OnMethods & ApiMain.OnceMethods)>(
        channel: Key,
        ...args: Parameters<(ApiMain.OnMethods & ApiMain.OnceMethods)[Key]>
    ): void;
    invoke<
        Key extends keyof (ApiMain.HandleMethods & ApiMain.HandleOnceMethods)
    >(
        channel: Key,
        ...args: Parameters<
            (ApiMain.HandleMethods & ApiMain.HandleOnceMethods)[Key]
        >
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
            downloadY2mate(data: ServerConvertResults): void;
        }
        interface OnceMethods {}
        interface HandleMethods {
            getVideoData: typeof getY2mateData;
            getSearchData: typeof getSearchData;
            startConvertingVideo: typeof convertY2mateData;
        }
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
    }
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
            handle<Key extends keyof ApiMain.HandleMethods>(
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
    const IS_DESKTOP: true | undefined;
}
declare module "electron" {}
