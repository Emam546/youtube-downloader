import fs from "fs";
import { getData } from "..";
import { download } from "../download";
const videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4";
describe("test getData", () => {
  jest.setTimeout(10000);
  test("should get Data Right", async () => {
    const data = await getData({
      link: videoUrl,
    });
    expect(data?.video?.medias.VIDEO?.length).toBeGreaterThan(0);
    expect(data?.video?.medias.AUDIO?.length).toBeGreaterThan(0);
    expect(data?.video?.medias.OTHERS?.length).toBeGreaterThan(0);
  });
});
