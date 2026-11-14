import { parseEmbedHtml } from "../metadata";
import { scoreMatch } from "../match";
import { parseSpotifyUrl } from "../valid";
import { SpotifyTrack } from "../metadata";

test("parses spotify urls and uris", () => {
  expect(
    parseSpotifyUrl(
      "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT?si=abc",
    ),
  ).toEqual({ kind: "track", id: "4cOdK2wGLETKBW3PvgPWqT" });
  expect(
    parseSpotifyUrl(
      "https://open.spotify.com/intl-en/album/6N9PS4QXF1D0OWPk0Sxtb4",
    ),
  ).toEqual({ kind: "album", id: "6N9PS4QXF1D0OWPk0Sxtb4" });
  expect(
    parseSpotifyUrl("spotify:playlist:37i9dQZF1DXcBWIGoYBM5M"),
  ).toEqual({ kind: "playlist", id: "37i9dQZF1DXcBWIGoYBM5M" });
  expect(parseSpotifyUrl("https://www.youtube.com/watch?v=abc")).toBeNull();
});

test("reads a track list from an embed payload", () => {
  const html = `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify(
    {
      props: {
        pageProps: {
          state: {
            data: {
              entity: {
                type: "album",
                id: "albumid",
                name: "Whenever You Need Somebody",
                visualIdentity: {
                  image: [{ url: "https://images.example/cover.jpg", maxWidth: 640 }],
                },
                trackList: [
                  {
                    uri: "spotify:track:trackid",
                    title: "Never Gonna Give You Up",
                    subtitle: "Rick Astley",
                    duration: 213573,
                    isPlayable: true,
                    audioPreview: {
                      url: "https://p.scdn.co/mp3-preview/example",
                    },
                  },
                  {
                    uri: "spotify:track:hidden",
                    title: "Hidden",
                    subtitle: "Rick Astley",
                    duration: 1000,
                    isPlayable: false,
                  },
                ],
              },
            },
          },
        },
      },
    },
  )}</script>`;
  const page = parseEmbedHtml(html);
  expect(page.name).toBe("Whenever You Need Somebody");
  expect(page.tracks).toEqual([
    {
      id: "trackid",
      title: "Never Gonna Give You Up",
      artists: "Rick Astley",
      durationMs: 213573,
      thumbnail: "https://images.example/cover.jpg",
      previewUrl: "https://p.scdn.co/mp3-preview/example",
    },
  ]);
});

test("prefers the original recording over a cover with the same name", () => {
  const track: SpotifyTrack = {
    id: "trackid",
    title: "Never Gonna Give You Up",
    artists: "Rick Astley",
    durationMs: 213000,
  };
  const official = scoreMatch(track, {
    title: "Rick Astley - Never Gonna Give You Up (Official Audio)",
    duration: 213,
    channel: "Rick Astley",
  });
  const cover = scoreMatch(track, {
    title: "Never Gonna Give You Up (Cover)",
    duration: 213,
    channel: "Someone Else",
  });
  expect(official).toBeGreaterThan(cover);
  expect(official).toBeGreaterThanOrEqual(25);
});
