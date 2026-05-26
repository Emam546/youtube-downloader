import "@utils/ffmpeg";
import { getData } from "..";
import { getAllFormats } from "../download";
import { getVideoID } from "../utils";
const videoUrl = "https://www.youtube.com/watch?v=tCDvOQI3pco";

jest.setTimeout(50000);
test("test get All formats", async () => {
  const result = await getAllFormats(
    "https://www.youtube.com/watch?v=KgROpzrFzcY"
  );
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
