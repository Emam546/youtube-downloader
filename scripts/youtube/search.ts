import { GetData } from "youtube-searches";
import { RelatedData } from "../types/types";
import { PATH } from "./valid";
export async function getSearchData(query: string): Promise<RelatedData[]> {
  const data = await GetData(query);
  return [
    {
      id: "youtube-search-results",
      title: "Youtube search results",
      data: data.resVideos.map((v) => {
        return {
          id: v.videoId,
          link: `/${PATH}/${v.videoId}`,
          thumbnail: v.thumbnails.sort((a, b) => a.height - b.height).at(-1)!
            .url,
          title: v.title,
          duration: 0,
        };
      }),
    },
  ];
}
