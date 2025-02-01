import { DownloadButton } from "@src/components/common/downloadButton";
import { Media } from "../../../../scripts/types/types";
import { Label } from "../label";

// export interface VideoData {
//   size: number;
//   fileTypeText: ReactNode;
//   download: () => any;
// }
export interface Props {
  video: Media;
  title: string;
  clippedData?: {
    start: number;
    end: number;
  };
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "MB";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
export default function MapData({ video, title, clippedData }: Props) {
  if (typeof video.dlink != "string" && window.Environment == "web")
    return null;
  return (
    <tr>
      <td className="tw-w tw-px-4 tw-py-2.5 tw-border tw-border-[#ddd] tw-w-full">
        {video.text.str}
        {video.text.label && (
          <Label mode={(video.text.label.color as "blue") || "blue"}>
            {video.text.label.str}
          </Label>
        )}
      </td>
      <td className="tw-px-4 tw-py-2.5 tw-border tw-border-[#ddd] tw-w-auto tw-min-w-[5rem]">
        <p className="tw-whitespace-nowrap">
          {`${formatBytes(parseInt(`${video.size}`), 0)}`}
        </p>
      </td>
      <td className="button-column tw-px-4 tw-py-2.5 tw-border tw-border-[#ddd] tw-w-auto">
        <DownloadButton
          shrink
          text="Download"
          onClick={() => {
            if (window.Environment == "desktop")
              if (clippedData) {
                if (typeof video.dlink == "string") {
                  window.api.send("downloadVideoLink", {
                    clipped: true,
                    ...clippedData,
                    dlink: video.dlink,
                    fquality: `${video.quality}q`,
                    ftype: video.container,
                    previewLink: video.previewLink,
                    title,
                  });
                } else {
                  window.api.send("mergeVideo", {
                    clipped: true,
                    ...clippedData,
                    dlink: video.dlink.video,
                    mergeData: {
                      audioLink: video.dlink.audio,
                      videoLink: video.dlink.video,
                    },
                    fquality: `${video.quality}q`,
                    ftype: video.container,
                    previewLink: video.previewLink,
                    title,
                  });
                }
              } else if (typeof video.dlink == "string") {
                window.api.send("downloadVideoLink", {
                  clipped: false,
                  dlink: video.dlink,
                  fquality: `${video.quality}q`,
                  ftype: video.container,
                  previewLink: video.previewLink,
                  title,
                });
              } else {
                window.api.send("mergeVideo", {
                  clipped: false,
                  dlink: video.dlink.video,
                  mergeData: {
                    audioLink: video.dlink.audio,
                    videoLink: video.dlink.video,
                  },
                  fquality: `${video.quality}q`,
                  ftype: video.container,
                  previewLink: video.previewLink,
                  title,
                });
              }
            else {
              if (typeof video.dlink != "string")
                throw new Error("unimplemented");
              const link = document.createElement("a");
              link.href = video.dlink;
              link.target == "_blank";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          }}
        />
      </td>
    </tr>
  );
}
