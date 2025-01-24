import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { ComponentProps, ReactNode, useEffect, useState } from "react";
import Loading from "../Loading";
import { getVideoData, getYoutubeVideoData } from "@src/API";
import { useRouter } from "next/router";
import { isValidUrl } from "@src/utils";
import VideoViewer from "../youtubeViewer";
import { DownloadButton } from "../downloadButton";

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
function Thumbnail({
  title,
  ...props
}: ComponentProps<"img"> & { title: string }) {
  return (
    <div>
      <div className="tw-mx-auto tw-rounded">
        <img className="tw-block tw-w-full" alt={title} {...props} />
      </div>
      <div className="tw-py-3">
        <b>{title}</b>
      </div>
    </div>
  );
}
export default function DownloadResult() {
  const router = useRouter();
  const { link } = router.query as {
    link?: string;
  };
  const paramQuery = useQuery({
    queryKey: ["video_link", link],
    queryFn: ({ signal }) => getVideoData(link!, signal),
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
  // const duration = parseInt(paramQuery.data.videoDetails.lengthSeconds);
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
            <img
              className="tw-w-full"
              alt={data.fileName}
              src={`data:image/jpeg;base64,${data.thumbnail}`}
            />
          }
          link={link}
        />
        <div>
          <DownloadButton text={"Download"} onClick={() => {}} />
        </div>
        <div className="tw-grid tw-grid-cols-12 tw-flex-1 tw-gap-6">
          <div className="tw-col-span-12 md:tw-col-span-8">
            {/* <TableDownload
              id={id}
              start={start}
              end={end}
              duration={duration}
              data={data}
            /> */}
          </div>
        </div>
      </section>
    </>
  );
}
