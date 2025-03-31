import { getYoutubeData } from "@utils/server";
import { getSearchData as getSearchData } from "@serv/routes/search/api";
import { getPlayListData } from "@serv/routes/playlist/api";
import { DownloadVideoLink } from "@app/main/lib/main/utils/downloadVideoLink";
import { MergeVideoData } from "@app/main/lib/main/utils/mergeVideo";
import type { DownloadFileToDesktop } from "@app/main/lib/main/utils/DownloadFile";
import type { downloadVideoAndExtractMetadata } from "@app/main/lib/main/getVideoLinkData";
import { ConvertFromIpCMainFunc } from "@shared/api";
import { getVideoLinkData } from "@app/main/lib/main/getVideoLinkData";
import { navigate } from "@app/main/lib/main/lib/navigate";
import { getVideoData } from "@app/main/lib/main/lib/getVideoData";
import { searchData } from "@app/main/lib/main/lib/search";
import { predictInputString } from "@app/main/lib/main/lib/predictInputString";
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
    getInputUrl(url: string): void;
  }
  interface OnceMethods {}
}
export namespace ApiMain {
  interface OnMethods {
    downloadVideoLink: ConvertFromIpCMainFunc<typeof DownloadVideoLink>;
    mergeVideo: ConvertFromIpCMainFunc<typeof MergeVideoData>;
  }
  interface OnceMethods {}
  interface HandleMethods {
    getVideoData: typeof getVideoData;
    getSearchData: typeof searchData;
    getPlaylistData: typeof getPlayListData;
    Download: typeof DownloadFileToDesktop;
    navigate: typeof navigate;
    predictInputString: typeof predictInputString;
  }
  interface HandleOnceMethods {}
}
