
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
