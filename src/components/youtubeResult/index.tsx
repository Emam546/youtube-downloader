import { videoFormat } from "ytdl-core";
import { useQuery } from "@tanstack/react-query";
import { getVideoID, validateID } from "@src/utils";
import { useDispatch } from "react-redux";
import { videoActions } from "@src/store/res-slice";
import { useEffect, useState } from "react";
import Loading from "../Loading";
import classnames from "classnames";
import { getVideoData } from "@src/API";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faDownload,
    faMusic,
    faVideo,
} from "@fortawesome/free-solid-svg-icons";
function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
function MapDataVideo(video: videoFormat, i: number, title: string) {
    if (!video.hasVideo) return null;
    if (!parseInt(video.contentLength)) return null;
    return (
        <tr key={i}>
            <td className="flex-shrink-1">
                {video.qualityLabel} (.{video.container})
                {!video.hasAudio && (
                    <span className="label bg-danger">NO AUDIO</span>
                )}
            </td>
            <td>{formatBytes(parseInt(video.contentLength), 0)}</td>
            <td className="button-column">
                <a
                    href={video.url}
                    download={`YoutubeDownloader - ${title}_${video.qualityLabel}`}
                >
                    <div className="btn btn-success">
                        <FontAwesomeIcon icon={faDownload} />
                        <span>Download</span>
                    </div>
                </a>
            </td>
        </tr>
    );
}
function MapDataAudio(video: videoFormat, i: number, title: string) {
    if (!video.hasAudio) return null;
    if (video.hasVideo) return null;
    if (!parseInt(video.contentLength)) return null;
    return (
        <tr key={i}>
            <td>
                {video.container.toUpperCase()} - {video.audioBitrate}kbps
            </td>
            <td>{formatBytes(parseInt(video.contentLength), 0)}</td>
            <td className="button-column">
                <a
                    href={video.url}
                    download={`YoutubeDownloader - ${title}`}
                >
                    <div className="btn btn-success">
                        <FontAwesomeIcon icon={faDownload} />
                        <span>Download</span>
                    </div>
                </a>
            </td>
        </tr>
    );
}
type TabsType = "VIDEO" | "AUDIO";
export default function YoutubeResult() {
    const [state, setState] = useState<TabsType>("VIDEO");
    const { id } = useRouter().query as { id: string };

    const dispatch = useDispatch();
    const paramQuery = useQuery({
        queryKey: ["video", id],
        queryFn: () => getVideoData(getVideoID(id || "")),
        enabled: id != undefined && validateID(id),
        cacheTime: 1 * 1000 * 60,
        staleTime: 1 * 1000 * 60,
        onSuccess: (data) => {
            dispatch(videoActions.setData(data.related_videos));
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
        console.error(paramQuery.error);
        return (
            <span className="text-warning">
                There is a problem that occurred on the server.
            </span>
        );
    }

    const data = paramQuery.data;
    const formats = data.formats.sort((a, b) => {
        return parseInt(b.contentLength) - parseInt(a.contentLength);
    });
    return (
        <section className="download-result">
            <div className="row">
                <div className="col-md-4">
                    <div>
                        <div className="thumb-nail">
                            <img
                                src={data.videoDetails.thumbnails.at(-1)?.url}
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
                                        {formats.map((v, i) =>
                                            MapDataVideo(
                                                v,
                                                i,
                                                data.videoDetails.title
                                            )
                                        )}
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
                                        {formats.map((v, i) =>
                                            MapDataAudio(
                                                v,
                                                i,
                                                data.videoDetails.title
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
