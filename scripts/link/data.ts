import { getVideoInfo } from "../utils/ffmpeg";
import path from "path";
import axios from "axios";
import https from "https";
import { Media, ResponseData } from "../types/types";
import { getFrameScreenShot } from "../utils/ffmpeg";
import {
  getQualityFromResolution,
  getResizedQualitiesFromLabel,
} from "../utils";
import mime from "mime-types";
import {
  FfmpegResizeBase as LinkDownloadBase,
  FFmpegResizeData,
  FFmpegResizeData as LinkDownloadData,
} from "./download";
import { PATH } from ".";
import Ffmpeg from "fluent-ffmpeg";

const DownloadAgent = new https.Agent({
  rejectUnauthorized: false, // (NOTE: this will disable client verification)
});

const DownloadInstance = axios.create({ httpsAgent: DownloadAgent });
function isVideo(v: string) {
  return mime.contentType(v).toString().includes("video") || false;
}
export async function downloadVideoAndExtractMetadata(
  query: any
): Promise<ResponseData<LinkDownloadData> | null> {
  if (!query.link) return null;

  try {
    const url = decodeURI(query.link);
    const response = await DownloadInstance.head(url);
    // Extract filename from headers or fallback to a default name
    const contentDisposition = response.headers["content-disposition"] as
      | string
      | undefined;
    // Save video file
    const metadata = await getVideoInfo(url);
    let reqFilename;
    if (contentDisposition) {
      let startFileNameIndex = contentDisposition.indexOf('"') + 1;
      let endFileNameIndex = contentDisposition.lastIndexOf('"');
      reqFilename = contentDisposition.substring(
        startFileNameIndex,
        endFileNameIndex
      );
    }
    // Extract useful metadata
    const expectedVideoFormat =
      metadata.format.format_name?.split(",")[0] || "mp4";
    const urlFileName = decodeURI(url.split("/").pop()?.split("?")[0] || "");
    const fileName =
      (metadata.format.tags?.title as string) ||
      reqFilename ||
      (isVideo(urlFileName) ? urlFileName : undefined) ||
      `video.${expectedVideoFormat}`;

    return {
      video: await getData(metadata, url, fileName),
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}
export async function getData(
  metadata: Ffmpeg.FfprobeData,
  url: string,
  fileName: string
): Promise<NonNullable<ResponseData<LinkDownloadData>["video"]>> {
  const videoFormat = path.extname(fileName).slice(1);
  const videoSize = metadata.format.size; // in bytes
  const videoDuration = metadata.format.duration;
  const videoStreams = metadata.streams;

  // Additional info: codec and resolution
  const videoStream = videoStreams.find(
    (stream) => stream.codec_type === "video"
  );
  const audioStream = videoStreams.find(
    (stream) => stream.codec_type === "audio"
  );
  let thumbnail = await getFrameScreenShot(url);

  const orgQuality =
    videoStream &&
    getQualityFromResolution(videoStream.width!, videoStream.height!);
  return {
    duration: videoDuration!,
    thumbnail: `data:image/jpeg;base64,${thumbnail}`!,
    medias: {
      VIDEO: orgQuality && [
        {
          previewLink: url,
          container: videoFormat,
          environment: ["desktop", "web"],
          id: `${url}-org`,
          data: {
            PATH: PATH,
            previewLink: url,
            data: {
              link: url,
            },
            ftype: videoFormat,
            fquality: orgQuality.label,
            title: path.basename(fileName),
          },
          quality: orgQuality.height,
          text: {
            str: `${orgQuality.label} (.${videoFormat})`,
            label: {
              str: "original",
              color: "blue",
            },
          },
          size: videoSize,
        },
        ...(await Promise.all(
          getResizedQualitiesFromLabel(orgQuality.label).map<
            Promise<Media<FFmpegResizeData>>
          >(async (quality) => ({
            previewLink: url,
            container: videoFormat,
            environment: ["desktop"],
            id: `${url}-${quality.label}`,
            data: {
              PATH: PATH,
              previewLink: url,
              data: {
                link: url,
                resize: quality.height,
              },
              ftype: videoFormat,
              fquality: quality.label,
              title: path.basename(fileName),
            },
            quality: quality.height,
            text: {
              str: `${quality.label} (.${videoFormat})`,
              label: {
                str: "resized",
                color: "red",
              },
            },
            size:
              (await LinkDownloadBase.getEstimatedFileSize({
                link: url,
                resize: quality.height,
              })) || undefined,
          }))
        )),
      ],
      AUDIO: audioStream && [
        {
          previewLink: url,
          container: videoFormat,
          environment: ["desktop", "web"],
          id: `${url}-audioOnly-org`,
          data: {
            PATH: PATH,
            previewLink: url,
            data: {
              link: url,
              editData: {
                audioOnly: true,
              },
            },
            ftype: videoFormat,
            fquality: `${audioStream.codec_name}`,
            title: `${path.basename(fileName)} - audioOnly`,
          },
          quality: 0,
          text: {
            str: `${videoFormat} - (${audioStream.codec_name?.toUpperCase()}) ${
              audioStream.bits_per_sample
            }kbps`,
          },
          size:
            (await LinkDownloadBase.getEstimatedFileSize({
              link: url,
              editData: {
                audioOnly: true,
              },
            })) || undefined,
        },
      ],
      OTHERS: orgQuality && [
        {
          previewLink: url,
          container: videoFormat,
          environment: ["desktop", "web"],
          id: `${url}-videoOnly-org`,
          data: {
            PATH: PATH,
            previewLink: url,
            data: {
              link: url,
              editData: {
                videoOnly: true,
              },
            },
            ftype: videoFormat,
            fquality: orgQuality.label,
            title: `${path.basename(fileName)} videoOnly`,
          },
          quality: orgQuality.height,
          text: {
            str: `${orgQuality.label || 240} (.${videoFormat})`,
            label: {
              str: "video only",
              color: "red",
            },
          },
          size:
            (await LinkDownloadBase.getEstimatedFileSize({
              link: url,
              editData: {
                videoOnly: true,
              },
            })) || undefined,
        },
        ...(await Promise.all(
          getResizedQualitiesFromLabel(orgQuality.label).map<
            Promise<Media<FFmpegResizeData>>
          >(async (quality) => ({
            previewLink: url,
            container: videoFormat,
            environment: ["desktop"],
            id: `${url}-videoOnly-${quality.label}`,
            data: {
              PATH: PATH,
              previewLink: url,
              data: {
                link: url,
                resize: quality.height,
                editData: {
                  videoOnly: true,
                },
              },
              ftype: videoFormat,
              fquality: quality.label,
              title: `${path.basename(fileName)}-videoOnly`,
            },
            quality: quality.height,
            text: {
              str: `${quality.label} (.${videoFormat})`,
              label: {
                str: "video only resized",
                color: "red",
              },
            },
            size:
              (await LinkDownloadBase.getEstimatedFileSize({
                link: url,
                resize: quality.height,
                editData: {
                  videoOnly: true,
                },
              })) || undefined,
          }))
        )),
      ],
    },
    viewerUrl: url,
    title: path.basename(fileName),
  };
}
