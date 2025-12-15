import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { videoActions } from "@src/store/res-slice";
import { ReactNode, useEffect } from "react";
import { getVideoData as getVideoData } from "@src/API";
import { useRouter } from "next/router";
import VideoViewer from "../Viewer";
import Thumbnail from "../../common/thumbnail";
import { getTime } from "@src/utils/time";
import TableDownload from "@src/components/common/table";
import { loadingActions } from "@src/store/loading";

export function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <div className="tw-bg-blue-100 tw-py-4 tw-px-2 tw-mb-5">
      <p className="tw-text-blue-900 tw-text-center">{children}</p>
    </div>
  );
}

export default function VideoResults() {
  const router = useRouter();
  const { ...query } = router.query as {
    id: string;
    start?: string;
    end?: string;
  };
  const dispatch = useDispatch();
  const paramQuery = useQuery({
    queryKey: ["video", router.query.path || null, router.query.id || null],
    queryFn: ({ signal }) =>
      getVideoData(router.query.path as string, router.query, signal),
    cacheTime: 1 * 1000 * 60,
    staleTime: 1 * 1000 * 60,
    // enabled: router.query.path,
    retry: 0,
  });

  useEffect(() => {
    if (paramQuery.data) {
      dispatch(videoActions.setData(paramQuery.data.relatedData || null));
    } else {
      dispatch(videoActions.setData(null));
    }
  }, [paramQuery.data]);
  useEffect(() => {
    dispatch(
      loadingActions.setData({
        name: "search",
        state: paramQuery.isLoading,
      })
    );
  }, [paramQuery.isLoading]);
  if (paramQuery.isError) {
    return <ErrorMessage>{new String(paramQuery.error)}</ErrorMessage>;
  }
  if (paramQuery.isLoading) return;
  if (!paramQuery.data)
    return <ErrorMessage>The video is not existed</ErrorMessage>;
  const data = paramQuery.data!;
  const duration = data.video.duration
    ? Math.floor(data.video.duration)
    : undefined;
  const [start, end] = duration
    ? [
        getTime(query.start ?? data?.video?.start, 0, duration),
        getTime(query.end ?? data?.video?.end, duration, duration),
      ]
    : [undefined, undefined];
  const ClippedState =
    start != undefined &&
    end != undefined &&
    duration != undefined &&
    (start != 0 || duration - end > 1 || end - start < duration);
  return (
    <>
      {/* <TypeApplication defaultState={false} env="desktop"> */}
      {start != undefined && end != undefined && duration != undefined && (
        <VideoViewer
          start={start}
          end={end}
          duration={duration}
          url={data.video.viewerUrl}
          setDuration={(start, end) => {
            router.replace(
              {
                pathname: router.pathname, // Keep the current path
                query: { ...router.query, start, end }, // Add or update the query parameters
              },
              undefined,
              { scroll: false }
            );
          }}
        />
      )}
      {/* </TypeApplication> */}
      <section className="tw-my-2.5">
        <div className="tw-grid tw-grid-cols-12 tw-flex-1 tw-gap-6">
          <div className="tw-col-span-12 md:tw-col-span-4">
            <Thumbnail title={data.video.title} src={data.video.thumbnail} />
          </div>
          <div className="tw-col-span-12 md:tw-col-span-8">
            <TableDownload
              data={data.video.medias}
              clippedData={
                ClippedState
                  ? {
                      start: start,
                      end: end,
                    }
                  : undefined
              }
              title={data.video.title}
            />
          </div>
        </div>
      </section>
    </>
  );
}
