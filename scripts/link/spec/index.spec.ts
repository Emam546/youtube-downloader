import "@utils/ffmpeg";
import { getData, navigate } from "..";
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
describe("test getData", () => {
  jest.setTimeout(10000);
  test("should get Data Right", async () => {
    const data = await navigate(videoUrl);
    expect(data).not.toBeNull();
  });
  test("should get Data Right", async () => {
    const data = await navigate("asdasd");
    expect(data).toBeNull();
  });
  test("should get Data Right", async () => {
    const data = await navigate("https://www.youtube.com/watch?v=yQdQ4HTEdI4");
    expect(data).toBeNull();
  });
});
