import { DownloadButton } from "@src/components/downloadButton";
import { ReactNode } from "react";

export interface VideoData {
    sizeText: ReactNode;
    fileTypeText: ReactNode;
    download: () => any;
}
export interface Props {
    video: VideoData;
}
export default function MapData({ video }: Props) {
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
