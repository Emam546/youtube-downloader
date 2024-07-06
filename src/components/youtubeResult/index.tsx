import { useQuery } from "@tanstack/react-query";
import { validateID } from "@utils/youtube";
import { useDispatch } from "react-redux";
import { videoActions } from "@src/store/res-slice";
import { ReactNode, useEffect, useState } from "react";
import Loading from "../Loading";
import classnames from "classnames";
import { convertVideo, getVideoData, instance } from "@src/API";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFileVideo,
    faMusic,
    faVideo,
} from "@fortawesome/free-solid-svg-icons";
import ModelPopUp from "../Model";
import { DownloadButton } from "../downloadButton";
import { ServerConvertResults } from "@serv/routes/videoDownloader/api";
function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

interface VideoData {
    sizeText: ReactNode;
    fileTypeText: ReactNode;
    download: () => any;
}
function MapData({ video }: { video: VideoData }) {
    return (
        <tr>
            <td className="flex-shrink-1">{video.fileTypeText}</td>
            <td>{video.sizeText}</td>
            <td className="button-column">
                <DownloadButton
                    onClick={video.download}
                    className="btn btn-success"
                />
            </td>
        </tr>
    );
}

type TabsType = "VIDEO" | "AUDIO" | "OTHERS";
interface ModelStateType {
    key: string;
    vid: string;
    quality: string;
}

export default function YoutubeResult() {
    const [state, setState] = useState<TabsType>("VIDEO");
    const { id } = useRouter().query as { id: string };
    const [modelState, setModelState] = useState<ModelStateType | null>(null);
    const dispatch = useDispatch();
    const paramQuery = useQuery({
        queryKey: ["video", id],
        queryFn: ({ signal }) => getVideoData(id, signal),
        enabled: id != undefined && validateID(id),
        cacheTime: 1 * 1000 * 60,
        staleTime: 1 * 1000 * 60,
        onSuccess: (data) => {
            dispatch(videoActions.setData(data.related_videos));
        },
    });
    const [DownloadData, setDownloadData] = useState<ServerConvertResults>();
    useQuery({
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
        onSuccess(data) {
            setDownloadData(data);
        },
    });
    useEffect(() => {
        setDownloadData(undefined);
    }, [modelState]);
    useEffect(() => {}, [modelState]);
    useEffect(() => {
        if (paramQuery.data)
            dispatch(videoActions.setData(paramQuery.data.related_videos));
        else dispatch(videoActions.setData(null));
    }, [id]);
    if (!id) return null;
    if (paramQuery.isLoading) return <Loading />;
    if (paramQuery.isError) {
        return (
            <p className="tw-text-red-500 tw-text-center tw-text-xl">
                There is a problem that occurred on the server.
            </p>
        );
    }
    const data = paramQuery.data;
    const videos: VideoData[] = [
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
                            window.api.send("downloadY2mate", {
                                vid: id,
                                title: data.videoDetails.title,
                                dlink: video.url,
                                fquality: video.qualityLabel,
                                ftype: video.container!,
                            });
                        }
                    },
                };
            }),
    ].sort((a, b) => {
        return parseInt(b.q) - parseInt(a.q);
    });
    const audios: VideoData[] = data.formats
        .filter((v) => v.hasAudio && !v.hasVideo)
        .map((video) => {
            return {
                sizeText: `${formatBytes(parseInt(video.contentLength), 0)}`,

                fileTypeText: `${video.container.toUpperCase()} - ${
                    video.audioBitrate
                }kbps`,
                download() {
                    if (window.Environment == "web") {
                        const a = document.createElement("a");
                        a.href = video.url;
                        a.click();
                    } else {
                        window.api.send("downloadY2mate", {
                            vid: id,
                            title: data.videoDetails.title,
                            dlink: video.url,
                            fquality: `${video.audioBitrate}kbps`,
                            ftype: video.container!,
                        });
                    }
                },
            };
        });
    const others: VideoData[] = data.formats
        .filter((v) => v.hasVideo && !v.hasAudio)
        .map((video) => {
            return {
                sizeText: `${formatBytes(parseInt(video.contentLength), 0)}`,
                fileTypeText: `Video Only ${video.qualityLabel} (.${video.container})`,
                download() {
                    if (window.Environment == "web") {
                        const a = document.createElement("a");
                        a.href = video.url;
                        a.click();
                    } else {
                        window.api.send("downloadY2mate", {
                            vid: id,
                            title: data.videoDetails.title,
                            dlink: video.url,
                            fquality: video.qualityLabel,
                            ftype: video.container!,
                        });
                    }
                },
            };
        });
    return (
        <>
            <ModelPopUp
                open={modelState != null}
                title={data.videoDetails.title}
                onClose={() => {
                    setModelState(null);
                }}
            >
                <div className="tw-flex tw-items-center tw-justify-center tw-mb-4">
                    {DownloadData != undefined ? (
                        <DownloadButton
                            onClick={() => {
                                if (window.Environment == "desktop") {
                                    window.api.send(
                                        "downloadY2mate",
                                        DownloadData
                                    );
                                    setModelState(null);
                                } else {
                                    const baseURL =
                                        instance.defaults.baseURL ||
                                        location.origin;

                                    const downloadURL = new URL(
                                        "/api/watch/download",
                                        baseURL
                                    );
                                    downloadURL.searchParams.append(
                                        "k",
                                        modelState!.key
                                    );
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
                            className="tw-min-w-[10rem]"
                        />
                    ) : (
                        <Loading />
                    )}
                </div>
                <p>
                    Thank you for using our service. If you could share our
                    website with your friends, that would be a great help. Thank
                    you.
                </p>
            </ModelPopUp>
            <section className="download-result">
                <div className="row">
                    <div className="col-md-4">
                        <div>
                            <div className="thumb-nail">
                                <img
                                    src={
                                        data.videoDetails.thumbnails.at(-1)?.url
                                    }
                                    alt={data.videoDetails.title}
                                />
                            </div>
                            <div className="thumb-nail-caption">
                                <b>{data.videoDetails.title}</b>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-8">
                        <div>
                            <ul className="icon-nav tw-select-none">
                                <li
                                    className={classnames({
                                        active: state == "VIDEO",
                                    })}
                                    onClick={() => setState("VIDEO")}
                                >
                                    <FontAwesomeIcon icon={faVideo} />
                                    <span>Video</span>
                                </li>
                                <li
                                    className={classnames({
                                        active: state == "AUDIO",
                                    })}
                                    onClick={() => setState("AUDIO")}
                                >
                                    <FontAwesomeIcon icon={faMusic} />
                                    <span>Audio</span>
                                </li>
                                <li
                                    className={classnames({
                                        active: state == "OTHERS",
                                    })}
                                    onClick={() => setState("OTHERS")}
                                >
                                    <FontAwesomeIcon icon={faFileVideo} />
                                    <span>Others</span>
                                </li>
                            </ul>
                            <div className="tab-content">
                                <div>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>File type</th>
                                                <th>File size</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {state == "VIDEO" &&
                                                videos.map((video, i) => (
                                                    <MapData
                                                        key={`${data.vid}-${i}-${video.fileTypeText}`}
                                                        video={video}
                                                    />
                                                ))}
                                            {state == "AUDIO" &&
                                                audios.map((video, i) => (
                                                    <MapData
                                                        key={`${data.vid}-${i}-${video.fileTypeText}`}
                                                        video={video}
                                                    />
                                                ))}
                                            {state == "OTHERS" &&
                                                others.map((video, i) => (
                                                    <MapData
                                                        key={`${data.vid}-${i}-${video.fileTypeText}`}
                                                        video={video}
                                                    />
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
