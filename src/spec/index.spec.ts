import getVideoID from "get-youtube-id";
describe("test get video id from youtbe ", () => {
  test("correct", () => {
    expect(getVideoID("https://youtu.be/iuW0VasDoZo?si=XraoipNHrmb6Xr1-")).toBe(
      "iuW0VasDoZo"
    );
    expect(
      getVideoID(
        "https://www.youtube.com/watch?v=iuW0VasDoZo&list=PLp22-4PivYmKFJFUO3JHaIAh7_Yq7Ka1_&index=15"
      )
    ).toBe("iuW0VasDoZo");
    expect(
      getVideoID("https://youtu.be/XH3PEYvlgx8?si=Bd7vgl1nBgre13GB&t=2")
    ).toBe("XH3PEYvlgx8");
  });
});
