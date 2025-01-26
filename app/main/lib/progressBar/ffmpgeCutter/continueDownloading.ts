import internal from "node:stream";
import { getVideoInfo } from "../utils/ffmpeg";
import Ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";

export function getTempName(orgPath: string) {
  // Get the directory name and the file name without extension
  const dir = path.dirname(orgPath);
  const baseName = path.basename(orgPath, path.extname(orgPath));

  // Construct the new file name with `.temp.mov` extension
  const newFileName = `${baseName}.temp${path.extname(orgPath)}`;

  // Construct the new file path
  return path.join(dir, newFileName);
}

export async function continueDownloading(
  org: string | internal.Readable,
  continued: string,
  start: number,
  duration: number
): Promise<Ffmpeg.FfmpegCommand> {
  const tempPath = getTempName(continued);
  fs.renameSync(continued, path.basename(tempPath));
  const info = await getVideoInfo(tempPath);
  const outputDuration = info.format.duration!;
  const resumePoint = outputDuration > 5 ? outputDuration - 5 : 0;
  return Ffmpeg()
    .input(tempPath)
    .inputOptions(`-t ${resumePoint}`)
    .input(org)
    .setStartTime(start + resumePoint)
    .inputOptions(`-t ${duration - resumePoint}`)
    .on("end", () => {
      fs.unlinkSync(tempPath);
    });
}
