import agent from "./index";
import { Response } from "supertest";
describe("Download", () => {
    describe("Post", () => {
        const link =
            "https://cdn.pixabay.com/photo/2016/11/29/12/13/fence-1869401_1280.jpg";
        test("should get data", async () => {
            const res = await agent
                .post(`/api/download`)
                .send({ imageUrl: link });
            expect(res.statusCode).toBe(200);
            console.log(res.headers);
            expect(res.headers["content-type"]).not.toBeUndefined();
        });
    });
});
