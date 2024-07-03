import axios from "axios";
import { ResultData } from "youtube-searches";
import { videoInfo } from "ytdl-core";
const domain = "";
export async function getSearchData(search: string): Promise<ResultData> {
    const res = await axios.get(`${domain}/api/search?search_query=${search}`);
    return res.data.data;
}
export async function getVideoData(id: string): Promise<videoInfo> {
    const res = await axios.get(`${domain}/api/watch?v=${id}`);
    return res.data.data;
}
