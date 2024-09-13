import type { ElectronAPI, IpcRenderer } from "@electron-toolkit/preload";
import type {
    IpcMainEvent,
    IpcMainInvokeEvent,
    IpcRendererEvent,
} from "electron";
import { ApiMain as Api } from "./api";
declare global {
    namespace ApiMain {
        interface OnMethods extends Api.OnMethods {}
        interface OnceMethods extends Api.OnceMethods {}
        interface HandleMethods extends Api.HandleMethods {}
        interface HandleOnceMethods extends Api.HandleOnceMethods {}
        namespace Render {
            interface OnMethods {}
            interface OnceMethods {}
        }
    }
}

interface ApiRender extends IpcRenderer {
    on<Key extends keyof ApiMain.Render.OnMethods>(
        channel: Key,
        listener: (
            event: IpcRendererEvent,
            ...args: Parameters<ApiMain.Render.OnMethods[Key]>
        ) => any
    ): () => void;

    once<Key extends keyof ApiMain.Render.OnceMethods>(
        channel: Key,
        listener: (
            event: IpcRendererEvent,
            ...args: Parameters<ApiMain.Render.OnceMethods[Key]>
        ) => any
    ): () => void;

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
