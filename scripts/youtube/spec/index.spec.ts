import { getData } from "..";
import { getAllFormats } from "../download";
import { getVideoID } from "../utils";
const videoUrl = "https://www.youtube.com/watch?v=tCDvOQI3pco";

test("test get All formats", async () => {
  const result = await getAllFormats(
    "https://www.youtube.com/watch?v=KgROpzrFzcY"
  );
  expect(result.length).toBeGreaterThan(0);
  console.log(
    result.map((f) => [
      f.args.format,
      f.qualityLabel,
      `audio ${f.has_audio}`,
      `video ${f.has_video}`,
    ])
  );
  console.log(result);
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
