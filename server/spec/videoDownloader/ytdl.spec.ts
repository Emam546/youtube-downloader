import ytdl, { chooseFormat } from "@distube/ytdl-core";
import axios from "axios";
const id = "WhWc3b3KhnY";

describe("videoDownload page", () => {
  describe("Correct 1", () => {
    jest.setTimeout(50000);
    test("should get data", async () => {
      const data = await ytdl.getInfo(id);
      await Promise.all(
        data.formats.map(async (v) => {
          const res = await axios.get(v.url);
          if (res.status >= 400) {
            console.log(
              v.hasAudio,
              v.hasVideo,
              v.codecs,
              v.quality,
              v.qualityLabel
            );
          }
        })
      );
    });
  });
});
