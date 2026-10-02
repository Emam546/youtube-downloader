import { getYoutubeData } from "@utils/server";
import { getSearchData as getSearchData } from "@serv/routes/search/api";
import { getPlayListData } from "@serv/routes/playlist/api";
import { DownloadVideo } from "@app/main/lib/main/utils/downloadVideoLink";
import { MergeVideoData } from "@app/main/lib/main/utils/mergeVideo";
import type { DownloadFileToDesktop } from "@app/main/lib/main/utils/DownloadFile";
import type { downloadVideoAndExtractMetadata } from "@app/main/lib/main/getVideoLinkData";
import { ConvertFromIpCMainFunc } from "@shared/api";
import { getVideoLinkData } from "@app/main/lib/main/getVideoLinkData";
import { showContextMenu } from "@app/main/lib/main/lib/context";
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
    "paste-text": (text: string) => void;
    downloadHistoryUpdated(): void;
  }
  interface OnceMethods {}
}
export interface DownloadHistoryItem {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  status:
    | "queued"
    | "preparing"
    | "connecting"
    | "downloading"
    | "paused"
    | "completed"
    | "failed"
    | "cancelled"
    | "interrupted";
  progress: number;
  downloadedBytes: number;
  totalBytes?: number;
  downloadSpeed?: number;
  eta?: number;
  isCompleted: boolean;
  isPaused: boolean;
  isFailed: boolean;
  isResumable: boolean;
  error?: string;
  createdAt: number;
  completedAt?: number;
  format?: string;
  quality?: string;
  filePath?: string;
  windowId?: number;
}
export namespace ApiMain {
  interface OnMethods {
    downloadVideoLink: ConvertFromIpCMainFunc<typeof DownloadVideo>;
    showContextMenu: ConvertFromIpCMainFunc<typeof showContextMenu>;
    openExtensionFolder(): void;
    openBrowserExtensionsPage(browser?: string): void;
  }
  interface OnceMethods {}
  interface HandleMethods {
    getVideoData: ReturnType<typeof getVideoData>;
    getSearchData: ReturnType<typeof searchData>;
    getPlaylistData: typeof getPlayListData;
    Download: typeof DownloadFileToDesktop;
    navigate: ReturnType<typeof navigate>;

    predictInputString: ReturnType<typeof predictInputString>;
    getDownloadHistory(): import("@shared/api").DownloadHistoryItem[];
    removeDownloadHistoryItem(id: string): void;
    clearDownloadHistory(): void;
    clearCompletedDownloads(): void;
    clearFailedDownloads(): void;
    pauseDownload(id: string): boolean;
    resumeDownload(id: string): boolean;
    cancelDownload(id: string): boolean;
    verifyDownloadFileExists(id: string): Promise<boolean>;
    getExtensionPath(): string;
  }
  interface HandleOnceMethods {}
}
