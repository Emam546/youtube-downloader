import { getFbVideoId } from "../valid";

test("test getId function", () => {
  expect(
    getFbVideoId("https://www.facebook.com/watch/?ref=saved&v=1800157843939644")
  ).toBe("1800157843939644");
  expect(
    getFbVideoId("https://www.facebook.com/reel/844960654592031")
  ).toBe("844960654592031");

});
