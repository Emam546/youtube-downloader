import { GetData, ResultData as originResultData } from "youtube-searches";
export type ResultData = originResultData;
export async function getSearchData(query: string): Promise<ResultData> {
    return await GetData(query);
}
