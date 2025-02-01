import { getVideoInfo } from "./utils";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import os from "os";
import path from "path";
import axios from "axios";
import https from "https";
import { ResponseData } from "../types/types";
const DownloadAgent = new https.Agent({
  rejectUnauthorized: false, // (NOTE: this will disable client verification)
});

const DownloadInstance = axios.create({ httpsAgent: DownloadAgent });
const tempDir = os.tmpdir();
const tempThumbnailPath = path.join(tempDir, "temp_thumbnail.png");

export async function downloadVideoAndExtractMetadata(
  query: any
): Promise<ResponseData | null> {
  if (!query.link) return null;
  const url = decodeURI(query.link);
  const response = await DownloadInstance.head(url);
  // Extract filename from headers or fallback to a default name
  const contentDisposition = response.headers["content-disposition"] as string;
  // Save video file
  const metadata = await getVideoInfo(url);
  let startFileNameIndex = contentDisposition.indexOf('"') + 1;
  let endFileNameIndex = contentDisposition.lastIndexOf('"');
  let reqFilename = contentDisposition.substring(
    startFileNameIndex,
    endFileNameIndex
  );
  // Extract useful metadata
  const videoFormat = metadata.format.format_name?.split(",")[0] || "mp4";
  const urlFileName = decodeURI(url.split("/").pop()?.split("?")[0] || "");
  const fileName =
    (metadata.format.tags?.title as string) ||
    reqFilename ||
    (urlFileName?.includes(".") ? urlFileName : undefined) ||
    `video.${videoFormat}`;
  const videoSize = metadata.format.size; // in bytes
  const videoDuration = metadata.format.duration; // in seconds
  const videoBitrate = metadata.format.bit_rate;
  const videoStreams = metadata.streams;

  // Additional info: codec and resolution
  const videoStream = videoStreams.find(
    (stream) => stream.codec_type === "video"
  );
  let thumbnail: string | undefined = undefined;
  if (videoStream && videoDuration) {
    const time = Math.max(
      0,
      Math.min(Math.round(videoDuration * 0.1) || 10, videoDuration - 5)
    );
    try {
      thumbnail = await new Promise<string>((res, rej) => {
        ffmpeg(url)
          .on("end", () => {
            const data = fs.readFileSync(tempThumbnailPath);
            fs.unlinkSync(tempThumbnailPath);
            res(data.toString("base64"));
          })
          .on("error", (err) => {
            rej("Error generating thumbnail: " + err.message);
          })
          .screenshot({
            filename: path.basename(tempThumbnailPath),
            folder: path.dirname(tempThumbnailPath),
            timestamps: [time],
            fastSeek: true,
          });
      });
    } catch {}
  }

  const audioStream = videoStreams.find(
    (stream) => stream.codec_type === "audio"
  );

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
            quality: videoStream?.height || 240,
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
}
