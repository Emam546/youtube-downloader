import "../main/pre-start";
import { DownloadTheFile } from "@app/main/lib/progressBar/downloader";
import {
    convertY2mateData,
    getY2mateData,
    ServerVideoInfo,
} from "@serv/routes/videoDownloader/api";
import { ObjectEntries, objectKeys, objectValues } from "@utils/index";
import ffmpeg from "fluent-ffmpeg";
const id = "TOOIRGhsFD4";
describe("Test Download function", () => {
    jest.setTimeout(50000);
    let val: ServerVideoInfo;
    beforeAll(async () => {
        val = await getY2mateData(id);
    });
    test("Test Is it Download from youtube", async () => {
        const format = val.formats[0];
        const response = await DownloadTheFile(format!.url);
        const result = await new Promise((res, rej) => {
            response.on("data", () => {
                response.destroy();
                res(true);
            });
            response.on("end", () => res(false));
        });
        expect(result).toBe(true);
    });
    test("Test is it Download from y2mate", async () => {
        const format = ObjectEntries(val.links.mp4);
        const res = await convertY2mateData(id, format[0][1].k as string);
        const response = await DownloadTheFile(res.dlink);
        const result = await new Promise((res, rej) => {
            response.on("data", () => {
                response.destroy();
                res(true);
            });
            response.on("end", () => res(false));
        });
        expect(result).toBe(true);
    });
    describe("test cutting a cut of the video", () => {
        test("Test is it Download from y2mate", async () => {
            const format = ObjectEntries(val.links.mp4);
            const vid = format[0][1];
            const result = await convertY2mateData(id, vid.k as string);
            const test = await new Promise((res, rej) => {
                ffmpeg.ffprobe(result.dlink, (err, data) => {
                    if (err) rej(err);
                    res(data);
                    console.log(data);
                });
            });
            expect(test).not.toBe(undefined);
            ffmpeg(result.dlink)
                .seekInput(30) 
                .duration(10) 
                .output("video.mp4") 
                .run();
        });
    });
});
