import { ReactNode, useState } from "react";
import classnames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFileVideo,
    faMusic,
    faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { DownloadButton } from "../downloadButton";

export interface VideoData {
    sizeText: ReactNode;
    fileTypeText: ReactNode;
    download: () => any;
}
function MapData({ video }: { video: VideoData }) {
    return (
        <tr>
            <td className="tw-w tw-px-4 tw-py-2.5 tw-border tw-border-[#ddd] tw-w-full">
                {video.fileTypeText}
            </td>
            <td className="tw-px-4 tw-py-2.5 tw-border tw-border-[#ddd] tw-w-auto tw-min-w-[5rem]">
                <p className="tw-whitespace-nowrap">{video.sizeText}</p>
            </td>
            <td className="button-column tw-px-4 tw-py-2.5 tw-border tw-border-[#ddd] tw-w-auto">
                <DownloadButton
                    shrink
                    text="Download"
                    onClick={video.download}
                />
            </td>
        </tr>
    );
}

type TabsType = "VIDEO" | "AUDIO" | "OTHERS";

const tabs: Array<{ type: TabsType; children: React.ReactNode }> = [
    {
        children: (
            <>
                <FontAwesomeIcon icon={faVideo} />
                <span>Video</span>
            </>
        ),
        type: "VIDEO",
    },
    {
        children: (
            <>
                <FontAwesomeIcon icon={faMusic} />
                <span>Audio</span>
            </>
        ),
        type: "AUDIO",
    },
    {
        children: (
            <>
                <FontAwesomeIcon icon={faFileVideo} />
                <span>Others</span>
            </>
        ),
        type: "OTHERS",
    },
];
export type TabsData = VideoData[];
export interface Props {
    id: string;
    videos: TabsData;
    audios: TabsData;
    others: TabsData;
}
export default function TableDownload({ others, audios, videos, id }: Props) {
    const [state, setState] = useState<TabsType>("VIDEO");
    return (
        <>
            <div>
                <ul className="tw-flex tw-select-none tw-m-0 tw-p-0">
                    {tabs.map(({ children, type }, i) => {
                        return (
                            <li
                                key={i}
                                role="tab"
                                className={classnames(
                                    "tw-px-3 tw-py-2.5 tw-rounded-t-lg tw-flex tw-items-center tw-justify-center tw-gap-1.5 tw-cursor-pointer tw-font-bold ",
                                    "aria-selected:tw-text-primary aria-selected:tw-bg-[#eee] aria-selected:tw-border-[#ddd] aria-selected:tw-border-b-transparent"
                                )}
                                aria-selected={state == type}
                                onClick={() => setState(type)}
                            >
                                {children}
                            </li>
                        );
                    })}
                </ul>
                <div>
                    <table className="tw-w-full tw-border tw-border-[#ddd] tw-mb-5">
                        <tbody>
                            {state == "VIDEO" &&
                                videos.map((video, i) => (
                                    <MapData
                                        key={`${id}-${i}-${video.fileTypeText}`}
                                        video={video}
                                    />
                                ))}
                            {state == "AUDIO" &&
                                audios.map((video, i) => (
                                    <MapData
                                        key={`${id}-${i}-${video.fileTypeText}`}
                                        video={video}
                                    />
                                ))}
                            {state == "OTHERS" &&
                                others.map((video, i) => (
                                    <MapData
                                        key={`${id}-${i}-${video.fileTypeText}`}
                                        video={video}
                                    />
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
