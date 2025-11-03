import internal from "node:stream";

import Ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { getVideoInfo } from "../../../ffmpeg";
import { getTempName } from "../continueDownloading";

export async function continueDownloading(
  org: { video: string | internal.Readable; audio: string | internal.Readable },
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
    .input(org.video)
    .setStartTime(start + resumePoint)
    .inputOptions(`-t ${duration - resumePoint}`)
    .input(org.audio)
    .setStartTime(start + resumePoint)
    .inputOptions(`-t ${duration - resumePoint}`)
    .on("end", () => {
      fs.unlinkSync(tempPath);
    });
}
