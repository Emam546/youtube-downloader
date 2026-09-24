import "@utils/ffmpeg";
import { getData } from "..";
import { getAllFormats } from "../download";
import { getVideoID } from "../utils";
const videoUrl = "https://www.youtube.com/watch?v=tCDvOQI3pco";
import fs from "fs"
jest.setTimeout(500000);
test("test get All formats", async () => {
  const result = await getAllFormats(
    "https://www.youtube.com/watch?v=KgROpzrFzcY"
  );
  fs.writeFileSync("result.json",JSON.stringify(result))
  expect(result.length).toBeGreaterThan(0);

});
describe("test getData", () => {
  test("should getDataRight", async () => {
    const data = await getData({
      id: getVideoID(videoUrl),
    });
    if (!data) return;
    expect(data.video?.medias.VIDEO?.length).toBeGreaterThan(0);
  });
});
