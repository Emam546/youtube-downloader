import { fetchData, ServerVideoInfo } from "@serv/routes/videoDownloader/api";
import agent from "../index";
import axios from "axios";
const id = "WhWc3b3KhnY";
describe("Scraping from data", () => {
    test("Test A normal requset", async () => {
        const response = await fetch(
            "https://www.y2mate.com/mates/en948/analyzeV2/ajax",
            {
                headers: {
                    accept: "*/*",
                    "accept-language":
                        "en-GB,en;q=0.9,de-GB;q=0.8,de;q=0.7,ar-EG;q=0.6,ar;q=0.5,en-US;q=0.4",
                    "cache-control": "no-cache",
                    "content-type":
                        "application/x-www-form-urlencoded; charset=UTF-8",
                    pragma: "no-cache",
                    priority: "u=1, i",
                    "sec-ch-ua":
                        '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": '"Windows"',
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-requested-with": "XMLHttpRequest",
                },
                referrer: "https://www.y2mate.com/youtube/YtQKPJ2s86A",
                referrerPolicy: "strict-origin-when-cross-origin",
                body: `k_query=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D${id}&k_page=home&hl=en&q_auto=0`,
                method: "POST",
                mode: "cors",
                credentials: "include",
            }
        );
        expect(response.status).toBeLessThan(300);
        expect(response.ok).toBe(true);
        const data = await response.json();
        console.log(data);
        expect(data).not.toBeUndefined();
        expect(data.links).not.toBeUndefined();
    });
    test("test fetch Data function", async () => {
        const data = await fetchData(id);
        console.log(data);
        expect(data).not.toBeUndefined();
        expect(data.links).not.toBeUndefined();
    });
});
describe("videoDownload page", () => {
    describe("Correct 1", () => {
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
