import { StoreData } from "@src/store";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { ReturnedSearch } from "youtube-searches";
import Loading from "@src/components/Loading";
import { getSearchData } from "@src/API";
import Link from "next/link";
import { useRouter } from "next/router";
import { ErrorMessage } from "../youtubeResult";
type RelatedVideos = { title: string; id: string } & ReturnedSearch;
export default function RelatedVideos() {
    let data = useSelector<StoreData, RelatedVideos[] | undefined>(
        (state) => state.relatedVideos as any
    );

    const { search } = useRouter().query;
    const paramQuery = useQuery({
        queryKey: ["search", search],
        queryFn: async () => {
            const res = await getSearchData(
                typeof search == "string" ? search : ""
            );
            return res.resVideos.map((video): RelatedVideos => {
                return {
                    ...video,
                    id: video.videoId,
                    title: video.title[0],
                } as any;
            });
        },
        enabled: search != undefined,
    });
    if (!data && !search) return null;
    if (!data) {
        if (paramQuery.isLoading) return <Loading />;
        if (paramQuery.isError)
            return (
                <>
                    <ErrorMessage>
                        ErrorHappened:
                        {JSON.stringify(paramQuery.error)}
                    </ErrorMessage>
                </>
            );
        if (!data) data = paramQuery.data;
    }
    return (
        <section>
            <h3>Related Videos</h3>
            <div className="related-videos tw-mt-2">
                {data.map((video, i) => {
                    return (
                        <Link
                            href={`/youtube/${video.id}`}
                            key={i}
                            className="d-block text-decoration-none link-primary hover:tw-text-primary tw-cursor-pointer"
                        >
                            <div>
                                <img
                                    src={video.thumbnails.at(-1)?.url}
                                    alt={video.title}
                                    className="tw-w-full tw-aspect-video tw-block"
                                />
                            </div>
                            <p className="tw-leading-5 pt-2 text-black tw-text-ellipsis hover:tw-text-primary tw-cursor-pointer ">
                                {video.title}
                            </p>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
