import "@utils/ffmpeg";
import { getData, navigate } from "..";
describe("test basic functions", () => {
  const videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4";
  jest.setTimeout(10000);
  test("should get Data Right", async () => {
    const data = await getData({
      link: videoUrl,
    });
    expect(data?.video?.medias.VIDEO?.length).toBeGreaterThan(0);
    expect(data?.video?.medias.AUDIO?.length).toBeGreaterThan(0);
    expect(data?.video?.medias.OTHERS?.length).toBeGreaterThan(0);
  });
  describe("test wrong data", () => {
    jest.setTimeout(10000);
    test("should get Data Right", async () => {
      const data = await navigate(videoUrl);
      expect(data).not.toBeNull();
    });
    test("should wrong link", async () => {
      const data = await navigate("asdasd");
      expect(data).toBeNull();
    });
    test("should get non video link", async () => {
      const data = await navigate(
        "https://www.youtube.com/watch?v=yQdQ4HTEdI4",
      );
      expect(data).toBeNull();
    });
  });
});

describe("test getData from different link", () => {
  const videoUrl =
    "https://s301d4.downet.net/download/1775285461/69cf6355035e3/Fallout.2024.S01E06.720p.WEB.AKWAM.mp4";
  jest.setTimeout(80000);
  test("should get Data Right", async () => {
    const data = await navigate(videoUrl);
    expect(data).not.toBeNull();
  });
  test("should get Data Right", async () => {
    const data = await getData({
      link: videoUrl,
    });
    expect(data?.video?.medias.VIDEO?.length).toBeGreaterThan(0);
    expect(data?.video?.medias.AUDIO?.length).toBeGreaterThan(0);
    expect(data?.video?.medias.OTHERS?.length).toBeGreaterThan(0);
  });
});
