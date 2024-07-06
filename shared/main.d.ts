import {
    getY2mateData,
    convertY2mateData,
    ServerConvertResults,
} from "@serv/routes/videoDownloader/api";
import { getSearchData as getSearchData } from "@serv/routes/search/api";

export namespace ApiRender {
    interface OnMethods {
        getYoutubeUrl(url: string);
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
        startConvertingVideo: typeof convertY2mateData;
    }
    interface HandleOnceMethods {}
}
