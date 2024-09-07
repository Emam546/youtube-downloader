import {
    ConvertToIpCHandleMainFunc,
    ConvertToIpCMainFunc,
} from "@shared/index";
import {
    convertY2mateData,
    getY2mateData,
} from "@serv/routes/videoDownloader/api";
import { getSearchData } from "@serv/routes/search/api";
import { createProgressBarWindow } from "../../helpers/create-window/Non-Clipped";
import { BrowserWindow } from "electron";
import { ApiMain } from "@shared/main";
import { Downloader } from "./downloader";

import { getPlayListData } from "@serv/routes/playlist/api";
import { createClippedProgressBarWindow } from "@app/main/helpers/create-window/Cliped";
type OnMethodsType = {
    [K in keyof ApiMain.OnMethods]: ConvertToIpCMainFunc<ApiMain.OnMethods[K]>;
};
type OnceMethodsType = {
    [K in keyof ApiMain.OnceMethods]: ConvertToIpCMainFunc<
        ApiMain.OnceMethods[K]
    >;
};
type HandelMethodsType = {
    [K in keyof ApiMain.HandleMethods]: ConvertToIpCHandleMainFunc<
        ApiMain.HandleMethods[K]
    >;
};
type HandelOnceMethodsType = {
    [K in keyof ApiMain.HandleOnceMethods]: ConvertToIpCHandleMainFunc<
        ApiMain.HandleOnceMethods[K]
    >;
};
export const OnMethods: OnMethodsType = {
    async downloadY2mate(e, data) {
        const window = BrowserWindow.fromWebContents(e.sender);
        if (!window) throw new Error("Undefined Window");
        const state = await Downloader(data, window);
        if (!state) return;
        if (data.clipped) {
            createClippedProgressBarWindow({
                stateData: state,
                preloadData: {
                    path: state.path,
                    link: data.dlink,
                    video: {
                        title: data.title,
                        vid: data.vid,
                    },
                },
                clippedData: { end: data.end, start: data.start },
            });
        } else
            createProgressBarWindow({
                stateData: state,
                preloadData: {
                    path: state.path,
                    link: data.dlink,
                    video: {
                        title: data.title,
                        vid: data.vid,
                    },
                },
            });
    },
};
export const OnceMethods: OnceMethodsType = {};
export const HandleMethods: HandelMethodsType = {
    getVideoData(_, ...args) {
        return getY2mateData(...args);
    },
    getSearchData(_, ...args) {
        return getSearchData(...args);
    },
    startConvertingVideo(_, ...args) {
        return convertY2mateData(...args);
    },
    getPlaylistData(_, id: string) {
        return getPlayListData(id);
    },
};
export const HandleOnceMethods: HandelOnceMethodsType = {};
