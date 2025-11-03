import { isValidYtdlpUrl } from "../valid";
jest.setTimeout(100000)
test("should get no format", async () => {
  expect(await isValidYtdlpUrl("none")).toBeFalsy();
  expect(await isValidYtdlpUrl("https://xhamster.com/videos/kerala-malayali-girl-sex-with-tailor-hot-mallu-girl-doing-sex-with-tailor-indian-tailor-and-hot-girl-sex-xh7Ezs8#")).toBeFalsy();
  expect(await isValidYtdlpUrl("https://www.youtube.com/")).toBeFalsy();
});
