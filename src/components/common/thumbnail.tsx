import { DownloadButton } from "./downloadButton";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ComponentProps } from "react";
export interface Props extends ComponentProps<"img"> {
  title: string;
  src: string;
}

export default function Thumbnail({ src, title }: Props) {
  const mutation = useMutation({
    async onMutate() {
      const fileName = `${title}-thumbnail.jpg`;
      if (window.Environment == "web") {
        const response = await axios.post(
          `/api/download`,
          {
            imageUrl: src,
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
          fileData: [src],
        });
    },
  });
  return (
    <div>
      <div className="tw-mx-auto tw-rounded">
        <img className="tw-block tw-w-full" src={src} alt={title} />
      </div>
      <div className="tw-py-3">
        <b>{title}</b>
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
