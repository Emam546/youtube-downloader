import { ConvertToIpCHandleMainFunc, ConvertToIpCMainFunc } from "@shared/api";
import { ApiMain } from "@src/types/api";
import { getPlayListData } from "@serv/routes/playlist/api";
import { DownloadVideo } from "./utils/downloadVideoLink";
import { DownloadFileToDesktop } from "./utils/DownloadFile";
import { ObjectEntries } from "@utils/index";
import { ipcMain } from "electron";
import { navigate } from "../../../../scripts/plugins/navigate";
import { getVideoData } from "../../../../scripts/plugins/getVideoData";
import { searchData } from "../../../../scripts/plugins/search";
import { predictInputString } from "../../../../scripts/plugins/predictInputString";
import { Plugins } from "./lib/plugins";
import { showContextMenu } from "./lib/context";

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
  downloadVideoLink: DownloadVideo,
  showContextMenu: showContextMenu,
};
export const OnceMethods: OnceMethodsType = {};
export const HandleMethods: HandelMethodsType = {
  getVideoData(_, ...args) {
    return getVideoData(Plugins)(...args);
  },

  getSearchData(_, ...args) {
    return searchData(Plugins)(...args);
  },
  getPlaylistData(_, id: string) {
    return getPlayListData(id);
  },
  Download(_, ...args) {
    return DownloadFileToDesktop(...args);
  },
  navigate(_, ...args) {
    return navigate(Plugins)(...args);
  },
  predictInputString(_, ...args) {
    return predictInputString(Plugins)(...args);
  },
};
export const HandleOnceMethods: HandelOnceMethodsType = {};
ObjectEntries(OnMethods).forEach(([key, val]) => {
  ipcMain.on(key, val);
});
ObjectEntries(HandleMethods).forEach(([key, val]) => {
  ipcMain.handle(key, val);
});
