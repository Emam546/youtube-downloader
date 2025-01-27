import { getVideoInfo } from "@app/main/utils/ffmpeg";
import { DownloadInstance } from "@serv/util/axios";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import os from "os";
import path from "path";
export type VideoInfoData = {
  size: number;
  duration: number;
  fileName: string;
  has_audio: boolean;
  audio_codec?: string;
  channels?: number;
  sample_rate?: number;
  has_video: boolean;
  videoCodec?: string;
  width?: number;
  height?: number;
  bit_rate?: number;
  thumbnail?: string;
  format: string;
  title: string;
};
const tempDir = os.tmpdir();
const tempThumbnailPath = path.join(tempDir, "temp_thumbnail.png");

export async function downloadVideoAndExtractMetadata(
  url: string
): Promise<VideoInfoData> {
  // Download video
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
    has_audio: audioStream != undefined,
    has_video: videoStream != undefined,
    audio_codec: audioStream?.codec_name,
    channels: audioStream?.channels,
    sample_rate: audioStream?.sample_rate,
    videoCodec: videoStream?.codec_name,
    width: videoStream?.width,
    height: videoStream?.height,
    thumbnail,
    bit_rate: videoBitrate,
    size: videoSize!,
    duration: videoDuration!,
    fileName,
    format: videoFormat,
    title: fileName.split(".").slice(0,-1).join("."),
  };
}
