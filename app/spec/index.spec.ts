import "../main/pre-start";
<<<<<<< HEAD
import {
  convertY2mateData,
  getY2mateData,
=======
import { DownloadTheFile } from "@app/main/lib/progressBar/linkDownload/downloader";
import {
  getYoutubeData,
>>>>>>> master
  ServerVideoInfo,
} from "@serv/routes/videoDownloader/api";
import { ObjectEntries } from "@utils/index";
import { IncomingMessage } from "http";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import {
  continueDownloading,
  getTempName,
} from "@app/main/lib/progressBar/ffmpeg/continueDownloading";
import { getVideoInfo } from "@app/main/lib/progressBar/ffmpeg/utils";
import path from "path";
import { DownloadTheFile } from "@app/main/lib/progressBar/linkDownload/downloader";

async function testDownloadResponse(response: IncomingMessage) {
  expect(response.statusCode).toBeLessThan(300);
  const result = await new Promise((res, rej) => {
    response.on("data", () => {
      response.destroy();
      res(true);
    });
    response.on("end", () => res(false));
  });
  expect(result).toBe(true);
}
describe("Test ffmbeg ", () => {
  const link = "https://www.w3schools.com/html/mov_bbb.mp4";
  test("test ffprobe", async () => {
    const data = await new Promise((res, rej) => {
      const ffProb = ffmpeg.ffprobe(link, (err, data) => {
        if (err) {
          rej(err);
        } else res(data);
      });
    });
    expect(data).not.toBeUndefined();
  });
  describe("Downloading", () => {
    const videoPath = "result.mov";
    test("normal", async () => {
      const writeStream = fs.createWriteStream(videoPath);
      const res = await new Promise((res, rej) => {
        ffmpeg(link)
          .format("mov")
          .setStartTime(0)
          .duration(5)
          .on("start", (data) => {
            console.log("Download started...", data); //ffmpeg -ss 5 -i http://192.168.1.150:4001/Film.mp4 -f mov -t 5 -movflags frag_keyframe+empty_moov -c copy pipe:1
          })
          .on("end", () => {
            writeStream.end(); // Close the writable stream
            res(true);
          })
          .on("error", (err) => {
            console.log(err);
            writeStream.end(); // Ensure stream is closed on error
            rej(err);
          })
          .outputOptions("-movflags frag_keyframe+empty_moov")
          .outputOptions("-c copy")
          .pipe(writeStream);
      });
      expect(res).toBe(true);
      const info = await getVideoInfo(videoPath);
      expect(Math.floor(info.format.duration!)).toBe(5);
    });
    test("merge two videos", async () => {
      const writeStream = fs.createWriteStream(videoPath);

      const res = await new Promise((res, rej) => {
        ffmpeg()
          .input(link)
          .input(link)
          .on("start", (data) => {
            console.log("Download started...", data); //ffmpeg -ss 5 -i http://192.168.1.150:4001/Film.mp4 -f mov -t 5 -movflags frag_keyframe+empty_moov -c copy pipe:1
          })
          .on("end", () => {
            res(true);
          })
          .on("error", (err) => {
            console.log(err); // Ensure stream is closed on error
            rej(err);
          })
          .format("mov")
          .outputOptions("-movflags frag_keyframe+empty_moov")
          .mergeToFile(writeStream, "./");
      });
      expect(res).toBe(true);
      const info = await getVideoInfo(videoPath);
      expect(Math.floor(info.format.duration!)).toBe(20);
    });
    describe("continue Downloading", () => {
      beforeAll(async () => {
        const writeStream = fs.createWriteStream(videoPath);
        await new Promise((res, rej) => {
          ffmpeg(link)
            .format("mp4")
            .duration(5)
            .on("end", () => {
              res(true);
            })
            .on("error", (err) => {
              writeStream.close(); // Ensure stream is closed on error
              rej(err);
            })
            .outputOptions("-movflags frag_keyframe+empty_moov")
            .outputOptions("-c copy")
            .pipe(writeStream);
        });
      });
      test("normalState", async () => {
        const writeStream = fs.createWriteStream(videoPath);

        const ffmpegPut = await continueDownloading(link, videoPath, 0, 10);
        const res = await new Promise((res, rej) => {
          ffmpegPut
            .on("start", (data) => {
              console.log("Download started...", data); //ffmpeg -ss 5 -i http://192.168.1.150:4001/Film.mp4 -f mov -t 5 -movflags frag_keyframe+empty_moov -c copy pipe:1
            })
            .on("end", () => {
              writeStream.end(); // Close the writable stream
              res(true);
            })
            .on("error", (err) => {
              console.log(err);
              writeStream.end(); // Ensure stream is closed on error
              rej(err);
            })
            .outputOptions("-movflags frag_keyframe+empty_moov")
            .format("mov")
            .mergeToFile(writeStream, path.dirname(videoPath));
        });
        expect(res).toBe(true);
        const info = await getVideoInfo(videoPath);
        expect(Math.floor(info.format.duration!)).toBe(10);
        expect(fs.existsSync(getTempName(videoPath))).toBe(false);
      });
    });
  });
});
describe("Test Download function", () => {
  const id = "TOOIRGhsFD4";
  jest.setTimeout(50000);
  let val: ServerVideoInfo;
  beforeAll(async () => {
<<<<<<< HEAD
    val = await getY2mateData(id);
=======
    val = await getYoutubeData(id);
>>>>>>> master
  });
  test("Test Is it Download from youtube", async () => {
    const format = val.formats[0];
    const response = await DownloadTheFile(format!.url);
    testDownloadResponse(response);
  });
<<<<<<< HEAD
  test("Test is it Download from y2mate", async () => {
    const format = ObjectEntries(val.links.mp4);
    const res = await convertY2mateData(id, format[0][1].k as string);
    const response = await DownloadTheFile(res.dlink);
    testDownloadResponse(response);
  });
=======
>>>>>>> master
});
