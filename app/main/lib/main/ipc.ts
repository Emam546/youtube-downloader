import { ConvertToIpCHandleMainFunc, ConvertToIpCMainFunc } from "@shared/api";
import { ApiMain } from "@src/types/api";
import { getPlayListData } from "@serv/routes/playlist/api";
import { DownloadVideoLink } from "./utils/downloadVideoLink";
import { DownloadFileToDesktop } from "./utils/DownloadFile";
import { ObjectEntries } from "@utils/index";
import { ipcMain } from "electron";
import { MergeVideoData } from "./utils/mergeVideo";
import { navigate } from "./lib/navigate";
import { getVideoData } from "./lib/getVideoData";
import { searchData } from "./lib/search";
import { predictInputString } from "./lib/predictInputString";

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
  downloadVideoLink: DownloadVideoLink,
  mergeVideo: MergeVideoData,
};
export const OnceMethods: OnceMethodsType = {};
export const HandleMethods: HandelMethodsType = {
  getVideoData(_, ...args) {
    return getVideoData(...args);
  },
  getSearchData(_, ...args) {
    return searchData(...args);
  },
  getPlaylistData(_, id: string) {
    return getPlayListData(id);
  },
  Download(_, ...args) {
    return DownloadFileToDesktop(...args);
  },
  navigate(_, ...args) {
    return navigate(...args);
  },
  predictInputString(_, ...args) {
    return predictInputString(...args);
  },
};
export const HandleOnceMethods: HandelOnceMethodsType = {};
ObjectEntries(OnMethods).forEach(([key, val]) => {
  ipcMain.on(key, val);
});
ObjectEntries(HandleMethods).forEach(([key, val]) => {
  ipcMain.handle(key, val);
});
