import { DownloadButton } from "@src/components/common/downloadButton";
import { ReactNode } from "react";

export interface VideoData {
  size: number;
  fileTypeText: ReactNode;
  download: () => any;
}
export interface Props {
  video: VideoData;
}
function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "MB";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
export default function MapData({ video }: Props) {
  return (
    <tr>
      <td className="tw-w tw-px-4 tw-py-2.5 tw-border tw-border-[#ddd] tw-w-full">
        {video.fileTypeText}
      </td>
      <td className="tw-px-4 tw-py-2.5 tw-border tw-border-[#ddd] tw-w-auto tw-min-w-[5rem]">
        <p className="tw-whitespace-nowrap">
          {`${formatBytes(parseInt(`${video.size}`), 0)}`}
        </p>
      </td>
      <td className="button-column tw-px-4 tw-py-2.5 tw-border tw-border-[#ddd] tw-w-auto">
        <DownloadButton shrink text="Download" onClick={video.download} />
      </td>
    </tr>
  );
}
