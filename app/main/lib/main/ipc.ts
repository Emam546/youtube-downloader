import { ConvertToIpCHandleMainFunc, ConvertToIpCMainFunc } from "@shared/api";
import {
  convertY2mateData,
  getY2mateData,
} from "@serv/routes/videoDownloader/api";
import { getSearchData } from "@serv/routes/search/api";
import { ApiMain } from "@src/types/api";
import { getPlayListData } from "@serv/routes/playlist/api";
import { DownloadY2mate } from "./downloadY2mate";
import { DownloadFileToDesktop } from "./DownloadFile";
import { ObjectEntries } from "@utils/index";
import { ipcMain } from "electron";
import { downloadVideoAndExtractMetadata } from "./getVideoData";
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
  downloadY2mate: DownloadY2mate,
};
export const OnceMethods: OnceMethodsType = {};
export const HandleMethods: HandelMethodsType = {
  getVideoData(_, ...args) {
    return downloadVideoAndExtractMetadata(...args);
  },
  getYoutubeVideoData(_, ...args) {
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
  Download(_, props) {
    return DownloadFileToDesktop(props);
  },
};
export const HandleOnceMethods: HandelOnceMethodsType = {};
ObjectEntries(OnMethods).forEach(([key, val]) => {
  ipcMain.on(key, val);
});
ObjectEntries(HandleMethods).forEach(([key, val]) => {
  ipcMain.handle(key, val);
});
