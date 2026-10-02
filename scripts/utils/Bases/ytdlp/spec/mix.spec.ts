import "@utils/ffmpeg";
import fs from "fs";
import { DownloadParams } from "../..";
import { getAllFormats } from "../../../../youtube/download";
import { getVideoInfo } from "../../../ffmpeg";
import { YtdlpMergeData, YtdlMerge } from "../mix";
import os from "os";
import path from "path";
const videoUrl = "https://www.youtube.com/shorts/MxyAciIEEco";
const videoPath = path.join(process.cwd(), "./video.mp4");
export function download(data: DownloadParams<YtdlpMergeData>) {
  return new YtdlMerge(data);
}
jest.setTimeout(500000);
describe("test download", () => {
  describe("test unClipped", () => {
    test("simple video", async () => {
      const formats = await getAllFormats(videoUrl);
      const videoformat = formats.find(
        (v) =>
          v.has_video &&
          !v.has_audio &&
          v.ext === "mp4" &&
          v.vcodec?.startsWith("avc1"),
      );
      const audioformat = formats.find(
        (v) =>
          !v.has_video &&
          v.has_audio &&
          v.ext === "m4a" &&
          v.acodec?.startsWith("mp4a"),
      );
      if (!videoformat) return;
      if (!audioformat) return;
      const VideoDownloader = download({
        data: {
          clipped: false,

          interfaces: {
            video: { ...videoformat, link: videoUrl },
            audio: { ...audioformat, link: videoUrl },
          },
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
  describe("test clipped", () => {
    test("simple video", async () => {
      const formats = await getAllFormats(videoUrl);
      const videoformat = formats.find(
        (v) =>
          v.has_video &&
          !v.has_audio &&
          v.ext === "mp4" &&
          v.vcodec?.startsWith("avc1"),
      );
      const audioformat = formats.find(
        (v) =>
          !v.has_video &&
          v.has_audio &&
          v.ext === "m4a" &&
          v.acodec?.startsWith("mp4a"),
      );
      if (!videoformat) return;
      if (!audioformat) return;
      const VideoDownloader = download({
        data: {
          clipped: true,
          start: 0,
          end: 4,
          interfaces: {
            video: { ...videoformat, link: videoUrl },
            audio: { ...audioformat, link: videoUrl },
          },
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
