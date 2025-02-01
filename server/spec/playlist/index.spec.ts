import agent from "../index";
import { Response } from "supertest";
describe("playlist page", () => {
    describe("GET", () => {
        describe("Correct 1", () => {
            const id = "PLWKjhJtqVAbnZtkAI3BqcYxKnfWn_C704";
            const mock = {
                playlistName: "Design Patterns - Beau teaches JavaScript",
                ids: [
                    "bgU7FeiWKzc",
                    "3PUVr8jFMGg",
                    "3pXVHRT-amw",
                    "KOVc5o5kURE",
                ],
                names: [
                    `Singleton Design Pattern - Beau teaches JavaScript`,
                    `Observer Design Pattern - Beau teaches JavaScript`,
                    `Module Design Pattern - Beau teaches JavaScript`,
                    `Mediator Design Pattern - Beau teaches JavaScript`,
                ],
                durations: [4 * 60 + 51, 3 * 60 + 57, 2 * 60 + 44, 5 * 60 + 9],
            };

            let data: any;
            let res: Response;
            beforeAll(async () => {
                res = await agent.get(`/api/playlist?list=${id}`);
                data = res.body.data;
            });
            test("should get data", () => {
                expect(res.statusCode).toBe(200);
                expect(data).not.toStrictEqual({});
            });
            it("getId", async () => {
                expect(data).not.toBeUndefined();
                data.videos.forEach(({ videoId }: any) => {
                    expect(mock.ids).toContain(videoId);
                });
            });
            it("playlist name", async () => {
                expect(data).not.toBeUndefined();
                expect(data.header).toBe(mock.playlistName);
            });
            it("names", async () => {
                expect(data).not.toBeUndefined();
                data.videos.forEach(({ title }: any) => {
                    expect(mock.names).toContain(title);
                });
            });
            it("durations", async () => {
                expect(data).not.toBeUndefined();
                data.videos.forEach(({ lengthSeconds }: any) => {
                    expect(mock.durations).toContain(lengthSeconds);
                });
            });
        });
        describe("Correct 2", () => {
            test("should get data", async () => {
                const id = "PLy1bC-662HHKXOVHInxvhSRReDz0d4xCI";
                const res = await agent.get(`/api/playlist?list=${id}`);
                const data = res.body.data;
                expect(res.statusCode).toBe(200);
                expect(data).not.toStrictEqual({});
                expect(data.videos.length).toBeGreaterThanOrEqual(20);
            });
        });

        test("Correct 3", async () => {
            const id = "PL1Wxz8hJM8HlUKSD2A1PngkTqI_Ai0B3y";
            let data;
            let res;
            res = await agent.get(`/api/playlist?list=${id}`);
            data = res.body.data;
            expect(res.statusCode).toBe(200);
            expect(data).not.toStrictEqual({});
            expect(data.videos.length).toBeGreaterThanOrEqual(60);
        });

        test("should get data", async () => {
            const id = "bad_id";
            let res = await agent.get(`/api/playlist?list=${id}`);
            let data = res.body.data;
            expect(res.statusCode).toBe(404);
        });
    });
});
