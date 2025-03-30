import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import os from "os";
import { getVideoInfo } from "../link/utils";
const tempDir = os.tmpdir();
const tempThumbnailPath = path.join(tempDir, "temp_thumbnail.png");
export async function getFrameScreenShot(videoPath: string) {
  const metadata = await getVideoInfo(videoPath);
  const videoDuration = metadata.format.duration;
  if (!videoDuration) return null;
  const time = Math.max(
    0,
    Math.min(Math.round(videoDuration * 0.1) || 10, videoDuration - 5)
  );
  return await new Promise<string>((res, rej) => {
    ffmpeg(videoPath)
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
}
