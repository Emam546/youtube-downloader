import "@utils/ffmpeg";
import fs from "fs";
import { DownloadParams } from "../..";
import { getAllFormats } from "../../../../youtube/download";
import { getVideoInfo } from "../../../ffmpeg";
import { FormatResult, YtdlpBase, YtdlpData } from "..";
import { Transform } from "stream";
const videoPath = "./video.mp4";
export function download(data: DownloadParams<YtdlpData>) {
  return new YtdlpBase(data);
}
jest.setTimeout(500000);

describe("test download", () => {
  beforeEach(() => {
    if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
  });

  describe("video One", () => {
    const videoUrl = "https://www.youtube.com/watch?v=tCDvOQI3pco";
    let formats: FormatResult[];

    beforeAll(async () => {
      formats = await getAllFormats(videoUrl);
    });
    test("test unClipped", async () => {
      const format = formats.find((v) => v.has_video)!;
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
      await getVideoInfo(videoPath);
    });

    test("Clipped", async () => {
      const formats = await getAllFormats(videoUrl);
      const format = formats.find((v) => v.has_video)!;
      const VideoDownloader = download({
        data: {
          clipped: true,
          start: 0,
          end: 5,
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
    });
    test("continue", async () => {
      const format = formats.find((v) => v.has_video)!;
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
      await VideoDownloader.download((path) => {
        let s = 0;
        const trans = new Transform({
          transform(chunk, encoding, callback) {
            s += chunk.length;
            if (s >= 4000) this.destroy();
            return callback(null, chunk);
          },
        });
        const stream = fs.createWriteStream(path);
        trans.pipe(stream);

        return trans;
      });
      const VideoDownloader2 = download({
        data: {
          clipped: false,
          ytdlpData: {
            link: videoUrl,
            ...format,
          },
        },
        downloadingState: {
          continued: true,
          path: videoPath,
        },
      });
      await VideoDownloader2.download((path) => {
        const stream = fs.createWriteStream(path);
        return stream;
      });
    });
  });
  describe("video two", () => {
    const videoUrl = "https://www.youtube.com/shorts/MxyAciIEEco";
    let formats: FormatResult[];

    beforeAll(async () => {
      formats = await getAllFormats(videoUrl);
    });
    test("test unClipped", async () => {
      const format = formats.find((v) => v.has_video)!;
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
      await getVideoInfo(videoPath);
    });

    test("Clipped", async () => {
      const formats = await getAllFormats(videoUrl);
      const format = formats.find((v) => v.has_video)!;
      const VideoDownloader = download({
        data: {
          clipped: true,
          start: 0,
          end: 10,
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
      console.log(VideoDownloader.ffmpegData?.duration);
      expect(videoInfo.format.duration).toBeCloseTo(
        VideoDownloader.ffmpegData?.duration!,
        0,
      );
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
