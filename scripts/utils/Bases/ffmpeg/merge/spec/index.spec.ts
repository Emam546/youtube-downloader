import "@utils/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { FfmpegMergeBase } from "..";
const videoPath = path.join(process.cwd(), "./video.mp4");
const videoInput = path.join(__dirname, "video.mp4");
const audioInput = path.join(__dirname, "audio.mp4");
jest.setTimeout(500000);
describe("test download", () => {
  describe("test unClipped", () => {
    test("simple video", async () => {
      const VideoDownloader = new FfmpegMergeBase({
        data: {
          clipped: false,
          data: {
            mergeData: {
              videoLink: path.join(__dirname, "video.mp4"),
              audioLink: path.join(__dirname, "audio.mp4"),
            },
          },
          PATH: "youtube",
          ftype: "tye",
          fquality: "asdfs",
          previewLink: "sdsf",
          title: "asdasd",
        },
        downloadingState: {
          continued: false,
          path: videoPath,
        },
      });
      console.log(
        await VideoDownloader.download((path) => fs.createWriteStream(path)),
      );
    });
  });
});
test("test normal video merging", async () => {
  return await new Promise((res, rej) => {
    ffmpeg()
      .input(videoInput)
      .input(audioInput)
      .outputOptions([
        "-map 0:v:0",
        "-map 1:a:0",
        "-c:v copy",
        "-c:a copy",
        "-shortest",
        "-movflags frag_keyframe+empty_moov",
      ])
      .on("end", res)
      .on("error", rej)
      .on("start", (cmd) => {
        console.log("COMMAND:", cmd);
      })
      .on("stderr", (line) => {
        console.log("FFMPEG:", line);
      })
      .format("mp4")
      .pipe(fs.createWriteStream(videoPath));
  });
});
