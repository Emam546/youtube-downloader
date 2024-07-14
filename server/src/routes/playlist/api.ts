import { GetData, MergeUrl, ReturnedData } from "youtube-playlists-js";

export async function getPlayListData(
    id: string
): Promise<ReturnedData | null> {
    return await GetData(MergeUrl(id));
}
