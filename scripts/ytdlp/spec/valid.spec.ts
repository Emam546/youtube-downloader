import { isValidYtdlpUrl } from "../valid";
jest.setTimeout(100000);
test("should get no format", async () => {
  expect(await isValidYtdlpUrl("none")).toBeFalsy();

  expect(
    await isValidYtdlpUrl("https://www.facebook.com/watch/?v=1485842433159955"),
  ).toBeTruthy();
  expect(
    await isValidYtdlpUrl("https://www.youtube.com/watch?v=j5xLLiiTcuU"),
  ).toBeTruthy();
  expect(
    await isValidYtdlpUrl(
      "https://xhamster.com/videos/kerala-malayali-girl-sex-with-tailor-hot-mallu-girl-doing-sex-with-tailor-indian-tailor-and-hot-girl-sex-xh7Ezs8#",
    ),
  ).toBeTruthy();
  expect(await isValidYtdlpUrl("https://www.youtube.com/")).toBeFalsy();
});
