import {
    getY2mateData,
    convertY2mateData,
    ServerConvertResults,
} from "@serv/routes/videoDownloader/api";
import { getSearchData as getSearchData } from "@serv/routes/search/api";
import { getPlayListData } from "@serv/routes/playlist/api";
export interface NavigateVideo {
    video: {
        link: string;
    };
}
export interface NavigateSearch {
    video: {
        link: string;
    };
}
export type Context = NavigateVideo | NavigateSearch | null;
export namespace ApiRender {
    interface OnMethods {
        getYoutubeUrl(url: string): void;
    }
    interface OnceMethods {}
}
export namespace ApiMain {
    interface OnMethods {
        log(...arg: unknown[]): void;
        downloadY2mate(data: ServerConvertResults): void;
    }
    interface OnceMethods {}
    interface HandleMethods {
        getVideoData: typeof getY2mateData;
        getSearchData: typeof getSearchData;
        getPlaylistData: typeof getPlayListData;
        startConvertingVideo: typeof convertY2mateData;
    }
    interface HandleOnceMethods {}
}
