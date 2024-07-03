import { ServerVideoInfo } from "@serv/routes/videoDownloader/api";
import agent from "../index";
describe("videoDownload page", () => {
    describe("Correct 1", () => {
        const id = "XG2debKGves";
        test("should get data", async () => {
            const res = await agent.get(`/api/watch?v=${id}`);
            const data = res.body.data;
            expect(res.statusCode).toBe(200);
            expect(data).not.toBeUndefined();
            expect(data).not.toStrictEqual({});
        });
    });
    describe("Wrong", () => {
        test("not exist id", async () => {
            const id = "XG2debKGvef";
            const res = await agent.get(`/api/watch?v=${id}`);
            const data = res.body.data;
            expect(res.statusCode).toBe(404);
            expect(data).toBeUndefined();
        });
    });
});
describe("Test Video Downloading System", () => {
    const id = "XG2debKGves";
    jest.setTimeout(50000);
    test("get basic data", async () => {
        const res = await agent.get(`/api/watch?v=${id}`);
        const data = res.body.data as ServerVideoInfo;
        expect(res.statusCode).toBe(200);

        expect(data.links).not.toBeUndefined();
        expect(data.links.mp3).not.toStrictEqual({});
    });
    test("get video data", async () => {
        const res = await agent.get(`/api/watch?v=${id}`);
        const data = res.body.data as ServerVideoInfo;
        expect(res.statusCode).toBe(200);
        const vid = Object.values(data.links.mp4).find(
            (val) => val.q == "240p"
        )!;
        expect(vid).not.toBeUndefined();
        const res2 = await agent.get(
            `/api/watch/download?k=${vid.k}&vid=${id}`
        );
        expect(res2.statusCode).toBeLessThan(300);
    });
});
