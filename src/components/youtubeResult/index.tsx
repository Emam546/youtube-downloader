/* eslint-disable jsx-a11y/role-supports-aria-props */
import { useQuery } from "@tanstack/react-query";
import { validateID } from "@utils/youtube";
import { useDispatch } from "react-redux";
import { videoActions } from "@src/store/res-slice";
import { ReactNode, useEffect, useState } from "react";
import Loading from "../Loading";
import { convertVideo, getVideoData, instance } from "@src/API";
import { useRouter } from "next/router";
import VideoViewer from "../youtubeViewer";
import TypeApplication from "../TypeApllication";
import { DataClipped } from "@serv/routes/videoDownloader/api";
import TableDownload, { TabsData } from "./table";
import Thumbnail from "./thumbnail";
import { Model } from "./model";
function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return "MB";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function ErrorMessage({ children }: { children: ReactNode }) {
    return (
        <div className="tw-bg-blue-100 tw-py-4 tw-px-2 tw-mb-5">
            <p className="tw-text-blue-900 tw-text-center">{children}</p>
        </div>
    );
}
function getTime(data: unknown, defaultN: number, maxTime: number) {
    if (typeof data == "string") return minMax(parseInt(data), maxTime);
    return defaultN;
}
function minMax(val: number, max: number, min: number = 0) {
    return Math.max(min, Math.min(val, max));
}
declare module "@distube/ytdl-core" {
    interface videoFormat {
        loudnessDb?: number;
    }
}
export interface ModelStateType {
    key: string;
    vid: string;
    quality: string;
}
export function AudioLoudnessType(
    a: number,
    b: number
): "High" | "Low" | "Same" {
    const diff = Math.abs(Math.round(a)) - Math.abs(Math.round(b));
    if (diff == 0) return "Same";
    if (a < b) return "Low";
    return "High";
}
export default function YoutubeResult() {
    const router = useRouter();
    const {
        id,
        start: startQ,
        end: endQ,
    } = router.query as {
        id: string;
        start?: string;
        end?: string;
    };

    const [modelState, setModelState] = useState<ModelStateType | null>(null);
    const dispatch = useDispatch();
    const paramQuery = useQuery({
        queryKey: ["video", id],
        queryFn: ({ signal }) => getVideoData(id, signal),
        enabled: id != undefined && validateID(id),
        cacheTime: 1 * 1000 * 60,
        staleTime: 1 * 1000 * 60,
    });
    const [DownloadData, setDownloadData] = useState<DataClipped>();
    const AskingQuery = useQuery({
        retry: 1,
        queryKey: ["video", "convert", modelState?.vid, modelState?.key],
        queryFn: async ({ signal }) => {
            const controller = new AbortController();
            signal?.addEventListener("abort", (e) => {
                controller.abort();
            });
            return await convertVideo(modelState!);
        },
        enabled: modelState != null,
        cacheTime: 3 * 1000 * 60,
        staleTime: 3 * 1000 * 60,
    });
    useEffect(() => {
        setDownloadData(undefined);
    }, [modelState]);
    useEffect(() => {
        if (!AskingQuery.data) return;
        if (ClippedState) {
            setDownloadData({
                ...AskingQuery.data,
                start,
                end,
                clipped: true,
            });
        } else {
            setDownloadData({
                ...AskingQuery.data,
                clipped: false,
            });
        }
    }, [AskingQuery.data]);
    useEffect(() => {
        if (paramQuery.data) {
            dispatch(videoActions.setData(paramQuery.data.related_videos));
        } else {
            dispatch(videoActions.setData(null));
        }
    }, [id, paramQuery.isSuccess]);

    if (!id) return null;
    if (!validateID(id)) return <ErrorMessage>Invalid video id</ErrorMessage>;
    if (paramQuery.isLoading) return <Loading />;
    if (paramQuery.isError) {
        return (
            <ErrorMessage>
                There is a problem that occurred on the server.
            </ErrorMessage>
        );
    }

    const data = paramQuery.data;

    const videos: TabsData = [
        ...Object.values(data.links.mp4)
            .filter((v) => v.q != "auto")
            .filter(
                (v) =>
                    !data.formats.some(
                        (ov) =>
                            ov.hasVideo && ov.hasAudio && ov.qualityLabel == v.q
                    )
            )
            .map((video) => {
                return {
                    sizeText: video.size,
                    fileTypeText: (
                        <>
                            {video.q} (.{video.f})
                        </>
                    ),
                    q: video.q,
                    download() {
                        setModelState({
                            key: video.k,
                            quality: video.q,
                            vid: data.videoDetails.videoId,
                        });
                    },
                };
            }),
        ...data.formats
            .filter((v) => v.hasVideo && v.hasAudio)
            .map((video) => {
                return {
                    sizeText: parseInt(video.contentLength)
                        ? formatBytes(parseInt(video.contentLength), 0)
                        : "MB",
                    fileTypeText: (
                        <>
                            {video.qualityLabel} (.{video.container})
                            <span className="label bg-primary">Original</span>
                        </>
                    ),
                    q: video.qualityLabel,
                    download() {
                        if (window.Environment == "web") {
                            const a = document.createElement("a");
                            a.href = video.url;
                            a.click();
                        } else {
                            if (ClippedState) {
                                window.api.send("downloadY2mate", {
                                    vid: id,
                                    title: data.videoDetails.title,
                                    dlink: video.url,
                                    fquality: video.qualityLabel,
                                    ftype: video.container!,
                                    start,
                                    end,
                                    clipped: true,
                                });
                            } else {
                                window.api.send("downloadY2mate", {
                                    vid: id,
                                    title: data.videoDetails.title,
                                    dlink: video.url,
                                    fquality: video.qualityLabel,
                                    ftype: video.container!,
                                    clipped: false,
                                });
                            }
                        }
                    },
                };
            }),
    ].sort((a, b) => {
        return parseInt(b.q) - parseInt(a.q);
    });

    const audios: TabsData = data.formats
        .filter((v) => v.hasAudio && !v.hasVideo)
        .map((audio) => {
            const loudnessType = AudioLoudnessType(
                audio.loudnessDb!,
                data.info.loudness
            );
            return {
                sizeText: `${formatBytes(parseInt(audio.contentLength), 0)}`,
                fileTypeText: (
                    <p>
                        {`${audio.container.toUpperCase()} - (${audio.audioCodec?.toUpperCase()}) ${
                            audio.audioBitrate
                        }kbps`}
                        {loudnessType != "Same" && (
                            <span className="label bg-primary">
                                {loudnessType == "Low" && "Quiet"}
                                {loudnessType == "High" && "Loud"}
                            </span>
                        )}
                    </p>
                ),
                download() {
                    if (window.Environment == "web") {
                        const a = document.createElement("a");
                        a.href = audio.url;
                        a.click();
                    } else {
                        if (ClippedState) {
                            window.api.send("downloadY2mate", {
                                vid: id,
                                title: data.videoDetails.title,
                                dlink: audio.url,
                                fquality: audio.qualityLabel,
                                ftype: audio.container!,
                                start,
                                end,
                                clipped: true,
                            });
                        } else {
                            window.api.send("downloadY2mate", {
                                vid: id,
                                title: data.videoDetails.title,
                                dlink: audio.url,
                                fquality: audio.qualityLabel,
                                ftype: audio.container!,
                                clipped: false,
                            });
                        }
                    }
                },
            };
        });
    const others: TabsData = data.formats
        .filter((v) => v.hasVideo && !v.hasAudio)
        .map((video) => {
            return {
                sizeText: `${formatBytes(parseInt(video.contentLength), 0)}`,
                fileTypeText: (
                    <p>
                        {`Video Only ${
                            video.qualityLabel
                        } (${video.videoCodec?.toUpperCase()}) (.${
                            video.container
                        })`}
                    </p>
                ),

                download() {
                    if (window.Environment == "web") {
                        const a = document.createElement("a");
                        a.href = video.url;
                        a.click();
                    } else {
                        if (ClippedState) {
                            window.api.send("downloadY2mate", {
                                vid: id,
                                title: data.videoDetails.title,
                                dlink: video.url,
                                fquality: video.qualityLabel,
                                ftype: video.container!,
                                start,
                                end,
                                clipped: true,
                            });
                        } else {
                            window.api.send("downloadY2mate", {
                                vid: id,
                                title: data.videoDetails.title,
                                dlink: video.url,
                                fquality: video.qualityLabel,
                                ftype: video.container!,
                                clipped: false,
                            });
                        }
                    }
                },
            };
        });
    const duration = parseInt(paramQuery.data.videoDetails.lengthSeconds);
    const [start, end] = [
        getTime(startQ, 0, duration),
        getTime(endQ, duration, duration),
    ];

    const ClippedState = start != 0 || end != duration;

    return (
        <>
            <Model
                modelState={modelState != null}
                title={data.videoDetails.title}
                onClose={() => {
                    setModelState(null);
                }}
                loading={DownloadData == undefined}
                onDownload={() => {
                    if (!DownloadData)
                        throw new Error("undefined Download State");
                    if (window.Environment == "desktop") {
                        window.api.send("downloadY2mate", DownloadData);
                        setModelState(null);
                    } else {
                        const baseURL =
                            instance.defaults.baseURL || location.origin;

                        const downloadURL = new URL(
                            "/api/watch/download",
                            baseURL
                        );
                        downloadURL.searchParams.append("k", modelState!.key);
                        downloadURL.searchParams.append(
                            "vid",
                            DownloadData.vid
                        );
                        const link = downloadURL.href;
                        const a = document.createElement("a");
                        a.href = link;
                        a.rel = "noopener noreferrer";
                        a.click();
                    }
                }}
            />

            <TypeApplication
                defaultState={false}
                env="desktop"
            >
                <VideoViewer
                    start={start}
                    end={end}
                    duration={duration}
                    id={id}
                    setDuration={(start, end) => {
                        router.replace(
                            {
                                pathname: router.pathname, // Keep the current path
                                query: { ...router.query, start, end }, // Add or update the query parameters
                            },
                            {},
                            { scroll: false }
                        );
                    }}
                />
            </TypeApplication>
            <section className="tw-my-2.5">
                <div className="tw-grid tw-grid-cols-12 tw-flex-1 tw-gap-6">
                    <div className="tw-col-span-12 md:tw-col-span-4">
                        <Thumbnail videoDetails={data.videoDetails} />
                    </div>
                    <div className="tw-col-span-12 md:tw-col-span-8">
                        <TableDownload
                            id={data.vid!}
                            videos={videos}
                            audios={audios}
                            others={others}
                        />
                    </div>
                </div>
            </section>
        </>
    );
}
