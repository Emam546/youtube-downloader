import fs from "fs";
import { DownloadParams } from "../..";
import { getAllFormats } from "../../../../youtube/download";
import { getVideoInfo } from "../../../ffmpeg";
import { YtdlpBase, YtdlpData } from "..";
const videoUrl = "https://www.youtube.com/shorts/f8S4hI6H1qw";
const videoPath = "./video.mp4";
export function download(data: DownloadParams<YtdlpData>) {
  return new YtdlpBase(data);
}
describe("test download", () => {
  jest.setTimeout(50000);
  describe("test unClipped", () => {
    test("simple video", async () => {
      const formats = await getAllFormats(videoUrl);
      const format = formats[0];
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

      const videoInfo = await getVideoInfo(videoPath);
      expect(videoInfo.format.duration).toBeGreaterThan(2);
      expect(
        videoInfo.streams.some((stream) => stream.codec_type == "audio")
      ).toBe(format.has_audio);
    });
  });
  describe("Clipped", () => {
    test("simple", async () => {
      const formats = await getAllFormats(videoUrl);
      console.log(
        formats.map((f) => [
          f.args.format,
          f.qualityLabel,
          `audio ${f.has_audio}`,
        ])
      );
      const format = formats[0];
      console.log(format);
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
