import { useQuery } from "@tanstack/react-query";
import { validateID } from "@utils/youtube";
import { useDispatch } from "react-redux";
import { videoActions } from "@src/store/res-slice";
import { ReactNode, useEffect } from "react";
import Loading from "../Loading";
import { getVideoData } from "@src/API";
import { useRouter } from "next/router";
import VideoViewer from "../youtubeViewer";
import TypeApplication from "../TypeApllication";
import TableDownload from "./table";
import Thumbnail from "./thumbnail";

export function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <div className="tw-bg-blue-100 tw-py-4 tw-px-2 tw-mb-5">
      <p className="tw-text-blue-900 tw-text-center">{children}</p>
    </div>
  );
}
function getTime(data: unknown, defaultN: number, maxTime: number) {
  if (typeof data == "string") return minMax(parseInt(data), maxTime);
  return defaultN;
}
function minMax(val: number, max: number, min: number = 0) {
  return Math.max(min, Math.min(val, max));
}
declare module "@distube/ytdl-core" {
  interface videoFormat {
    loudnessDb?: number;
  }
}

export default function YoutubeResult() {
  const router = useRouter();
  const {
    id,
    start: startQ,
    end: endQ,
  } = router.query as {
    id: string;
    start?: string;
    end?: string;
  };

  const dispatch = useDispatch();
  const paramQuery = useQuery({
    queryKey: ["video", id],
    queryFn: ({ signal }) => getVideoData(id, signal),
    enabled: id != undefined && validateID(id),
    cacheTime: 1 * 1000 * 60,
    staleTime: 1 * 1000 * 60,
  });

  useEffect(() => {
    if (paramQuery.data) {
      dispatch(videoActions.setData(paramQuery.data.related_videos));
    } else {
      dispatch(videoActions.setData(null));
    }
  }, [id, paramQuery.isSuccess]);

  if (!id) return null;
  if (!validateID(id)) return <ErrorMessage>Invalid video id</ErrorMessage>;
  if (paramQuery.isLoading) return <Loading />;
  if (paramQuery.isError) {
    return (
      <ErrorMessage>
        There is a problem that occurred on the server.
      </ErrorMessage>
    );
  }

  const data = paramQuery.data;
  const duration = parseInt(paramQuery.data.videoDetails.lengthSeconds);
  const [start, end] = [
    getTime(startQ, 0, duration),
    getTime(endQ, duration, duration),
  ];

  return (
    <>
      <TypeApplication defaultState={false} env="desktop">
        <VideoViewer
          start={start}
          end={end}
          duration={duration}
          id={id}
          setDuration={(start, end) => {
            router.replace(
              {
                pathname: router.pathname, // Keep the current path
                query: { ...router.query, start, end }, // Add or update the query parameters
              },
              {},
              { scroll: false }
            );
          }}
        />
      </TypeApplication>
      <section className="tw-my-2.5">
        <div className="tw-grid tw-grid-cols-12 tw-flex-1 tw-gap-6">
          <div className="tw-col-span-12 md:tw-col-span-4">
            <Thumbnail videoDetails={data.videoDetails} />
          </div>
          <div className="tw-col-span-12 md:tw-col-span-8">
            <TableDownload
              id={id}
              start={start}
              end={end}
              duration={duration}
              data={data}
            />
          </div>
        </div>
      </section>
    </>
  );
}
