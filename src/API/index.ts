import axios from "axios";
import { ResultData } from "youtube-searches";
import type {
    ServerVideoInfo,
    ServerConvertResults,
} from "@serv/routes/videoDownloader/api";
export const instance = axios.create({});
export async function getSearchData(search: string): Promise<ResultData> {
    const res = await instance.get(`/api/search?search_query=${search}`);
    return res.data.data;
}
export async function getVideoData(
    id: string,
    signal?: AbortSignal
): Promise<ServerVideoInfo> {
    const res = await instance.get(`/api/watch?v=${id}`, { signal });
    return res.data.data;
}

