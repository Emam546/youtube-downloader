import supertest from "supertest";
import { videoInfo } from "ytdl-core";
import fs from "fs";
import path from "path";
import { describe } from "node:test";
const agent = supertest("http://localhost:3000/api/");
function WriteFile(data: any, name = "./res.json") {
    return fs.writeFileSync(path.join(__dirname, name), JSON.stringify(data));
}
describe("videoDownload page", () => {
    describe("Correct 1", () => {
        const id = "XG2debKGves";
        let data: videoInfo | undefined;
        let res;
        beforeAll(async () => {
            res = await agent.get(`watch?v=${id}`);
            data = res.body.data;
        });
        test("should get data", () => {
            expect(res.statusCode).toBe(200);
            expect(data).not.toBeUndefined();
            expect(data).not.toStrictEqual({});
            WriteFile(data);
        });
    });
    describe("Wrong", () => {
        test("not exist id", async () => {
            const id = "XG2debKGvef";
            const res = await agent.get(`watch?v=${id}`);
            const data = res.body.data;
            expect(res.statusCode).toBe(404);
            expect(data).toBeUndefined();
        });
    });
});
