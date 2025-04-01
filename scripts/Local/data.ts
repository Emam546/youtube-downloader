import { getVideoInfo } from "../link/utils";
import fs from "fs";
import path from "path";
import https from "https";
import { ResponseData, ReturnedSearch } from "../types/types";
import { getOriginalFileName } from "@utils/server";
import { PATH } from "./valid";
import { getFrameScreenShot } from "../utils/ffmpeg";
import { getVideoQualityLabel } from "../utils";

async function getVideoData(filePath: string) {
  const metadata = await getVideoInfo(filePath);

  // Extract useful metadata
  const videoFormat = metadata.format.format_name?.split(",")[0] || "mp4";
  const fileName = getOriginalFileName(path.basename(filePath));
  const videoSize = metadata.format.size; // in bytes
  const videoDuration = metadata.format.duration;
  const videoStreams = metadata.streams;

  // Additional info: codec and resolution
  const videoStream = videoStreams.find(
    (stream) => stream.codec_type === "video"
  );
  let thumbnail = await getFrameScreenShot(filePath);

  return {
    duration: videoDuration!,
    thumbnail: `data:image/jpeg;base64,${thumbnail}`!,
    medias: {
      VIDEO: [
        {
          container: videoFormat,
          dlink: filePath,
          id: `${filePath}-org`,
          previewLink: filePath,
          quality:
            getVideoQualityLabel(
              videoStream?.width || 0,
              videoStream?.height || 240
            )?.height || 240,
          text: {
            str: `${videoStream?.height || 240} (.${videoFormat})`,
          },
          size: videoSize,
        },
      ],
    },
    viewerUrl: `video:///${encodeURI(filePath)}`,
    title: path.basename(fileName),
    filePath,
  };
}
function sliceArray<T>(arr: T[], startIndex: number, length = 20) {
  if (arr.length <= length) return arr;
  let slicedPart = arr.slice(startIndex, startIndex + 20);
  if (slicedPart.length < length) {
    let remaining = length - slicedPart.length;
    slicedPart = [...arr.slice(0, remaining), ...slicedPart];
  }
  return slicedPart;
}
function isVideoFile(filename: string) {
  const videoExtensions = /\.(mp4|mkv|avi|mov|wmv|flv|webm|m4v|mpeg|mpg|3gp)$/i;
  return videoExtensions.test(filename);
}
export async function downloadVideoAndExtractMetadata(
  query: any
): Promise<ResponseData | null> {
  if (!query.id) return null;

  const filePath = decodeURI(query.id);
  if (fs.lstatSync(filePath).isDirectory()) {
    const videos = getVideos(filePath);
    for (let i = 0; i < videos.length; i++) {
      try {
        return await downloadVideoAndExtractMetadata({
          ...query,
          id: path.join(filePath, videos[i]),
        });
      } catch (error) {
        console.error(error);
      }
    }
    return null;
  }

  const folderDist = path.dirname(filePath);
  return {
    video: await getVideoData(filePath),
    relatedData: [
      {
        id: "LocalVideos",
        title: "Local Videos",
        data: await getAllVideosData(folderDist, filePath),
      },
    ],
  };
}
function getVideos(folderDist: string) {
  return fs
    .readdirSync(folderDist)
    .filter(
      (v) => fs.lstatSync(path.join(folderDist, v)).isFile() && isVideoFile(v)
    );
}
export async function getAllVideosData(
  folderDist: string,
  mainFile?: string,
  limit = 20
) {
  const files = getVideos(folderDist);
  const arr = sliceArray(
    files.filter((v) => path.join(folderDist, v) != mainFile),
    files.findIndex((v) => path.join(folderDist, v) == mainFile) || 0,
    limit
  );
  const data: Array<ReturnedSearch> = [];
  for (let i = 0; i < arr.length; i++) {
    try {
      const g = await getVideoData(path.join(folderDist, arr[i]));
      data.push({
        id: g.filePath,
        link: `/${PATH}/${encodeURI(g.filePath)}`,
        thumbnail: g.thumbnail,
        title: [g.title],
        duration: g.duration,
      });
    } catch (error) {}
  }
  return data;
}
