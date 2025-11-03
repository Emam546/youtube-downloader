import { getYoutubeData } from "@utils/server";
import { getSearchData as getSearchData } from "@serv/routes/search/api";
import { getPlayListData } from "@serv/routes/playlist/api";
import { DownloadVideo } from "@app/main/lib/main/utils/downloadVideoLink";
import { MergeVideoData } from "@app/main/lib/main/utils/mergeVideo";
import type { DownloadFileToDesktop } from "@app/main/lib/main/utils/DownloadFile";
import type { downloadVideoAndExtractMetadata } from "@app/main/lib/main/getVideoLinkData";
import { ConvertFromIpCMainFunc } from "@shared/api";
import { getVideoLinkData } from "@app/main/lib/main/getVideoLinkData";
import { navigate } from "@scripts/plugins/navigate";
import { getVideoData } from "@scripts/plugins/getVideoData";
import { searchData } from "@scripts/plugins/search";
import { predictInputString } from "@scripts/plugins/predictInputString";
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
    downloadVideoLink: ConvertFromIpCMainFunc<typeof DownloadVideo>;
  }
  interface OnceMethods {}
  interface HandleMethods {
    getVideoData: ReturnType<typeof getVideoData>;
    getSearchData: ReturnType<typeof searchData>;
    getPlaylistData: typeof getPlayListData;
    Download: typeof DownloadFileToDesktop;
    navigate: ReturnType<typeof navigate>;
    predictInputString: ReturnType<typeof predictInputString>;
  }
  interface HandleOnceMethods {}
}
