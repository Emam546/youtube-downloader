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
jest.setTimeout(500000);
describe("test download", () => {
  describe("test unClipped", () => {
    test("simple video", async () => {
      const formats = await getAllFormats(videoUrl);
      const format = formats.find((v) => v.has_video && v.has_audio);
      if (!format) return;
      const VideoDownloader = download({
        data: {
          clipped: false,

          ytdlpData: {
            link: videoUrl,
            ...format,
          },
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
        data: {
          clipped: false,

          ytdlpData: {
            link: videoUrl,
            ...format,
          },
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
        0,
      );
      expect(
        videoInfo.streams.some((stream) => stream.codec_type == "audio"),
      ).toBeTruthy();
    });
  });
});
test("test download a video with a problem", async () => {
  const videoUrl =
    "https://www.facebook.com/watch/?ref=saved&v=1328520638649977";

  const formats = await getAllFormats(videoUrl);
  const format = formats.find((v) => v.has_video && v.has_audio);
  if (!format) return;
  const VideoDownloader = download({
    data: {
      clipped: false,
      ytdlpData: {
        link: videoUrl,
        ...format,
      },
    },
    downloadingState: {
      continued: false,
      path: videoPath,
    },
  });
  await VideoDownloader.download((path) => fs.createWriteStream(path));
});
