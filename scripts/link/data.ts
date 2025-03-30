import { getVideoInfo } from "./utils";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import os from "os";
import path from "path";
import axios from "axios";
import https from "https";
import { ResponseData } from "../types/types";
import { getFrameScreenShot } from "../utils/ffmpeg";
import { getVideoQualityLabel } from "../utils";
const DownloadAgent = new https.Agent({
  rejectUnauthorized: false, // (NOTE: this will disable client verification)
});

const DownloadInstance = axios.create({ httpsAgent: DownloadAgent });

export async function downloadVideoAndExtractMetadata(
  query: any
): Promise<ResponseData | null> {
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
    const videoFormat = metadata.format.format_name?.split(",")[0] || "mp4";
    const urlFileName = decodeURI(url.split("/").pop()?.split("?")[0] || "");
    const fileName =
      (metadata.format.tags?.title as string) ||
      reqFilename ||
      (urlFileName?.includes(".") ? urlFileName : undefined) ||
      `video.${videoFormat}`;
    const videoSize = metadata.format.size; // in bytes
    const videoDuration = metadata.format.duration;
    const videoStreams = metadata.streams;

    // Additional info: codec and resolution
    const videoStream = videoStreams.find(
      (stream) => stream.codec_type === "video"
    );
    let thumbnail = await getFrameScreenShot(url);

    return {
      video: {
        duration: videoDuration!,
        thumbnail: `data:image/jpeg;base64,${thumbnail}`!,
        medias: {
          VIDEO: [
            {
              container: videoFormat,
              dlink: url,
              id: `${url}-org`,
              previewLink: url,
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
        viewerUrl: url,
        title: path.basename(fileName),
      },
    };
  } catch (error) {
    return null;
  }
}
