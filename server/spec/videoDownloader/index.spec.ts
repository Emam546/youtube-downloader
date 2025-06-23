import {  } from "@utils/server";
import agent from "../index";
const id = "WhWc3b3KhnY";

describe("videoDownload page", () => {
  describe("Correct 1", () => {
    test("should get data", async () => {
      const res = await agent.get(`/api/youtube?id=${id}`);
      const data = res.body.data;
      expect(res.statusCode).toBe(200);
      expect(data).not.toBeUndefined();
      expect(data).not.toStrictEqual({});
    });
  });
});
describe("Test Video Downloading System", () => {
  jest.setTimeout(50000);
  test("get basic data", async () => {
    const res = await agent.get(`/api/youtube?id=${id}`);
    const data = res.body.data ;
    expect(res.statusCode).toBe(200);
  });
});
