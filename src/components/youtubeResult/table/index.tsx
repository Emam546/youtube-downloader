import { ReactNode, useEffect, useState } from "react";
import classnames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileVideo,
  faMusic,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { DataClipped, ServerVideoInfo } from "@serv/routes/videoDownloader/api";
import { convertVideoY2mate, instance } from "@src/API";
import { useQuery } from "@tanstack/react-query";
import { Model } from "./model";
import MapData, { VideoData } from "./column";
import { Label } from "./label";

type TabsType = "VIDEO" | "AUDIO" | "OTHERS";

const tabs: Array<{ type: TabsType; children: React.ReactNode }> = [
  {
    children: (
      <>
        <FontAwesomeIcon icon={faVideo} />
        <span>Video</span>
      </>
    ),
    type: "VIDEO",
  },
  {
    children: (
      <>
        <FontAwesomeIcon icon={faMusic} />
        <span>Audio</span>
      </>
    ),
    type: "AUDIO",
  },
  {
    children: (
      <>
        <FontAwesomeIcon icon={faFileVideo} />
        <span>Others</span>
      </>
    ),
    type: "OTHERS",
  },
];
export interface ModelStateType {
  key: string;
  vid: string;
  quality: string;
}
export function AudioLoudnessType(
  a: number,
  b: number
): "High" | "Low" | "Same" {
  const diff = Math.abs(Math.round(a)) - Math.abs(Math.round(b));
  if (diff == 0) return "Same";
  if (a < b) return "Low";
  return "High";
}
export type TabsData = VideoData[];
export interface Props {
  id: string;
  data: ServerVideoInfo;
  start: number;
  end: number;
  duration: number;
}
export default function TableDownload({
  data,
  start,
  end,
  duration,
  id,
}: Props) {
  const [state, setState] = useState<TabsType>("VIDEO");
  const ClippedState = start != 0 || end != duration;
  const [modelState, setModelState] = useState<ModelStateType | null>(null);
  const [DownloadData, setDownloadData] = useState<DataClipped>();
  const AskingQuery = useQuery({
    retry: 1,
    queryKey: ["video", "convert", modelState?.vid, modelState?.key],
    queryFn: async ({ signal }) => {
      const controller = new AbortController();
      signal?.addEventListener("abort", (e) => {
        controller.abort();
      });
      return await convertVideoY2mate(modelState!);
    },
    enabled: modelState != null,
    cacheTime: 3 * 1000 * 60,
    staleTime: 3 * 1000 * 60,
  });
  useEffect(() => {
    setDownloadData(undefined);
  }, [modelState]);
  useEffect(() => {
    if (!AskingQuery.data) return;
    if (ClippedState) {
      setDownloadData({
        ...AskingQuery.data,
        start,
        end,
        clipped: true,
      });
    } else {
      setDownloadData({
        ...AskingQuery.data,
        clipped: false,
      });
    }
  }, [AskingQuery.data]);
  const videos: TabsData = [
    ...Object.values(data.links.mp4)
      .filter((v) => v.q != "auto")
      .filter(
        (v) =>
          !data.formats.some(
            (ov) => ov.hasVideo && ov.hasAudio && ov.qualityLabel == v.q
          )
      )
      .map((video) => {
        return {
          sizeText: video.size,
          fileTypeText: (
            <>
              {video.q} (.{video.f})
            </>
          ),
          q: video.q,
          download() {
            setModelState({
              key: video.k,
              quality: video.q,
              vid: data.videoDetails.videoId,
            });
          },
        };
      }),
    ...data.formats
      .filter((v) => v.hasVideo && v.hasAudio)
      .map((video) => {
        return {
          sizeText: parseInt(video.contentLength)
            ? formatBytes(parseInt(video.contentLength), 0)
            : "MB",
          fileTypeText: (
            <>
              {video.qualityLabel} (.{video.container})
              <Label mode="blue">Original</Label>
            </>
          ),
          q: video.qualityLabel,
          download() {
            if (window.Environment == "web") {
              const a = document.createElement("a");
              a.href = video.url;
              a.click();
            } else {
              if (ClippedState) {
                window.api.send("downloadY2mate", {
                  vid: id,
                  title: data.videoDetails.title,
                  dlink: video.url,
                  fquality: video.qualityLabel,
                  ftype: video.container!,
                  start,
                  end,
                  clipped: true,
                });
              } else {
                window.api.send("downloadY2mate", {
                  vid: id,
                  title: data.videoDetails.title,
                  dlink: video.url,
                  fquality: video.qualityLabel,
                  ftype: video.container!,
                  clipped: false,
                });
              }
            }
          },
        };
      }),
  ].sort((a, b) => {
    return parseInt(b.q) - parseInt(a.q);
  });

  const audios: TabsData = data.formats
    .filter((v) => v.hasAudio && !v.hasVideo)
    .map((audio) => {
      const loudnessType = AudioLoudnessType(
        audio.loudnessDb!,
        data.info.loudness
      );
      return {
        sizeText: `${formatBytes(parseInt(audio.contentLength), 0)}`,
        fileTypeText: (
          <p>
            {`${audio.container.toUpperCase()} - (${audio.audioCodec?.toUpperCase()}) ${
              audio.audioBitrate
            }kbps`}
            {loudnessType != "Same" && (
              <>
                <Label mode="blue">
                  {loudnessType == "Low" && "Quiet"}
                  {loudnessType == "High" && "Loud"}
                </Label>
              </>
            )}
          </p>
        ),
        download() {
          if (window.Environment == "web") {
            const a = document.createElement("a");
            a.href = audio.url;
            a.click();
          } else {
            if (ClippedState) {
              window.api.send("downloadY2mate", {
                vid: id,
                title: data.videoDetails.title,
                dlink: audio.url,
                fquality: audio.qualityLabel,
                ftype: audio.container!,
                start,
                end,
                clipped: true,
              });
            } else {
              window.api.send("downloadY2mate", {
                vid: id,
                title: data.videoDetails.title,
                dlink: audio.url,
                fquality: audio.qualityLabel,
                ftype: audio.container!,
                clipped: false,
              });
            }
          }
        },
      };
    });
  const others: TabsData = data.formats
    .filter((v) => v.hasVideo && !v.hasAudio)
    .map((video) => {
      return {
        sizeText: `${formatBytes(parseInt(video.contentLength), 0)}`,
        fileTypeText: (
          <p>
            {`Video Only ${
              video.qualityLabel
            } (${video.videoCodec?.toUpperCase()}) (.${video.container})`}
          </p>
        ),

        download() {
          if (window.Environment == "web") {
            const a = document.createElement("a");
            a.href = video.url;
            a.click();
          } else {
            if (ClippedState) {
              window.api.send("downloadY2mate", {
                vid: id,
                title: data.videoDetails.title,
                dlink: video.url,
                fquality: video.qualityLabel,
                ftype: video.container!,
                start,
                end,
                clipped: true,
              });
            } else {
              window.api.send("downloadY2mate", {
                vid: id,
                title: data.videoDetails.title,
                dlink: video.url,
                fquality: video.qualityLabel,
                ftype: video.container!,
                clipped: false,
              });
            }
          }
        },
      };
    });
  return (
    <>
      <Model
        modelState={modelState != null}
        title={data.videoDetails.title}
        onClose={() => {
          setModelState(null);
        }}
        loading={DownloadData == undefined}
        onDownload={() => {
          if (!DownloadData) throw new Error("undefined Download State");
          if (window.Environment == "desktop") {
            window.api.send("downloadY2mate", DownloadData);
            setModelState(null);
          } else {
            const baseURL = instance.defaults.baseURL || location.origin;

            const downloadURL = new URL("/api/watch/download", baseURL);
            downloadURL.searchParams.append("k", modelState!.key);
            downloadURL.searchParams.append("vid", DownloadData.vid);
            const link = downloadURL.href;
            const a = document.createElement("a");
            a.href = link;
            a.rel = "noopener noreferrer";
            a.click();
          }
        }}
      />
      <div>
        <ul className="tw-flex tw-select-none tw-m-0 tw-p-0">
          {tabs.map(({ children, type }, i) => {
            return (
              <li
                key={i}
                role="tab"
                className={classnames(
                  "tw-px-3 tw-py-2.5 tw-rounded-t-lg tw-flex tw-items-center tw-justify-center tw-gap-1.5 tw-cursor-pointer tw-font-bold ",
                  "aria-selected:tw-text-primary aria-selected:tw-bg-[#eee] aria-selected:tw-border-[#ddd] aria-selected:tw-border-b-transparent"
                )}
                aria-selected={state == type}
                onClick={() => setState(type)}
              >
                {children}
              </li>
            );
          })}
        </ul>
        <div>
          <table className="tw-w-full tw-border tw-border-[#ddd] tw-mb-5">
            <tbody>
              {state == "VIDEO" &&
                videos.map((video, i) => (
                  <MapData
                    key={`${id}-${i}-${video.fileTypeText}`}
                    video={video}
                  />
                ))}
              {state == "AUDIO" &&
                audios.map((video, i) => (
                  <MapData
                    key={`${id}-${i}-${video.fileTypeText}`}
                    video={video}
                  />
                ))}
              {state == "OTHERS" &&
                others.map((video, i) => (
                  <MapData
                    key={`${id}-${i}-${video.fileTypeText}`}
                    video={video}
                  />
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "MB";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
