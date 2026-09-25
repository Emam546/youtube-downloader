import "@utils/ffmpeg";
import fs from "fs";
import { DownloadParams } from "../..";
import { getAllFormats } from "../../../../youtube/download";
import { getVideoInfo } from "../../../ffmpeg";
import { YtdlpMergeData, YtdlMerge } from "../mix";
import os from "os";
import path from "path";
const videoUrl = "https://www.youtube.com/shorts/u9dKu6HaMcw";
const videoPath = path.join(process.cwd(), "./video.mp4");
export function download(data: DownloadParams<YtdlpMergeData>) {
  return new YtdlMerge(data);
}
jest.setTimeout(500000);
describe("test download", () => {
  describe("test unClipped", () => {
    test("simple video", async () => {
      const formats = await getAllFormats(videoUrl);
      const videoformat = formats.find((v) => v.has_video && !v.has_audio);
      const audioformat = formats.find((v) => !v.has_video && v.has_audio);
      if (!videoformat) return;
      if (!audioformat) return;
      const VideoDownloader = download({
        data: {
          clipped: false,
          data: {
            interfaces: {
              video: { ...videoformat, link: videoUrl },
              audio: { ...audioformat, link: videoUrl },
            },
          },
          PATH: "youtube",
          ftype: videoformat.type,
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
