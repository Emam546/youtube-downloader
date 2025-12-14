import "@utils/ffmpeg";
import fs from "fs";
import { FfmpegBase } from "../";
import { getVideoInfo } from "../../../ffmpeg";

const videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4";
const videoPath = "video.mp4";
jest.setTimeout(50000);
describe("test local", () => {
  test("test ffmpeg non-clipped", async () => {
    const videoDownloader = new FfmpegBase({
      curSize: 0,
      data: {
        clipped: false,
        data: {
          link: videoUrl,
        },
        PATH: "youtube",
        ftype: "sds",
        fquality: "asdfs",
        previewLink: "sdsf",
        title: "asdasd",
      },
      downloadingState: {
        continued: false,
        path: videoPath,
      },
    });
    await videoDownloader.download((path) => fs.createWriteStream(path));

    const orgInfo = await getVideoInfo(videoUrl);
    const videoInfo = await getVideoInfo(videoPath);

    expect(videoInfo.streams[0]?.duration).toBeCloseTo(
      parseInt(orgInfo.streams[0].duration!),
      1
    );
  });
  test("test ffmpeg clipped", async () => {
    const videoDownloader = new FfmpegBase({
      curSize: 0,
      data: {
        clipped: true,
        start: 4,
        end: 10,
        data: {
          link: videoUrl,
        },
        PATH: "youtube",
        ftype: "sds",
        fquality: "asdfs",
        previewLink: "sdsf",
        title: "asdasd",
      },
      downloadingState: {
        continued: false,
        path: videoPath,
      },
    });
    await videoDownloader.download((path) => fs.createWriteStream(path));

    const videoInfo = await getVideoInfo(videoPath);
    expect(videoInfo.format.duration).toBeCloseTo(
      videoDownloader.ffmpegData!.duration,
      0
    );
  });
  describe("no video Condition", () => {
    describe("clipped", () => {
      test("test ffmpeg videoOnly", async () => {
        const VideoDownloader = new FfmpegBase({
          curSize: 0,
          data: {
            clipped: true,
            start: 4,
            end: 8,
            data: {
              link: videoUrl,
              editData: {
                videoOnly: true,
              },
            },
            PATH: "None",
            ftype: "sds",
            fquality: "None",
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
          VideoDownloader.ffmpegData!.duration,
          0
        );
        expect(
          videoInfo.streams.some((stream) => stream.codec_type == "audio")
        ).toBeFalsy();
      });
      test("test ffmpeg audioOnly", async () => {
        const VideoDownloader = new FfmpegBase({
          curSize: 0,
          data: {
            clipped: true,
            start: 4,
            end: 8,
            data: {
              link: videoUrl,
              editData: {
                audioOnly: true,
              },
            },
            PATH: "None",
            ftype: "sds",
            fquality: "None",
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
          VideoDownloader.ffmpegData!.duration,
          0
        );
        expect(
          videoInfo.streams.some((stream) => stream.codec_type == "video")
        ).toBeFalsy();
      });
    });
  });
});
