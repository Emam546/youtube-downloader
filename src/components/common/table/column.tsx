import { DownloadButton } from "@src/components/common/downloadButton";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Media } from "../../../../scripts/types/types";
import { Label } from "../label";

// export interface VideoData {
//   size: number;
//   fileTypeText: ReactNode;
//   download: () => any;
// }
export interface Props<T> {
  video: Media<T>;
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
export default function MapData({ video, title, clippedData }: Props<unknown>) {
  const mutate = useMutation({
    async onMutate(data) {
      const response = await axios.post("/api/prepare-download", data);
      const token: string = response.data.token;
      const a = document.createElement("a");
      a.href = `/api/download/${token}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    },
  });
  if (!video.environment.includes(window.Environment)) return null;
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
          disabled={mutate.isLoading}
          onClick={() => {
            const data = clippedData
              ? {
                  clipped: true,
                  ...clippedData,
                  ...video.data,
                }
              : {
                  clipped: false,
                  ...video.data,
                };
            if (window.Environment == "desktop")
              window.api.send("downloadVideoLink", data as any);
            else if (window.Environment == "web") {
              mutate.mutate(data as any);
            }
          }}
        />
      </td>
    </tr>
  );
}
