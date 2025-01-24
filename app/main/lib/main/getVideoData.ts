import axios from "axios";
import { ffprobe, FfmpegCommand } from "fluent-ffmpeg";
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
};
const tempDir = os.tmpdir();
const tempThumbnailPath = path.join(tempDir, "temp_thumbnail.png");
export async function downloadVideoAndExtractMetadata(
  url: string
): Promise<VideoInfoData> {
  // Download video
  const response = await axios.head(url);

  // Extract filename from headers or fallback to a default name
  const contentDisposition = response.headers["content-disposition"] as string;
  const fileName = contentDisposition
    ? contentDisposition.match(/filename="(.+)"/)?.[1] || "video.mp4"
    : "video.mp4";

  // Save video file

  return new Promise((res, rej) => {
    ffprobe(url, async (err, metadata) => {
      if (err) return rej(err);

      // Extract useful metadata
      const videoFormat = metadata.format.format_name;
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
          Math.min(videoDuration || 10, videoDuration - 5)
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

      return res({
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
      });
    });
  });
}
