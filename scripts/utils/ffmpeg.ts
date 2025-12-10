import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import os from "os";
import { v4 } from "uuid";
const tempDir = os.tmpdir();
ffmpeg.setFfmpegPath(process.env.ffmpegPath!);
ffmpeg.setFfprobePath(process.env.ffmpegProbe!);
export async function getFrameScreenShot(videoPath: string) {
  const metadata = await getVideoInfo(videoPath);
  const videoDuration = metadata.format.duration;
  if (!videoDuration) return null;
  const time = Math.max(
    0,
    Math.min(Math.round(videoDuration * 0.1) || 10, videoDuration - 5)
  );
  return await new Promise<string>((res, rej) => {
    const tempThumbnailPath = path.join(tempDir, `temp_thumbnail_${v4()}.png`);
    ffmpeg(videoPath)
      .on("end", () => {
        if (!fs.existsSync(tempThumbnailPath)) return rej("unfounded image");
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
}
export function getVideoInfo(path: string) {
  return new Promise<ffmpeg.FfprobeData>((res, rej) => {
    ffmpeg.ffprobe(path, (err, metadata) => {
      if (err) rej(err);
      res(metadata);
    });
  });
}
export async function getEstimatedVideoSize(path: string, duration: number) {
  const metadata = await getVideoInfo(path);
  // Calculate the estimated output size
  const videoStream = metadata.streams.find(
    (stream) => stream.codec_type === "video"
  );
  const audioStream = metadata.streams.find(
    (stream) => stream.codec_type === "audio"
  );
  const videoBitrate: number = videoStream
    ? videoStream.bit_rate
      ? parseInt(videoStream.bit_rate)
      : 0
    : 0;
  const audioBitrate: number = audioStream
    ? audioStream.bit_rate
      ? parseInt(audioStream.bit_rate)
      : 0
    : 0;

  const estimatedSize = ((videoBitrate + audioBitrate) * duration) / 8; // in bytes

  return estimatedSize;
}
