import "@utils/ffmpeg";
import Ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import { getVideoInfo } from "../../../../ffmpeg";
import { FfmpegResizeBase } from "../index";

const videoUrl = "newExample.mp4";
const videoPath = "./video.mp4";
jest.setTimeout(10000);
describe("test local", () => {
  describe("Non resized", () => {
    describe("Non Clipped", () => {
      test("test ffmpeg videoOnly", async () => {
        const VideoDownloader = new FfmpegResizeBase({
          curSize: 0,
          data: {
            clipped: false,
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

        expect(
          videoInfo.streams.some((stream) => stream.codec_type == "audio")
        ).toBeFalsy();
      });
      test("test ffmpeg audioOnly", async () => {
        const VideoDownloader = new FfmpegResizeBase({
          curSize: 0,
          data: {
            clipped: false,
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
        expect(
          videoInfo.streams.some((stream) => stream.codec_type == "video")
        ).toBeFalsy();
      });
    });
    describe("clipped", () => {
      test("test ffmpeg videoOnly", async () => {
        const VideoDownloader = new FfmpegResizeBase({
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
          -1
        );
        expect(
          videoInfo.streams.some((stream) => stream.codec_type == "audio")
        ).toBeFalsy();
      });
      test("test ffmpeg audioOnly", async () => {
        const VideoDownloader = new FfmpegResizeBase({
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
          -1
        );
        expect(
          videoInfo.streams.some((stream) => stream.codec_type == "video")
        ).toBeFalsy();
      });
    });
  });
  describe("resized", () => {
    describe("Non Clipped", () => {
      test("test ffmpeg videoOnly", async () => {
        const VideoDownloader = new FfmpegResizeBase({
          curSize: 0,
          data: {
            clipped: false,
            data: {
              link: videoUrl,
              editData: {
                videoOnly: true,
              },
              resize: 240,
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
        expect(
          videoInfo.streams.find((v) => v.codec_type == "video")?.height
        ).toEqual(VideoDownloader?.resize);
        expect(
          videoInfo.streams.some((stream) => stream.codec_type == "audio")
        ).toBeFalsy();
      });
    });
    describe("clipped", () => {
      test("test ffmpeg videoOnly", async () => {
        const VideoDownloader = new FfmpegResizeBase({
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
              resize: 140,
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
          -1
        );
        expect(
          videoInfo.streams.some((stream) => stream.codec_type == "audio")
        ).toBeFalsy();
      });
    });
  });
});
