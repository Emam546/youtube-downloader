import axios from "axios";
import { ResultData } from "@serv/routes/search/api";
import type {
    ServerVideoInfo,
    ServerConvertResults,
} from "@serv/routes/videoDownloader/api";
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
export interface ModelStateType {
    key: string;
    vid: string;
}
export async function convertVideo(
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
