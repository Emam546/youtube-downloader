import type {
    ElectronAPI,
    IpcRendererListener,
} from "@electron-toolkit/preload";
import type {
    IpcMainEvent,
    IpcMainInvokeEvent,
    IpcRendererEvent,
} from "electron";
type ConvertToIpCMainFunc<T extends (...args: any) => any> = (
    event: IpcMainEvent,
    ...args: Parameters<T>
) => void;
type ConvertToIpCHandleMainFunc<T extends (...args: any[]) => any> = (
    event: IpcMainInvokeEvent,
    ...args: Parameters<T>
) => ReturnType<T>;
import { ApiMain as Api, ApiRender as OrgApiRender } from "@shared/main";

declare global {
    namespace ApiMain {
        interface OnMethods {
            log(...args: any[]): void;
            setTitle(name: string): void;
        }
        interface OnceMethods {}
        interface HandleMethods {}
        interface HandleOnceMethods {}
    }
}

interface ApiRender {
    on<Key extends keyof ApiMain.Render.OnMethods>(
        channel: Key,
        listener: (
            event: IpcRendererEvent,
            ...args: Parameters<ApiMain.Render.OnMethods[Key]>
        ) => any
    ): void;

    once<Key extends keyof ApiMain.Render.OnceMethods>(
        channel: Key,
        listener: (
            event: IpcRendererEvent,
            ...args: Parameters<ApiMain.Render.OnceMethods[Key]>
        ) => any
    ): void;

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
    interface Window {
        electron: ElectronAPI;
        api: ApiRender;
    }
}
declare module "electron" {}