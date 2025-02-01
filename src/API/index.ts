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
export async function getVideoData(
  path: string,
  query: any,
  signal?: AbortSignal
): Promise<ResponseData | null> {
  if (window.Environment == "desktop") {
    return await window.api.invoke("getVideoData", path, query);
  } else {
    const data = await axios.get(`/api/${path}`, { params: { ...query } });
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
