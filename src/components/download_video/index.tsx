import { useQuery } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import Loading from "../common/Loading";
import { getVideoLinkData } from "@src/API";
import { useRouter } from "next/router";
import { isValidUrl } from "@src/utils";
import VideoViewer from "../Youtube/youtubeViewer";
import Thumbnail from "../common/thumbnail";
import TableDownload, { TabsData } from "../common/table";
import { Label } from "../common/label";

export function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <div className="tw-bg-blue-100 tw-py-4 tw-px-2 tw-mb-5">
      <p className="tw-text-blue-900 tw-text-center">{children}</p>
    </div>
  );
}

declare module "@distube/ytdl-core" {
  interface videoFormat {
    loudnessDb?: number;
  }
}

export default function DownloadResult() {
  const router = useRouter();
  const { link } = router.query as {
    link?: string;
  };
  const paramQuery = useQuery({
    queryKey: ["video_link", link],
    queryFn: ({ signal }) => getVideoLinkData(link!, signal),
    enabled: link != undefined && isValidUrl(link),
    cacheTime: 1 * 1000 * 60,
    staleTime: 1 * 1000 * 60,
  });
  const [[start, end], setTimeData] = useState([0, 0]);
  useEffect(() => {
    if (paramQuery.data) setTimeData([0, Math.ceil(paramQuery.data.duration)]);
  }, [paramQuery.data]);
  if (!link) return null;
  if (!isValidUrl(link)) return <ErrorMessage>Invalid video id</ErrorMessage>;
  if (paramQuery.isLoading) return <Loading />;
  if (paramQuery.isError) {
    return (
      <ErrorMessage>
        There is a problem that occurred on the server.
      </ErrorMessage>
    );
  }
  const data = paramQuery.data;
  const duration = Math.ceil(data.duration);
  const ClippedState = start != 0 || end != duration;
  const videos: TabsData = [
    {
      size: data.size,
      fileTypeText: (
        <>
          {`${data.height}q`} (.{data.format})
          <Label mode="blue">Original</Label>
        </>
      ),
      q: `${data.height}q`,
      download() {
        if (ClippedState) {
          window.api.send("downloadVideoLink", {
            previewLink: link,
            title: data.title,
            ftype: data.format,
            clipped: true,
            dlink: link,
            end,
            start,
            fquality: `${data.height}q`,
          });
        } else
          window.api.send("downloadVideoLink", {
            previewLink: link,
            title: data.fileName,
            ftype: data.format,
            clipped: false,
            dlink: link,
            fquality: `${data.height}q`,
          });
      },
    },
  ].sort((a, b) => {
    return parseInt(b.q) - parseInt(a.q);
  });
  return (
    <>
      <section className="tw-my-2.5">
        <VideoViewer
          start={start}
          end={end}
          duration={duration}
          setDuration={(start, end) => {
            setTimeData([start, end]);
          }}
          light={
            <>
              <img
                className="tw-w-full"
                alt={data.fileName}
                src={`data:image/jpeg;base64,${data.thumbnail}`}
              />
            </>
          }
          url={link}
        />
        <div className="tw-grid tw-grid-cols-12 tw-flex-1 tw-gap-6">
          <div className="tw-col-span-12 md:tw-col-span-4">
            <Thumbnail
              title={data.title}
              src={`data:image/jpeg;base64,${data.thumbnail}`}
            />
          </div>
          <div className="tw-col-span-12 md:tw-col-span-8">
            <TableDownload id={data.fileName} data={{ VIDEO: videos }} />
          </div>
        </div>
      </section>
    </>
  );
}
