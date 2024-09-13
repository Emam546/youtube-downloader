import { videoInfo } from "@distube/ytdl-core";
import { DownloadButton } from "../downloadButton";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import mime from "mime-types";
export interface Props {
    videoDetails: videoInfo["videoDetails"];
}

export default function Thumbnail({ videoDetails }: Props) {
    const largeImage = videoDetails.thumbnails.reduce(
        (cur, acc) => (cur.height > acc.height ? cur : acc),
        videoDetails.thumbnails[0]
    );
    const mutation = useMutation({
        async onMutate() {
            const fileName = `${videoDetails.title}-thumbnail.jpg`;
            if (window.Environment == "web") {
                const response = await axios.post(
                    `/api/download`,
                    {
                        imageUrl: largeImage.url,
                    },
                    { responseType: "blob" }
                );
                const blob = new Blob([response.data], { type: "image/jpeg" });
                const url = URL.createObjectURL(blob);
                // Create a link element
                const link = document.createElement("a");
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                return true;
            }
            if (window.Environment == "desktop")
                return await window.api.invoke("Download", {
                    fileName,
                    fileData: [largeImage.url],
                });
        },
    });
    return (
        <div>
            <div className="tw-mx-auto tw-rounded">
                <img
                    className="tw-block tw-w-full"
                    src={videoDetails.thumbnails.at(-1)?.url}
                    alt={videoDetails.title}
                />
            </div>
            <div className="tw-py-3">
                <b>{videoDetails.title}</b>
            </div>
            <DownloadButton
                className="tw-w-full"
                text="Thumbnail"
                disabled={mutation.isLoading}
                onClick={() => {
                    mutation.mutate();
                }}
            />
        </div>
    );
}
