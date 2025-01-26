import axios from "axios";
import { ResultData } from "@serv/routes/search/api";
<<<<<<< HEAD
import type {
  ServerVideoInfo,
  ServerConvertResults,
} from "@serv/routes/videoDownloader/api";
import type { VideoInfoData } from "@app/main/lib/main/getVideoData";
=======
import type { ServerVideoInfo } from "@serv/routes/videoDownloader/api";
>>>>>>> master
import { ReturnedData as PlayListData } from "youtube-playlists-js";
export const instance = axios.create({});
export async function getSearchData(search: string): Promise<ResultData> {
  if (window.Environment == "desktop") {
    return await window.api.invoke("getSearchData", search);
  } else {
    const res = await instance.get(`/api/search?search_query=${search}`);
    return res.data.data;
  }
}
export async function getYoutubeVideoData(
  id: string,
  signal?: AbortSignal
): Promise<ServerVideoInfo> {
  if (window.Environment == "desktop") {
    return await window.api.invoke("getYoutubeVideoData", id);
  } else {
    const res = await instance.get(`/api/watch`, {
      signal,
      params: {
        v: id,
      },
    });
    return res.data.data;
  }
}

export async function getVideoData(
  link: string,
  signal?: AbortSignal
): Promise<VideoInfoData> {
  if (window.Environment == "desktop") {
    return await window.api.invoke("getVideoData", link);
  } else {
    throw new Error("unimplemented feature");
  }
}
export async function getYoutubeListData(
  id: string,
  signal?: AbortSignal
): Promise<PlayListData | null> {
  if (window.Environment == "desktop") {
    return await window.api.invoke("getPlaylistData", id);
  } else {
    const res = await instance.get(`/api/playlist`, {
      signal,
      params: {
        list: id,
      },
    });
    return res.data.data;
  }
}
export interface ModelStateType {
  key: string;
  vid: string;
}
<<<<<<< HEAD
export async function convertVideoY2mate(
  state: ModelStateType,
  signal?: AbortSignal
): Promise<ServerConvertResults> {
  if (window.Environment == "desktop") {
    return await window.api.invoke(
      "startConvertingVideo",
      state!.vid,
      state!.key
    );
  } else {
    const baseURL = instance.defaults.baseURL || location.origin;
    const downloadURL = new URL("/api/watch/convert", baseURL);
    downloadURL.searchParams.append("k", state.key);
    downloadURL.searchParams.append("vid", state.vid);
    const link = downloadURL.href;
    const data = await axios.get(link, {
      signal,
    });
    return data.data.data;
  }
}
=======

>>>>>>> master
