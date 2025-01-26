import axios from "axios";
import { ResultData } from "@serv/routes/search/api";
import type { ServerVideoInfo } from "@serv/routes/videoDownloader/api";
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
export async function getVideoData(
    id: string,
    signal?: AbortSignal
): Promise<ServerVideoInfo> {
    if (window.Environment == "desktop") {
        return await window.api.invoke("getVideoData", id);
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
export async function getListData(
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

