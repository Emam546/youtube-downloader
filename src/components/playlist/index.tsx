import { getListData } from "@src/API";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import Loading from "../Loading";
import { ErrorMessage } from "../youtubeResult";
import Link from "next/link";

export default function PlayList() {
    const { list: listId, id } = useRouter().query as {
        list: string;
        id?: string;
    };
    const paramQuery = useQuery({
        queryKey: ["list", listId],
        queryFn: ({ signal }) => getListData(listId, signal),
        enabled: listId != undefined,
        cacheTime: 1 * 1000 * 60,
        staleTime: 1 * 1000 * 60,
    });

    if (!listId) return null;
    if (paramQuery.isLoading) return null;
    if (paramQuery.isError) {
        return (
            <ErrorMessage>
                There is a problem that occurred on the server.
            </ErrorMessage>
        );
    }
    return (
        <section className="tw-my-10">
            <h3>PlayList</h3>
            <div className="tw-max-h-[30rem] tw-overflow-auto tw-mb-10 pr-2">
                {paramQuery.data?.videos.map((video, i) => {
                    return (
                        <div key={`${listId}-${i}`}>
                            <div
                                className="tw-flex tw-items-stretch px-3 py-3 tw-rounded-xl hover:tw-bg-blue-100 aria-selected:tw-bg-blue-50"
                                aria-selected={id == video.videoId}
                            >
                                <div className="tw-flex tw-items-center">
                                    <p className="tw-w-5">{i}</p>
                                </div>
                                <div className="tw-flex-1">
                                    <Link
                                        href={`/youtube/${video.videoId}?list=${listId}`}
                                        className="d-block text-decoration-none link-primary hover:tw-text-primary tw-cursor-pointer"
                                    >
                                        <div className="tw-flex tw-gap-x-3">
                                            <div className="tw-w-44">
                                                <img
                                                    src={
                                                        video.thumbnails.at(-1)
                                                            ?.url
                                                    }
                                                    alt={video.title}
                                                    className="tw-w-full tw-aspect-video tw-block"
                                                />
                                            </div>
                                            <div className="tw-flex-1">
                                                <p className="tw-leading-5 pt-2 text-black tw-text-ellipsis hover:tw-text-primary tw-cursor-pointer ">
                                                    {video.title}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
