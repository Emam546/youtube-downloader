import axios from "axios";
import { ResponseData, RelatedData } from "@scripts/types/types";
import { ReturnedData as PlayListData } from "youtube-playlists-js";
export const instance = axios.create({});
export async function getSearchData(search: string): Promise<RelatedData[]> {
  if (window.Environment == "desktop") {
    return await window.api.invoke("getSearchData", search);
  } else {
    const data = await axios.get(`/api/search`, { params: { s: search } });
    return data.data.data;
  }
}
export async function getVideoData<T>(
  path: string,
  query: any,
  signal?: AbortSignal
): Promise<ResponseData<T> | null> {
  if (window.Environment == "desktop") {
    try {
      return (await window.api.invoke(
        "getVideoData",
        path,
        query
      )) as ResponseData<T>;
    } catch (error) {
      throw new Error(
        new String(error).replace(
          "Error: Error invoking remote method 'getVideoData': Error:",
          ""
        )
      );
    }
  } else {
    const data = await axios.get(`/api/${path}`, { params: { ...query } });
    return data.data.data;
  }
}
export async function predictInputStr(
  path: string,
  query: any,
  signal?: AbortSignal
): Promise<string | null> {
  if (window.Environment == "desktop") {
    return await window.api.invoke("predictInputString", path, query);
  } else {
    const data = await axios.get(`/api/${path}/predict`, {
      params: { ...query },
      signal,
    });
    return data.data.data;
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
