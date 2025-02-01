import axios from "axios";
import { ReturnedData as PlayListData } from "youtube-playlists-js";
export const instance = axios.create({});
export async function getSearchData(search: string) {
  if (window.Environment == "desktop") {
    return await window.api.invoke("getSearchData", search);
  } else {
    throw new Error("unimplemented");
  }
}
export async function getVideoData(
  path: string,
  query: any,
  signal?: AbortSignal
) {
  if (window.Environment == "desktop") {
    return await window.api.invoke("getVideoData", path, query);
  } else {
    throw new Error("unimplemented");
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
