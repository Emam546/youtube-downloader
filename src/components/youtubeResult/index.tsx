import { useQuery } from "@tanstack/react-query";
import { validateID } from "@src/utils";
import { useDispatch } from "react-redux";
import { videoActions } from "@src/store/res-slice";
import { ReactNode, useEffect, useState } from "react";
import Loading from "../Loading";
import classnames from "classnames";
import { getVideoData, instance } from "@src/API";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMusic, faVideo } from "@fortawesome/free-solid-svg-icons";
import ModelPopUp from "../Model";
import React from "react";
import { DownloadButton } from "../downloadButton";
import axios from "axios";
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
function MapDataVideo({ video }: { video: VideoData }) {
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

function MapDataAudio({ video }: { video: VideoData }) {
    return (
        <tr>
            <td>{video.fileTypeText}</td>
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
type TabsType = "VIDEO" | "AUDIO";
interface ModelStateType {
    key: string;
    vid: string;
    quality: string;
    dlink: string;
    active: boolean;
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

    useQuery({
        retry: 1,
        queryKey: ["video", "convert", modelState?.vid, modelState?.key],
        queryFn: ({ signal }) => {
            const controller = new AbortController();
            signal?.addEventListener("abort", (e) => {
                controller.abort();
            });
            return new Promise<boolean>((res, rej) => {
                axios
                    .get(modelState!.dlink, {
                        validateStatus(status) {
                            res(true);
                            return true;
                        },
                        signal: controller.signal,
                    })
                    .catch((err) => rej(err));
            });
        },
        enabled: modelState != null,
        cacheTime: 3 * 1000 * 60,
        staleTime: 3 * 1000 * 60,
        onSuccess(data) {
            setModelState({ ...modelState!, active: true });
        },
    });
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
                const baseURL = instance.defaults.baseURL || location.origin;

                const downloadURL = new URL("/api/watch/download", baseURL);
                downloadURL.searchParams.append("k", video.k);
                downloadURL.searchParams.append(
                    "vid",
                    data.videoDetails.videoId
                );
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
                            dlink: downloadURL.href,
                            active: false,
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
                        const a = document.createElement("a");
                        a.href = video.url;
                        a.click();
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
                    const a = document.createElement("a");
                    a.href = video.url;
                    a.download = `YoutubeDownloader - ${data.videoDetails.title}`;
                    a.click();
                },
            };
        });
    return (
        <>
            <ModelPopUp
                open={modelState != null}
                title={data.videoDetails.title}
                onClose={() => setModelState(null)}
            >
                <div className="tw-flex tw-items-center tw-justify-center tw-mb-4">
                    {modelState?.active ? (
                        <DownloadButton
                            onClick={() => {
                                const a = document.createElement("a");
                                a.href = modelState.dlink;
                                a.rel = "noopener noreferrer";
                                a.click();
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
                            <ul className="icon-nav">
                                <li
                                    className={classnames({
                                        active: state == "VIDEO",
                                    })}
                                    onClick={() => setState("VIDEO")}
                                >
                                    <FontAwesomeIcon icon={faVideo} />
                                    Video
                                </li>
                                <li
                                    className={classnames({
                                        active: state == "AUDIO",
                                    })}
                                    onClick={() => setState("AUDIO")}
                                >
                                    <FontAwesomeIcon icon={faMusic} />
                                    Audio
                                </li>
                            </ul>
                            <div className="tab-content">
                                <div
                                    className={classnames({
                                        "tw-hidden": state != "VIDEO",
                                    })}
                                >
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>File type</th>
                                                <th>File size</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {videos.map((video, i) => (
                                                <MapDataVideo
                                                    key={`${data.vid}-${i}`}
                                                    video={video}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div
                                    className={classnames({
                                        "tw-hidden": state != "AUDIO",
                                    })}
                                >
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>File type</th>
                                                <th>File size</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {audios.map((v, i) => (
                                                <MapDataAudio
                                                    video={v}
                                                    key={`${data.vid}-${i}`}
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
