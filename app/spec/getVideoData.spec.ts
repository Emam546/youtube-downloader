import "../main/pre-start";
import { downloadVideoAndExtractMetadata } from "@app/main/lib/main/getVideoLinkData";

jest.setTimeout(10000);
const link = "https://www.w3schools.com/html/mov_bbb.mp4";
describe("Test getDownloadData ", () => {
  test("test success", async () => {
    const data = await downloadVideoAndExtractMetadata(link);
    expect(data).not.toBeUndefined();
    console.log(data);
  });
  test("test not a video data", async () => {
    const data = await new Promise((res) => {
      downloadVideoAndExtractMetadata("https://www.google.com/")
        .then(() => res(true))
        .catch((err) => res(false));
    });
    expect(data).toBe(false);
  });
  test("test get a screenshot", async () => {
    const data: any = await downloadVideoAndExtractMetadata(link);
    expect(data.has_video).toBe(true);
    expect(data.thumbnail).not.toBeUndefined();
  });
  test("video link with certificate", () => {
    
  })
});
