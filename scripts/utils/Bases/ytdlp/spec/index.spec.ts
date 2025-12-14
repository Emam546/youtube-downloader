import "@utils/ffmpeg";
import fs from "fs";
import { DownloadParams } from "../..";
import { getAllFormats } from "../../../../youtube/download";
import { getVideoInfo } from "../../../ffmpeg";
import { YtdlpBase, YtdlpData } from "..";
const videoUrl = "https://www.youtube.com/watch?v=tCDvOQI3pco";
const videoPath = "./video.mp4";
export function download(data: DownloadParams<YtdlpData>) {
  return new YtdlpBase(data);
}
describe("test download", () => {
  jest.setTimeout(500000);
  describe("test unClipped", () => {
    test("simple video", async () => {
      const formats = await getAllFormats(videoUrl);
      const format = formats.find((v) => v.has_video && v.has_audio);
      if (!format) return;
      const VideoDownloader = download({
        curSize: 0,
        data: {
          clipped: false,
          data: {
            ytdlpData: {
              link: videoUrl,
              ...format,
            },
          },
          PATH: "youtube",
          ftype: format.type,
          fquality: "asdfs",
          previewLink: "sdsf",
          title: "asdasd",
        },
        downloadingState: {
          continued: false,
          path: videoPath,
        },
      });
      await VideoDownloader.download((path) => fs.createWriteStream(path));
    });
  });
  describe("Clipped", () => {
    test("simple", async () => {
      const formats = await getAllFormats(videoUrl);
      const format = formats.find((v) => v.has_video && v.has_audio);
      if (!format) return;
      const VideoDownloader = download({
        curSize: 0,
        data: {
          clipped: true,
          start: 0,
          end: 5,
          data: {
            ytdlpData: {
              link: videoUrl,
              ...format,
            },
          },
          PATH: "youtube",
          ftype: format.type,
          fquality: "asdfs",
          previewLink: "sdsf",
          title: "asdasd",
        },
        downloadingState: {
          continued: false,
          path: videoPath,
        },
      });
      await VideoDownloader.download((path) => fs.createWriteStream(path));
      const videoInfo = await getVideoInfo(videoPath);
      expect(videoInfo.format.duration).toBeCloseTo(
        VideoDownloader.ffmpegData?.duration!,
        0
      );
      expect(
        videoInfo.streams.some((stream) => stream.codec_type == "audio")
      ).toBeTruthy();
    });
  });
});
