import { getYtdlpStreams } from "../func";

test("get correct link", async () => {
  const data = await getYtdlpStreams(
    "https://www.youtube.com/watch?v=IOq5b5Z23oQ",
  );
});
