import {
  getY2mateData,
  convertY2mateData,
} from "@serv/routes/videoDownloader/api";

import { getSearchData as getSearchData } from "@serv/routes/search/api";
import { getPlayListData } from "@serv/routes/playlist/api";
import type { DownloadY2mate } from "@app/main/lib/main/downloadY2mate";
import type { DownloadFileToDesktop } from "@app/main/lib/main/DownloadFile";
import type { downloadVideoAndExtractMetadata } from "@app/main/lib/main/getVideoData";
import { ConvertFromIpCMainFunc } from "@shared/api";
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
    downloadY2mate: ConvertFromIpCMainFunc<DownloadY2mate>;
  }
  interface OnceMethods {}
  interface HandleMethods {
    getVideoData: typeof downloadVideoAndExtractMetadata;
    getYoutubeVideoData: typeof getY2mateData;
    getSearchData: typeof getSearchData;
    getPlaylistData: typeof getPlayListData;
    startConvertingVideo: typeof convertY2mateData;
    Download: typeof DownloadFileToDesktop;
  }
  interface HandleOnceMethods {}
}
